#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — рахує УНІКАЛЬНІ назви
 * освітніх програм (spn) окремо для бакалаврату й магістратури КНУ (uid=41),
 * спеціальність C7, 2025 рік — щоб перевірити реальний programCount після
 * виправлення (рахувати унікальні spn, а не кількість конкурсних
 * пропозицій/офферів).
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const KNU_UID = 41;
const JOURNALISM_RE = /журналіст/i;

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

async function dumpLevel(qualification, educationBase, label) {
  console.log(`\n=== КНУ, ${label}, C7, ${YEAR} ===`);
  const uniResp = await postForm("/offers-universities/", {
    qualification,
    education_base: educationBase,
    speciality: "C7",
    region: "",
    education_form: "",
    course: ""
  });
  const uni = (uniResp.universities || []).find((u) => u.uid === KNU_UID);
  if (!uni) {
    console.log("КНУ не знайдено у списку ЗВО для цього рівня.");
    return;
  }
  const ids = (uni.ids || "").split(",").filter(Boolean);
  const offersResp = await postForm("/offers-list/", { ids: ids.join(",") });
  const offers = offersResp.offers || [];
  console.log("усього офферів у КНУ:", offers.length);

  const journalismOffers = offers.filter((o) => JOURNALISM_RE.test(o.spn || ""));
  console.log("журналістських офферів:", journalismOffers.length);

  const distinctSpn = new Set(journalismOffers.map((o) => o.spn));
  console.log("унікальних назв програм (spn):", distinctSpn.size, JSON.stringify([...distinctSpn]));

  for (const offer of journalismOffers) {
    console.log(`  usid=${offer.usid} spn="${offer.spn}" ustn="${offer.ustn}" efn="${offer.efn}" t=${offer.st?.c?.t} a=${offer.st?.c?.a}`);
  }

  console.log("\nусі оффери КНУ (включно з не-журналістськими), spn:", JSON.stringify(offers.map((o) => o.spn)));
}

async function main() {
  await dumpLevel("1", "40", "бакалавр");
  await dumpLevel("2", "", "магістр");
}

main().catch((err) => {
  console.error("diagnose-application-count впав з помилкою:", err);
  process.exitCode = 1;
});
