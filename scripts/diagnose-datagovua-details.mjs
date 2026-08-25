#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — детально вивчає два
 * найперспективніші датасети МОН на data.gov.ua, знайдені попереднім
 * diagnose-datagovua.mjs ("ЄДЕБО" -> 11 результатів), щоб з'ясувати, чи
 * вони можуть замінити vstup2026.edbo.gov.ua як джерело даних за 2026 рік:
 * - "Дані щодо фактичного прийому та випуску за спеціальностями у ЗВО"
 *   (8f7d7ba2-1d1f-4de8-a105-660fb5ebb01a)
 * - "Дані щодо фактичного прийому за спеціальностями у ЗВО"
 *   (069dd877-9460-47f1-95db-57c57f02ae5d)
 *
 * Перевіряємо: чи є ресурс за 2026 рік, чи є розбивка по спеціальностях
 * (журналістика/061), чи є розбивка по закладах, чи є поле бюджет/контракт.
 */

const PACKAGE_IDS = [
  "8f7d7ba2-1d1f-4de8-a105-660fb5ebb01a",
  "069dd877-9460-47f1-95db-57c57f02ae5d"
];

const TIMEOUT_MS = 20_000;

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function parseCsvHead(text, maxLines = 5) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0).slice(0, maxLines);
  return lines;
}

async function main() {
  for (const pkgId of PACKAGE_IDS) {
    console.log(`\n========== package ${pkgId} ==========`);
    const resp = await fetchWithTimeout(
      `https://data.gov.ua/api/3/action/package_show?id=${pkgId}`
    );
    console.log(`package_show status: ${resp.status}`);
    if (!resp.ok) continue;
    const json = await resp.json();
    const pkg = json.result;
    if (!pkg) { console.log("немає result"); continue; }
    console.log(`Назва: ${pkg.title}`);
    console.log(`Опис: ${(pkg.notes || "").slice(0, 500)}`);
    console.log(`Дата оновлення метаданих: ${pkg.metadata_modified}`);
    console.log(`Кількість ресурсів: ${(pkg.resources || []).length}`);

    for (const res of pkg.resources || []) {
      console.log(`\n  --- ресурс: ${res.name} ---`);
      console.log(`  формат: ${res.format}, url: ${res.url}`);
      console.log(`  created: ${res.created}, last_modified: ${res.last_modified}`);
    }

    // пробуємо завантажити найновіший CSV/XLS ресурс і подивитись перші рядки
    const csvResources = (pkg.resources || []).filter(
      (r) => (r.format || "").toUpperCase() === "CSV"
    );
    csvResources.sort((a, b) => new Date(b.last_modified || b.created || 0) - new Date(a.last_modified || a.created || 0));
    const latest = csvResources[0];
    if (latest) {
      console.log(`\n  Завантажую найновіший CSV: ${latest.url}`);
      try {
        const csvResp = await fetchWithTimeout(latest.url);
        console.log(`  статус завантаження: ${csvResp.status}`);
        if (csvResp.ok) {
          const buf = await csvResp.arrayBuffer();
          const bytes = new Uint8Array(buf);
          console.log(`  розмір: ${bytes.length} байт`);
          // пробуємо utf-8, якщо з кракозябрами - windows-1251
          let text = new TextDecoder("utf-8").decode(bytes.slice(0, 4000));
          if (text.includes("�")) {
            text = new TextDecoder("windows-1251").decode(bytes.slice(0, 4000));
          }
          console.log("  перші рядки CSV:");
          for (const line of parseCsvHead(text, 8)) {
            console.log(`    ${line.slice(0, 300)}`);
          }
        }
      } catch (err) {
        console.log(`  помилка завантаження CSV: ${err.message}`);
      }
    } else {
      console.log("  немає CSV-ресурсу");
    }
  }
}

main().catch((err) => {
  console.error("diagnose-datagovua-details впав з помилкою:", err);
  process.exitCode = 1;
});
