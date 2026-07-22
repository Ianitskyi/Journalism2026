#!/usr/bin/env node
/*
 * Діагностичний скрипт для vstup.edbo.gov.ua. Призначений для запуску в
 * GitHub Actions (.github/workflows/diagnose-edbo.yml), де є повний доступ
 * в інтернет — на відміну від агентської сесії, в якій верстався сайт.
 *
 * Мета: НЕ зібрати реальні дані, а розвідати, як сайт їх віддає — відкрити
 * сторінку headless-браузером, залогувати всі мережеві запити (особливо
 * JSON-відповіді XHR/fetch, які найімовірніше і є реальним API), зберегти
 * HTML, скріншот і тіла JSON-відповідей як артефакти workflow. Результат
 * потім аналізується вручну, щоб написати робочий scripts/fetch-edbo.mjs.
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const START_URL = "https://vstup.edbo.gov.ua/";
const OUT_DIR = new URL("../diagnostics/", import.meta.url).pathname;
const RESPONSES_DIR = path.join(OUT_DIR, "responses");

// типи ресурсів, тіла яких точно варто зберегти цілком
const INTERESTING_TYPES = ["xhr", "fetch"];

async function main() {
  await mkdir(RESPONSES_DIR, { recursive: true });

  const networkLog = [];
  const consoleLog = [];
  let savedBodies = 0;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  page.on("console", (msg) => {
    consoleLog.push({ type: msg.type(), text: msg.text() });
  });
  page.on("pageerror", (err) => {
    consoleLog.push({ type: "pageerror", text: err.message });
  });

  page.on("response", async (response) => {
    const request = response.request();
    const entry = {
      url: response.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      status: response.status(),
      contentType: response.headers()["content-type"] || null
    };

    const looksInteresting =
      INTERESTING_TYPES.includes(request.resourceType()) ||
      (entry.contentType && entry.contentType.includes("application/json"));

    if (looksInteresting && response.ok()) {
      try {
        const body = await response.text();
        // зберігаємо тільки не надто величезні тіла, аби не роздувати артефакт
        if (body && body.length < 2_000_000) {
          savedBodies += 1;
          const file = `response-${String(savedBodies).padStart(3, "0")}.txt`;
          await writeFile(path.join(RESPONSES_DIR, file), body, "utf8");
          entry.bodyFile = `responses/${file}`;
          entry.bodyLength = body.length;
        } else {
          entry.bodySkipped = body ? `too large (${body.length} bytes)` : "empty";
        }
      } catch (err) {
        entry.bodyError = err.message;
      }
    }

    networkLog.push(entry);
  });

  console.log(`Відкриваю ${START_URL} …`);
  try {
    await page.goto(START_URL, { waitUntil: "networkidle", timeout: 45_000 });
  } catch (err) {
    console.error(`Навігація завершилась з помилкою (продовжуємо, дивимось що встигли зловити): ${err.message}`);
  }

  // даємо SPA час доладнати початкові запити
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(OUT_DIR, "screenshot-initial.png"), fullPage: true }).catch(() => {});

  // best-effort: пробуємо знайти пошук/фільтр і ввести "Журналістика" —
  // селектори сайту нам невідомі, тож це обгорнуто в try/catch і не є
  // критичним для діагностики (мережевий лог знімається незалежно)
  try {
    const searchInput = page.locator('input[type="search"], input[type="text"]').first();
    if (await searchInput.count()) {
      await searchInput.click({ timeout: 5000 });
      await searchInput.fill("Журналістика");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUT_DIR, "screenshot-after-search.png"), fullPage: true }).catch(() => {});
    } else {
      console.log("Не знайшов очевидного поля пошуку — пропускаю крок взаємодії.");
    }
  } catch (err) {
    console.log(`Крок взаємодії з пошуком не вдався (не критично): ${err.message}`);
  }

  const html = await page.content().catch(() => "<!-- не вдалось отримати HTML -->");
  await writeFile(path.join(OUT_DIR, "page.html"), html, "utf8");

  await writeFile(path.join(OUT_DIR, "network-log.json"), JSON.stringify(networkLog, null, 2), "utf8");
  await writeFile(path.join(OUT_DIR, "console-log.json"), JSON.stringify(consoleLog, null, 2), "utf8");

  await browser.close();

  const jsonCalls = networkLog.filter((e) => e.bodyFile);
  const summary = [
    `## Діагностика vstup.edbo.gov.ua`,
    ``,
    `- Усього мережевих запитів залоговано: **${networkLog.length}**`,
    `- З них із збереженим JSON/XHR тілом: **${jsonCalls.length}**`,
    `- Консольних повідомлень/помилок: **${consoleLog.length}**`,
    ``,
    jsonCalls.length
      ? `### Найімовірніші кандидати на API:\n\n${jsonCalls.slice(0, 20).map((e) => `- \`${e.method} ${e.url}\` (${e.bodyLength} байт → \`${e.bodyFile}\`)`).join("\n")}`
      : `⚠️ Жодного XHR/JSON запиту не залоговано — можливо, дані рендеряться на сервері (SSR) або сайт вимагає взаємодії, якої скрипт не відтворив. Дивись \`page.html\` і скріншоти.`,
    ``,
    `Повні артефакти (HTML, скріншоти, тіла відповідей) — у завантаженому артефакті workflow \`edbo-diagnostics\`.`
  ].join("\n");

  console.log("\n" + summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
  }
}

main().catch((err) => {
  console.error("Діагностика впала з помилкою:", err);
  process.exitCode = 1;
});
