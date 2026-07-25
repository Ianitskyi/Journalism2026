#!/usr/bin/env node
/*
 * Щоденне оновлення ВЖЕ ВІДОМИХ пропозицій 2026 року.
 *
 * Пошук пропозицій захищений Turnstile, тому цей скрипт принципово не
 * намагається його викликати або обходити. Початковий список offerId людина
 * створює через edbo-capture.bookmarklet.js + import-edbo-manual.mjs.
 * Публічні GET /offer/<id> перевірено: вони працюють без cookies і містять
 * готові rqs_total/rqs_allowed/rqs_kv_avg. Рейтинг рахуємо за всіма поданими
 * заявами незалежно від пріоритету — це показник попиту, а не кількість
 * унікальних вступників.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";

const BASE = "https://vstup.edbo.gov.ua";
const UID_TO_SLUG = {
  41: "knu", 282: "lnu", 79: "naukma", 244: "ucu", 28: "onu",
  62: "karazin", 111: "dnu", 73: "znu", 44: "vnu", 207: "uzhnu",
  101: "cnu", 6945: "kubg", 246: "donnu", 198: "cpu", 81: "lnu-shev",
  19: "mdu", 61: "chnu", 168: "sumdu", 6704: "npu", 337: "kneu"
};
const SLUG_HUE = {
  knu: 350, lnu: 205, naukma: 268, ucu: 140, onu: 24, karazin: 12,
  dnu: 60, znu: 90, vnu: 200, uzhnu: 150, cnu: 45, kubg: 300,
  donnu: 260, cpu: 18, "lnu-shev": 100, mdu: 220, chnu: 280,
  sumdu: 170, npu: 330, kneu: 130
};
const SLUG_SHORT = {
  knu: "КНУ", lnu: "ЛНУ", naukma: "НаУКМА", ucu: "УКУ", onu: "ОНУ",
  karazin: "ХНУ", dnu: "ДНУ", znu: "ЗНУ", vnu: "ВНУ", uzhnu: "УжНУ",
  cnu: "ЧНУ", kubg: "КУБГ", donnu: "ДонНУ", cpu: "КПУ",
  "lnu-shev": "ЛНУ ім.Ш.", mdu: "МДУ", chnu: "ЧернНУ",
  sumdu: "СумДУ", npu: "НПУ", kneu: "КНЕУ"
};
const PALETTE_HUES = [350, 205, 268, 140, 24, 12, 60, 90, 320, 200, 150, 45, 300, 260, 18, 100, 220, 280, 170, 330];
const MIN_APPLICATIONS = { bachelor: 20, master: 15 };

function field(html, name) {
  const normalized = html.replace(/\\"/g, '"');
  const match = normalized.match(new RegExp(`"${name}":"?(-?\\d+(?:\\.\\d+)?)`));
  return match ? Number(match[1]) : null;
}

function stringField(html, name) {
  const normalized = html.replace(/\\"/g, '"');
  const match = normalized.match(new RegExp(`"${name}":"([^"]*)"`));
  return match ? match[1].replace(/\\n/g, " ") : null;
}

function shortName(name) {
  const words = name.replace(/["'«»“”()]/g, " ").split(/\s+/).filter((word) => word.length > 2);
  return (words.slice(0, 4).map((word) => word[0]).join("") || name.slice(0, 4)).toUpperCase();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* /offer-requests/ — той самий недокументований ендпоінт, що й в
   fetch-edbo-history.mjs (там детальний опис і перевірена пагінація).
   Тут — той самий підхід, застосований до живого 2026 року: НЕ перевірено
   заздалегідь (архівні роки не захищені Cloudflare, а живий рік захищений
   на пошуку — на самому /offer-requests/ це не тестувалось), тому огорнуто
   в try/catch у fetchOffer(): якщо ендпоінт тут не працює, просто
   отримаємо p12Count=0/p12ScoreSum=0 для цього offer, і applicationsP12
   зрештою піде в 0 — без падіння всього скрипта. */
