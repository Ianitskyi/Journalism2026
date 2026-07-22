#!/usr/bin/env node
/*
 * Реальні дані ЄДЕБО для архівних (завершених) вступних кампаній
 * vstup<рік>.edbo.gov.ua (2018–2025) — спеціальність 061 "Журналістика"
 * (код C7 у новій класифікації спеціалізацій, використаній на сайті).
 *
 * ВАЖЛИВО: живий поточний рік (vstup.edbo.gov.ua, зараз 2026) захищений
 * Cloudflare Turnstile саме на цьому ендпоінті — цей скрипт його НЕ чіпає.
 * Архівні роки (кампанія вже завершена) Cloudflare не тригерять
 * (перевірено diagnose-edbo-history.mjs), тому автоматизація тут законна.
 *
 * Контракт з'ясовано з коду js/offers_search_form.js (звичайний jQuery
 * $.ajax POST, без жодного захисту):
 *   POST /offers-universities/ {qualification, education_base, speciality,
 *        region, education_form, course}
 *     → {universities: [{uid, un, ids: "1,2,3", n}, ...]}
 *   POST /offers-list/ {ids: "1,2,3,..."}
 *     → {offers: [{uid, un, qid, qn, ssc, ssn, st: {c: {t, ka, km, kx, ...}}}]}
 * де st.c.t — кількість заяв, st.c.ka — середній конкурсний бал по цій
 * конкурсній пропозиції. Один ЗВО може мати кілька пропозицій (форми
 * навчання, бюджет/контракт) для тієї самої спеціальності — агрегуємо їх
 * у одну сумарну кількість заяв і середньозважений бал.
 */

import { writeFile, mkdir } from "node:fs/promises";

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const SPECIALITY = "C7"; // Журналістика
const QUALIFICATIONS = { bachelor: "1", master: "2" };
const EDUCATION_BASE = { bachelor: "40", master: "" }; // 40 = Повна загальна середня освіта

/* мінімальна кількість заяв, щоб заклад потрапив у рейтинг (як у data.js) */
const MIN_APPLICATIONS = { bachelor: 20, master: 15 };

const PALETTE_HUES = [350, 205, 268, 140, 24, 12, 60, 90, 320, 200, 150, 45, 300, 260, 18, 100, 220, 280, 170, 330, 210, 30, 240, 60, 130];

function log(line) {
  console.log(line);
}

function hashHue(uid) {
  return PALETTE_HUES[uid % PALETTE_HUES.length];
}

const SHORT_NAME_STOPWORDS = new Set([
  "національний", "державний", "приватний", "вищий", "вищої", "заклад", "закладу",
  "освіти", "освіта", "університет", "університету", "інститут", "інституту",
  "академія", "академії", "коледж", "навчальний", "навчальної", "імені", "ім",
  "та", "і", "в", "у", "з", "до", "на", "як", "або", "the", "of", "for"
]);

