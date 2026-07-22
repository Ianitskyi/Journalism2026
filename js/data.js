/* =========================================================
   journalism2026 — рейтинг журфаків України за середнім конкурсним
   балом вступників на спеціальність 061 «Журналістика».

   ЦЕ ТЕСТОВІ (ЗГЕНЕРОВАНІ) ДАНІ. Реальний фід ще не підключено —
   дивись README.md, розділ «Підключення реальних даних ЄДЕБО».
   Список закладів освіти нижче — справжні українські університети,
   що реально готують журналістів, але БАЛИ й КІЛЬКІСТЬ ЗАЯВ
   для кожного з них у цьому файлі — випадково згенеровані і не
   відображають реальний стан вступної кампанії.

   Дані по роках: 2026 — лише найсвіжіший знімок поточної кампанії;
   2021–2025 — по одному підсумковому знімку на рік
   (кампанія завершена, проміжної історії немає). Всі числа так само
   згенеровані, а не взяті з ЄДЕБО.

   Кожен знімок містить два незалежно проранжовані зрізи: "усі заяви"
   (bachelor/master) та "лише заяви з пріоритетом №1" (bachelorP1/
   masterP1) — коли цей заклад був свідомим першим вибором вступника,
   а не запасним варіантом.
   ========================================================= */

const TODAY = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());
const CURRENT_YEAR = 2026;
const PAST_YEARS = [2021, 2022, 2023, 2024, 2025];

/* base-профіль закладу: score/applications — стартові орієнтири для генератора,
   не реальні цифри */
/* nameEn/shortEn — орієнтовні усталені англійські назви/абревіатури для
   EN-версії сайту; не офіційний переклад, потребує звірки з самими ЗВО */
