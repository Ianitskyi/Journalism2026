#!/usr/bin/env node
/*
 * Перевірка, чи МОН/ЄДЕБО публікують рейтингові списки вступників як
 * відкритий датасет на data.gov.ua — щоб не залежати від Cloudflare-захисту
 * vstup.edbo.gov.ua (див. README). data.gov.ua зазвичай побудований на CKAN,
 * який має відкритий пошуковий API (/api/3/action/package_search) без
 * анти-бот захисту, тож спершу пробуємо його напряму, а якщо не спрацює —
 * падаємо назад на пошук по UI headless-браузером.
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";

const OUT_DIR = new URL("../diagnostics-datagovua/", import.meta.url).pathname;
const QUERIES = ["ЄДЕБО", "вступ", "конкурсний бал", "рейтинг вступників", "edbo", "інфоресурс"];

function log(line) {
  console.log(line);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });

  // ---------- 1) пробуємо CKAN API напряму ----------
  log("=== Пробую CKAN package_search API напряму ===");
  const apiResults = {};
  for (const q of QUERIES) {
    const apiUrl = `https://data.gov.ua/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=15`;
    try {
      const resp = await context.request.get(apiUrl, { timeout: 20_000 });
      const status = resp.status();
      let body = null;
      try {
        body = await resp.json();
      } catch {
        body = await resp.text().catch(() => null);
      }
      apiResults[q] = { status, ok: resp.ok(), body };
      log(`\n--- Запит "${q}" → ${apiUrl} (status ${status}) ---`);
      if (resp.ok() && body?.result) {
        log(`count: ${body.result.count}`);
        for (const pkg of (body.result.results || []).slice(0, 10)) {
          log(`- [${pkg.name}] "${pkg.title}" — org: ${pkg.organization?.title || "?"} — resources: ${(pkg.resources || []).map((r) => r.format).join(",")}`);
        }
      } else {
        log(JSON.stringify(body).slice(0, 500));
      }
    } catch (err) {
      apiResults[q] = { error: err.message };
      log(`Помилка запиту "${q}": ${err.message}`);
    }
  }
  await writeFile(`${OUT_DIR}api-results.json`, JSON.stringify(apiResults, null, 2), "utf8");

  // ---------- 2) fallback: пошук по UI ----------
  log("\n=== Fallback: відкриваю data.gov.ua/uk та пробую пошук по UI ===");
  const page = await context.newPage();
  try {
    await page.goto(`https://data.gov.ua/uk/dataset?q=${encodeURIComponent("ЄДЕБО вступ рейтинг")}`, {
      waitUntil: "load",
      timeout: 30_000
    });
  } catch (err) {
    log(`Навігація по UI не вдалась: ${err.message}`);
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT_DIR}screenshot-search.png`, fullPage: true }).catch(() => {});

  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 3000) || "").catch(() => "");
  log(`\n=== ТЕКСТ СТОРІНКИ ПОШУКУ (перші 3000 símvolів) ===\n${bodyText}`);

  const links = await page
    .evaluate(() =>
      Array.from(document.querySelectorAll("a[href*='/dataset/']"))
        .map((a) => ({ text: a.textContent.trim().slice(0, 100), href: a.href }))
        .filter((l) => l.text)
    )
    .catch(() => []);
  log(`\n=== ПОСИЛАННЯ НА ДАТАСЕТИ (${links.length}) ===\n${JSON.stringify(links.slice(0, 30), null, 2)}`);

  await browser.close();

  const summary = [
    `## Розвідка data.gov.ua`,
    ``,
    ...QUERIES.map((q) => {
      const r = apiResults[q];
      return `- "${q}": ${r?.error ? `помилка: ${r.error}` : `status ${r.status}, count ${r.body?.result?.count ?? "?"}`}`;
    }),
    ``,
    `Посилань на датасети зі сторінки пошуку UI: ${links.length}`
  ].join("\n");

  log("\n" + summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
  }
}

main().catch((err) => {
  console.error("Розвідка data.gov.ua впала з помилкою:", err);
  process.exitCode = 1;
});
