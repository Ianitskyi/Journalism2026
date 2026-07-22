#!/usr/bin/env node
/*
 * fetch-edbo-history.mjs дав 0 результатів для 2021-2024 (speciality=C7 —
 * код нової класифікації, ймовірно невірний для цих років) і JSON-помилку
 * для 2018-2020 (інша структура сайту). Цей скрипт просто завантажує
 * головну сторінку кожного архівного року (plain fetch, без браузера) і
 * шукає в HTML рядки з "журналіст", щоб знайти правильний код спеціальності
 * (value відповідного <option>) для кожного року окремо.
 */

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

async function main() {
  for (const year of YEARS) {
    const url = `https://vstup${year}.edbo.gov.ua/`;
    console.log(`\n=== ${year} (${url}) ===`);
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const html = await resp.text();
      console.log(`status ${resp.status}, довжина ${html.length}`);

      // шукаємо усі <option value="X">...журналіст...</option> (та сусідні рядки)
      const re = /<option[^>]*value="([^"]*)"[^>]*>([^<]*журналіст[^<]*)<\/option>/gi;
      let m;
      let found = 0;
      while ((m = re.exec(html)) !== null) {
        console.log(`  option value="${m[1]}" text="${m[2].trim()}"`);
        found++;
      }
      if (!found) {
        // може бути в іншому форматі (JS-масив опцій, не <option>) — просто
        // покажемо контекст навколо першого входження слова "журналіст"
        const idx = html.toLowerCase().indexOf("журналіст");
        if (idx >= 0) {
          console.log(`  контекст навколо "журналіст": ...${html.slice(Math.max(0, idx - 150), idx + 150)}...`);
        } else {
          console.log("  слово 'журналіст' взагалі не знайдено на головній сторінці");
        }
      }
    } catch (err) {
      console.log(`Помилка: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("Впало:", err);
  process.exitCode = 1;
});