const BACHELOR_UNIS = [
  { id: "knu",       name: "КНУ ім. Тараса Шевченка (Інститут журналістики)", short: "КНУ",        nameEn: "Taras Shevchenko National University of Kyiv (Institute of Journalism)", shortEn: "KNU",    hue: 350, baseScore: 178.4, baseApps: 640 },
  { id: "lnu",       name: "Львівський нац. ун-т ім. Івана Франка",           short: "ЛНУ",         nameEn: "Ivan Franko National University of Lviv",                                shortEn: "LNU",    hue: 205, baseScore: 162.1, baseApps: 410 },
  { id: "naukma",    name: "НаУКМА (Могилянська школа журналістики)",        short: "НаУКМА",      nameEn: "National University of Kyiv-Mohyla Academy (Mohyla School of Journalism)", shortEn: "NaUKMA", hue: 268, baseScore: 174.8, baseApps: 260 },
  { id: "ucu",       name: "Український католицький університет",           short: "УКУ",         nameEn: "Ukrainian Catholic University",                                          shortEn: "UCU",    hue: 140, baseScore: 168.9, baseApps: 150 },
  { id: "onu",       name: "Одеський нац. ун-т ім. І. І. Мечникова",         short: "ОНУ",         nameEn: "Odesa I. I. Mechnikov National University",                              shortEn: "ONU",    hue: 24,  baseScore: 151.6, baseApps: 220 },
  { id: "karazin",   name: "Харківський нац. ун-т ім. В. Н. Каразіна",       short: "ХНУ",         nameEn: "V. N. Karazin Kharkiv National University",                              shortEn: "KhNU",   hue: 12,  baseScore: 149.2, baseApps: 300 },
  { id: "dnu",       name: "Дніпровський нац. ун-т ім. Олеся Гончара",       short: "ДНУ",         nameEn: "Oles Honchar Dnipro National University",                                shortEn: "DNU",    hue: 60,  baseScore: 144.7, baseApps: 190 },
  { id: "znu",       name: "Запорізький нац. ун-т",                          short: "ЗНУ",         nameEn: "Zaporizhzhia National University",                                       shortEn: "ZNU",    hue: 90,  baseScore: 141.3, baseApps: 130 },
  { id: "pnu",       name: "Прикарпатський нац. ун-т ім. В. Стефаника",      short: "ПНУ",         nameEn: "Vasyl Stefanyk Precarpathian National University",                       shortEn: "PNU",    hue: 320, baseScore: 139.8, baseApps: 95  },
  { id: "vnu",       name: "Волинський нац. ун-т ім. Лесі Українки",         short: "ВНУ",         nameEn: "Lesya Ukrainka Volyn National University",                               shortEn: "VNU",    hue: 200, baseScore: 138.4, baseApps: 80  },
  { id: "uzhnu",     name: "Ужгородський нац. ун-т",                         short: "УжНУ",        nameEn: "Uzhhorod National University",                                           shortEn: "UzhNU",  hue: 150, baseScore: 136.9, baseApps: 70  },
  { id: "cnu",       name: "Черкаський нац. ун-т ім. Б. Хмельницького",      short: "ЧНУ",         nameEn: "Bohdan Khmelnytsky National University of Cherkasy",                     shortEn: "CNU",    hue: 45,  baseScore: 135.2, baseApps: 60  },
  { id: "kubg",      name: "Київський ун-т ім. Бориса Грінченка",            short: "КУБГ",        nameEn: "Borys Grinchenko Kyiv University",                                       shortEn: "BGKU",   hue: 300, baseScore: 143.5, baseApps: 175 },
  { id: "donnu",     name: "Донецький нац. ун-т ім. Василя Стуса (Вінниця)", short: "ДонНУ",       nameEn: "Vasyl' Stus Donetsk National University (Vinnytsia)",                    shortEn: "DonNU",  hue: 260, baseScore: 137.6, baseApps: 65  },
  { id: "cpu",       name: "Класичний приватний університет (Запоріжжя)",   short: "КПУ",         nameEn: "Classic Private University (Zaporizhzhia)",                              shortEn: "CPU",    hue: 18,  baseScore: 131.0, baseApps: 40  },
  { id: "lnu-shev",  name: "Луганський нац. ун-т ім. Т. Шевченка (Полтава)", short: "ЛНУ ім.Ш.",  nameEn: "Taras Shevchenko National University of Luhansk (Poltava)",              shortEn: "LSNU",   hue: 100, baseScore: 133.8, baseApps: 35  },
  { id: "mdu",       name: "Маріупольський державний ун-т (Київ)",           short: "МДУ",         nameEn: "Mariupol State University (Kyiv)",                                       shortEn: "MSU",    hue: 220, baseScore: 134.9, baseApps: 45  },
  { id: "chnu",      name: "Чернівецький нац. ун-т ім. Юрія Федьковича",     short: "ЧернНУ",      nameEn: "Yuriy Fedkovych Chernivtsi National University",                         shortEn: "ChNU",   hue: 280, baseScore: 140.1, baseApps: 85  },
  { id: "sumdu",     name: "Сумський державний університет",                 short: "СумДУ",       nameEn: "Sumy State University",                                                   shortEn: "SumSU",  hue: 170, baseScore: 132.4, baseApps: 55  },
  { id: "npu",       name: "НПУ ім. М. П. Драгоманова",                      short: "НПУ",         nameEn: "M. P. Drahomanov Ukrainian State University",                            shortEn: "NPU",    hue: 330, baseScore: 145.9, baseApps: 120 }
];

