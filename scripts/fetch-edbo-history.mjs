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
 *     → {offers: [{uid, un, qid, qn, ssc, ssn, ustn, st: {c: {t, ka, km, kx, ...}}}]}
 * де st.c.t — кількість заяв, st.c.ka — середній конкурсний бал по цій
 * конкурсній пропозиції. Один ЗВО може мати кілька пропозицій (форми
 * навчання, бюджет/контракт) для тієї самої спеціальності — агрегуємо їх
 * у одну сумарну кількість заяв і середньозважений бал.
 *
 * offer.ustn — тип конкурсної пропозиції (перевірено скриптом
 * scripts/diagnose-budget-field.mjs на реальних даних 2025 року):
 * "Відкрита" — звичайне бюджетне місце (відкритий конкурс), "Фіксована" —
 * бюджетне місце за квотою/пільгою, "Небюджетна" — контрактне (платне)
 * місце. Для фільтра "лише бюджет" нас цікавить строго "Відкрита" —
 * заклад сам просив рахувати без пільгових/фіксованих місць.
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

/* Ручні винятки: заклад сам не використав слово «журналіст…» у назві
   програми, але за змістом це той самий напрям цифрових медіа/журналістики —
   додано за ручним рішенням автора рейтингу після перегляду повного списку
   виключених назв (діагностика scripts/diagnose-excluded-programs.mjs). Ключ
   — "uid::spn", щоб виняток стосувався саме цієї програми цього закладу, а
   не будь-якої програми з такою назвою деінде. */
const PROGRAM_EXCEPTIONS = new Set([
  "41::Цифрові медіа", // КНУ ім. Тараса Шевченка, магістр
  "6945::Контент-продюсування цифрових медіапроєктів", // КУБГ, магістр
  "6945::Міжнародні медіа та цифрові комунікації" // КУБГ, магістр
]);

function isJournalismProgram(uid, spn) {
  if (/журналіст/i.test(spn || "")) return true;
  return PROGRAM_EXCEPTIONS.has(`${uid}::${spn}`);
}

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* /offer-requests/ — недокументований ендпоінт, яким сама сторінка
   /offer/<usid> підвантажує рейтинговий список вступників конкретної
   пропозиції (Handlebars-шаблон офера посилається на нього через offer.js).
   POST {id: usid, last: <кількість вже отриманих записів>} — пагінація
   перевірена вручну (diagnose-offer-requests-pagination.mjs): last=0 дає
   перші записи, наступний виклик з last=<скільки вже зібрано> дає
   продовження, розмір сторінки НЕ фіксований (може бути і 100, і 775) —
   орієнтуємось лише на порожню відповідь як ознаку кінця списку. Кожен
   запис має "pa" — пріоритет заяви абітурієнта (1, 2, 3…) і "kv" —
   індивідуальний конкурсний бал. Використовуємо це для підрахунку заяв
   1-го та 2-го пріоритету окремо від загальної кількості. */
const PRIORITY_MAX = 2;
const PRIORITY_PAGE_DELAY_MS = 150;
const PRIORITY_MAX_PAGES = 60; // запобіжник: 60 сторінок з запасом покриє навіть найбільші пропозиції

