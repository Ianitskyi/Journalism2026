/* =========================================================
   journalism2026 — рейтинг журфаків України за середнім конкурсним
   балом вступників на спеціальність 061 «Журналістика».

   ЦЕ ТЕСТОВІ (ЗГЕНЕРОВАНІ) ДАНІ. Реальний фід ще не підключено —
   дивись README.md, розділ «Підключення реальних даних ЄДЕБО».
   Список закладів освіти нижче — справжні українські університети,
   що реально готують журналістів, але БАЛИ й КІЛЬКІСТЬ ЗАЯВ
   для кожного з них у цьому файлі — випадково згенеровані і не
   відображають реальний стан вступної кампанії.

   Дані по роках: 2026 — поточна кампанія з щоденною історією (як і
   раніше); 2021–2025 — по одному підсумковому знімку на рік
   (кампанія завершена, проміжної історії немає). Всі числа так само
   згенеровані, а не взяті з ЄДЕБО.

   Кожен знімок містить два незалежно проранжовані зрізи: "усі заяви"
   (bachelor/master) та "лише заяви з пріоритетом №1" (bachelorP1/
   masterP1) — коли цей заклад був свідомим першим вибором вступника,
   а не запасним варіантом.
   ========================================================= */

const TODAY = "2026-07-21";
const CURRENT_YEAR = 2026;
const HISTORY_DAYS = 7;
const PAST_YEARS = [2021, 2022, 2023, 2024, 2025];

/* base-профіль закладу: score/applications — стартові орієнтири для генератора,
   не реальні цифри */
const BACHELOR_UNIS = [
  { id: "knu",       name: "КНУ ім. Тараса Шевченка (Інститут журналістики)", short: "КНУ",        hue: 350, baseScore: 178.4, baseApps: 640 },
  { id: "lnu",       name: "Львівський нац. ун-т ім. Івана Франка",           short: "ЛНУ",         hue: 205, baseScore: 162.1, baseApps: 410 },
  { id: "naukma",    name: "НаУКМА (Могилянська школа журналістики)",        short: "НаУКМА",      hue: 268, baseScore: 174.8, baseApps: 260 },
  { id: "ucu",       name: "Український католицький університет",           short: "УКУ",         hue: 140, baseScore: 168.9, baseApps: 150 },
  { id: "onu",       name: "Одеський нац. ун-т ім. І. І. Мечникова",         short: "ОНУ",         hue: 24,  baseScore: 151.6, baseApps: 220 },
  { id: "karazin",   name: "Харківський нац. ун-т ім. В. Н. Каразіна",       short: "ХНУ",         hue: 12,  baseScore: 149.2, baseApps: 300 },
  { id: "dnu",       name: "Дніпровський нац. ун-т ім. Олеся Гончара",       short: "ДНУ",         hue: 60,  baseScore: 144.7, baseApps: 190 },
  { id: "znu",       name: "Запорізький нац. ун-т",                          short: "ЗНУ",         hue: 90,  baseScore: 141.3, baseApps: 130 },
  { id: "pnu",       name: "Прикарпатський нац. ун-т ім. В. Стефаника",      short: "ПНУ",         hue: 320, baseScore: 139.8, baseApps: 95  },
  { id: "vnu",       name: "Волинський нац. ун-т ім. Лесі Українки",         short: "ВНУ",         hue: 200, baseScore: 138.4, baseApps: 80  },
  { id: "uzhnu",     name: "Ужгородський нац. ун-т",                         short: "УжНУ",        hue: 150, baseScore: 136.9, baseApps: 70  },
  { id: "cnu",       name: "Черкаський нац. ун-т ім. Б. Хмельницького",      short: "ЧНУ",         hue: 45,  baseScore: 135.2, baseApps: 60  },
  { id: "kubg",      name: "Київський ун-т ім. Бориса Грінченка",            short: "КУБГ",        hue: 300, baseScore: 143.5, baseApps: 175 },
  { id: "donnu",     name: "Донецький нац. ун-т ім. Василя Стуса (Вінниця)", short: "ДонНУ",       hue: 260, baseScore: 137.6, baseApps: 65  },
  { id: "cpu",       name: "Класичний приватний університет (Запоріжжя)",   short: "КПУ",         hue: 18,  baseScore: 131.0, baseApps: 40  },
  { id: "lnu-shev",  name: "Луганський нац. ун-т ім. Т. Шевченка (Полтава)", short: "ЛНУ ім.Ш.",  hue: 100, baseScore: 133.8, baseApps: 35  },
  { id: "mdu",       name: "Маріупольський державний ун-т (Київ)",           short: "МДУ",         hue: 220, baseScore: 134.9, baseApps: 45  },
  { id: "chnu",      name: "Чернівецький нац. ун-т ім. Юрія Федьковича",     short: "ЧернНУ",      hue: 280, baseScore: 140.1, baseApps: 85  },
  { id: "sumdu",     name: "Сумський державний університет",                 short: "СумДУ",       hue: 170, baseScore: 132.4, baseApps: 55  },
  { id: "npu",       name: "НПУ ім. М. П. Драгоманова",                      short: "НПУ",         hue: 330, baseScore: 145.9, baseApps: 120 }
];

