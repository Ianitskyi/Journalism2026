#!/usr/bin/env node
/*
 * ЗАГОТОВКА, НЕ ПЕРЕВІРЕНА. Написана без мережевого доступу до
 * vstup.edbo.gov.ua — точний контракт ендпоінтів потрібно підтвердити
 * (DevTools → Network на сторінці рейтингового списку) і оновити нижче.
 *
 * Мета скрипта: зібрати конкурсні пропозиції зі спеціальністю
 * 061 «Журналістика» (бакалавр і магістр) по всіх ЗВО, порахувати середній
 * конкурсний бал і кількість заяв на кожну пропозицію, і записати
 * data/<YYYY-MM-DD>.json у форматі, описаному в README.md.
 *
 * Призначений для запуску в GitHub Actions (див. .github/workflows/update-data.yml),
 * де є повний доступ в інтернет.
 */

const SPECIALTY_CODE = "061"; // Журналістика
const OUT_DIR = new URL("../data/", import.meta.url);

async function main() {
  throw new Error(
    "TODO: підтвердити реальний ендпоінт vstup.edbo.gov.ua перед використанням. " +
    "Дивись коментар угорі файлу."
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
