#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — перевіряє, чи вже
 * можна автоматично отримати дані поточної (2026) вступної кампанії з
 * живого vstup.edbo.gov.ua. Раніше (fetch-edbo-current.mjs, коментарі)
 * /offers-universities/ (пошук пропозицій) був захищений Cloudflare
 * Turnstile — цей скрипт лише перевіряє поточний стан, нічого не обходить.
 */

const BASE = "https://vstup.edbo.gov.ua";

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
  const text = await resp.text();
  return { status: resp.status, contentType: resp.headers.get("content-type"), text };
}

async function main() {
  console.log("=== POST /offers-universities/ (пошук пропозицій, бакалавр, C7 Журналістика) ===");
  const search = await postForm("/offers-universities/", {
    qualification: "1", education_base: "40", speciality: "C7",
    region: "", education_form: "", course: ""
  });
  console.log("status:", search.status, "content-type:", search.contentType, "length:", search.text.length);
  console.log("перші 500 символів відповіді:", search.text.slice(0, 500));
  try {
    const json = JSON.parse(search.text);
    console.log("це валідний JSON! universities:", (json.universities || []).length);
  } catch {
    console.log("НЕ валідний JSON (ймовірно HTML-сторінка Cloudflare challenge або помилка)");
  }

  // головна сторінка — шукаємо згадки про статус кампанії / дати наказів про зарахування
  console.log("\n=== GET / (головна) — шукаємо дати/статус кампанії ===");
  const home = await fetch(`${BASE}/`, { headers: { "User-Agent": "Journalism2026 diagnostic" }, signal: AbortSignal.timeout(20000) });
  const homeText = await home.text();
  console.log("status:", home.status, "length:", homeText.length);
  for (const kw of ["наказ", "зарахован", "рейтингов", "2026"]) {
    const idx = homeText.toLowerCase().indexOf(kw.toLowerCase());
    if (idx >= 0) console.log(`  "${kw}":`, homeText.slice(Math.max(0, idx - 100), idx + 200).replace(/\s+/g, " "));
  }
}

main().catch((err) => {
  console.error("diagnose-2026-availability впав з помилкою:", err);
  process.exitCode = 1;
});
