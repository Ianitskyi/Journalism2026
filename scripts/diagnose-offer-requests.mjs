#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/, нічого на сайті не міняє) —
 * продовження розвідки. У offer.js знайдено рядок "/offer-requests/" —
 * ймовірний AJAX-ендпоінт, який підвантажує список вступників (конкурсні
 * заяви) для конкретної пропозиції. Пробуємо різні форми виклику (GET/POST,
 * різні назви параметра з id пропозиції) і друкуємо сиру відповідь + усі
 * ключі першого запису, щоб побачити, чи є там пріоритет/стать/вік.
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const SAMPLE_OFFER_ID = 1552449; // КНУ, Журналістика, бакалавр, денна, бюджет

async function tryCall(label, fn) {
  console.log(`\n--- ${label} ---`);
  try {
    const resp = await fn();
    const text = await resp.text();
    console.log("status:", resp.status, "content-type:", resp.headers.get("content-type"), "length:", text.length);
    console.log("body (перші 1500 символів):", text.slice(0, 1500));
    try {
      const json = JSON.parse(text);
      const arr = Array.isArray(json) ? json : json.data || json.requests || json.items || null;
      if (Array.isArray(arr) && arr.length) {
        console.log("це масив, довжина:", arr.length);
        console.log("ключі першого запису:", JSON.stringify(Object.keys(arr[0])));
        console.log("перший запис:", JSON.stringify(arr[0]));
      } else if (json && typeof json === "object") {
        console.log("це об'єкт, ключі верхнього рівня:", JSON.stringify(Object.keys(json)));
      }
    } catch {
      // не JSON — вже надрукували текст вище
    }
  } catch (err) {
    console.log("error:", err.message);
  }
}

async function printOfferJsContext() {
  const resp = await fetch(`${BASE}/js/offer.js?v250901`, {
    headers: { "User-Agent": "Journalism2026 diagnostic" },
    signal: AbortSignal.timeout(20000)
  });
  const js = await resp.text();
  const idx = js.indexOf("/offer-requests/");
  console.log("\n--- контекст навколо '/offer-requests/' в offer.js ---");
  console.log(js.slice(Math.max(0, idx - 400), idx + 400));
}

async function main() {
  await printOfferJsContext();

  const headers = {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json, text/javascript, */*; q=0.01",
    Referer: `${BASE}/offer/${SAMPLE_OFFER_ID}`
  };

  await tryCall("GET /offer-requests/?id=", () =>
    fetch(`${BASE}/offer-requests/?id=${SAMPLE_OFFER_ID}`, { headers, signal: AbortSignal.timeout(20000) })
  );

  await tryCall("GET /offer-requests/<id>", () =>
    fetch(`${BASE}/offer-requests/${SAMPLE_OFFER_ID}`, { headers, signal: AbortSignal.timeout(20000) })
  );

  for (const paramName of ["id", "offerId", "usid", "offer_id"]) {
    await tryCall(`POST /offer-requests/ {${paramName}}`, () =>
      fetch(`${BASE}/offer-requests/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ [paramName]: String(SAMPLE_OFFER_ID) }).toString(),
        signal: AbortSignal.timeout(20000)
      })
    );
  }
}

main().catch((err) => {
  console.error("diagnose-offer-requests впав з помилкою:", err);
  process.exitCode = 1;
});