const MASTER_UNIS = [
  { id: "knu",     name: "КНУ ім. Тараса Шевченка (Інститут журналістики)", short: "КНУ",    nameEn: "Taras Shevchenko National University of Kyiv (Institute of Journalism)", shortEn: "KNU",    hue: 350, baseScore: 172.0, baseApps: 210 },
  { id: "lnu",     name: "Львівський нац. ун-т ім. Івана Франка",           short: "ЛНУ",     nameEn: "Ivan Franko National University of Lviv",                                shortEn: "LNU",    hue: 205, baseScore: 158.4, baseApps: 140 },
  { id: "naukma",  name: "НаУКМА (Могилянська школа журналістики)",        short: "НаУКМА",  nameEn: "National University of Kyiv-Mohyla Academy (Mohyla School of Journalism)", shortEn: "NaUKMA", hue: 268, baseScore: 169.3, baseApps: 95  },
  { id: "ucu",     name: "Український католицький університет",           short: "УКУ",     nameEn: "Ukrainian Catholic University",                                          shortEn: "UCU",    hue: 140, baseScore: 164.2, baseApps: 60  },
  { id: "karazin", name: "Харківський нац. ун-т ім. В. Н. Каразіна",       short: "ХНУ",     nameEn: "V. N. Karazin Kharkiv National University",                              shortEn: "KhNU",   hue: 12,  baseScore: 146.8, baseApps: 90  },
  { id: "onu",     name: "Одеський нац. ун-т ім. І. І. Мечникова",         short: "ОНУ",     nameEn: "Odesa I. I. Mechnikov National University",                              shortEn: "ONU",    hue: 24,  baseScore: 147.5, baseApps: 70  },
  { id: "dnu",     name: "Дніпровський нац. ун-т ім. Олеся Гончара",       short: "ДНУ",     nameEn: "Oles Honchar Dnipro National University",                                shortEn: "DNU",    hue: 60,  baseScore: 141.6, baseApps: 55  },
  { id: "kubg",    name: "Київський ун-т ім. Бориса Грінченка",            short: "КУБГ",    nameEn: "Borys Grinchenko Kyiv University",                                       shortEn: "BGKU",   hue: 300, baseScore: 140.2, baseApps: 65  },
  { id: "znu",     name: "Запорізький нац. ун-т",                          short: "ЗНУ",     nameEn: "Zaporizhzhia National University",                                       shortEn: "ZNU",    hue: 90,  baseScore: 137.9, baseApps: 40  },
  { id: "npu",     name: "НПУ ім. М. П. Драгоманова",                      short: "НПУ",     nameEn: "M. P. Drahomanov Ukrainian State University",                            shortEn: "NPU",    hue: 330, baseScore: 142.7, baseApps: 50  },
  { id: "uzhnu",   name: "Ужгородський нац. ун-т",                         short: "УжНУ",    nameEn: "Uzhhorod National University",                                           shortEn: "UzhNU",  hue: 150, baseScore: 133.5, baseApps: 25  },
  { id: "chnu",    name: "Чернівецький нац. ун-т ім. Юрія Федьковича",     short: "ЧернНУ",  nameEn: "Yuriy Fedkovych Chernivtsi National University",                         shortEn: "ChNU",   hue: 280, baseScore: 136.0, baseApps: 30  }
];

/* мінімальна кількість заяв, щоб заклад потрапив у рейтинг */
const MIN_APPLICATIONS = { bachelor: 20, master: 15 };
/* те саме, але для заяв із пріоритетом №1 (їх завжди менше за загальну кількість) */
const MIN_APPLICATIONS_P1 = { bachelor: 8, master: 5 };

/* частка заяв, де заклад вказаний пріоритетом №1: залежить від "престижності"
   (базового балу) — популярніші заклади частіше є свідомим першим вибором,
   а не запасним варіантом */
function priority1Share(baseScore) {
  const s = 0.22 + (baseScore - 100) / 280;
  return Math.min(0.62, Math.max(0.22, s));
}

/* ---------- детермінований генератор тестових знімків ---------- */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

const round1 = (n) => Math.round(n * 10) / 10;

function sumApps(rows) {
  return rows.reduce((s, r) => s + r.applications, 0);
}

/* рахує "усі заяви" та "лише пріоритет 1" одним проходом і повертає обидва
   незалежно відсортовані й проранжовані списки */
function rankBoth(base, minApps, minAppsP1) {
  const all = base
    .filter((r) => r.applications >= minApps)
    .sort((a, b) => b.score - a.score)
    .map(({ id, name, short, nameEn, shortEn, hue, score, applications }, i) =>
      ({ id, name, short, nameEn, shortEn, hue, score, applications, rank: i + 1 }));

  const p1 = base
    .filter((r) => r.p1Applications >= minAppsP1)
    .sort((a, b) => b.p1Score - a.p1Score)
    .map(({ id, name, short, nameEn, shortEn, hue, p1Score, p1Applications }, i) =>
      ({ id, name, short, nameEn, shortEn, hue, score: p1Score, applications: p1Applications, rank: i + 1 }));

  return { all, p1 };
}

