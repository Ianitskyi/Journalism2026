#!/usr/bin/env node
/*
 * Розвідка: чи є в архівному ЄДЕБО (vstup<рік>.edbo.gov.ua) дані про
 * фактично ЗАРАХОВАНИХ студентів (а не лише допущених до конкурсу).
 * Дивимось (1) повну структуру offers-list/ відповіді — які саме поля є
 * під st.c і чи є сестринські до "c" ключі; (2) вихідний код
 * offers_search_form.js — чи є там підказки-лейбли для полів статистики.
 */

const BASE = "https://vstup2024.edbo.gov.ua";

async function postForm(path, data) {
  const body = new URLSearchParams(data).toString();
  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/javascript, */*; q=0.01",
      Referer: `${BASE}/`
    },
    body,
    signal: AbortSignal.timeout(20000)
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} для ${path}`);
  return resp.json();
}

async function main() {
  console.log("=== 1. Пошук закладів (bachelor, C7/061 Журналістика) ===");
  const uniResp = await postForm("/offers-universities/", {
    qualification: "1",
    education_base: "40",
    speciality: "061",
    region: "",
    education_form: "",
    course: ""
  });
  const universities = uniResp.universities || [];
  console.log(`Знайдено закладів: ${universities.length}`);
  console.log("Перший заклад (сирий об'єкт):", JSON.stringify(universities[0], null, 2));

  const firstIds = (universities[0]?.ids || "").split(",").filter(Boolean).slice(0, 5);
  console.log(`\n=== 2. offers-list/ для перших id (${firstIds.join(",")}) ===`);
  const offersResp = await postForm("/offers-list/", { ids: firstIds.join(",") });
  console.log("Кількість offers:", (offersResp.offers || []).length);
  for (const offer of (offersResp.offers || []).slice(0, 3)) {
    console.log("--- offer (повністю) ---");
    console.log(JSON.stringify(offer, null, 2));
  }

  console.log("\n=== 3. Пошук у offers_search_form.js підказок про поля статистики ===");
  const jsResp = await fetch(`${BASE}/js/offers_search_form.js`, { signal: AbortSignal.timeout(20000) });
  const js = await jsResp.text();
  console.log(`Розмір файлу: ${js.length} символів`);
  const keywords = ["зарахован", "рекомендован", "enrolled", "\\.km", "\\.kx", "\\.ka\\b", "\\.t\\b", "\\.a\\b", "st\\.c", "st\\.d", "st\\.e", "st\\.z"];
  for (const kw of keywords) {
    const re = new RegExp(kw, "gi");
    const matches = [...js.matchAll(re)];
    if (!matches.length) continue;
    console.log(`\n--- знайдено "${kw}" (${matches.length} збігів), перші 3 контексти ---`);
    for (const m of matches.slice(0, 3)) {
      const start = Math.max(0, m.index - 120);
      const end = Math.min(js.length, m.index + 120);
      console.log(js.slice(start, end).replace(/\s+/g, " "));
      console.log("···");
    }
  }
}

main().catch((err) => {
  console.error("diagnose-edbo-enrollment впав з помилкою:", err);
  process.exitCode = 1;
});
