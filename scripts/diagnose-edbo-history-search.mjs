#!/usr/bin/env node
/*
 * Архівні vstup<рік>.edbo.gov.ua (2018–2025) НЕ захищені Cloudflare Turnstile
 * (перевірено diagnose-edbo-history.mjs — жоден рік не тригерить challenge).
 * Тож на відміну від поточного vstup.edbo.gov.ua тут можна легально
 * автоматизувати справжній пошук — це вже не обхід захисту, бо захисту нема.
 *
 * Цей скрипт виконує РЕАЛЬНИЙ пошук на vstup2025.edbo.gov.ua: рівень
 * "Бакалавр", спеціальність "Журналістика" (061), регіон "усі" — і друкує
 * в лог повний мережевий лог + HTML/текст результатів, щоб зрозуміти
 * точний формат (список конкурсних пропозицій по ЗВО, чи одразу рейтинг
 * абітурієнтів).
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

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
      (entry.contentType && entry.contentType.includes("json"));
    if (looksInteresting && response.ok()) {
      try {
        const body = await response.text();
        if (body) {
          entry.bodyLength = body.length;
          entry.bodyPreview = body.slice(0, 500);
        }
      } catch {
        /* ігноруємо */
      }
    }
    networkLog.push(entry);
  });

  log(`Відкриваю ${START_URL} …`);
  await page.goto(START_URL, { waitUntil: "load", timeout: 30_000 }).catch((err) => log(`Навігація: ${err.message}`));
  await page.waitForTimeout(2000);

  // 1) обираємо освітній рівень "Бакалавр"
  try {
    const bachelorBtn = page.getByText("Бакалавр", { exact: true }).first();
    await bachelorBtn.click({ timeout: 5000 });
    log("Клікнув 'Бакалавр'");
  } catch (err) {
    log(`Не вдалось клікнути 'Бакалавр': ${err.message}`);
  }
  await page.waitForTimeout(1000);

  // 2) вводимо спеціальність у пошукове поле, якщо є текстовий інпут
  try {
    const input = page.locator('input[type="text"], input[type="search"]').first();
    if (await input.count()) {
      await input.click({ timeout: 3000 });
      await input.fill("бакалавр журналістика");
      log("Ввів 'бакалавр журналістика' у пошукове поле");
      await page.waitForTimeout(1500);
    } else {
      log("Текстового поля пошуку не знайдено — пробую select/dropdown 'Спеціальність'");
      const specDropdown = page.getByText(/спеціальніст/i).first();
      if (await specDropdown.count()) {
        await specDropdown.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(500);
        const journalismOption = page.getByText(/журналіст/i).first();
        if (await journalismOption.count()) {
          await journalismOption.click({ timeout: 3000 }).catch(() => {});
          log("Обрав опцію 'Журналістика' у dropdown");
        }
      }
    }
  } catch (err) {
    log(`Крок вводу спеціальності не вдався: ${err.message}`);
  }
  await page.waitForTimeout(1000);

  // 3) тиснемо "Пошук"
  try {
    const searchBtn = page.getByRole("button", { name: /пошук/i }).first();
    if (await searchBtn.count()) {
      await searchBtn.click({ timeout: 5000 });
      log("Клікнув кнопку 'Пошук'");
    } else {
      log("Кнопки 'Пошук' не знайдено");
    }
  } catch (err) {
    log(`Клік по 'Пошук' не вдався: ${err.message}`);
  }

  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT_DIR}screenshot-results.png`, fullPage: true }).catch(() => {});

  const bodyText = await page.evaluate(() => document.body?.innerText || "").catch(() => "");
  log(`\n=== ТЕКСТ СТОРІНКИ ПІСЛЯ ПОШУКУ (перші 5000 символів) ===\n${bodyText.slice(0, 5000)}`);

  const links = await page
    .evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => ({ text: a.textContent.trim().replace(/\s+/g, " ").slice(0, 100), href: a.getAttribute("href") }))
        .filter((l) => l.text && /журналіст|рейтинг|пропозиц/i.test(l.text))
    )
    .catch(() => []);
  log(`\n=== РЕЛЕВАНТНІ ПОСИЛАННЯ (${links.length}) ===\n${JSON.stringify(links.slice(0, 40), null, 2)}`);

  const html = await page.content().catch(() => "");
  await writeFile(`${OUT_DIR}page-results.html`, html, "utf8");
  await writeFile(`${OUT_DIR}network-log.json`, JSON.stringify(networkLog, null, 2), "utf8");

  log(`\n=== МЕРЕЖЕВИЙ ЛОГ (${networkLog.length} запитів, показую xhr/fetch/json) ===`);
  log(JSON.stringify(networkLog.filter((e) => e.bodyLength), null, 2));

  await browser.close();

  const summary = [
    `## Пошук на vstup${YEAR}.edbo.gov.ua (бакалавр, журналістика)`,
    ``,
    `- Мереж. запитів: ${networkLog.length}`,
    `- Релевантних посилань знайдено: ${links.length}`,
    `- Довжина тексту сторінки після пошуку: ${bodyText.length}`
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
