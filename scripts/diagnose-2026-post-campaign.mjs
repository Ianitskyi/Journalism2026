#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — вступна кампанія 2026
 * ймовірно вже завершилась, але vstup2026.edbo.gov.ua (архівний піддомен,
 * як для 2018-2025) досі не існує (перевірено diagnose-2026-archived.mjs,
 * 9 разів поспіль "fetch failed"). Перевіряємо гіпотезу: може, дані
 * доступні на САМОМУ живому vstup.edbo.gov.ua (без переїзду на новий
 * піддомен) — раніше там був Cloudflare Turnstile саме на пошуку
 * пропозицій; можливо, після завершення кампанії цей захист знято.
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
  console.log(`=== GET ${BASE}/ (головна, живий домен) ===`);
  try {
    const home = await fetch(`${BASE}/`, { headers: { "User-Agent": "Journalism2026 diagnostic" }, signal: AbortSignal.timeout(20000) });
    const text = await home.text();
    console.log("status:", home.status, "length:", text.length);
    for (const kw of ["наказ", "зарахован", "завершен", "рейтингов", "cloudflare", "turnstile", "captcha"]) {
      const idx = text.toLowerCase().indexOf(kw.toLowerCase());
      if (idx >= 0) console.log(`  "${kw}":`, text.slice(Math.max(0, idx - 80), idx + 150).replace(/\s+/g, " "));
    }
  } catch (err) {
    console.log("помилка:", err.message);
  }

  console.log(`\n=== POST ${BASE}/offers-universities/ (старий контракт, живий домен, бакалавр C7) ===`);
  try {
    const search = await postForm("/offers-universities/", {
      qualification: "1", education_base: "40", speciality: "C7",
      region: "", education_form: "", course: ""
    });
    console.log("status:", search.status, "content-type:", search.contentType, "length:", search.text.length);
    console.log("перші 500 символів:", search.text.slice(0, 500));
    try {
      const json = JSON.parse(search.text);
      console.log("це валідний JSON! universities:", (json.universities || []).length);
    } catch {
      console.log("НЕ валідний JSON (ймовірно HTML — Cloudflare challenge чи 404)");
    }
  } catch (err) {
    console.log("помилка запиту:", err.message);
  }

  console.log(`\n=== GET ${BASE}/offers (сторінка пошуку, живий домен) ===`);
  try {
    const resp = await fetch(`${BASE}/offers`, { headers: { "User-Agent": "Journalism2026 diagnostic" }, signal: AbortSignal.timeout(20000) });
    const text = await resp.text();
    console.log("status:", resp.status, "length:", text.length);
    console.log("перші 300 символів:", text.slice(0, 300).replace(/\s+/g, " "));
  } catch (err) {
    console.log("помилка:", err.message);
  }
}

main().catch((err) => {
  console.error("diagnose-2026-post-campaign впав з помилкою:", err);
  process.exitCode = 1;
});