function buildDayList(unis, daySeed, minApps, minAppsP1) {
  const base = unis.map((u) => {
    const rnd = mulberry32(hashStr(u.id) ^ (daySeed * 2654435761));
    const drift = (rnd() - 0.5) * 1.4;                 // невеликий денний шум бала
    const growth = 1 + rnd() * 0.03;
    const score = Math.max(100, u.baseScore + drift);
    const applications = Math.round(u.baseApps * growth);

    const rndP1 = mulberry32(hashStr(u.id + ":p1") ^ (daySeed * 2654435761));
    const share = priority1Share(u.baseScore);
    const p1Applications = Math.round(applications * share * (0.9 + rndP1() * 0.2));
    const p1Score = Math.max(100, score + (rndP1() - 0.5) * 2.0);

    return {
      id: u.id, name: u.name, short: u.short, nameEn: u.nameEn, shortEn: u.shortEn, hue: u.hue,
      score: round1(score), applications,
      p1Score: round1(p1Score), p1Applications
    };
  });
  return rankBoth(base, minApps, minAppsP1);
}

function buildSnapshots() {
  const daySeed = Number(TODAY.replaceAll("-", ""));
  const bachelor = buildDayList(BACHELOR_UNIS, daySeed, MIN_APPLICATIONS.bachelor, MIN_APPLICATIONS_P1.bachelor);
  const master = buildDayList(MASTER_UNIS, daySeed, MIN_APPLICATIONS.master, MIN_APPLICATIONS_P1.master);
  return {
    [TODAY]: {
      date: TODAY,
      asOf: `${TODAY}T23:30:00+03:00`,
      bachelor: bachelor.all,
      master: master.all,
      bachelorP1: bachelor.p1,
      masterP1: master.p1,
      totalApplications: {
        bachelor: sumApps(bachelor.all),
        master: sumApps(master.all),
        bachelorP1: sumApps(bachelor.p1),
        masterP1: sumApps(master.p1)
      }
    }
  };
}

/* підсумковий (єдиний) знімок для завершеної кампанії минулих років:
   бал і кількість заяв поступово нижчі, чим давніший рік */
function buildYearFinalList(unis, year, minApps, minAppsP1) {
  const yearsAgo = CURRENT_YEAR - year;
  const base = unis.map((u) => {
    const rnd = mulberry32(hashStr(u.id) ^ (year * 40503));
    const drift = (rnd() - 0.5) * 2.4;
    const score = Math.max(100, u.baseScore - yearsAgo * 1.7 + drift);
    const appsFactor = Math.max(0.3, 1 - yearsAgo * 0.1 + (rnd() - 0.5) * 0.08);
    const applications = Math.round(u.baseApps * appsFactor);

    const rndP1 = mulberry32(hashStr(u.id + ":p1") ^ (year * 40503));
    const share = priority1Share(u.baseScore);
    const p1Applications = Math.round(applications * share * (0.9 + rndP1() * 0.2));
    const p1Score = Math.max(100, score + (rndP1() - 0.5) * 2.4);

    return {
      id: u.id, name: u.name, short: u.short, nameEn: u.nameEn, shortEn: u.shortEn, hue: u.hue,
      score: round1(score), applications,
      p1Score: round1(p1Score), p1Applications
    };
  });
  return rankBoth(base, minApps, minAppsP1);
}

function buildYearFinalSnapshot(year) {
  const date = `${year}-08-05`;
  const bachelor = buildYearFinalList(BACHELOR_UNIS, year, MIN_APPLICATIONS.bachelor, MIN_APPLICATIONS_P1.bachelor);
  const master = buildYearFinalList(MASTER_UNIS, year, MIN_APPLICATIONS.master, MIN_APPLICATIONS_P1.master);
  return {
    date,
    asOf: `${date}T18:00:00+03:00`,
    final: true,
    bachelor: bachelor.all,
    master: master.all,
    bachelorP1: bachelor.p1,
    masterP1: master.p1,
    totalApplications: {
      bachelor: sumApps(bachelor.all),
      master: sumApps(master.all),
      bachelorP1: sumApps(bachelor.p1),
      masterP1: sumApps(master.p1)
    }
  };
}

