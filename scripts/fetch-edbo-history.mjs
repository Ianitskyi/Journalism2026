#!/usr/bin/env node
/*
 * Реальні дані ЄДЕБО для архівних (завершених) вступних кампаній
 * vstup<рік>.edbo.gov.ua (2018–2025) — спеціальність 061 "Журналістика".
 * Код спеціальності різний за роками: 2018-2024 — "061" (стара
 * класифікація), 2025 — "C7" (нова літерна класифікація спеціалізацій,
 * якою сайт перейшов саме з цього року) — див. specialityFor() нижче.
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
/* Код спеціальності "Журналістика" різний залежно від року: сайт перейшов
   на нову літерну класифікацію спеціалізацій лише з 2025 року (перевірено
   diagnose-edbo-spec-codes.mjs — 2018-2024 усі мають
   <option value="061">Журналістика</option>, і лише 2025 використовує C7). */
function specialityFor(year) {
  return year >= 2025 ? "C7" : "061";
}
const QUALIFICATIONS = { bachelor: "1", master: "2" };
const EDUCATION_BASE = { bachelor: "40", master: "" }; // 40 = Повна загальна середня освіта

/* Мапа "EDBO uid → наш слаг" для ЗВО, що вже є у статичному списку
   BACHELOR_UNIS/MASTER_UNIS (js/data.js) з демо-даними за 2026 рік. Без
   цієї мапи university.js (сторінка ЗВО, графік динаміки по роках) не
   зміг би з'єднати реальні 2018-2025 з демо-2026 для того самого закладу,
   бо шукає рядки по `id` зі статичного списку, а не по назві. uid взято з
   реальних відповідей /offers-universities/ за 2025 рік — стабільний
   внутрішній ідентифікатор ЗВО в ЄДЕБО, не має змінюватись між роками.
   Заклади поза цим списком отримують id `edbo<uid>` — без "наскрізної"
   історії з демо-2026, але самі по собі коректні. */
const UID_TO_SLUG = {
  41: "knu",       // Київський нац. ун-т ім. Тараса Шевченка
  282: "lnu",      // Львівський нац. ун-т ім. Івана Франка
  79: "naukma",    // НаУКМА
  244: "ucu",      // Український католицький університет
  28: "onu",       // Одеський нац. ун-т ім. І. І. Мечникова
  62: "karazin",   // Харківський нац. ун-т ім. В. Н. Каразіна
  111: "dnu",      // Дніпровський нац. ун-т ім. Олеся Гончара
  73: "znu",       // Запорізький нац. ун-т
  44: "vnu",       // Волинський нац. ун-т ім. Лесі Українки
  207: "uzhnu",    // Ужгородський нац. ун-т
  101: "cnu",      // Черкаський нац. ун-т ім. Б. Хмельницького
  6945: "kubg",    // Київський ун-т ім. Бориса Грінченка (нині "столичний")
  246: "donnu",    // Донецький нац. ун-т ім. Василя Стуса
  198: "cpu",      // Класичний приватний університет
  81: "lnu-shev",  // Луганський нац. ун-т ім. Т. Шевченка
  19: "mdu",       // Маріупольський державний ун-т
  61: "chnu",      // Чернівецький нац. ун-т ім. Юрія Федьковича
  168: "sumdu",    // Сумський державний університет
  6704: "npu",     // НПУ ім. М. П. Драгоманова (нині Укр. держ. ун-т ім. Драгоманова)
  337: "kneu"      // Київський нац. економічний ун-т ім. Вадима Гетьмана
};

/* ЄДЕБО іноді повертає назву закладу ВЕЛИКИМИ ЛІТЕРАМИ (напр. uid 337) —
   виправляємо вручну там, де це помічено, замість використання сирого
   rec.name */
const NAME_OVERRIDE = {
  337: "Київський національний економічний університет імені Вадима Гетьмана",
  6594: "Державний торговельно-економічний університет (Київ)"
};

/* коли автоматична евристика shortName() дає гірший результат за
   реальну усталену абревіатуру закладу */
const SLUG_SHORT_OVERRIDE = {
  kneu: "КНЕУ"
};

/* мінімальна кількість заяв, щоб заклад потрапив у рейтинг (як у data.js) */
const MIN_APPLICATIONS = { bachelor: 20, master: 15 };

