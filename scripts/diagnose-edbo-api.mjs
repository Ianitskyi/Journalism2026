#!/usr/bin/env node
/*
 * Пряма перевірка реального API vstup<рік>.edbo.gov.ua (архівний рік,
 * НЕ захищений Cloudflare — перевірено diagnose-edbo-history.mjs).
 *
 * З коду scripts-vidповідно offers_search_form.js (див.
 * diagnose-edbo-fetch-js.mjs) відомо:
 *  - POST /offers-universities/ з полями qualification/education_base/
 *    speciality/region/education_form/course повертає {universities:[...]}
 *  - POST /offers-list/ з {ids: "<comma-separated>"} повертає {offers:[...]}
 * Це звичайний form-submit, який робить будь-який браузер — не обхід
 * жодного захисту (тут його й нема).
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;

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
    signal: AbortSignal.timeout(15000)
  });
  const text = await resp.text();
  return { status: resp.status, text };
}

async function main() {
  console.log(`=== POST /offers-universities/ (qualification=1 Бакалавр, education_base=40, speciality=C7 Журналістика) ===`);
  const uniResp = await postForm("/offers-universities/", {
    qualification: "1",
    education_base: "40",
    speciality: "C7",
    region: "",
    education_form: "",
    course: ""
  });
  console.log(`status ${uniResp.status}`);
  console.log(uniResp.text);

  let uniData;
  try {
    uniData = JSON.parse(uniResp.text);
  } catch (err) {
    console.log(`Не вдалось розпарсити JSON: ${err.message}`);
    return;
  }

  if (!uniData.universities || !uniData.universities.length) {
    console.log("\n⚠️ Немає universities у відповіді — перевір поля запиту.");
    return;
  }

  console.log(`\n=== Знайдено ${uniData.universities.length} ЗВО. Перший запис повністю: ===`);
  console.log(JSON.stringify(uniData.universities[0], null, 2));

  const allIds = uniData.universities
    .flatMap((u) => u.ids || u.offer_ids || u.offerIds || [])
    .join(",");

  console.log(`\nusiідатрибути можливих ключів для id пропозицій: ${Object.keys(uniData.universities[0]).join(", ")}`);

  if (allIds) {
    console.log(`\n=== POST /offers-list/ (ids=${allIds.slice(0, 200)}...) ===`);
    const offersResp = await postForm("/offers-list/", { ids: allIds });
    console.log(`status ${offersResp.status}`);
    console.log(offersResp.text.slice(0, 8000));
  } else {
    console.log("\n⚠️ Не знайшов ids пропозицій у відповіді universities — спробую взяти перший ЗВО і подивитись усі його поля ще раз вручну.");
  }
}

main().catch((err) => {
  console.error("Впало:", err);
  process.exitCode = 1;
});
