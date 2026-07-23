#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — перевіряє, чи поле st.c.t
 * з /offers-list/ дійсно означає "кількість поданих заяв", чи це щось інше
 * (напр. лише заяви, що дожили до фіналу кампанії). Привід: у реальних даних
 * st.c.a (admitted) виявився підозріло близьким до st.c.t (85-100% для
 * багатьох закладів) — для конкурсного вступу це нереалістично високий
 * відсоток "успішності" заяв.
 *
 * Бере КНУ (uid=41), бакалавр, 2025, друкує сирі st.c об'єкти для програм
 * "журналістика", а також тягне сторінку /offer/<usid> і шукає там будь-які
 * числа біля слів "заяв", "конкурс", "зарахован", "рекомендован", щоб
 * звірити з тим, що бачить сирий глядач сайту.
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const KNU_UID = 41;

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

async function main() {
  const uniResp = await postForm("/offers-universities/", {
    qualification: "1",
    education_base: "40",
    speciality: "C7",
    region: "",
    education_form: "",
    course: ""
  });
  const uni = (uniResp.universities || []).find((u) => u.uid === KNU_UID);
  if (!uni) {
    console.log("КНУ не знайдено у списку ЗВО!", JSON.stringify(uniResp.universities?.slice(0, 3)));
    return;
  }
  console.log("КНУ ids:", uni.ids);

  const ids = (uni.ids || "").split(",").filter(Boolean);
  const offersResp = await postForm("/offers-list/", { ids: ids.join(",") });
  const offers = offersResp.offers || [];
  console.log("усього офферів у КНУ:", offers.length);

  const journalismOffers = offers.filter((o) => /журналіст/i.test(o.spn || ""));
  console.log("журналістських офферів:", journalismOffers.length);

  for (const offer of journalismOffers) {
    console.log("\n--- offer usid=" + offer.usid + " spn=" + offer.spn + " ---");
    console.log("raw offer (без st):", JSON.stringify({ ...offer, st: undefined }));
    console.log("st.c:", JSON.stringify(offer.st?.c));

    try {
      const resp = await fetch(`${BASE}/offer/${offer.usid}`, {
        headers: { Accept: "text/html", "User-Agent": "Journalism2026 diagnostic" },
        signal: AbortSignal.timeout(20000)
      });
      const html = await resp.text();
      console.log("offer page status:", resp.status, "length:", html.length);

      // шукаємо всі числа в межах ~60 символів біля ключових слів
      const keywords = ["заяв", "конкурс", "зарахован", "рекомендован", "учасник", "місц"];
      for (const kw of keywords) {
        const re = new RegExp(kw, "gi");
        let m;
        let count = 0;
        while ((m = re.exec(html)) && count < 3) {
          const idx = m.index;
          const snippet = html.slice(Math.max(0, idx - 80), idx + 80).replace(/\s+/g, " ");
          console.log(`  [${kw}] ...${snippet}...`);
          count++;
        }
      }
    } catch (err) {
      console.log("offer page fetch error:", err.message);
    }
  }
}

main().catch((err) => {
  console.error("diagnose-application-count впав з помилкою:", err);
  process.exitCode = 1;
});
