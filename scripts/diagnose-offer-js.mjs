#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/, нічого на сайті не міняє) —
 * продовження розвідки з diagnose-applicant-fields.mjs. Шаблон сторінки
 * /offer/<id> містить плейсхолдери "pa"/"prsid" (натяк на пріоритет заяви
 * абітурієнта), але сам список вступників підвантажується окремим скриптом
 * /js/offer.js через AJAX — URL ендпоінта в HTML немає. Тут тягнемо сам
 * offer.js (і, про всяк випадок, functions.js/brownies.min.js) і шукаємо
 * в них рядкові літерали шляхів (fetch/ajax/url:) — щоб знайти реальний
 * ендпоінт, а тоді спробувати його викликати й подивитись на структуру
 * відповіді (чи справді є там пріоритет / стать / вік вступника).
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const SAMPLE_OFFER_ID = 1552449; // КНУ, Журналістика, бакалавр, денна, бюджет

async function fetchText(path) {
  const resp = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "Journalism2026 diagnostic" },
    signal: AbortSignal.timeout(20000)
  });
  return { status: resp.status, text: await resp.text() };
}

function findPaths(js) {
  // рядкові літерали, що виглядають як шлях API ("/…"), і будь-які .ajax({url: …})/fetch(...)
  const literalPaths = [...js.matchAll(/["'`](\/[a-zA-Z0-9_\-\/]+)["'`]/g)].map((m) => m[1]);
  const ajaxCalls = [...js.matchAll(/\.ajax\(\s*\{[^}]{0,300}/gs)].map((m) => m[0]);
  return { literalPaths: [...new Set(literalPaths)], ajaxCalls };
}

async function main() {
  for (const path of ["/js/offer.js?v250901", "/js/functions.js?v250901", "/js/brownies.min.js"]) {
    console.log(`\n=== ${path} ===`);
    const { status, text } = await fetchText(path);
    console.log("status:", status, "length:", text.length);
    const { literalPaths, ajaxCalls } = findPaths(text);
    const interesting = literalPaths.filter((p) => /offer|request|rating|applicant|abit|vstup/i.test(p));
    console.log("цікаві шляхи:", JSON.stringify(interesting));
    console.log("усі короткі шляхи (до 30):", JSON.stringify(literalPaths.slice(0, 30)));
    console.log(`знайдено .ajax({...}) викликів: ${ajaxCalls.length}`);
    for (const call of ajaxCalls.slice(0, 10)) {
      console.log("  ajax call snippet:", call.replace(/\s+/g, " ").slice(0, 250));
    }
    // окремо шукаємо саме слово offerId/usid поруч з url/action, це часто видає ендпоінт
    const idx = text.search(/offerId|usid/i);
    if (idx >= 0) {
      console.log("контекст навколо offerId/usid:", text.slice(Math.max(0, idx - 200), idx + 200).replace(/\s+/g, " "));
    }
  }
}

main().catch((err) => {
  console.error("diagnose-offer-js впав з помилкою:", err);
  process.exitCode = 1;
});
