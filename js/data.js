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

   Кожен знімок ранжує ЗВО за усіма поданими заявами незалежно від
   пріоритету (одна людина може подати кілька заяв — це показник попиту,
   а не кількість унікальних вступників).
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

function sumAdmitted(rows) {
  return rows.reduce((s, r) => s + (r.admitted || 0), 0);
}

/* сортує й ранжує заклади за всіма поданими заявами (незалежно від
   пріоритету), відкидаючи ті, що не набрали мінімуму */
function rankAll(base, minApps) {
  return base
    .filter((r) => r.applications >= minApps)
    .sort((a, b) => b.score - a.score)
    .map(({ id, name, short, nameEn, shortEn, hue, score, applications, admitted }, i) =>
      ({ id, name, short, nameEn, shortEn, hue, score, applications, admitted, rank: i + 1 }));
}

function buildDayList(unis, daySeed, minApps) {
  const base = unis.map((u) => {
    const rnd = mulberry32(hashStr(u.id) ^ (daySeed * 2654435761));
    const drift = (rnd() - 0.5) * 1.4;                 // невеликий денний шум бала
    const growth = 1 + rnd() * 0.03;
    const score = Math.max(100, u.baseScore + drift);
    const applications = Math.round(u.baseApps * growth);
    const admitted = Math.round(applications * (0.72 + rnd() * 0.2));

    return {
      id: u.id, name: u.name, short: u.short, nameEn: u.nameEn, shortEn: u.shortEn, hue: u.hue,
      score: round1(score), applications, admitted
    };
  });
  return rankAll(base, minApps);
}

function buildSnapshots() {
  const daySeed = Number(TODAY.replaceAll("-", ""));
  const bachelor = buildDayList(BACHELOR_UNIS, daySeed, MIN_APPLICATIONS.bachelor);
  const master = buildDayList(MASTER_UNIS, daySeed, MIN_APPLICATIONS.master);
  return {
    [TODAY]: {
      date: TODAY,
      asOf: `${TODAY}T23:30:00+03:00`,
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
    }
  };
}

/* підсумковий (єдиний) знімок для завершеної кампанії минулих років:
   бал і кількість заяв поступово нижчі, чим давніший рік */
function buildYearFinalList(unis, year, minApps) {
  const yearsAgo = CURRENT_YEAR - year;
  const base = unis.map((u) => {
    const rnd = mulberry32(hashStr(u.id) ^ (year * 40503));
    const drift = (rnd() - 0.5) * 2.4;
    const score = Math.max(100, u.baseScore - yearsAgo * 1.7 + drift);
    const appsFactor = Math.max(0.3, 1 - yearsAgo * 0.1 + (rnd() - 0.5) * 0.08);
    const applications = Math.round(u.baseApps * appsFactor);
    const admitted = Math.round(applications * (0.72 + rnd() * 0.2));

    return {
      id: u.id, name: u.name, short: u.short, nameEn: u.nameEn, shortEn: u.shortEn, hue: u.hue,
      score: round1(score), applications, admitted
    };
  });
  return rankAll(base, minApps);
}

