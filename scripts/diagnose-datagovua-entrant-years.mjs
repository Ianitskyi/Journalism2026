#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — перевіряє повний вміст
 * OPENDATA_02_ENTRANT.csv (датасет caa6a9a2-16b9-491d-8a49-6fa64ef770ed,
 * знайдений diagnose-datagovua-details.mjs): які роки покриває, і чи є
 * рядки для журналістики (спеціальність 061 / C7) з розбивкою
 * бюджет/контракт по закладах.
 */

const CSV_URL =
  "https://data.gov.ua/dataset/caa6a9a2-16b9-491d-8a49-6fa64ef770ed/resource/ae7b629b-f3e4-430d-92c6-3e3a8174e1d3/download/dani-shchodo-faktichnogo-priiomu-za-spetsialnostiami-u-zakladakh-vishchoyi-osviti.csv";

async function main() {
  const resp = await fetch(CSV_URL, { signal: AbortSignal.timeout(60_000) });
  console.log(`статус завантаження: ${resp.status}`);
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  console.log(`розмір: ${bytes.length} байт`);
  const text = new TextDecoder("utf-8").decode(bytes);
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  console.log(`рядків (з заголовком): ${lines.length}`);

  const header = lines[0].split(";");
  console.log(`заголовок: ${JSON.stringify(header)}`);
  const yearIdx = header.indexOf("year");
  const specCodeIdx = header.indexOf("speciality_code");
  const specNameIdx = header.indexOf("speciality_name");
  const uniIdx = header.indexOf("university_name");
  const qualIdx = header.indexOf("qualification_name");

  const years = new Set();
  const journalismRows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const year = cols[yearIdx];
    years.add(year);
    const specCode = cols[specCodeIdx] || "";
    const specName = (cols[specNameIdx] || "").toLowerCase();
    if (specCode.includes("061") || specName.includes("журналіст")) {
      journalismRows.push(lines[i]);
    }
  }

  const sortedYears = [...years].sort((a, b) => Number(a) - Number(b));
  console.log(`\nунікальні роки (${sortedYears.length}): ${JSON.stringify(sortedYears)}`);

  console.log(`\nзнайдено рядків журналістики (061 / "журналіст" у назві): ${journalismRows.length}`);
  console.log("приклади (перші 5):");
  for (const row of journalismRows.slice(0, 5)) console.log(`  ${row}`);

  // журналістика, останній рік у файлі
  const maxYear = sortedYears[sortedYears.length - 1];
  const journalismLastYear = journalismRows.filter((r) => r.split(";")[yearIdx] === maxYear);
  console.log(`\nжурналістика за останній рік у файлі (${maxYear}): ${journalismLastYear.length} рядків`);
  for (const row of journalismLastYear.slice(0, 15)) console.log(`  ${row}`);
}

main().catch((err) => {
  console.error("diagnose-datagovua-entrant-years впав з помилкою:", err);
  process.exitCode = 1;
});