function shortName(name) {
  // евристика: беремо великі літери зі значущих слів (пропускаючи типові
  // "національний університет..." тощо, щоб абревіатура була відрізняльною)
  const cleaned = name.replace(/[«»""''"'()]/g, " ");
  const words = cleaned.split(/\s+/).filter((w) => w.length > 1 && !SHORT_NAME_STOPWORDS.has(w.toLowerCase()));
  const source = words.length ? words : cleaned.split(/\s+/).filter(Boolean);
  const letters = source
    .slice(0, 4)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return letters || name.slice(0, 4).toUpperCase();
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

async function fetchLevelData(base, level) {
  const uniResp = await postForm(base, "/offers-universities/", {
    qualification: QUALIFICATIONS[level],
    education_base: EDUCATION_BASE[level],
    speciality: SPECIALITY,
    region: "",
    education_form: "",
    course: ""
  });

  const universities = uniResp.universities || [];
  if (!universities.length) return [];

  const allIds = universities.flatMap((u) => (u.ids || "").split(",").filter(Boolean));
  if (!allIds.length) return [];

  // офери-лист має ліміт на розмір запиту — розбиваємо на пачки по 200 id
  const CHUNK = 200;
  const offersById = new Map();
  for (let i = 0; i < allIds.length; i += CHUNK) {
    const chunk = allIds.slice(i, i + CHUNK);
    const offersResp = await postForm(base, "/offers-list/", { ids: chunk.join(",") });
    for (const offer of offersResp.offers || []) {
      offersById.set(offer.usid, offer);
    }
  }

  // агрегуємо по uid (заклад освіти): сумарні заяви, середньозважений бал
  const byUid = new Map();
  for (const offer of offersById.values()) {
    const stats = offer.st && offer.st.c;
    if (!stats || !stats.t || !stats.ka) continue;
    const t = Number(stats.t);
    const ka = Number(stats.ka);
    if (!Number.isFinite(t) || !Number.isFinite(ka) || t <= 0) continue;

    const uid = offer.uid;
    if (!byUid.has(uid)) {
      byUid.set(uid, { uid, name: offer.un, weightedScoreSum: 0, applications: 0 });
    }
    const rec = byUid.get(uid);
    rec.weightedScoreSum += ka * t;
    rec.applications += t;
  }

  const rows = [];
  for (const rec of byUid.values()) {
    if (rec.applications < MIN_APPLICATIONS[level]) continue;
    rows.push({
      id: `edbo${rec.uid}`,
      name: rec.name,
      short: shortName(rec.name),
      hue: hashHue(rec.uid),
      score: Math.round((rec.weightedScoreSum / rec.applications) * 10) / 10,
      applications: rec.applications
    });
  }

  rows.sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

function sumApps(rows) {
  return rows.reduce((s, r) => s + r.applications, 0);
}

async function fetchYear(year) {
  const base = `https://vstup${year}.edbo.gov.ua`;
  log(`\n=== ${year} (${base}) ===`);

  const bachelor = await fetchLevelData(base, "bachelor").catch((err) => {
    log(`  бакалавр: помилка — ${err.message}`);
    return [];
  });
  log(`  бакалавр: ${bachelor.length} ЗВО у рейтингу`);

  const master = await fetchLevelData(base, "master").catch((err) => {
    log(`  магістр: помилка — ${err.message}`);
    return [];
  });
  log(`  магістр: ${master.length} ЗВО у рейтингу`);

  return {
    date: `${year}-08-05`,
    asOf: `${year}-08-05T18:00:00+03:00`,
    final: true,
    bachelor,
    master,
    // "пріоритет 1" зрізи поки не підключено — потрібен окремий контракт
    // (не помічено відповідного поля в st.* з поточного дослідження);
    // лишаємо порожніми, щоб не показувати вигадані дані
    bachelorP1: [],
    masterP1: [],
    totalApplications: {
      bachelor: sumApps(bachelor),
      master: sumApps(master),
      bachelorP1: 0,
      masterP1: 0
    }
  };
}

async function main() {
  await mkdir("data", { recursive: true });

  const onlyYear = process.argv[2] ? Number(process.argv[2]) : null;
  const years = onlyYear ? [onlyYear] : YEARS;

  for (const year of years) {
    const snapshot = await fetchYear(year);
    const file = `data/${snapshot.date}.json`;
    await writeFile(file, JSON.stringify(snapshot, null, 2), "utf8");
    log(`  → записано ${file}`);
    log(`  ТОП-5 бакалавр: ${JSON.stringify(snapshot.bachelor.slice(0, 5), null, 2)}`);
    log(`  ТОП-5 магістр: ${JSON.stringify(snapshot.master.slice(0, 5), null, 2)}`);
  }
}

main().catch((err) => {
  console.error("fetch-edbo-history впав з помилкою:", err);
  process.exitCode = 1;
});
