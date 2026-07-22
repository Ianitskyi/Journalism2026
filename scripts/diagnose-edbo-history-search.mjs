#!/usr/bin/env node
/*
 * Архівні vstup<рік>.edbo.gov.ua (2018–2025) НЕ захищені Cloudflare Turnstile
 * (перевірено diagnose-edbo-history.mjs). Тож пошук тут можна легально
 * автоматизувати — це не обхід захисту, бо захисту нема.
 *
 * Перша спроба (клік по "Бакалавр" як по кнопці) провалилась: `locator
 * resolved to <option value="1">Бакалавр</option>` — рівень і спеціальність
 * тут НАТИВНІ <select>, а не кастомні SPA-віджети як на живому сайті. Ця
 * версія спершу дампить усі <select> з їхніми <option>, потім обирає
 * значення через selectOption (яке працює з прихованими нативними select),
 * а не click.
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";

const YEAR = 2025;
const START_URL = `https://vstup${YEAR}.edbo.gov.ua/`;
const OUT_DIR = new URL("../diagnostics-history-search/", import.meta.url).pathname;

function log(line) {
  console.log(line);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const networkLog = [];
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();

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
      request.resourceType() === "xhr" ||
      request.resourceType() === "fetch" ||
      request.resourceType() === "document" ||
      (entry.contentType && entry.contentType.includes("json"));
    if (looksInteresting && response.ok()) {
      try {
        const body = await response.text();
        if (body) {
          entry.bodyLength = body.length;
          entry.bodyPreview = body.slice(0, entry.resourceType === "document" ? 300 : 1500);
        }
      } catch {
        /* ігноруємо */
      }
    }
    networkLog.push(entry);
  });

  log(`Відкриваю ${START_URL} …`);
  await page.goto(START_URL, { waitUntil: "load", timeout: 30_000 }).catch((err) => log(`Навігація: ${err.message}`));
  await page.waitForTimeout(1500);

  // ---------- 1) дампимо всі <select> на сторінці ----------
  const selects = await page.evaluate(() =>
    Array.from(document.querySelectorAll("select")).map((sel, i) => ({
      index: i,
      name: sel.name || null,
      id: sel.id || null,
      options: Array.from(sel.options).map((o) => ({ value: o.value, text: o.textContent.trim() }))
    }))
  );
  log(`\n=== <select> на сторінці (${selects.length}) ===`);
  for (const sel of selects) {
    log(`[${sel.index}] name=${sel.name} id=${sel.id} — ${sel.options.length} опцій, перші 5: ${JSON.stringify(sel.options.slice(0, 5))}`);
  }

  // ---------- 2) знаходимо select для рівня освіти і для спеціальності ----------
  const levelSelectIndex = selects.findIndex((s) => s.options.some((o) => /бакалавр/i.test(o.text)));
  const specSelectIndex = selects.findIndex((s) => s.options.some((o) => /журналіст/i.test(o.text)));

  log(`\nlevelSelectIndex=${levelSelectIndex}, specSelectIndex=${specSelectIndex}`);
  if (specSelectIndex >= 0) {
    const journalismOptions = selects[specSelectIndex].options.filter((o) => /журналіст/i.test(o.text));
    log(`Опції зі словом "журналіст": ${JSON.stringify(journalismOptions)}`);
  }

  const selectLocators = page.locator("select");

  if (levelSelectIndex >= 0) {
    try {
      await selectLocators.nth(levelSelectIndex).selectOption({ label: "Бакалавр" });
      log("selectOption 'Бакалавр' на рівні освіти — OK");
    } catch (err) {
      log(`selectOption рівня не вдався: ${err.message}`);
    }
  }
  await page.waitForTimeout(800);

  if (specSelectIndex >= 0) {
    const journalismOption = selects[specSelectIndex].options.find((o) => /журналіст/i.test(o.text));
    if (journalismOption) {
      try {
        await selectLocators.nth(specSelectIndex).selectOption({ value: journalismOption.value });
        log(`selectOption спеціальності '${journalismOption.text}' — OK`);
      } catch (err) {
        log(`selectOption спеціальності не вдався: ${err.message}`);
      }
    }
  }
  // даємо offers_search_form.js (побачений у мережевому лозі минулого разу
  // як лениво-завантажений скрипт) час довантажитись і навісити обробники,
  // інакше клік по "Пошук" стається до реєстрації submit-хендлера
  await page.waitForTimeout(3000);

  // ---------- 3) тиснемо реальну кнопку відправки форми ----------
  try {
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    if (await submitBtn.count()) {
      await submitBtn.click({ timeout: 5000 });
      log("Клікнув submit-кнопку форми");
    } else {
      const searchBtn = page.getByRole("button", { name: /^пошук$/i }).first();
      await searchBtn.click({ timeout: 5000 });
      log("Клікнув кнопку 'Пошук' (getByRole)");
    }
  } catch (err) {
    log(`Клік по кнопці пошуку не вдався: ${err.message}`);
  }

  await page.waitForTimeout(9000);
  await page.screenshot({ path: `${OUT_DIR}screenshot-results.png`, fullPage: true }).catch(() => {});

  const bodyText = await page.evaluate(() => document.body?.innerText || "").catch(() => "");
  log(`\n=== ТЕКСТ СТОРІНКИ ПІСЛЯ ПОШУКУ (перші 6000 символів) ===\n${bodyText.slice(0, 6000)}`);

  const links = await page
    .evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => ({ text: a.textContent.trim().replace(/\s+/g, " ").slice(0, 120), href: a.getAttribute("href") }))
        .filter((l) => l.text)
    )
    .catch(() => []);
  log(`\n=== ВСІ ПОСИЛАННЯ ПІСЛЯ ПОШУКУ (${links.length}, перші 60) ===\n${JSON.stringify(links.slice(0, 60), null, 2)}`);

  const html = await page.content().catch(() => "");
  await writeFile(`${OUT_DIR}page-results.html`, html, "utf8");
  await writeFile(`${OUT_DIR}network-log.json`, JSON.stringify(networkLog, null, 2), "utf8");

  log(`\n=== МЕРЕЖЕВІ ЗАПИТИ (усього ${networkLog.length}) ===`);
  log(JSON.stringify(networkLog.slice(0, 40), null, 2));

  await browser.close();

  const summary = [
    `## Пошук на vstup${YEAR}.edbo.gov.ua (бакалавр, журналістика)`,
    ``,
    `- levelSelectIndex=${levelSelectIndex}, specSelectIndex=${specSelectIndex}`,
    `- Мереж. запитів: ${networkLog.length}`,
    `- Посилань після пошуку: ${links.length}`,
    `- Довжина тексту сторінки: ${bodyText.length}`
  ].join("\n");
  log("\n" + summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
  }
}

main().catch((err) => {
  console.error("Пошук на архівному році впав з помилкою:", err);
  process.exitCode = 1;
});