const PALETTE_HUES = [350, 205, 268, 140, 24, 12, 60, 90, 320, 200, 150, 45, 300, 260, 18, 100, 220, 280, 170, 330, 210, 30, 240, 60, 130];

/* ті самі відтінки, що й у BACHELOR_UNIS/MASTER_UNIS (js/data.js), щоб
   колір ЗВО в таблиці не "стрибав" між демо-2026 і реальними роками */
const SLUG_HUE = {
  knu: 350, lnu: 205, naukma: 268, ucu: 140, onu: 24, karazin: 12, dnu: 60,
  znu: 90, vnu: 200, uzhnu: 150, cnu: 45, kubg: 300, donnu: 260, cpu: 18,
  "lnu-shev": 100, mdu: 220, chnu: 280, sumdu: 170, npu: 330, kneu: 130
};

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
  const cleaned = name.replace(/["'«»“”‘’()]/g, " ");
  const words = cleaned.split(/\s+/).filter((w) => w.length > 1 && !SHORT_NAME_STOPWORDS.has(w.toLowerCase()));
  const source = words.length ? words : cleaned.split(/\s+/).filter(Boolean);
  // якщо значущих слів мало (напр. "Києво-Могилянська"), розбиваємо ще й по
  // дефісу, щоб абревіатура не звелась до однієї літери
  const parts = source.length >= 3 ? source : source.flatMap((w) => w.split("-"));
  const letters = parts
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

async function fetchLevelData(base, level, year) {
  const uniResp = await postForm(base, "/offers-universities/", {
    qualification: QUALIFICATIONS[level],
    education_base: EDUCATION_BASE[level],
    speciality: specialityFor(year),
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

  // Агрегуємо по uid (заклад освіти): усі подані заяви, допущені до
  // конкурсу та середній бал по всіх поданих заявах. Вагового коефіцієнта
  // для середнього балу — st.c.t (усі подані заяви), а не st.c.a
  // (допущені), щоб рейтинг послідовно спирався на подані заяви.
  const byUid = new Map();
  for (const offer of offersById.values()) {
    const stats = offer.st && offer.st.c;
    if (!stats || !stats.t) continue;
    const t = Number(stats.t);
    const a = Number(stats.a);
    const ka = Number(stats.ka);
    if (!Number.isFinite(t) || !Number.isFinite(a) || t <= 0 || a < 0) continue;

    const uid = offer.uid;
    if (!byUid.has(uid)) {
      byUid.set(uid, { uid, name: offer.un, weightedScoreSum: 0, applications: 0, admitted: 0 });
    }
    const rec = byUid.get(uid);
    if (Number.isFinite(ka)) rec.weightedScoreSum += ka * t;
    rec.applications += t;
    rec.admitted += a;
  }

  const rows = [];
  for (const rec of byUid.values()) {
    if (rec.applications < MIN_APPLICATIONS[level] || rec.admitted <= 0) continue;
    const slug = UID_TO_SLUG[rec.uid];
    rows.push({
      id: slug || `edbo${rec.uid}`,
      name: NAME_OVERRIDE[rec.uid] || rec.name,
      short: (slug && SLUG_SHORT_OVERRIDE[slug]) || shortName(rec.name),
      hue: slug ? SLUG_HUE[slug] : hashHue(rec.uid),
      score: Math.round((rec.weightedScoreSum / rec.applications) * 10) / 10,
      applications: rec.applications,
      admitted: rec.admitted
    });
  }

  rows.sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

function sumApps(rows) {
  return rows.reduce((s, r) => s + r.applications, 0);
}

function sumAdmitted(rows) {
  return rows.reduce((s, r) => s + (r.admitted || 0), 0);
}

async function fetchYear(year) {
  const base = `https://vstup${year}.edbo.gov.ua`;
  log(`\n=== ${year} (${base}) ===`);

  const bachelor = await fetchLevelData(base, "bachelor", year).catch((err) => {
    log(`  бакалавр: помилка — ${err.message}`);
    return [];
  });
  log(`  бакалавр: ${bachelor.length} ЗВО у рейтингу`);

  const master = await fetchLevelData(base, "master", year).catch((err) => {
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
    totalApplications: {
      bachelor: sumApps(bachelor),
      master: sumApps(master)
    },
    totalAdmitted: {
      bachelor: sumAdmitted(bachelor),
      master: sumAdmitted(master)
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
