#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/, нічого на сайті не міняє) —
 * валідація механіки /offer-requests/ перед побудовою повного конвеєра:
 *  1) чи справді параметр "last" — це пагінація "скільки вже завантажено"
 *     (пробуємо last=0, потім last=<кількість отриманих записів>, і так,
 *     поки відповідь не стане порожньою чи коротшою за розмір сторінки);
 *  2) чи варіюється pa (пріоритет) — чи є серед 1275 заяв цього офера
 *     значення 2, 3 і вище, чи всі 1;
 *  3) яке поле відповідає "допущено" — порівнюємо кількість записів з cp===1
 *     (і окремо з d===1) із відомим st.c.a = 1099 для цього ж офера.
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const SAMPLE_OFFER_ID = 1552449; // КНУ, Журналістика, бакалавр, денна, бюджет: t=1275, a=1099
const KNOWN_T = 1275;
const KNOWN_A = 1099;
const PAGE_SIZE_HINT = 100;
const MAX_PAGES = 25; // запобіжник від нескінченного циклу

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(last) {
  const resp = await fetch(`${BASE}/offer-requests/`, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: `${BASE}/offer/${SAMPLE_OFFER_ID}`
    },
    body: new URLSearchParams({ id: String(SAMPLE_OFFER_ID), last: String(last) }).toString(),
    signal: AbortSignal.timeout(20000)
  });
  const json = await resp.json();
  return json.requests || [];
}

async function main() {
  const all = [];
  let last = 0;
  let page = 0;
  while (page < MAX_PAGES) {
    page++;
    const batch = await fetchPage(last);
    console.log(`сторінка ${page}: last=${last} -> отримано ${batch.length} записів` + (batch.length ? `, n від ${batch[0].n} до ${batch[batch.length - 1].n}` : ""));
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < PAGE_SIZE_HINT) break;
    last = all.length; // гіпотеза: last = кількість вже завантажених записів
    await sleep(250);
  }

  console.log(`\nусього зібрано записів: ${all.length} (очікувалось t=${KNOWN_T})`);

  const uniqueN = new Set(all.map((r) => r.n));
  console.log("унікальних n:", uniqueN.size, uniqueN.size === all.length ? "(без дублів)" : "(!! Є ДУБЛІ !!)");

  const paCounts = {};
  for (const r of all) paCounts[r.pa] = (paCounts[r.pa] || 0) + 1;
  console.log("розподіл pa (пріоритет):", JSON.stringify(paCounts));

  const cpCounts = {};
  for (const r of all) cpCounts[r.cp] = (cpCounts[r.cp] || 0) + 1;
  console.log("розподіл cp:", JSON.stringify(cpCounts));

  const dCounts = {};
  for (const r of all) dCounts[r.d] = (dCounts[r.d] || 0) + 1;
  console.log("розподіл d:", JSON.stringify(dCounts));

  const cptCounts = {};
  for (const r of all) cptCounts[r.cpt] = (cptCounts[r.cpt] || 0) + 1;
  console.log("розподіл cpt (текстовий статус):", JSON.stringify(cptCounts));

  const cpOnes = all.filter((r) => r.cp === 1).length;
  const dOnes = all.filter((r) => r.d === 1).length;
  console.log(`\ncp===1: ${cpOnes} (відоме a=${KNOWN_A}) -> ${cpOnes === KNOWN_A ? "СПІВПАДАЄ" : "не співпадає"}`);
  console.log(`d===1: ${dOnes} (відоме a=${KNOWN_A}) -> ${dOnes === KNOWN_A ? "СПІВПАДАЄ" : "не співпадає"}`);

  // приклад запису з pa != 1, якщо такий є — цікаво подивитись на повну структуру
  const nonPriority1 = all.find((r) => r.pa !== 1);
  console.log("\nприклад запису з pa !== 1:", nonPriority1 ? JSON.stringify(nonPriority1) : "не знайдено жодного");
}

main().catch((err) => {
  console.error("diagnose-offer-requests-pagination впав з помилкою:", err);
  process.exitCode = 1;
});
