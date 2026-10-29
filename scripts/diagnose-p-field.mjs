#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — перевіряє гіпотезу, що
 * поле "p" у записах /offer-requests/ (напр. "p":"Б", "p":"К") позначає
 * бюджет/контракт ІНДИВІДУАЛЬНО для кожної заяви, незалежно від offer.ustn
 * — якщо так, це універсальний і точніший спосіб рахувати "лише бюджет"
 * (працює навіть для магістратури 2021-2022, де ustn="Відкрита" не існує).
 *
 * Перевірка: розподіл значень "p" окремо для offer з ustn="Небюджетна"
 * (де б не мало бути жодного "Б", якщо гіпотеза вірна) і для
 * ustn="Фіксована"/"Відкрита" (де мають бути обидва варіанти).
 */

const CASES = [
  { year: 2021, level: "master", qualification: "2", educationBase: "" },
  { year: 2022, level: "master", qualification: "2", educationBase: "" },
  { year: 2023, level: "master", qualification: "2", educationBase: "" },
  { year: 2025, level: "bachelor", qualification: "1", educationBase: "40" }
];

function specialityFor(year) {
  return year >= 2025 ? "C7" : "061";
}

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
    body,
    signal: AbortSignal.timeout(20000)
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} для ${path}`);
  return resp.json();
}

async function fetchAllRequests(base, usid) {
  let last = 0;
  let all = [];
  for (let page = 0; page < 60; page++) {
    const json = await postForm(base, "/offer-requests/", { id: String(usid), last: String(last) });
    const batch = json.requests || [];
    if (!batch.length) break;
    all = all.concat(batch);
    last = all.length;
    await new Promise((r) => setTimeout(r, 100));
  }
  return all;
}

async function main() {
  for (const { year, level, qualification, educationBase } of CASES) {
    const base = `https://vstup${year}.edbo.gov.ua`;
    console.log(`\n========== ${level} ${year} ==========`);

    const uniResp = await postForm(base, "/offers-universities/", {
      qualification, education_base: educationBase,
      speciality: specialityFor(year), region: "", education_form: "", course: ""
    });
    const allIds = (uniResp.universities || []).flatMap((u) => (u.ids || "").split(",").filter(Boolean));
    if (!allIds.length) { console.log("немає offer id"); continue; }

    const offersResp = await postForm(base, "/offers-list/", { ids: allIds.slice(0, 200).join(",") });
    const offers = (offersResp.offers || []).filter((o) => o.st && o.st.c && Number(o.st.c.t) > 5);

    const byUstn = {};
    for (const o of offers) {
      const key = o.ustn ?? "(undefined)";
      if (!byUstn[key]) byUstn[key] = [];
      byUstn[key].push(o);
    }

    for (const [ustn, group] of Object.entries(byUstn)) {
      // беремо до 2 найбільших offer цього ustn-типу
      group.sort((a, b) => Number(b.st.c.t) - Number(a.st.c.t));
      const sample = group.slice(0, 2);
      for (const offer of sample) {
        const requests = await fetchAllRequests(base, offer.usid);
        const pValues = requests.map((r) => r.p);
        const dist = {};
        for (const p of pValues) dist[p] = (dist[p] || 0) + 1;
        console.log(`  ustn="${ustn}" usid=${offer.usid} (${offer.un}, spn=${offer.spn}, top-level ob=${offer.ob}, oc=${offer.oc}): ${requests.length} заяв, розподіл "p": ${JSON.stringify(dist)}`);
      }
    }
  }
}

main().catch((err) => {
  console.error("diagnose-p-field впав з помилкою:", err);
  process.exitCode = 1;
});
