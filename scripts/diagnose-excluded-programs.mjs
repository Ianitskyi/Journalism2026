#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — для рішення про ручні
 * винятки з фільтра "лише назви програм зі словом журналіст…". Бере ВСІ
 * заклади освіти зі спеціальністю C7 (2025) для обох рівнів, ділить усі
 * назви програм (spn) на ті, що вже проходять фільтр /журналіст/i, і ті,
 * що НЕ проходять (виключені) — і друкує список виключених назв, з якими
 * закладами вони трапляються і скільки заяв там подано, щоб можна було
 * позначити, які з них варто додати як ручний виняток.
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
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
  console.log(`\n########## ${label} — C7 — ${YEAR} ##########`);
  const uniResp = await postForm("/offers-universities/", {
    qualification,
    education_base: educationBase,
    speciality: "C7",
    region: "",
    education_form: "",
    course: ""
  });
  const universities = uniResp.universities || [];
  const allIds = universities.flatMap((u) => (u.ids || "").split(",").filter(Boolean));

  const CHUNK = 200;
  const offersById = new Map();
  for (let i = 0; i < allIds.length; i += CHUNK) {
    const chunk = allIds.slice(i, i + CHUNK);
    const offersResp = await postForm("/offers-list/", { ids: chunk.join(",") });
    for (const offer of offersResp.offers || []) {
      offersById.set(offer.usid, offer);
    }
  }

  // групуємо ВИКЛЮЧЕНІ (не проходять /журналіст/i) назви програм: назва -> {заклади, заяви, допущено}
  const excluded = new Map();
  let includedCount = 0;
  for (const offer of offersById.values()) {
    const spn = offer.spn || "(без назви)";
    if (JOURNALISM_RE.test(spn)) {
      includedCount++;
      continue;
    }
    if (!excluded.has(spn)) excluded.set(spn, new Map());
    const byUni = excluded.get(spn);
    const uid = offer.uid;
    if (!byUni.has(uid)) byUni.set(uid, { name: offer.un, t: 0, a: 0 });
    const rec = byUni.get(uid);
    const stats = offer.st && offer.st.c;
    rec.t += Number(stats?.t) || 0;
    rec.a += Number(stats?.a) || 0;
  }

  console.log(`усього офферів C7: ${offersById.size}, вже проходять фільтр: ${includedCount}, виключених офферів: ${offersById.size - includedCount}`);
  console.log(`унікальних ВИКЛЮЧЕНИХ назв програм: ${excluded.size}\n`);

  const sortedNames = [...excluded.entries()].sort((a, b) => {
    const sumA = [...a[1].values()].reduce((s, r) => s + r.t, 0);
    const sumB = [...b[1].values()].reduce((s, r) => s + r.t, 0);
    return sumB - sumA;
  });

  for (const [spn, byUni] of sortedNames) {
    const unis = [...byUni.values()];
    const totalT = unis.reduce((s, r) => s + r.t, 0);
    console.log(`"${spn}" — ${unis.length} заклад(ів), сумарно заяв: ${totalT}`);
    for (const rec of unis.sort((a, b) => b.t - a.t)) {
      console.log(`    ${rec.name} — заяв: ${rec.t}, допущено: ${rec.a}`);
    }
  }
}

async function main() {
  await dumpLevel("1", "40", "БАКАЛАВР");
  await dumpLevel("2", "", "МАГІСТР");
}

main().catch((err) => {
  console.error("diagnose-excluded-programs впав з помилкою:", err);
  process.exitCode = 1;
});
