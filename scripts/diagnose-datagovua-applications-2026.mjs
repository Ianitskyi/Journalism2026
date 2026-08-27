#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — перевіряє датасет МОН
 * "Дані про заяви вступників до закладів вищої освіти (знеособлені дані)"
 * (id=fe330fe6-a5a6-4126-8427-510f303cde14), знайдений широким пошуком на
 * data.gov.ua, метадані оновлені 2026-08-20 — тобто, схоже, це актуальні
 * дані вступної кампанії 2026 року. З'ясовуємо: URL ресурсів (XLSX),
 * розмір, і (якщо вдасться швидко розпарсити) чи є там рік/спеціальність/
 * заклад/бюджет-контракт по журналістиці.
 */

const PACKAGE_ID = "fe330fe6-a5a6-4126-8427-510f303cde14";
const TIMEOUT_MS = 30_000;

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const resp = await fetchWithTimeout(
    `https://data.gov.ua/api/3/action/package_show?id=${PACKAGE_ID}`
  );
  console.log(`package_show status: ${resp.status}`);
  const json = await resp.json();
  const pkg = json.result;
  if (!pkg) { console.log("немає result"); return; }
  console.log(`Назва: ${pkg.title}`);
  console.log(`Опис: ${(pkg.notes || "").slice(0, 1000)}`);
  console.log(`Дата оновлення метаданих: ${pkg.metadata_modified}`);
  console.log(`Тегі: ${JSON.stringify((pkg.tags || []).map((t) => t.name))}`);
  console.log(`Кількість ресурсів: ${(pkg.resources || []).length}`);

  for (const res of pkg.resources || []) {
    console.log(`\n--- ресурс: ${res.name} ---`);
    console.log(`формат: ${res.format}, url: ${res.url}`);
    console.log(`created: ${res.created}, last_modified: ${res.last_modified}`);
    console.log(`опис: ${(res.description || "").slice(0, 300)}`);

    // HEAD запит, щоб дізнатись розмір без завантаження всього файлу
    try {
      const headResp = await fetchWithTimeout(res.url, { method: "HEAD" });
      console.log(`HEAD статус: ${headResp.status}, Content-Length: ${headResp.headers.get("content-length")}, Last-Modified: ${headResp.headers.get("last-modified")}`);
    } catch (err) {
      console.log(`HEAD помилка: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("diagnose-datagovua-applications-2026 впав з помилкою:", err);
  process.exitCode = 1;
});
