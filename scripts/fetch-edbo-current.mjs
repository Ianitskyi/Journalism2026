#!/usr/bin/env node
/*
 * Щоденне оновлення ВЖЕ ВІДОМИХ пропозицій 2026 року.
 *
 * Пошук пропозицій захищений Turnstile, тому цей скрипт принципово не
 * намагається його викликати або обходити. Початковий список offerId людина
 * створює через edbo-capture.bookmarklet.js + import-edbo-manual.mjs.
 * Публічні GET /offer/<id> перевірено: вони працюють без cookies і містять
 * готові rqs_total/rqs_allowed/rqs_kv_avg та список заяв із
 * konkurs_value/priority.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";

const BASE = "https://vstup.edbo.gov.ua";
const UID_TO_SLUG = {
  41: "knu", 282: "lnu", 79: "naukma", 244: "ucu", 28: "onu",
  62: "karazin", 111: "dnu", 73: "znu", 44: "vnu", 207: "uzhnu",
  101: "cnu", 6945: "kubg", 246: "donnu", 198: "cpu", 81: "lnu-shev",
  19: "mdu", 61: "chnu", 168: "sumdu", 6704: "npu"
};
const SLUG_HUE = {
  knu: 350, lnu: 205, naukma: 268, ucu: 140, onu: 24, karazin: 12,
  dnu: 60, znu: 90, vnu: 200, uzhnu: 150, cnu: 45, kubg: 300,
  donnu: 260, cpu: 18, "lnu-shev": 100, mdu: 220, chnu: 280,
  sumdu: 170, npu: 330
};
const SLUG_SHORT = {
  knu: "КНУ", lnu: "ЛНУ", naukma: "НаУКМА", ucu: "УКУ", onu: "ОНУ",
  karazin: "ХНУ", dnu: "ДНУ", znu: "ЗНУ", vnu: "ВНУ", uzhnu: "УжНУ",
  cnu: "ЧНУ", kubg: "КУБГ", donnu: "ДонНУ", cpu: "КПУ",
  "lnu-shev": "ЛНУ ім.Ш.", mdu: "МДУ", chnu: "ЧернНУ",
  sumdu: "СумДУ", npu: "НПУ"
};
const PALETTE_HUES = [350, 205, 268, 140, 24, 12, 60, 90, 320, 200, 150, 45, 300, 260, 18, 100, 220, 280, 170, 330];
const MIN_APPLICATIONS = { bachelor: 20, master: 15 };
const MIN_APPLICATIONS_P1 = { bachelor: 8, master: 5 };

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

  const priority1Scores = [];
  const priorityPattern = /"konkurs_value":([0-9.]+),"priority":1(?:,|})/g;
  const normalized = html.replace(/\\"/g, '"');
  for (const match of normalized.matchAll(priorityPattern)) priority1Scores.push(Number(match[1]));

  return {
    offerId,
    level: manifestEntry.level,
    universityId: field(html, "university_id") ?? manifestEntry.universityId,
    universityName: stringField(html, "university_name") ?? manifestEntry.universityName,
    applications,
    admitted,
    averageScore,
    priority1Scores
  };
}

function rank(offers, level) {
  const grouped = new Map();
  for (const offer of offers.filter((item) => item.level === level)) {
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
        applications: 0,
        admitted: 0,
        p1Sum: 0,
        p1Applications: 0
      });
    }
    const row = grouped.get(id);
    row.weighted += offer.averageScore * offer.admitted;
    row.applications += offer.applications;
    row.admitted += offer.admitted;
    for (const score of offer.priority1Scores) {
      row.p1Sum += score;
      row.p1Applications += 1;
    }
  }

  const all = [...grouped.values()]
    .filter((row) => row.applications >= MIN_APPLICATIONS[level] && row.admitted > 0)
    .map((row) => ({
      id: row.id, name: row.name, short: row.short, hue: row.hue,
      score: Math.round((row.weighted / row.admitted) * 10) / 10,
      applications: row.applications,
      admitted: row.admitted
    }))
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const p1 = [...grouped.values()]
    .filter((row) => row.p1Applications >= MIN_APPLICATIONS_P1[level])
    .map((row) => ({
      id: row.id, name: row.name, short: row.short, hue: row.hue,
      score: Math.round((row.p1Sum / row.p1Applications) * 10) / 10,
      applications: row.p1Applications
    }))
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return { all, p1 };
}

function kyivDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

const sumApps = (rows) => rows.reduce((sum, row) => sum + row.applications, 0);
const sumAdmitted = (rows) => rows.reduce((sum, row) => sum + (row.admitted || 0), 0);

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
    bachelor: bachelor.all,
    master: master.all,
    bachelorP1: bachelor.p1,
    masterP1: master.p1,
    totalApplications: {
      bachelor: sumApps(bachelor.all), master: sumApps(master.all),
      bachelorP1: sumApps(bachelor.p1), masterP1: sumApps(master.p1)
    },
    totalAdmitted: {
      bachelor: sumAdmitted(bachelor.all), master: sumAdmitted(master.all)
    },
    _offers: {
      bachelor: offers.filter((offer) => offer.level === "bachelor"),
      master: offers.filter((offer) => offer.level === "master")
    }
  };

  await mkdir("data", { recursive: true });
  await writeFile(`data/${date}.json`, JSON.stringify(snapshot, null, 2), "utf8");
  await writeFile("data/2026-index.json", JSON.stringify([date], null, 2) + "\n", "utf8");
  console.log(`Записано data/${date}.json`);
}

main().catch((error) => {
  console.error(`fetch-edbo-current: ${error.message}`);
  process.exitCode = 1;
});
