#!/usr/bin/env node
/*
 * Замість гадання по UI (кілька спроб клікнути правильну кнопку пошуку не
 * дали AJAX-запиту з результатами) — просто читаємо вихідний код
 * offers_search_form.js напряму. Це публічний, немінімізований на вигляд
 * JS-файл, у якому має бути видно: які поля обов'язкові, чи це form.submit()
 * (реальна навігація з query-string) чи AJAX, і на який endpoint/з якими
 * параметрами він реально стукає.
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const FILES = ["/js/offers_search_form.js", "/js/functions.js", "/js/brownies.min.js"];

async function main() {
  for (const file of FILES) {
    const url = `${BASE}${file}?v250901`;
    console.log(`\n\n########## ${url} ##########\n`);
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const text = await resp.text();
      console.log(`status ${resp.status}, довжина ${text.length} символів`);
      console.log(text);
    } catch (err) {
      console.log(`Помилка: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("Впало:", err);
  process.exitCode = 1;
});
