#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — з'ясовує, чи "pa"
 * (пріоритет заяви) в /offer-requests/ колись ненульовий для магістратури
 * 2021-2022 (де applicationsP12Total вийшов 0 для КОЖНОГО закладу), чи
 * pa=0 там завжди — тобто сам механізм подачі заяв з пріоритетом
 * (1-й/2-й вибір) на магістратуру тоді ще не існував, а не просто поле
 * "не заповнене". Порівнюємо з бакалавратом тих самих років (де
 * пріоритет точно рахується) і з магістратурою пізніших років.
 */

const CASES = [
  { year: 2021, level: "master", qualification: "2", educationBase: "" },
  { year: 2021, level: "bachelor", qualification: "1", educationBase: "40" },
  { year: 2022, level: "master", qualification: "2", educationBase: "" },
  { year: 2023, level: "master", qualification: "2", educationBase: "" }
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
    // беремо 3 найбільші offer за кількістю заяв — щоб мати досить записів для аналізу pa
    offers.sort((a, b) => Number(b.st.c.t) - Number(a.st.c.t));
    const sample = offers.slice(0, 3);

    for (const offer of sample) {
      const requests = await fetchAllRequests(base, offer.usid);
      const paValues = requests.map((r) => Number(r.pa));
      const distinct = [...new Set(paValues)].sort((a, b) => a - b);
      const nonZero = paValues.filter((v) => v > 0).length;
      console.log(`  usid=${offer.usid} (${offer.un}, spn=${offer.spn}, ustn=${offer.ustn}): ${requests.length} записів, унікальні pa=${JSON.stringify(distinct)}, pa>0: ${nonZero}/${requests.length}`);
    }
  }
}

main().catch((err) => {
  console.error("diagnose-priority-existed впав з помилкою:", err);
  process.exitCode = 1;
});