async function fetchOfferPriorityStats(base, usid) {
  let last = 0;
  let total = 0;
  let p12Count = 0;
  let p12ScoreSum = 0;
  for (let page = 0; page < PRIORITY_MAX_PAGES; page++) {
    const json = await postForm(base, "/offer-requests/", { id: String(usid), last: String(last) });
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

  // Заклад освіти може подавати спеціальність «Журналістика» під різними
  // освітніми програмами (spn) — деякі з них реально називаються інакше
  // («Зв'язки з громадськістю», «Медіакомунікації» тощо). Рахуємо рейтинг
  // лише за програмами, у назві яких справді є «журналіст…» (у будь-якій
  // формі), а не за всіма програмами під спеціальністю. Заклад, у якого
  // жодна програма не названа «журналістика», у рейтинг не потрапляє.
  //
  // Одна освітня програма (spn) зазвичай подається кількома конкурсними
  // пропозиціями — за формою навчання (денна/заочна) і джерелом
  // фінансування (бюджет/контракт). Це РІЗНІ пропозиції, але ОДНА програма
  // (перевірено на КНУ: 4 пропозиції спн «Журналістика» — 1 програма).
  // programCount рахує кількість УНІКАЛЬНИХ spn на заклад, а не кількість
  // пропозицій, — інакше середнє «на програму» було б заниженим там, де
  // програма просто розбита на кілька каналів подачі заяви.
  //
  // Агрегуємо по uid (заклад освіти): усі подані заяви й допущені по
  // відфільтрованих програмах, кількість унікальних програм — щоб рахувати
  // середню кількість заяв на ОДНУ програму (applicationsTotal —
  // сумарна кількість, лишається окремо для системних агрегатів).
  // Ваговий коефіцієнт для середнього балу — st.c.t (усі подані заяви),
  // а не st.c.a (допущені).
  const matchingOffers = [...offersById.values()].filter((offer) => isJournalismProgram(offer.uid, offer.spn));

  const byUid = new Map();
  for (const offer of matchingOffers) {
    const stats = offer.st && offer.st.c;
    if (!stats || !stats.t) continue;
    const t = Number(stats.t);
    const a = Number(stats.a);
    const ka = Number(stats.ka);
    if (!Number.isFinite(t) || !Number.isFinite(a) || t <= 0 || a < 0) continue;

    const uid = offer.uid;
    if (!byUid.has(uid)) {
      byUid.set(uid, {
        uid, name: offer.un, weightedScoreSum: 0, applicationsTotal: 0, admitted: 0, programNames: new Set(),
        p12ApplicationsTotal: 0, p12ScoreSum: 0,
        openApplicationsTotal: 0, openWeightedScoreSum: 0,
        openP12ApplicationsTotal: 0, openP12ScoreSum: 0
      });
    }
    const rec = byUid.get(uid);
    // "лише бюджет" = строго відкритий конкурс (ustn "Відкрита"), без
    // пільгових/фіксованих місць ("Фіксована") і без контракту
    // ("Небюджетна") — див. коментар на початку файлу.
    const isOpen = offer.ustn === "Відкрита";
    if (Number.isFinite(ka)) rec.weightedScoreSum += ka * t;
    rec.applicationsTotal += t;
    rec.admitted += a;
    rec.programNames.add(offer.spn);
    if (isOpen) {
      rec.openApplicationsTotal += t;
      if (Number.isFinite(ka)) rec.openWeightedScoreSum += ka * t;
    }

    try {
      const priority = await fetchOfferPriorityStats(base, offer.usid);
      rec.p12ApplicationsTotal += priority.p12Count;
      rec.p12ScoreSum += priority.p12ScoreSum;
      if (isOpen) {
        rec.openP12ApplicationsTotal += priority.p12Count;
        rec.openP12ScoreSum += priority.p12ScoreSum;
      }
      if (priority.total !== t) {
        log(`  ! usid=${offer.usid} (${offer.un}, ${offer.spn}): /offer-requests/ дав ${priority.total} записів, а st.c.t=${t}`);
      }
    } catch (err) {
      log(`  ! не вдалось отримати заяви за пріоритетом для usid=${offer.usid} (${offer.un}): ${err.message}`);
    }
  }

  const rows = [];
  for (const rec of byUid.values()) {
    const programCount = rec.programNames.size;
    if (rec.applicationsTotal < MIN_APPLICATIONS[level] || rec.admitted <= 0 || programCount <= 0) continue;
    const slug = UID_TO_SLUG[rec.uid];
    rows.push({
      id: slug || `edbo${rec.uid}`,
      name: NAME_OVERRIDE[rec.uid] || rec.name,
      short: (slug && SLUG_SHORT_OVERRIDE[slug]) || shortName(rec.name),
      hue: slug ? SLUG_HUE[slug] : hashHue(rec.uid),
      score: Math.round((rec.weightedScoreSum / rec.applicationsTotal) * 10) / 10,
      applications: Math.round((rec.applicationsTotal / programCount) * 10) / 10,
      applicationsTotal: rec.applicationsTotal,
      programCount,
      admitted: rec.admitted,
      applicationsP12Total: rec.p12ApplicationsTotal,
      applicationsP12: Math.round((rec.p12ApplicationsTotal / programCount) * 10) / 10,
      scoreP12: rec.p12ApplicationsTotal > 0 ? Math.round((rec.p12ScoreSum / rec.p12ApplicationsTotal) * 10) / 10 : null,
      applicationsOpenTotal: rec.openApplicationsTotal,
      applicationsOpen: Math.round((rec.openApplicationsTotal / programCount) * 10) / 10,
      scoreOpen: rec.openApplicationsTotal > 0 ? Math.round((rec.openWeightedScoreSum / rec.openApplicationsTotal) * 10) / 10 : null,
      applicationsOpenP12Total: rec.openP12ApplicationsTotal,
      applicationsOpenP12: Math.round((rec.openP12ApplicationsTotal / programCount) * 10) / 10,
      scoreOpenP12: rec.openP12ApplicationsTotal > 0 ? Math.round((rec.openP12ScoreSum / rec.openP12ApplicationsTotal) * 10) / 10 : null
    });
  }

  rows.sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

function sumApps(rows) {
  return rows.reduce((s, r) => s + r.applicationsTotal, 0);
}

function sumAdmitted(rows) {
  return rows.reduce((s, r) => s + (r.admitted || 0), 0);
}

function sumAppsP12(rows) {
  return rows.reduce((s, r) => s + (r.applicationsP12Total || 0), 0);
}

function sumAppsOpen(rows) {
  return rows.reduce((s, r) => s + (r.applicationsOpenTotal || 0), 0);
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
    },
    totalApplicationsP12: {
      bachelor: sumAppsP12(bachelor),
      master: sumAppsP12(master)
    },
    totalApplicationsOpen: {
      bachelor: sumAppsOpen(bachelor),
      master: sumAppsOpen(master)
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
