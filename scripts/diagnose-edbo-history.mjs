#!/usr/bin/env node
/*
 * Розвідка архівних піддоменів vstup<рік>.edbo.gov.ua (2018–2025) — чи вони
 * захищені тим самим Cloudflare Turnstile, що й поточний vstup.edbo.gov.ua
 * (див. README, розділ "Підключення реальних даних ЄДЕБО"). Завершені
 * кампанії — це архіви, тож цілком можливо анти-бот захист там не потрібен
 * і взагалі відсутній (сайт лише віддає статичні дані). Скрипт НЕ намагається
 * обійти жоден захист — лише спостерігає, чи капча взагалі з'являється при
 * звичайній навігації, як і diagnose-edbo.mjs для поточного року.
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const OUT_DIR = new URL("../diagnostics-history/", import.meta.url).pathname;

const CLICK_CANDIDATES = [
  /конкурсн.*пропозиц/i,
  /рейтингов.*список/i,
  /журналіст/i,
  /061/,
  /пошук/i
];

function log(line) {
  console.log(line);
}

async function checkYear(context, year) {
  const url = `https://vstup${year}.edbo.gov.ua/`;
  const page = await context.newPage();

  let cloudflareSeen = false;
  let networkCount = 0;
  const jsonBodies = [];

  page.on("response", async (response) => {
    networkCount += 1;
    if (/challenges\.cloudflare\.com/.test(response.url())) {
      cloudflareSeen = true;
    }
    const request = response.request();
    const contentType = response.headers()["content-type"] || "";
    if ((request.resourceType() === "xhr" || request.resourceType() === "fetch") && response.ok()) {
      try {
        const body = await response.text();
        if (body && body.length < 5000) {
          jsonBodies.push({ url: response.url(), contentType, length: body.length, preview: body.slice(0, 200) });
        }
      } catch {
        /* ігноруємо */
      }
    }
  });

  let loadError = null;
  try {
    await page.goto(url, { waitUntil: "load", timeout: 30_000 });
  } catch (err) {
    loadError = err.message;
  }
  await page.waitForTimeout(2500);

  const title = await page.title().catch(() => "");
  const bodyTextBefore = await page.evaluate(() => document.body?.innerText?.slice(0, 300) || "").catch(() => "");

  let clicked = null;
  try {
    const handles = await page.$$("a, button, [role='button'], li, span, div");
    for (const pattern of CLICK_CANDIDATES) {
      for (const handle of handles) {
        const text = (await handle.textContent().catch(() => "")) || "";
        if (pattern.test(text) && text.trim().length < 120) {
          const visible = await handle.isVisible().catch(() => false);
          if (!visible) continue;
          try {
            await handle.scrollIntoViewIfNeeded({ timeout: 2000 });
            await handle.click({ timeout: 3000 });
            clicked = text.trim().slice(0, 90);
            break;
          } catch {
            /* пробуємо наступний */
          }
        }
      }
      if (clicked) break;
    }
  } catch {
    /* не критично */
  }

  await page.waitForTimeout(2500);
  await mkdir(OUT_DIR, { recursive: true });
  await page.screenshot({ path: `${OUT_DIR}screenshot-${year}.png`, fullPage: true }).catch(() => {});

  const bodyTextAfter = await page.evaluate(() => document.body?.innerText?.slice(0, 500) || "").catch(() => "");

  await page.close();

  return {
    year,
    url,
    loadError,
    title,
    networkCount,
    cloudflareSeen,
    clicked,
    bodyTextBefore,
    bodyTextAfter,
    jsonBodies: jsonBodies.slice(0, 5)
  };
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });

  const results = [];
  for (const year of YEARS) {
    log(`\n### Перевіряю vstup${year}.edbo.gov.ua …`);
    const result = await checkYear(context, year);
    log(JSON.stringify(result, null, 2));
    results.push(result);
  }

  await browser.close();

  await writeFile(new URL("../diagnostics-history/results.json", import.meta.url).pathname, JSON.stringify(results, null, 2), "utf8");

  const summary = [
    `## Розвідка архівних vstup<рік>.edbo.gov.ua`,
    ``,
    ...results.map(
      (r) =>
        `- **${r.year}**: title="${r.title}", Cloudflare-challenge: **${r.cloudflareSeen ? "ТАК" : "ні"}**, клік: ${r.clicked || "—"}, мереж.запитів: ${r.networkCount}${r.loadError ? `, ПОМИЛКА завантаження: ${r.loadError}` : ""}`
    )
  ].join("\n");

  log("\n" + summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
  }
}

main().catch((err) => {
  console.error("Розвідка архівних років впала з помилкою:", err);
  process.exitCode = 1;
});
