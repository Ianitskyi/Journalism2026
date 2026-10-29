#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — з'ясовує, чи "Фіксована"
 * (ustn) завжди означає пільгову квоту, чи в 2021-2022 роках для
 * магістратури це був просто тодішній механізм держзамовлення без
 * "відкритого конкурсу" (тобто по суті звичайний бюджет).
 *
 * Гіпотеза для перевірки: master-специфічне поле mptid/mptn (з'являється
 * лише в master offer, не в bachelor) може бути маркером типу
 * держзамовлення/квоти — порівнюємо його значення для "Фіксована" offer
 * у роках, де ustn="Відкрита" взагалі не існує (2021-2022), проти років,
 * де "Відкрита" і "Фіксована" співіснують (2023, 2025) — якщо в других
 * "Фіксована" справді позначає окрему пільгову категорію, там це поле
 * має відрізнятись від значення в 2021-2022.
 */

const YEARS = [2021, 2022, 2023, 2025];
const QUALIFICATION_MASTER = "2";

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

async function main() {
  for (const year of YEARS) {
    const base = `https://vstup${year}.edbo.gov.ua`;
    console.log(`\n========== master ${year} ==========`);

    const uniResp = await postForm(base, "/offers-universities/", {
      qualification: QUALIFICATION_MASTER, education_base: "",
      speciality: specialityFor(year), region: "", education_form: "", course: ""
    });
    const allIds = (uniResp.universities || []).flatMap((u) => (u.ids || "").split(",").filter(Boolean));
    if (!allIds.length) { console.log("немає offer id"); continue; }

    const offersResp = await postForm(base, "/offers-list/", { ids: allIds.join(",") });
    const offers = offersResp.offers || [];
    console.log(`Отримано ${offers.length} offer.`);

    // групуємо за ustn, друкуємо унікальні значення mptid/mptn/rk/qid/cid
    // для КОЖНОГО типу ustn — шукаємо поле, що відрізняє звичайне
    // "Фіксована" від потенційно пільгового
    const byUstn = {};
    for (const o of offers) {
      const key = o.ustn ?? "(undefined)";
      if (!byUstn[key]) byUstn[key] = [];
      byUstn[key].push(o);
    }
    for (const [ustn, group] of Object.entries(byUstn)) {
      const mptn = [...new Set(group.map((o) => o.mptn ?? "(undefined)"))];
      const mptid = [...new Set(group.map((o) => o.mptid ?? "(undefined)"))];
      const rk = [...new Set(group.map((o) => o.rk ?? "(undefined)"))];
      console.log(`  ustn="${ustn}" (${group.length} offer): mptn=${JSON.stringify(mptn)} mptid=${JSON.stringify(mptid)} rk=${JSON.stringify(rk)}`);
    }

    // повний сирий приклад одного offer кожного типу ustn — щоб побачити
    // геть усі поля напряму
    for (const [ustn, group] of Object.entries(byUstn)) {
      console.log(`  повний приклад ustn="${ustn}":`, JSON.stringify(group[0]));
    }
  }
}

main().catch((err) => {
  console.error("diagnose-fiksovana-meaning впав з помилкою:", err);
  process.exitCode = 1;
});