const SNAPSHOTS = buildSnapshots();
const SNAPSHOT_DATES = Object.keys(SNAPSHOTS).sort();

const BY_YEAR = {};
for (const year of PAST_YEARS) {
  // запасний варіант (згенеровані дані), поки не підвантажились реальні —
  // одразу перезаписується нижче через loadRealHistoricalData()
  const snap = buildYearFinalSnapshot(year);
  BY_YEAR[year] = { dates: [snap.date], snapshots: { [snap.date]: snap } };
}
BY_YEAR[CURRENT_YEAR] = { dates: SNAPSHOT_DATES, snapshots: SNAPSHOTS };

/* реальні дані ЄДЕБО за 2018–2025 (див. README, розділ "Підключення
   реальних даних ЄДЕБО") — зібрані scripts/fetch-edbo-history.mjs з
   архівних vstup<рік>.edbo.gov.ua. Підвантажуються асинхронно й заміняють
   згенерований запасний варіант вище; якщо конкретний рік не завантажився
   (наприклад, немає мережі), лишається згенерований fallback, і про це
   попереджається в консолі. Після заміни розсилається подія
   "edbo-data-updated", щоб app.js/university.js могли перерендерити вже
   відкриту сторінку, якщо запит завершився вже після першого рендеру. */
async function loadRealHistoricalData() {
  const results = await Promise.allSettled(
    PAST_YEARS.map(async (year) => {
      const date = `${year}-08-05`;
      const resp = await fetch(`data/${date}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const snap = await resp.json();
      return { year, snap };
    })
  );

  let anyUpdated = false;
  results.forEach((r, i) => {
    const year = PAST_YEARS[i];
    if (r.status === "fulfilled") {
      const { snap } = r.value;
      BY_YEAR[year] = { dates: [snap.date], snapshots: { [snap.date]: snap } };
      anyUpdated = true;
    } else {
      console.warn(`Не вдалось завантажити реальні дані ЄДЕБО за ${year} рік, лишаю згенерований fallback:`, r.reason);
    }
  });

  if (anyUpdated && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("edbo-data-updated"));
  }
}

loadRealHistoricalData();

/* Реальні щоденні знімки поточної кампанії. Список файлів веде ручний
   імпортер у data/2026-index.json. Якщо індексу або знімків ще немає,
   лишається детермінований демо-fallback із buildSnapshots(). */
async function loadRealCurrentData() {
  try {
    const indexResp = await fetch(`data/${CURRENT_YEAR}-index.json`);
    if (!indexResp.ok) throw new Error(`HTTP ${indexResp.status}`);

    const dates = (await indexResp.json())
      .filter((date) => /^2026-\d{2}-\d{2}$/.test(date))
      .sort();
    if (!dates.length) return;
    const latestDate = dates.at(-1);
    const resp = await fetch(`data/${latestDate}.json`);
    if (!resp.ok) throw new Error(`${latestDate}: HTTP ${resp.status}`);
    const snapshot = await resp.json();
    BY_YEAR[CURRENT_YEAR] = {
      dates: [snapshot.date],
      snapshots: { [snapshot.date]: snapshot }
    };
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("edbo-data-updated"));
    }
  } catch (err) {
    console.warn("Реальних знімків ЄДЕБО за 2026 рік ще немає, лишаю демо-fallback:", err);
  }
}

loadRealCurrentData();

const DB = {
  years: [...PAST_YEARS, CURRENT_YEAR],
  currentYear: CURRENT_YEAR,
  byYear: BY_YEAR,
  minApplications: MIN_APPLICATIONS,
  minApplicationsP1: MIN_APPLICATIONS_P1
};
