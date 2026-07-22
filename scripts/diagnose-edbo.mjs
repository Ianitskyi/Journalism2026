#!/usr/bin/env node
/*
 * Діагностичний скрипт для vstup.edbo.gov.ua. Призначений для запуску в
 * GitHub Actions (.github/workflows/diagnose-edbo.yml), де є повний доступ
 * в інтернет — на відміну від агентської сесії, в якій верстався сайт.
 *
 * Мета цієї (розширеної) версії: попередня спроба відкрила лише кореневу
 * сторінку, не знайшла native <input type="text|search">, і зловила лише 2
 * малесенькі службові POST-запити — тобто дані не завантажуються одразу.
 * Ця версія додатково:
 *  - друкує в stdout (а не тільки в артефакт) текст сторінки, усі посилання
 *    й кнопки — щоб зрозуміти реальну структуру SPA без перегляду
 *    скріншота;
 *  - пробує клікнути по будь-якому елементу, чий текст натякає на перехід
 *    до рейтингових списків/спеціальностей/пошуку;
 *  - витягує зовнішні <script src> й шукає в них рядки "/api", "fetch(",
 *    "XMLHttpRequest" — щоб знайти базовий URL реального API, навіть якщо
 *    він не викликається одразу при завантаженні кореня;
 *  - логує ПОВНИЙ список мережевих запитів (не тільки xhr/fetch) в stdout.
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const START_URL = "https://vstup.edbo.gov.ua/";
const OUT_DIR = new URL("../diagnostics/", import.meta.url).pathname;
const RESPONSES_DIR = path.join(OUT_DIR, "responses");

const CLICK_CANDIDATES = [
  /журналіст/i,
  /061/,
  /конкурсн.*пропозиц/i,
  /рейтингов.*список/i,
  /спеціальніст/i,
  /розширений пошук/i,
  /пошук/i,
  /вступ 2026/i,
  /абітурієнт/i
];

function log(line) {
  console.log(line);
}

async function dumpPageState(page, label) {
  const bodyText = await page.evaluate(() => document.body?.innerText || "").catch(() => "");
  const links = await page
    .evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => ({ text: a.textContent.trim().replace(/\s+/g, " ").slice(0, 90), href: a.getAttribute("href") }))
        .filter((l) => l.text || l.href)
    )
    .catch(() => []);
  const buttons = await page
    .evaluate(() =>
      Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], select, [role="combobox"]'))
        .map((b) => ({ tag: b.tagName.toLowerCase(), text: (b.textContent || b.value || "").trim().replace(/\s+/g, " ").slice(0, 70) }))
        .filter((b) => b.text)
    )
    .catch(() => []);

  log(`\n=== [${label}] BODY TEXT (${bodyText.length} символів, перші 3000) ===`);
  log(bodyText.slice(0, 3000) || "(порожньо)");

  log(`\n=== [${label}] ПОСИЛАННЯ (усього ${links.length}, перші 60) ===`);
  log(JSON.stringify(links.slice(0, 60), null, 2));

  log(`\n=== [${label}] КНОПКИ/SELECT/COMBOBOX (усього ${buttons.length}, перші 60) ===`);
  log(JSON.stringify(buttons.slice(0, 60), null, 2));

  return { bodyText, links, buttons };
}

async function main() {
  await mkdir(RESPONSES_DIR, { recursive: true });

  const networkLog = [];
  const consoleLog = [];
  let savedBodies = 0;

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();

  page.on("console", (msg) => consoleLog.push({ type: msg.type(), text: msg.text() }));
  page.on("pageerror", (err) => consoleLog.push({ type: "pageerror", text: err.message }));

  page.on("response", async (response) => {
    const request = response.request();
    const entry = {
      url: response.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      status: response.status(),
      contentType: response.headers()["content-type"] || null
    };

    const looksJson =
      request.resourceType() === "xhr" ||
      request.resourceType() === "fetch" ||
      (entry.contentType && entry.contentType.includes("json"));

    if (looksJson && response.ok()) {
      try {
        const body = await response.text();
        if (body) {
          savedBodies += 1;
          const file = `response-${String(savedBodies).padStart(3, "0")}.txt`;
          await writeFile(path.join(RESPONSES_DIR, file), body, "utf8");
          entry.bodyFile = `responses/${file}`;
          entry.bodyLength = body.length;
          entry.bodyPreview = body.slice(0, 400);
        } else {
          entry.bodySkipped = "empty";
        }
      } catch (err) {
        entry.bodyError = err.message;
      }
    }

    networkLog.push(entry);
  });

  log(`Відкриваю ${START_URL} …`);
  try {
    await page.goto(START_URL, { waitUntil: "load", timeout: 45_000 });
  } catch (err) {
    log(`Навігація завершилась з помилкою (продовжуємо): ${err.message}`);
  }

  // даємо SPA час доладнати початкові запити/рендер
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(OUT_DIR, "screenshot-initial.png"), fullPage: true }).catch(() => {});

  const initialState = await dumpPageState(page, "initial");

  // ---------- грепаємо зовнішні JS-бандли на предмет /api ----------
  try {
    const scriptSrcs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script[src]")).map((s) => s.src)
    );
    log(`\n=== Зовнішні <script src> (${scriptSrcs.length}) ===`);
    log(JSON.stringify(scriptSrcs, null, 2));

    const apiHints = [];
    for (const src of scriptSrcs.slice(0, 15)) {
      try {
        const resp = await context.request.get(src, { timeout: 15_000 });
        const text = await resp.text();
        const matches = new Set();
        const re = /["'`](\/?api\/[a-zA-Z0-9\/_\-]{2,80}|https?:\/\/[a-zA-Z0-9.\-]*edbo[a-zA-Z0-9.\-]*\/[a-zA-Z0-9\/_\-]{0,80})["'`]/g;
        let m;
        while ((m = re.exec(text)) !== null) matches.add(m[1]);
        if (matches.size) apiHints.push({ src, matches: Array.from(matches).slice(0, 30) });
      } catch (err) {
        apiHints.push({ src, error: err.message });
      }
    }
    log(`\n=== Знайдені /api-подібні рядки в JS-бандлах ===`);
    log(JSON.stringify(apiHints, null, 2));
  } catch (err) {
    log(`Грепання скриптів не вдалось: ${err.message}`);
  }

  // ---------- пробуємо клікнути по чомусь релевантному ----------
  let clicked = null;
  try {
    const candidateHandles = await page.$$("a, button, [role='button'], [role='tab'], li, span, div");
    for (const pattern of CLICK_CANDIDATES) {
      for (const handle of candidateHandles) {
        const text = (await handle.textContent().catch(() => "")) || "";
        if (pattern.test(text) && text.trim().length < 120) {
          const visible = await handle.isVisible().catch(() => false);
          if (!visible) continue;
          try {
            await handle.scrollIntoViewIfNeeded({ timeout: 3000 });
            await handle.click({ timeout: 5000 });
            clicked = { pattern: pattern.toString(), text: text.trim().slice(0, 90) };
            break;
          } catch {
            /* пробуємо наступний */
          }
        }
      }
      if (clicked) break;
    }
  } catch (err) {
    log(`Пошук клікабельного елемента впав: ${err.message}`);
  }

  log(`\n=== Результат спроби кліку: ${clicked ? JSON.stringify(clicked) : "нічого підходящого не знайдено/не клікнулось"} ===`);

  if (clicked) {
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(OUT_DIR, "screenshot-after-click.png"), fullPage: true }).catch(() => {});
    await dumpPageState(page, "after-click");
  }

  const html = await page.content().catch(() => "<!-- не вдалось отримати HTML -->");
  await writeFile(path.join(OUT_DIR, "page.html"), html, "utf8");
  await writeFile(path.join(OUT_DIR, "network-log.json"), JSON.stringify(networkLog, null, 2), "utf8");
  await writeFile(path.join(OUT_DIR, "console-log.json"), JSON.stringify(consoleLog, null, 2), "utf8");

  await browser.close();

  log(`\n=== ПОВНИЙ мережевий лог (усі ${networkLog.length} запитів) ===`);
  log(JSON.stringify(networkLog, null, 2));

  log(`\n=== Консольні повідомлення (${consoleLog.length}) ===`);
  log(JSON.stringify(consoleLog.slice(0, 40), null, 2));

  const jsonCalls = networkLog.filter((e) => e.bodyFile);
  const summary = [
    `## Діагностика vstup.edbo.gov.ua`,
    ``,
    `- Усього мережевих запитів залоговано: **${networkLog.length}**`,
    `- З них із збереженим JSON/XHR тілом: **${jsonCalls.length}**`,
    `- Консольних повідомлень/помилок: **${consoleLog.length}**`,
    `- Клік по релевантному елементу: **${clicked ? "так — " + clicked.text : "ні"}**`,
    ``,
    jsonCalls.length
      ? `### Кандидати на API:\n\n${jsonCalls.slice(0, 20).map((e) => `- \`${e.method} ${e.url}\` (${e.bodyLength} байт)`).join("\n")}`
      : `⚠️ Жодного XHR/JSON запиту не залоговано.`
  ].join("\n");

  log("\n" + summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
  }
}

main().catch((err) => {
  console.error("Діагностика впала з помилкою:", err);
  process.exitCode = 1;
});