const PRIORITY_MAX = 2;
const PRIORITY_PAGE_DELAY_MS = 150;
const PRIORITY_MAX_PAGES = 60;

async function fetchOfferPriorityStats(offerId) {
  let last = 0;
  let total = 0;
  let p12Count = 0;
  let p12ScoreSum = 0;
  for (let page = 0; page < PRIORITY_MAX_PAGES; page++) {
    const resp = await fetch(`${BASE}/offer-requests/`, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: `${BASE}/offer/${offerId}`
      },
      body: new URLSearchParams({ id: String(offerId), last: String(last) }).toString(),
      signal: AbortSignal.timeout(20000)
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} для /offer-requests/ (offerId=${offerId})`);
    const json = await resp.json();
    const batch = json.requests || [];
    if (!batch.length) break;
    for (const r of batch) {
      total++;
      const pa = Number(r.pa);
      const kv = Number(r.kv);
      if (pa >= 1 && pa <= PRIORITY_MAX && Number.isFinite(kv)) {
        p12Count++;
        p12ScoreSum += kv;
      }
    }
    last = total;
    await sleep(PRIORITY_PAGE_DELAY_MS);
  }
  return { total, p12Count, p12ScoreSum };
}

async function fetchOffer(manifestEntry) {
  const response = await fetch(`${BASE}/offer/${manifestEntry.offerId}`, {
    headers: { Accept: "text/html", "User-Agent": "Journalism2026 public-data updater" },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`offer ${manifestEntry.offerId}: HTTP ${response.status}`);
  const html = await response.text();
  const offerId = field(html, "university_specialities_id");
  const applications = field(html, "rqs_total");
  const admitted = field(html, "rqs_allowed");
  const averageScore = field(html, "rqs_kv_avg");
  if (offerId !== Number(manifestEntry.offerId) || applications == null || admitted == null || averageScore == null) {
    throw new Error(`offer ${manifestEntry.offerId}: у HTML немає очікуваної статистики`);
  }

  let p12Count = 0;
  let p12ScoreSum = 0;
  try {
    const priority = await fetchOfferPriorityStats(offerId);
    p12Count = priority.p12Count;
    p12ScoreSum = priority.p12ScoreSum;
  } catch (err) {
    console.log(`  ! не вдалось отримати заяви за пріоритетом для offer ${offerId}: ${err.message}`);
  }

  // programName (spn у архівному API) — назва освітньої програми, потрібна
  // для фільтра "лише журналістика". Поле НЕ перевірено на живій сторінці
  // /offer/<id> (вона захищена Turnstile, скрипт це не обходить) — якщо
  // spn там не існує/названо інакше, programName буде null і offer просто
  // не потрапить у фільтр rank() нижче, доки хтось не перевірить руками.
  return {
    offerId,
    level: manifestEntry.level,
    universityId: field(html, "university_id") ?? manifestEntry.universityId,
    universityName: stringField(html, "university_name") ?? manifestEntry.universityName,
    programName: stringField(html, "spn"),
    applications,
    admitted,
    averageScore,
    p12Count,
    p12ScoreSum
  };
}

/* Ручні винятки: заклад сам не використав слово «журналіст…» у назві
   програми, але за змістом це той самий напрям цифрових медіа/журналістики —
   додано за ручним рішенням автора рейтингу (див. таку саму мапу й коментар
   у scripts/fetch-edbo-history.mjs). Ключ — "uid::programName". */
const PROGRAM_EXCEPTIONS = new Set([
  "41::Цифрові медіа", // КНУ ім. Тараса Шевченка, магістр
  "6945::Контент-продюсування цифрових медіапроєктів", // КУБГ, магістр
  "6945::Міжнародні медіа та цифрові комунікації" // КУБГ, магістр
]);

function isJournalismProgram(uid, programName) {
  if (/журналіст/i.test(programName || "")) return true;
  return PROGRAM_EXCEPTIONS.has(`${uid}::${programName}`);
}

function rank(offers, level) {
  const grouped = new Map();
  for (const offer of offers.filter((item) => item.level === level)) {
    if (!isJournalismProgram(offer.universityId, offer.programName)) continue;
    const uid = Number(offer.universityId);
    const slug = UID_TO_SLUG[uid];
    const id = slug || `edbo${uid}`;
    if (!grouped.has(id)) {
      grouped.set(id, {
        id,
        name: offer.universityName,
        short: slug ? SLUG_SHORT[slug] : shortName(offer.universityName),
        hue: slug ? SLUG_HUE[slug] : PALETTE_HUES[Math.abs(uid) % PALETTE_HUES.length],
        weighted: 0,
        applicationsTotal: 0,
        admitted: 0,
        programNames: new Set(),
        p12ApplicationsTotal: 0,
        p12ScoreSum: 0
      });
    }
    const row = grouped.get(id);
    row.weighted += offer.averageScore * offer.applications;
    row.applicationsTotal += offer.applications;
    row.admitted += offer.admitted;
    row.programNames.add(offer.programName);
    row.p12ApplicationsTotal += offer.p12Count || 0;
    row.p12ScoreSum += offer.p12ScoreSum || 0;
  }

  return [...grouped.values()]
    .map((row) => ({ ...row, programCount: row.programNames.size }))
    .filter((row) => row.applicationsTotal >= MIN_APPLICATIONS[level] && row.admitted > 0 && row.programCount > 0)
    .map((row) => ({
      id: row.id, name: row.name, short: row.short, hue: row.hue,
      score: Math.round((row.weighted / row.applicationsTotal) * 10) / 10,
      applications: Math.round((row.applicationsTotal / row.programCount) * 10) / 10,
      applicationsTotal: row.applicationsTotal,
      programCount: row.programCount,
      admitted: row.admitted,
      applicationsP12Total: row.p12ApplicationsTotal,
      applicationsP12: Math.round((row.p12ApplicationsTotal / row.programCount) * 10) / 10,
      scoreP12: row.p12ApplicationsTotal > 0 ? Math.round((row.p12ScoreSum / row.p12ApplicationsTotal) * 10) / 10 : null
    }))
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function kyivDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

const sumApps = (rows) => rows.reduce((sum, row) => sum + row.applicationsTotal, 0);
const sumAdmitted = (rows) => rows.reduce((sum, row) => sum + (row.admitted || 0), 0);
const sumAppsP12 = (rows) => rows.reduce((sum, row) => sum + (row.applicationsP12Total || 0), 0);

async function main() {
  const manifest = JSON.parse(await readFile("data/2026-offers.json", "utf8"));
  if (!Array.isArray(manifest.offers) || !manifest.offers.length) {
    throw new Error("data/2026-offers.json порожній. Спочатку зроби ручні capture-файли й імпортуй їх.");
  }

  const offers = [];
  for (const entry of manifest.offers) {
    offers.push(await fetchOffer(entry));
    console.log(`Отримано ${entry.offerId}`);
  }

  const bachelor = rank(offers, "bachelor");
  const master = rank(offers, "master");
  const date = process.argv[2] || kyivDate();
  const snapshot = {
    date,
    asOf: new Date().toISOString(),
    bachelor,
    master,
    totalApplications: {
      bachelor: sumApps(bachelor), master: sumApps(master)
    },
    totalAdmitted: {
      bachelor: sumAdmitted(bachelor), master: sumAdmitted(master)
    },
    totalApplicationsP12: {
      bachelor: sumAppsP12(bachelor), master: sumAppsP12(master)
    },
    _offers: {
      bachelor: offers.filter((offer) => offer.level === "bachelor"),
      master: offers.filter((offer) => offer.level === "master")
    }
  };

  await mkdir("data", { recursive: true });
  await writeFile("data/2026-current.json", JSON.stringify(snapshot, null, 2), "utf8");
  console.log(`Записано data/2026-current.json (${date})`);
}

main().catch((error) => {
  console.error(`fetch-edbo-current: ${error.message}`);
  process.exitCode = 1;
});
