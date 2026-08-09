#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — перевіряє, чи кампанія
 * 2026 року вже завершилась і vstup2026.edbo.gov.ua запрацював як
 * архівні роки (2018-2025): без Cloudflare, з тим самим
 * /offers-universities/ + /offers-list/ контрактом.
 */

const BASE = "https://vstup2026.edbo.gov.ua";

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
  console.log(`=== GET ${BASE}/ ===`);
  try {
    const home = await fetch(`${BASE}/`, { headers: { "User-Agent": "Journalism2026 diagnostic" }, signal: AbortSignal.timeout(20000) });
    console.log("status:", home.status, "length:", (await home.text()).length);
  } catch (err) {
    console.log("помилка:", err.message);
  }

  console.log(`\n=== POST ${BASE}/offers-universities/ (бакалавр, C7 Журналістика) ===`);
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
      console.log("НЕ валідний JSON");
    }
  } catch (err) {
    console.log("помилка запиту:", err.message);
  }
}

main().catch((err) => {
  console.error("diagnose-2026-archived впав з помилкою:", err);
  process.exitCode = 1;
});
