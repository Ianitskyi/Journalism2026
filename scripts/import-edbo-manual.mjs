#!/usr/bin/env node
/*
 * Варіант 1 ручного підключення реальних даних ЄДЕБО (див. README, розділ
 * "Підключення реальних даних ЄДЕБО" → Cloudflare Turnstile блокує
 * автоматичний пошук на vstup.edbo.gov.ua).
 *
 * Людина сама заходить на vstup.edbo.gov.ua, проходить Turnstile як звичайний
 * користувач, знаходить рейтинговий список абітурієнтів для конкретної
 * конкурсної пропозиції (ЗВО + спеціальність 061 + рівень) і копіює стовпець
 * конкурсних балів (звичайний copy-paste, без жодної автоматизації доступу)
 * у текстовий файл — по одному числу на рядок (або через кому/пробіл).
 * Цей скрипт рахує середній бал і кількість заяв із цього файлу й
 * оновлює/створює єдиний знімок data/2026-current.json у форматі, який
 * очікує js/app.js. Попередні дні свідомо не зберігаються — файл завжди
 * перезаписується найсвіжішими даними.
 *
 * Приклад:
 *   node scripts/import-edbo-manual.mjs \
 *     --date 2026-07-22 --level bachelor --university knu \
 *     --scores scores/knu-bachelor.txt
 *
 * Файл зі скорами: будь-який текст, з якого витягуються всі числа виду
 * 100-200(.xx) — зайві пробіли/розділові знаки не заважають.
 *
 * Реєстр ЗВО нижче має відповідати BACHELOR_UNIS/MASTER_UNIS у js/data.js
 * (ті самі id/name/short/hue) — це навмисно окрема копія, щоб не чіпати
 * генератор тестових даних.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const UNIVERSITIES = {
  knu:      { name: "КНУ ім. Тараса Шевченка (Інститут журналістики)", short: "КНУ",        hue: 350 },
  lnu:      { name: "Львівський нац. ун-т ім. Івана Франка",           short: "ЛНУ",         hue: 205 },
  naukma:   { name: "НаУКМА (Могилянська школа журналістики)",        short: "НаУКМА",      hue: 268 },
  ucu:      { name: "Український католицький університет",           short: "УКУ",         hue: 140 },
  onu:      { name: "Одеський нац. ун-т ім. І. І. Мечникова",         short: "ОНУ",         hue: 24  },
  karazin:  { name: "Харківський нац. ун-т ім. В. Н. Каразіна",       short: "ХНУ",         hue: 12  },
  dnu:      { name: "Дніпровський нац. ун-т ім. Олеся Гончара",       short: "ДНУ",         hue: 60  },
  znu:      { name: "Запорізький нац. ун-т",                          short: "ЗНУ",         hue: 90  },
  pnu:      { name: "Прикарпатський нац. ун-т ім. В. Стефаника",      short: "ПНУ",         hue: 320 },
  vnu:      { name: "Волинський нац. ун-т ім. Лесі Українки",         short: "ВНУ",         hue: 200 },
  uzhnu:    { name: "Ужгородський нац. ун-т",                         short: "УжНУ",        hue: 150 },
  cnu:      { name: "Черкаський нац. ун-т ім. Б. Хмельницького",      short: "ЧНУ",         hue: 45  },
  kubg:     { name: "Київський ун-т ім. Бориса Грінченка",            short: "КУБГ",        hue: 300 },
  donnu:    { name: "Донецький нац. ун-т ім. Василя Стуса (Вінниця)", short: "ДонНУ",       hue: 260 },
  cpu:      { name: "Класичний приватний університет (Запоріжжя)",   short: "КПУ",         hue: 18  },
  "lnu-shev": { name: "Луганський нац. ун-т ім. Т. Шевченка (Полтава)", short: "ЛНУ ім.Ш.", hue: 100 },
  mdu:      { name: "Маріупольський державний ун-т (Київ)",           short: "МДУ",         hue: 220 },
  chnu:     { name: "Чернівецький нац. ун-т ім. Юрія Федьковича",     short: "ЧернНУ",      hue: 280 },
  sumdu:    { name: "Сумський державний університет",                 short: "СумДУ",       hue: 170 },
  npu:      { name: "НПУ ім. М. П. Драгоманова",                      short: "НПУ",         hue: 330 }
};

const UID_TO_SLUG = {
  41: "knu", 282: "lnu", 79: "naukma", 244: "ucu", 28: "onu",
  62: "karazin", 111: "dnu", 73: "znu", 44: "vnu", 207: "uzhnu",
  101: "cnu", 6945: "kubg", 246: "donnu", 198: "cpu", 81: "lnu-shev",
  19: "mdu", 61: "chnu", 168: "sumdu", 6704: "npu"
};

const PALETTE_HUES = [350, 205, 268, 140, 24, 12, 60, 90, 320, 200, 150, 45, 300, 260, 18, 100, 220, 280, 170, 330];

const MIN_APPLICATIONS = { bachelor: 20, master: 15 };

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function extractScores(text) {
  const re = /\b1[0-9]{2}(?:[.,]\d{1,3})?\b/g;
  const matches = text.match(re) || [];
  return matches.map((s) => parseFloat(s.replace(",", ".")));
}

const round1 = (n) => Math.round(n * 10) / 10;

function rankAll(entries) {
  return entries
    .filter((e) => e.applications >= (MIN_APPLICATIONS[e._level] ?? 0))
    .sort((a, b) => b.score - a.score)
    .map(({ id, name, short, hue, score, applications, admitted }, i) => ({ id, name, short, hue, score, applications, admitted, rank: i + 1 }));
}

function sumApps(rows) {
  return rows.reduce((s, r) => s + r.applications, 0);
}

function sumAdmitted(rows) {
  return rows.reduce((s, r) => s + (r.admitted || 0), 0);
}

function shortName(name) {
  const words = name.replace(/["'«»“”()]/g, " ").split(/\s+/).filter((word) => word.length > 2);
  return (words.slice(0, 4).map((word) => word[0]).join("") || name.slice(0, 4)).toUpperCase();
}

function metaForCapturedOffer(offer) {
  const slug = UID_TO_SLUG[offer.universityId];
  if (slug && UNIVERSITIES[slug]) return { id: slug, ...UNIVERSITIES[slug] };
  const uid = Number(offer.universityId) || 0;
  const name = offer.universityName || `Заклад ЄДЕБО ${uid || "без id"}`;
  return {
    id: uid ? `edbo${uid}` : `manual-${Buffer.from(name).toString("hex").slice(0, 12)}`,
    name,
    short: shortName(name),
    hue: PALETTE_HUES[Math.abs(uid) % PALETTE_HUES.length]
  };
}

function rebuildLevel(snapshot, level) {
  const manualEntries = snapshot._entries?.[level] || [];
  const offers = snapshot._offers?.[level] || [];
  const grouped = new Map();

  for (const offer of offers) {
    const meta = metaForCapturedOffer(offer);
    if (!grouped.has(meta.id)) {
      grouped.set(meta.id, {
        ...meta,
        _level: level,
        weightedScoreSum: 0,
        applications: 0,
        admitted: 0
      });
    }
    const row = grouped.get(meta.id);
    row.weightedScoreSum += Number(offer.averageScore) * Number(offer.admitted);
    row.applications += Number(offer.applications);
    row.admitted += Number(offer.admitted);
  }

  const capturedEntries = [...grouped.values()].map((row) => ({
    id: row.id,
    name: row.name,
    short: row.short,
    hue: row.hue,
    _level: level,
    score: round1(row.weightedScoreSum / row.admitted),
    applications: row.applications,
    admitted: row.admitted
  }));

  const capturedIds = new Set(capturedEntries.map((entry) => entry.id));
  return rankAll([...manualEntries.filter((entry) => !capturedIds.has(entry.id)), ...capturedEntries]);
}

async function loadSnapshot(file, date) {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      date,
      asOf: `${date}T00:00:00+03:00`,
      bachelor: [],
      master: [],
      // _entries зберігає сирі агреговані рядки (до ранжування), щоб можна
      // було дописувати нові ЗВО в той самий знімок кількома запусками
      _entries: { bachelor: [], master: [] },
      _offers: { bachelor: [], master: [] }
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const date = args.date || new Date().toISOString().slice(0, 10);
  const level = args.level;
  const universityId = args.university;

  if (args.capture) {
    const captureFiles = String(args.capture).split(",").map((value) => value.trim()).filter(Boolean);
    const captures = await Promise.all(captureFiles.map(async (file) => JSON.parse(await readFile(file, "utf8"))));
    const offers = captures.map((capture) => capture.offer).filter(Boolean);
    if (!offers.length) throw new Error("У capture-файлах немає поля offer. Запускай консольний скрипт на сторінці /offer/<id>.");

    const outDir = "data";
    const outFile = path.join(outDir, "2026-current.json");
    await mkdir(outDir, { recursive: true });
    const snapshot = await loadSnapshot(outFile, date);
    snapshot._entries ||= { bachelor: [], master: [] };
    snapshot._offers ||= { bachelor: [], master: [] };

    for (const offer of offers) {
      if (!offer.offerId || !["bachelor", "master"].includes(offer.level)) {
        throw new Error("Capture не містить коректних offerId/level.");
      }
      if (!Number.isFinite(Number(offer.applications)) || !Number.isFinite(Number(offer.admitted)) || !Number.isFinite(Number(offer.averageScore))) {
        throw new Error(`Capture пропозиції ${offer.offerId} не містить applications/admitted/averageScore.`);
      }
      const list = snapshot._offers[offer.level] || [];
      snapshot._offers[offer.level] = [...list.filter((item) => item.offerId !== offer.offerId), offer];
    }

    for (const currentLevel of ["bachelor", "master"]) {
      snapshot[currentLevel] = rebuildLevel(snapshot, currentLevel);
    }
    snapshot.date = date;
    snapshot.asOf = new Date().toISOString();
    snapshot.totalApplications = {
      bachelor: sumApps(snapshot.bachelor || []),
      master: sumApps(snapshot.master || [])
    };
    snapshot.totalAdmitted = {
      bachelor: sumAdmitted(snapshot.bachelor || []),
      master: sumAdmitted(snapshot.master || [])
    };

    await writeFile(outFile, JSON.stringify(snapshot, null, 2), "utf8");
    const manifestFile = path.join("data", "2026-offers.json");
    let manifest = { offers: [] };
    try {
      manifest = JSON.parse(await readFile(manifestFile, "utf8"));
    } catch {}
    for (const offer of offers) {
      manifest.offers = [
        ...(manifest.offers || []).filter((item) => item.offerId !== offer.offerId),
        {
          offerId: offer.offerId,
          level: offer.level,
          universityId: offer.universityId,
          universityName: offer.universityName
        }
      ];
    }
    manifest.offers.sort((a, b) => a.offerId - b.offerId);
    await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    console.log(`Імпортовано ${offers.length} capture-файл(ів) → ${outFile}`);
    return;
  }

  if (!level || !["bachelor", "master"].includes(level)) {
    console.error("Потрібен --level bachelor|master");
    process.exitCode = 1;
    return;
  }
  if (!universityId || !UNIVERSITIES[universityId]) {
    console.error(
      `Потрібен --university <id>. Відомі id: ${Object.keys(UNIVERSITIES).join(", ")}\n` +
        `(якщо потрібного ЗВО нема в списку — додай його в UNIVERSITIES у цьому файлі)`
    );
    process.exitCode = 1;
    return;
  }
  if (!args.scores) {
    console.error("Потрібен --scores <файл із балами> (по одному числу на рядок або через кому/пробіл)");
    process.exitCode = 1;
    return;
  }

  const scoresRaw = await readFile(args.scores, "utf8");
  const scores = extractScores(scoresRaw);
  if (!scores.length) {
    console.error(`У файлі ${args.scores} не знайдено жодного числа виду 100-200(.xx)`);
    process.exitCode = 1;
    return;
  }

  const mean = (arr) => round1(arr.reduce((s, x) => s + x, 0) / arr.length);

  const uni = UNIVERSITIES[universityId];
  const outDir = "data";
  const outFile = path.join(outDir, "2026-current.json");
  await mkdir(outDir, { recursive: true });

  const snapshot = await loadSnapshot(outFile, date);
  snapshot._entries = snapshot._entries || { bachelor: [], master: [] };
  snapshot._entries[level] = (snapshot._entries[level] || []).filter((e) => e.id !== universityId);

  const entry = {
    id: universityId,
    name: uni.name,
    short: uni.short,
    hue: uni.hue,
    _level: level,
    score: mean(scores),
    applications: scores.length,
    admitted: scores.length
  };
  snapshot._entries[level].push(entry);

  snapshot[level] = rankAll(snapshot._entries[level]);
  snapshot.totalApplications = {
    bachelor: sumApps(snapshot.bachelor || []),
    master: sumApps(snapshot.master || [])
  };
  snapshot.totalAdmitted = {
    bachelor: sumAdmitted(snapshot.bachelor || []),
    master: sumAdmitted(snapshot.master || [])
  };
  snapshot.asOf = new Date().toISOString().replace(/\.\d+Z$/, "+03:00");

  await writeFile(outFile, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(`Записано ${universityId} (${level}): бал ${entry.score}, заяв ${entry.applications}\n→ ${outFile}`);
}

main().catch((err) => {
  console.error("Помилка імпорту:", err);
  process.exitCode = 1;
});
