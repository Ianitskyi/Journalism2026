#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/, нічого на сайті не міняє) —
 * шукає, яке поле в об'єкті offer з /offers-list/ відповідає за джерело
 * фінансування (бюджет/контракт).
 *
 * Ідея: fetch-edbo-history.mjs вже задокументував (коментар над
 * fetchLevelData), що ОДНА освітня програма (spn) подається кількома
 * "пропозиціями" (offer, ключ usid) — за формою навчання (денна/заочна) і
 * джерелом фінансування (бюджет/контракт), і що для КНУ це підтверджено:
 * 4 пропозиції spn "Журналістика" = 1 програма (тобто 2 форми навчання x
 * 2 джерела фінансування = 4). Тут беремо всі ці 4 (чи скільки є) сирі
 * offer-об'єкти для КНУ (uid=41) і одного-двох інших ЗВО, друкуємо їх
 * повністю, і виводимо, які саме ключі відрізняються між пропозиціями
 * однієї програми — це і має бути форма навчання + джерело фінансування.
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const QUALIFICATIONS = { bachelor: "1", master: "2" };
const EDUCATION_BASE = { bachelor: "40", master: "" };
const SPECIALITY = "C7"; // 2025 використовує нову літерну класифікацію
const SAMPLE_UIDS = [41, 79, 6945]; // КНУ, НаУКМА, КУБГ — відомо, що мають кілька offer на програму "Журналістика"

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

async function fetchOffers(level) {
  const uniResp = await postForm("/offers-universities/", {
    qualification: QUALIFICATIONS[level],
    education_base: EDUCATION_BASE[level],
    speciality: SPECIALITY,
    region: "",
    education_form: "",
    course: ""
  });
  const universities = uniResp.universities || [];
  const allIds = universities.flatMap((u) => (u.ids || "").split(",").filter(Boolean));
  if (!allIds.length) return [];

  const CHUNK = 200;
  const offers = [];
  for (let i = 0; i < allIds.length; i += CHUNK) {
    const chunk = allIds.slice(i, i + CHUNK);
    const offersResp = await postForm("/offers-list/", { ids: chunk.join(",") });
    for (const offer of offersResp.offers || []) offers.push(offer);
  }
  return offers;
}

function diffKeys(offers) {
  if (offers.length < 2) return [];
  const allKeys = new Set(offers.flatMap((o) => Object.keys(o)));
  const varying = [];
  for (const key of allKeys) {
    const values = offers.map((o) => JSON.stringify(o[key]));
    if (new Set(values).size > 1) varying.push(key);
  }
  return varying;
}

async function main() {
  for (const level of ["bachelor", "master"]) {
    console.log(`\n========== ${level} (${YEAR}) ==========`);
    const offers = await fetchOffers(level);
    console.log(`Отримано ${offers.length} пропозицій усього.`);

    for (const uid of SAMPLE_UIDS) {
      const uniOffers = offers.filter((o) => o.uid === uid);
      if (!uniOffers.length) continue;
      console.log(`\n--- uid=${uid} (${uniOffers[0].un}), ${uniOffers.length} пропозицій ---`);

      const bySpn = new Map();
      for (const o of uniOffers) {
        const spn = o.spn ?? "(без spn)";
        if (!bySpn.has(spn)) bySpn.set(spn, []);
        bySpn.get(spn).push(o);
      }

      for (const [spn, group] of bySpn) {
        console.log(`\n  Програма "${spn}": ${group.length} пропозицій`);
        for (const o of group) {
          console.log("   ", JSON.stringify(o));
        }
        if (group.length > 1) {
          const varying = diffKeys(group);
          console.log(`   >>> ключі, що ВІДРІЗНЯЮТЬСЯ між пропозиціями цієї програми: ${JSON.stringify(varying)}`);
          for (const key of varying) {
            console.log(`       ${key}: ${JSON.stringify(group.map((o) => o[key]))}`);
          }
        }
      }
    }

    // про всяк випадок: усі ключі одного офера верхнього рівня і всередині st.c
    if (offers.length) {
      console.log("\nусі ключі offer (перший запис):", JSON.stringify(Object.keys(offers[0])));
      console.log("усі ключі offer.st.c (перший запис):", JSON.stringify(Object.keys(offers[0].st?.c || {})));
    }
  }
}

main().catch((err) => {
  console.error("diagnose-budget-field впав з помилкою:", err);
  process.exitCode = 1;
});
