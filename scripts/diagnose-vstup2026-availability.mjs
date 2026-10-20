#!/usr/bin/env node
/*
 * ТИМЧАСОВА розвідка (нічого не комітить) — чи кампанія 2026 вже
 * завершилась настільки, що можна використати той самий механізм, що й
 * для архівних років (vstup<рік>.edbo.gov.ua, /offers-universities/ +
 * /offers-list/ без Cloudflare Turnstile), і чи сторінки /offer/<usid>
 * вже містять реальний середній конкурсний бал (rqs_kv_avg) та кількість
 * допущених (rqs_allowed), а не null, як було на 04.09.2026 (див.
 * data/2026-current.json: "Середній бал вступників додається пізніше").
 *
 * Пробуємо по черзі:
 *   1) https://vstup2026.edbo.gov.ua — чи вже існує архівний піддомен
 *      для 2026 року, як для 2018–2025.
 *   2) https://vstup.edbo.gov.ua — чи сам живий сайт уже віддає дані без
 *      Turnstile (можливо, захист знімають одразу після завершення
 *      кампанії, а не лише при переїзді на архівний піддомен).
 */

async function postForm(base, path, data) {
  const body = new URLSearchParams(data).toString();
  const resp = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/javascript, */*; q=0.01",
      Referer: `${base}/`
    },
    signal: AbortSignal.timeout(20000),
    body
  });
  const text = await resp.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* не JSON — ймовірно, Cloudflare challenge page */
  }
  return { status: resp.status, contentType: resp.headers.get("content-type"), text, json };
}

async function tryBase(base) {
  console.log(`\n=== ${base} ===`);
  const uniResult = await postForm(base, "/offers-universities/", {
    qualification: "1",
    education_base: "40",
    speciality: "C7",
    region: "",
    education_form: "",
    course: ""
  });
  console.log(`/offers-universities/ status=${uniResult.status} content-type=${uniResult.contentType}`);
  if (!uniResult.json) {
    console.log(`  не JSON, перші 300 символів: ${uniResult.text.slice(0, 300).replace(/\s+/g, " ")}`);
    return false;
  }
  const universities = uniResult.json.universities || [];
  console.log(`  знайдено закладів: ${universities.length}`);
  if (!universities.length) return false;

  const allIds = universities.flatMap((u) => (u.ids || "").split(",").filter(Boolean)).slice(0, 50);
  const offersResult = await postForm(base, "/offers-list/", { ids: allIds.join(",") });
  console.log(`/offers-list/ status=${offersResult.status}`);
  const offers = offersResult.json?.offers || [];
  console.log(`  отримано пропозицій: ${offers.length}`);
  if (offers.length) {
    console.log(`  приклад offer[0]: ${JSON.stringify(offers[0]).slice(0, 500)}`);
  }

  // шукаємо журналістську пропозицію для перевірки сторінки /offer/<usid>
  const journalismOffer = offers.find((o) => /журналіст/i.test(o.qn || o.spn || ""));
  const sampleOffer = journalismOffer || offers[0];
  if (sampleOffer) {
    const usid = sampleOffer.usid;
    const offerPage = await fetch(`${base}/offer/${usid}`, {
      headers: { Accept: "text/html", "User-Agent": "Journalism2026 diagnostic" },
      signal: AbortSignal.timeout(20000)
    });
    const html = await offerPage.text();
    const normalized = html.replace(/\\"/g, '"');
    const field = (name) => {
      const m = normalized.match(new RegExp(`"${name}":"?(-?\\d+(?:\\.\\d+)?)`));
      return m ? m[1] : null;
    };
    console.log(`  /offer/${usid}: rqs_total=${field("rqs_total")} rqs_allowed=${field("rqs_allowed")} rqs_kv_avg=${field("rqs_kv_avg")}`);
  }

  return true;
}

async function safeTryBase(base) {
  try {
    return await tryBase(base);
  } catch (err) {
    console.log(`  Помилка для ${base}: ${err.message}`);
    return false;
  }
}

async function main() {
  const okArchive = await safeTryBase("https://vstup2026.edbo.gov.ua");
  const okLive = await safeTryBase("https://vstup.edbo.gov.ua");
  console.log(`\n\nПІДСУМОК: vstup2026 працює без Turnstile = ${okArchive}; vstup (живий) працює без Turnstile = ${okLive}`);
}

main().catch((err) => {
  console.error("Помилка:", err.message);
  process.exitCode = 1;
});