const MASTER_UNIS = [
  { id: "knu",     name: "КНУ ім. Тараса Шевченка (Інститут журналістики)", short: "КНУ",    hue: 350, baseScore: 172.0, baseApps: 210 },
  { id: "lnu",     name: "Львівський нац. ун-т ім. Івана Франка",           short: "ЛНУ",     hue: 205, baseScore: 158.4, baseApps: 140 },
  { id: "naukma",  name: "НаУКМА (Могилянська школа журналістики)",        short: "НаУКМА",  hue: 268, baseScore: 169.3, baseApps: 95  },
  { id: "ucu",     name: "Український католицький університет",           short: "УКУ",     hue: 140, baseScore: 164.2, baseApps: 60  },
  { id: "karazin", name: "Харківський нац. ун-т ім. В. Н. Каразіна",       short: "ХНУ",     hue: 12,  baseScore: 146.8, baseApps: 90  },
  { id: "onu",     name: "Одеський нац. ун-т ім. І. І. Мечникова",         short: "ОНУ",     hue: 24,  baseScore: 147.5, baseApps: 70  },
  { id: "dnu",     name: "Дніпровський нац. ун-т ім. Олеся Гончара",       short: "ДНУ",     hue: 60,  baseScore: 141.6, baseApps: 55  },
  { id: "kubg",    name: "Київський ун-т ім. Бориса Грінченка",            short: "КУБГ",    hue: 300, baseScore: 140.2, baseApps: 65  },
  { id: "znu",     name: "Запорізький нац. ун-т",                          short: "ЗНУ",     hue: 90,  baseScore: 137.9, baseApps: 40  },
  { id: "npu",     name: "НПУ ім. М. П. Драгоманова",                      short: "НПУ",     hue: 330, baseScore: 142.7, baseApps: 50  },
  { id: "uzhnu",   name: "Ужгородський нац. ун-т",                         short: "УжНУ",    hue: 150, baseScore: 133.5, baseApps: 25  },
  { id: "chnu",    name: "Чернівецький нац. ун-т ім. Юрія Федьковича",     short: "ЧернНУ",  hue: 280, baseScore: 136.0, baseApps: 30  }
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

function dateMinusDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
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
    .map(({ id, name, short, hue, score, applications }, i) => ({ id, name, short, hue, score, applications, rank: i + 1 }));

  const p1 = base
    .filter((r) => r.p1Applications >= minAppsP1)
    .sort((a, b) => b.p1Score - a.p1Score)
    .map(({ id, name, short, hue, p1Score, p1Applications }, i) =>
      ({ id, name, short, hue, score: p1Score, applications: p1Applications, rank: i + 1 }));

  return { all, p1 };
}

function buildDayList(unis, dayIndex, minApps, minAppsP1) {
  const base = unis.map((u) => {
    const rnd = mulberry32(hashStr(u.id) ^ (dayIndex * 2654435761));
    const drift = (rnd() - 0.5) * 1.4;                 // невеликий денний шум бала
    const growth = 1 + (HISTORY_DAYS - dayIndex) * 0.05 + rnd() * 0.03; // заяви ростуть ближче до "сьогодні"
    const score = Math.max(100, u.baseScore + drift - (HISTORY_DAYS - dayIndex) * 0.15);
    const applications = Math.round(u.baseApps * growth);

    const rndP1 = mulberry32(hashStr(u.id + ":p1") ^ (dayIndex * 2654435761));
    const share = priority1Share(u.baseScore);
    const p1Applications = Math.round(applications * share * (0.9 + rndP1() * 0.2));
    const p1Score = Math.max(100, score + (rndP1() - 0.5) * 2.0);

    return {
      id: u.id, name: u.name, short: u.short, hue: u.hue,
      score: round1(score), applications,
      p1Score: round1(p1Score), p1Applications
    };
  });
  return rankBoth(base, minApps, minAppsP1);
}

function buildSnapshots() {
  const snapshots = {};
  for (let i = 0; i <= HISTORY_DAYS; i++) {
    const date = dateMinusDays(TODAY, i);
    const dayIndex = HISTORY_DAYS - i; // 0 = найдавніший, HISTORY_DAYS = сьогодні
    const bachelor = buildDayList(BACHELOR_UNIS, dayIndex, MIN_APPLICATIONS.bachelor, MIN_APPLICATIONS_P1.bachelor);
    const master = buildDayList(MASTER_UNIS, dayIndex, MIN_APPLICATIONS.master, MIN_APPLICATIONS_P1.master);
    snapshots[date] = {
      date,
      asOf: date === TODAY ? `${date}T23:30:00+03:00` : `${date}T23:59:00+03:00`,
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
  return snapshots;
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
      id: u.id, name: u.name, short: u.short, hue: u.hue,
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
  const snap = buildYearFinalSnapshot(year);
  BY_YEAR[year] = { dates: [snap.date], snapshots: { [snap.date]: snap } };
}
BY_YEAR[CURRENT_YEAR] = { dates: SNAPSHOT_DATES, snapshots: SNAPSHOTS };

const DB = {
  years: [...PAST_YEARS, CURRENT_YEAR],
  currentYear: CURRENT_YEAR,
  byYear: BY_YEAR,
  minApplications: MIN_APPLICATIONS,
  minApplicationsP1: MIN_APPLICATIONS_P1
};