function buildYearFinalSnapshot(year) {
  const date = `${year}-08-05`;
  const bachelor = buildYearFinalList(BACHELOR_UNIS, year, MIN_APPLICATIONS.bachelor);
  const master = buildYearFinalList(MASTER_UNIS, year, MIN_APPLICATIONS.master);
  return {
    date,
    asOf: `${date}T18:00:00+03:00`,
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

/* реальні дані ЄДЕБО за 2021–2025 (див. README, розділ "Підключення
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

/* Реальний знімок поточної кампанії — єдиний файл data/2026-current.json,
   який щоразу перезаписується скриптами fetch-edbo-current.mjs /
   import-edbo-manual.mjs. Попередні дні свідомо не зберігаються: нас
   цікавлять лише останні дані станом на сьогодні. Якщо файла ще немає,
   лишається детермінований демо-fallback із buildSnapshots(). */
async function loadRealCurrentData() {
  try {
    const resp = await fetch(`data/${CURRENT_YEAR}-current.json`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const snapshot = await resp.json();
    BY_YEAR[CURRENT_YEAR] = {
      dates: [snapshot.date],
      snapshots: { [snapshot.date]: snapshot }
    };
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("edbo-data-updated"));
    }
  } catch (err) {
    console.warn("Реального знімка ЄДЕБО за 2026 рік ще немає, лишаю демо-fallback:", err);
  }
}

loadRealCurrentData();

/* Англійські назви/абревіатури для закладів, яких немає в кураторському
   демо-списку BACHELOR_UNIS/MASTER_UNIS (тобто відомі лише з реальних
   історичних даних ЄДЕБО) — без цього перемикач на EN лишав би їхню
   назву українською. Орієнтовний переклад, за наявності — усталена
   англомовна назва самого закладу; потребує звірки з офіційними
   джерелами закладів. */
const UNI_NAME_EN = {
  edbo193: { name: "Berdiansk State Pedagogical University", short: "BSPU" },
  edbo318: { name: "KROK University", short: "KROK" },
  edbo252: { name: "Vinnytsia Mykhailo Kotsiubynskyi State Pedagogical University", short: "VSPU" },
  edbo6600: { name: "Vinnytsia Institute of Trade and Economics", short: "VITE" },
  edbo404: { name: "Viacheslav Chornovil Halych Vocational College", short: "HVC" },
  edbo216: { name: "Ukrainian State University of Chemical Technology", short: "USUCT" },
  edbo6540: { name: "State Tax University", short: "STU" },
  edbo6594: { name: "State University of Trade and Economics", short: "SUTE" },
  edbo208: { name: "Zhytomyr Polytechnic State University", short: "ZPSU" },
  edbo5780: { name: "State University of Intelligent Technologies and Telecommunications", short: "SUITT" },
  edbo109: { name: "Ivan Franko Zhytomyr State University", short: "ZSU" },
  edbo1139: { name: "Lviv University of Business and Law", short: "LUBL" },
  edbo144: { name: "King Danylo University", short: "KDU" },
  edbo217: { name: "Open International University of Human Development “Ukraine”", short: "OIUHD" },
  edbo171: { name: "West Ukrainian National University", short: "WUNU" },
  edbo178: { name: "Ivan Ohiienko Kamianets-Podilskyi National University", short: "KPNU" },
  edbo341: { name: "Vasyl Stefanyk Carpathian National University", short: "VSCNU" },
  kneu: { name: "Vadym Hetman Kyiv National Economic University", short: "KNEU" },
  edbo196: { name: "Kyiv National University of Trade and Economics", short: "KNUTE" },
  edbo308: { name: "Kyiv National University of Culture and Arts", short: "KNUCA" },
  edbo56: { name: "Borys Grinchenko Kyiv University", short: "BGKU" },
  edbo5691: { name: "Kyiv University of Intellectual Property and Law", short: "KUIPL" },
  edbo218: { name: "Mykhailo Ostrohradskyi Kremenchuk National University", short: "KrNU" },
  edbo309: { name: "Lutsk National Technical University", short: "LNTU" },
  edbo16: { name: "Lviv University of Trade and Economics", short: "LUTE" },
  edbo353: { name: "International University", short: "IU" },
  edbo183: { name: "National Aviation University", short: "NAU" },
  edbo194: { name: "M. P. Drahomanov National Pedagogical University", short: "NPU" },
  edbo36: { name: "Dnipro University of Technology", short: "DUT" },
  edbo174: { name: "Igor Sikorsky Kyiv Polytechnic Institute", short: "KPI" },
  edbo91: { name: "Zaporizhzhia Polytechnic National University", short: "ZPNU" },
  edbo97: { name: "Lviv Polytechnic National University", short: "LPNU" },
  edbo5754: { name: "Odesa Polytechnic National University", short: "OPNU" },
  edbo192: { name: "National University “Odesa Law Academy”", short: "NUOLA" },
  edbo120: { name: "National University of Ostroh Academy", short: "NaUOA" },
  edbo225: { name: "Yuri Kondratyuk Poltava Polytechnic National University", short: "PPNU" },
  edbo158: { name: "T. H. Shevchenko National University “Chernihiv Colehium”", short: "NUCC" },
  edbo7208: { name: "Kyiv Aviation Institute National University", short: "KAI" },
  edbo7: { name: "National University of Life and Environmental Sciences of Ukraine", short: "NUBiP" },
  edbo9: { name: "National University of Water and Environmental Engineering", short: "NUWEE" },
  edbo105: { name: "Admiral Makarov National University of Shipbuilding", short: "NUOS" },
  edbo47: { name: "National University of Food Technologies", short: "NUFT" },
  edbo155: { name: "Mykola Gogol Nizhyn State University", short: "NDU" },
  edbo31: { name: "Odesa National Economic University", short: "ONEU" },
  edbo220: { name: "Odesa National Maritime University", short: "ONMU" },
  edbo3: { name: "Volodymyr Korolenko Poltava National Pedagogical University", short: "PNPU" },
  edbo249: { name: "Interregional Academy of Personnel Management", short: "MAUP" },
  edbo310: { name: "Kyiv University of Culture", short: "KUC" },
  edbo215: { name: "Academician Stepan Demianchuk International University of Economics and Humanities", short: "IUEH" },
  edbo868: { name: "Ukrainian Institute of Humanities", short: "UIH" },
  edbo344: { name: "Kyiv International University", short: "KyIU" },
  edbo1365: { name: "Pylyp Orlyk International Classical University", short: "ICU" },
  edbo21: { name: "Volodymyr Dahl East Ukrainian National University", short: "EUNU" },
  edbo892: { name: "V. I. Vernadsky Taurida National University", short: "TNU" },
  edbo96: { name: "Volodymyr Hnatiuk Ternopil National Pedagogical University", short: "TNPU" },
  edbo167: { name: "Ukrainian Academy of Printing", short: "UAP" },
  edbo6507: { name: "Ukrainian State University of Science and Technologies", short: "USUST" },
  edbo88: { name: "Pavlo Tychyna Uman State Pedagogical University", short: "USPU" },
  edbo340: { name: "Hryhorii Skovoroda University in Pereiaslav", short: "HSUP" },
  edbo3457: { name: "University of the State Fiscal Service of Ukraine", short: "USFS" },
  edbo1486: { name: "University of Customs and Finance", short: "UCF" },
  edbo87: { name: "Kharkiv State Academy of Culture", short: "KhSAC" },
  edbo227: { name: "Simon Kuznets Kharkiv National University of Economics", short: "KhNUE" },
  edbo48: { name: "Kherson State University", short: "KSU" },
  edbo55: { name: "Volodymyr Vynnychenko Central Ukrainian State University", short: "CUSU" },
  edbo265: { name: "Petro Mohyla Black Sea National University", short: "BSNU" },
  sumdu: { name: "Sumy State University", short: "SumDU" },
  mdu: { name: "Mariupol State University", short: "MSU" },
  donnu: { name: "Vasyl' Stus Donetsk National University", short: "DonNU" },
  "lnu-shev": { name: "Taras Shevchenko Luhansk National University", short: "LNU" },
  vnu: { name: "Lesya Ukrainka Volyn National University", short: "VNU" },
  cnu: { name: "Bohdan Khmelnytsky National University of Cherkasy", short: "CNU" },
  cpu: { name: "Classic Private University", short: "CPU" }
};

/* Реєстр УСІХ закладів освіти, що хоч раз траплялись у даних цього рівня
   (по всіх роках, включно з реальними історичними) — не лише
   кураторський демо-список BACHELOR_UNIS/MASTER_UNIS. Потрібен, щоб (а)
   сторінка ЗВО могла знайти метадані для будь-якого реального закладу,
   а не тільки для ~20 кураторських, і (б) повний рейтинг міг показати
   заклад навіть за рік, коли в нього немає даних. */
function allUniversitiesForDegree(degree) {
  const registry = new Map();
  for (const year of [...PAST_YEARS, CURRENT_YEAR]) {
    const yd = BY_YEAR[year];
    if (!yd) continue;
    const snap = yd.snapshots[yd.dates[yd.dates.length - 1]];
    for (const row of snap[degree] || []) {
      registry.set(row.id, { id: row.id, name: row.name, short: row.short, hue: row.hue });
    }
  }
  const curated = degree === "bachelor" ? BACHELOR_UNIS : MASTER_UNIS;
  for (const u of curated) {
    const existing = registry.get(u.id);
    if (existing) {
      existing.nameEn = u.nameEn;
      existing.shortEn = u.shortEn;
    } else {
      registry.set(u.id, { id: u.id, name: u.name, short: u.short, hue: u.hue, nameEn: u.nameEn, shortEn: u.shortEn });
    }
  }
  for (const [id, entry] of registry) {
    if (!entry.nameEn && UNI_NAME_EN[id]) {
      entry.nameEn = UNI_NAME_EN[id].name;
      entry.shortEn = UNI_NAME_EN[id].short;
    }
  }
  return registry;
}

/* той самий реєстр, але об'єднаний по обох рівнях — з прапорцями
   hasBachelor/hasMaster (потрібно для сторінки ЗВО) */
function allUniversitiesMeta() {
  const registry = new Map();
  for (const degree of ["bachelor", "master"]) {
    for (const [id, info] of allUniversitiesForDegree(degree)) {
      const existing = registry.get(id) || { ...info, hasBachelor: false, hasMaster: false };
      existing.name = info.name;
      existing.short = info.short;
      existing.hue = info.hue;
      existing.nameEn = info.nameEn;
      existing.shortEn = info.shortEn;
      existing[degree === "bachelor" ? "hasBachelor" : "hasMaster"] = true;
      registry.set(id, existing);
    }
  }
  return registry;
}

const DB = {
  years: [...PAST_YEARS, CURRENT_YEAR],
  currentYear: CURRENT_YEAR,
  byYear: BY_YEAR,
  minApplications: MIN_APPLICATIONS,
  allUniversities: allUniversitiesForDegree,
  allUniversitiesMeta
};
