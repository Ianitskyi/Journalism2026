#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — досі перевірявся лише
 * розділ "вступ" (vstup*.edbo.gov.ua). ЄДЕБО — це ширша екосистема
 * доменів; перевіряємо, чи є деінде публічна статистика прийому/заяв за
 * 2026 рік поза цим розділом:
 * - info.edbo.gov.ua — згадувався в метаданих датасету МОН на data.gov.ua
 *   як "частина ЄДЕБО" (публічний інформаційний портал?)
 * - edbo.gov.ua — головний сайт реєстру
 * - www.edbo.gov.ua
 */

const TIMEOUT_MS = 20_000;

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ...(opts.headers || {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

const TARGETS = [
  "https://info.edbo.gov.ua/",
  "https://info.edbo.gov.ua/opendata/",
  "https://info.edbo.gov.ua/opendata",
  "https://edbo.gov.ua/",
  "https://www.edbo.gov.ua/",
  "https://edbo.gov.ua/opendata/",
  "https://vstup.edbo.gov.ua/opendata/"
];

async function main() {
  for (const url of TARGETS) {
    console.log(`\n=== ${url} ===`);
    try {
      const resp = await fetchWithTimeout(url);
      console.log(`статус: ${resp.status}`);
      if (resp.ok) {
        const text = await resp.text();
        console.log(`довжина: ${text.length}`);
        const title = /<title>([\s\S]*?)<\/title>/.exec(text);
        if (title) console.log(`title: ${title[1].trim()}`);
        // шукаємо посилання, що можуть вести на статистику/звіти/opendata
        const linkRe = /href="([^"]+)"/g;
        const interesting = new Set();
        let m;
        while ((m = linkRe.exec(text))) {
          const href = m[1];
          if (/статистик|звіт|opendata|open-data|report|analytic|прийом|вступ/i.test(href)) {
            interesting.add(href);
          }
        }
        if (interesting.size) {
          console.log("цікаві посилання:");
          for (const href of interesting) console.log(`  - ${href}`);
        }
      }
    } catch (err) {
      console.log(`помилка: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("diagnose-edbo-other-domains впав з помилкою:", err);
  process.exitCode = 1;
});
