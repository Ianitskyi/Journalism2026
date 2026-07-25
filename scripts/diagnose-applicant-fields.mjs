#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/, нічого на сайті не міняє) —
 * перевіряє, чи є в даних ЄДЕБО (публічно доступних без авторизації) поля
 * про стать/вік вступників і про пріоритет заяви (1-й/2-й вибір тощо).
 *
 * 1) Дивимось на агрегований /offers-list/ (те, чим користується рейтинг) —
 *    чи є там хоч якась розбивка не лише по т/a/ka, а по статі/віку.
 * 2) Тягнемо повний HTML сторінки /offer/<id> (архівний рік, не захищений
 *    Cloudflare) і шукаємо: (a) посилання на API-ендпоінт, який підвантажує
 *    сам рейтинговий список вступників (бо в HTML лише Handlebars-шаблон,
 *    не дані); (b) будь-які згадки стать/вік/gender/sex/age/пріоритет у
 *    самому шаблоні — це підкаже, чи взагалі є такі поля в моделі даних,
 *    навіть якщо конкретні значення підвантажуються окремим запитом.
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const SAMPLE_OFFER_ID = 1552449; // КНУ, Журналістика, бакалавр, денна, бюджет

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

async function checkAggregateFields() {
  console.log("\n=== 1) /offers-list/ — усі ключі одного офера (КНУ, Журналістика) ===");
  const uniResp = await postForm("/offers-universities/", {
    qualification: "1", education_base: "40", speciality: "C7", region: "", education_form: "", course: ""
  });
  const uni = (uniResp.universities || []).find((u) => u.uid === 41);
  const ids = (uni.ids || "").split(",").filter(Boolean);
  const offersResp = await postForm("/offers-list/", { ids: ids.join(",") });
  const offer = (offersResp.offers || [])[0];
  console.log("усі ключі offer:", JSON.stringify(Object.keys(offer)));
  console.log("усі ключі offer.st.c:", JSON.stringify(Object.keys(offer.st?.c || {})));
  const genderAgeKeys = Object.keys(offer).filter((k) => /gender|sex|age|birth|стат|вік/i.test(k));
  console.log("ключі, схожі на стать/вік:", JSON.stringify(genderAgeKeys));
}

async function checkOfferPage() {
  console.log(`\n=== 2) /offer/${SAMPLE_OFFER_ID} — повний HTML ===`);
  const resp = await fetch(`${BASE}/offer/${SAMPLE_OFFER_ID}`, {
    headers: { Accept: "text/html", "User-Agent": "Journalism2026 diagnostic" },
    signal: AbortSignal.timeout(20000)
  });
  const html = await resp.text();
  console.log("status:", resp.status, "length:", html.length);

  // шукаємо будь-які fetch()/XHR/data-url звернення до API всередині сторінки
  const apiCalls = [...html.matchAll(/(?:fetch|url|action)\(?[:=]?\s*["'`](\/[a-z0-9_\-\/]+)["'`]/gi)]
    .map((m) => m[1])
    .filter((u) => !/\.(css|js|svg|png|jpg|ico|woff2?)$/i.test(u));
  console.log("знайдені шляхи (можливі API):", JSON.stringify([...new Set(apiCalls)]));

  // ключові слова про стать/вік у шаблоні
  for (const kw of ["стат", "гендер", "gender", "sex", "вік", "age", "birth", "дата народж"]) {
    const idx = html.toLowerCase().indexOf(kw.toLowerCase());
    if (idx >= 0) {
      console.log(`  знайдено "${kw}":`, html.slice(Math.max(0, idx - 100), idx + 100).replace(/\s+/g, " "));
    } else {
      console.log(`  "${kw}": не знайдено`);
    }
  }

  // поля пріоритету в самому шаблоні (Handlebars-плейсхолдери типу {{pa}}, {{p}}, {{prsid}})
  const priorityPlaceholders = [...html.matchAll(/\{\{\{?#?\/?([a-z_]*p[a-z_]*rio[a-z_]*|pa|prsid|np)\b/gi)].map((m) => m[1]);
  console.log("плейсхолдери, схожі на пріоритет:", JSON.stringify([...new Set(priorityPlaceholders)]));

  // будь-які скрипти, підключені на сторінці (можуть містити ще ключі API)
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  console.log("підключені скрипти:", JSON.stringify(scripts.slice(0, 20)));
}

async function main() {
  await checkAggregateFields();
  await checkOfferPage();
}

main().catch((err) => {
  console.error("diagnose-applicant-fields впав з помилкою:", err);
  process.exitCode = 1;
});
