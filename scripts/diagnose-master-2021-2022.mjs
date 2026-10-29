#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — з'ясовує, чому для
 * магістратури 2021 і 2022 років і фільтр пріоритету (applicationsP12),
 * і фільтр бюджету (applicationsOpen) виходять нульовими для КОЖНОГО
 * закладу, тоді як для бакалаврату тих самих років і для магістратури
 * 2023+ обидва рахуються нормально. Перевіряємо дві гіпотези:
 * (a) offer.ustn відсутнє/інше для магістерських offer тих років;
 * (b) поле "pa" (пріоритет) у /offer-requests/ відсутнє/інше.
 */

const YEARS = [2021, 2022, 2023];
const QUALIFICATION_MASTER = "2";
const EDUCATION_BASE_MASTER = "";

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

function specialityFor(year) {
  return year >= 2025 ? "C7" : "061";
}

async function main() {
  for (const year of YEARS) {
    const base = `https://vstup${year}.edbo.gov.ua`;
    console.log(`\n========== master ${year} (${base}) ==========`);

    const uniResp = await postForm(base, "/offers-universities/", {
      qualification: QUALIFICATION_MASTER, education_base: EDUCATION_BASE_MASTER,
      speciality: specialityFor(year), region: "", education_form: "", course: ""
    });
    const universities = uniResp.universities || [];
    const allIds = universities.flatMap((u) => (u.ids || "").split(",").filter(Boolean));
    console.log(`ЗВО: ${universities.length}, offer id: ${allIds.length}`);
    if (!allIds.length) continue;

    const offersResp = await postForm(base, "/offers-list/", { ids: allIds.slice(0, 200).join(",") });
    const offers = offersResp.offers || [];
    console.log(`Отримано ${offers.length} offer. Приклад ключів:`, JSON.stringify(Object.keys(offers[0] || {})));

    const ustnCounts = {};
    for (const o of offers) {
      const key = o.ustn === undefined ? "(undefined)" : JSON.stringify(o.ustn);
      ustnCounts[key] = (ustnCounts[key] || 0) + 1;
    }
    console.log("розподіл offer.ustn:", JSON.stringify(ustnCounts));

    // беремо перший offer із реальними заявами й дивимось сирий /offer-requests/
    const sample = offers.find((o) => o.st && o.st.c && Number(o.st.c.t) > 0);
    if (!sample) { console.log("немає offer з заявами для проби /offer-requests/"); continue; }
    console.log(`проба /offer-requests/ для usid=${sample.usid} (${sample.un}, spn=${sample.spn}, ustn=${JSON.stringify(sample.ustn)}, st.c.t=${sample.st.c.t})`);

    const reqResp = await postForm(base, "/offer-requests/", { id: String(sample.usid), last: "0" });
    const batch = reqResp.requests || [];
    console.log(`/offer-requests/ повернув ${batch.length} записів. Ключі першого:`, JSON.stringify(Object.keys(batch[0] || {})));
    console.log("перші 3 записи:", JSON.stringify(batch.slice(0, 3)));
  }
}

main().catch((err) => {
  console.error("diagnose-master-2021-2022 впав з помилкою:", err);
  process.exitCode = 1;
});
