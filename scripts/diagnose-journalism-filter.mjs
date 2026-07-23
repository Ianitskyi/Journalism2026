#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — для попереднього перегляду
 * ідеї "рахувати заяви на одну навчальну програму, але лише для програм, де
 * в назві є слово «журналістика»" (у різних формах), перш ніж це впроваджувати.
 *
 * 1) Спершу друкує сирі offer-об'єкти для НаУКМА (uid 79) — щоб перевірити,
 *    яке саме поле містить назву освітньої програми (комент у
 *    fetch-edbo-history.mjs називає їх qn/ssn, але не пояснює семантику).
 * 2) Потім для року 2025 (обидва рівні) рахує по кожному закладу:
 *    - поточне середнє (сума заяв / кількість програм під C7, як зараз)
 *    - середнє лише по програмах, де в назві є "журналіст" (журналістика,
 *      журналіст, журналістики тощо — просте входження підрядка, без
 *      урахування регістру)
 *    і друкує порівняльну таблицю.
 */

const YEARS = [2025];
const QUALIFICATIONS = { bachelor: "1", master: "2" };
const EDUCATION_BASE = { bachelor: "40", master: "" };
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

async function fetchOffers(base, level, year) {
  const uniResp = await postForm(base, "/offers-universities/", {
    qualification: QUALIFICATIONS[level],
    education_base: EDUCATION_BASE[level],
    speciality: specialityFor(year),
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
    const offersResp = await postForm(base, "/offers-list/", { ids: chunk.join(",") });
    for (const offer of offersResp.offers || []) offers.push(offer);
  }
  return offers;
}

const JOURNALISM_RE = /журналіст/i;

function main() {
  return (async () => {
    for (const year of YEARS) {
      const base = `https://vstup${year}.edbo.gov.ua`;
      console.log(`\n========== ${year} (${base}) ==========`);

      for (const level of ["bachelor", "master"]) {
        console.log(`\n---------- ${level} ----------`);
        const offers = await fetchOffers(base, level, year);
        console.log(`Отримано ${offers.length} пропозицій.`);

        // 1) сирий дамп для НаУКМА (uid 79), якщо є в цьому рівні/році —
        // щоб побачити реальні назви полів і значення
        const naukma = offers.filter((o) => o.uid === 79);
        if (naukma.length) {
          console.log(`\n[RAW DUMP] НаУКМА (uid=79), ${naukma.length} пропозицій:`);
          for (const o of naukma) {
            console.log(JSON.stringify(o));
          }
        }

        // 2) групуємо по закладу, рахуємо і поточне, і "лише журналістика"
        const byUid = new Map();
        for (const offer of offers) {
          const stats = offer.st && offer.st.c;
          if (!stats || !stats.t) continue;
          const t = Number(stats.t);
          if (!Number.isFinite(t) || t <= 0) continue;

          const uid = offer.uid;
          if (!byUid.has(uid)) byUid.set(uid, { uid, name: offer.un, offers: [] });
          // припущення (перевіряється сирим дампом вище): qn — назва
          // освітньої програми/спеціалізації
          const programName = offer.qn ?? offer.ssn ?? "";
          byUid.get(uid).offers.push({ programName, applications: t });
        }

        const rows = [];
        for (const rec of byUid.values()) {
          const totalApps = rec.offers.reduce((s, o) => s + o.applications, 0);
          const programCount = rec.offers.length;
          const avgAll = totalApps / programCount;

          const jOffers = rec.offers.filter((o) => JOURNALISM_RE.test(o.programName));
          const jApps = jOffers.reduce((s, o) => s + o.applications, 0);
          const avgJournalism = jOffers.length ? jApps / jOffers.length : null;

          rows.push({
            name: rec.name,
            programCount,
            totalApps,
            avgAll: Math.round(avgAll * 10) / 10,
            journalismProgramCount: jOffers.length,
            avgJournalism: avgJournalism != null ? Math.round(avgJournalism * 10) / 10 : null,
            programNames: rec.offers.map((o) => o.programName)
          });
        }

        rows.sort((a, b) => b.avgAll - a.avgAll);
        console.log(`\n[ПОРІВНЯННЯ] ${level}, ${year} (сортовано за поточним avgAll):`);
        for (const r of rows) {
          console.log(
            `${r.name} | програм: ${r.programCount} (з них "журналіст*": ${r.journalismProgramCount}) | ` +
            `заяв разом: ${r.totalApps} | зараз (сер./програму): ${r.avgAll} | лише журналістика (сер./програму): ${r.avgJournalism ?? "—"}`
          );
          console.log(`   назви програм: ${JSON.stringify(r.programNames)}`);
        }
      }
    }
  })();
}

main().catch((err) => {
  console.error("diagnose-journalism-filter впав з помилкою:", err);
  process.exitCode = 1;
});
