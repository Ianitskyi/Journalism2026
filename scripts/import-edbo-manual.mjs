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
 * оновлює/створює знімок data/<дата>.json у форматі, який очікує js/app.js.
 *
 * Приклад:
 *   node scripts/import-edbo-manual.mjs \
 *     --date 2026-07-22 --level bachelor --university knu \
 *     --scores scores/knu-bachelor.txt \
 *     [--priority1-scores scores/knu-bachelor-p1.txt]
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

const MIN_APPLICATIONS = { bachelor: 20, master: 15 };
const MIN_APPLICATIONS_P1 = { bachelor: 8, master: 5 };

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

function rankBoth(entries) {
  const all = entries
    .filter((e) => e.applications >= (MIN_APPLICATIONS[e._level] ?? 0))
    .sort((a, b) => b.score - a.score)
    .map(({ id, name, short, hue, score, applications }, i) => ({ id, name, short, hue, score, applications, rank: i + 1 }));

  const p1 = entries
    .filter((e) => e.p1Applications != null && e.p1Applications >= (MIN_APPLICATIONS_P1[e._level] ?? 0))
    .sort((a, b) => b.p1Score - a.p1Score)
    .map(({ id, name, short, hue, p1Score, p1Applications }, i) => ({ id, name, short, hue, score: p1Score, applications: p1Applications, rank: i + 1 }));

  return { all, p1 };
}

function sumApps(rows) {
  return rows.reduce((s, r) => s + r.applications, 0);
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
      bachelorP1: [],
      masterP1: [],
      // _entries зберігає сирі агреговані рядки (до ранжування), щоб можна
      // було дописувати нові ЗВО в той самий знімок кількома запусками
      _entries: { bachelor: [], master: [] }
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const date = args.date || new Date().toISOString().slice(0, 10);
  const level = args.level;
  const universityId = args.university;

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

  let p1Scores = [];
  if (args["priority1-scores"]) {
    const p1Raw = await readFile(args["priority1-scores"], "utf8");
    p1Scores = extractScores(p1Raw);
  }

  const mean = (arr) => round1(arr.reduce((s, x) => s + x, 0) / arr.length);

  const uni = UNIVERSITIES[universityId];
  const outDir = "data";
  const outFile = path.join(outDir, `${date}.json`);
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
    ...(p1Scores.length ? { p1Score: mean(p1Scores), p1Applications: p1Scores.length } : {})
  };
  snapshot._entries[level].push(entry);

  const ranked = rankBoth(snapshot._entries[level]);
  snapshot[level] = ranked.all;
  snapshot[`${level}P1`] = ranked.p1;
  snapshot.totalApplications = {
    bachelor: sumApps(snapshot.bachelor || []),
    master: sumApps(snapshot.master || []),
    bachelorP1: sumApps(snapshot.bachelorP1 || []),
    masterP1: sumApps(snapshot.masterP1 || [])
  };
  snapshot.asOf = new Date().toISOString().replace(/\.\d+Z$/, "+03:00");

  await writeFile(outFile, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(
    `Записано ${universityId} (${level}): бал ${entry.score}, заяв ${entry.applications}` +
      (entry.p1Score ? `, пріоритет-1 бал ${entry.p1Score} / заяв ${entry.p1Applications}` : "") +
      `\n→ ${outFile}`
  );
}

main().catch((err) => {
  console.error("Помилка імпорту:", err);
  process.exitCode = 1;
});
