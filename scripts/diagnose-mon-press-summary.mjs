#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — перевіряє, чи публікує
 * МОН/ЄДЕБО прес-звіти чи новини з підсумками вступної кампанії 2026 року
 * (готові агреговані цифри, не сирі дані) — через пошук на mon.gov.ua та
 * загальний веб-пошук (DuckDuckGo HTML, без API-ключа).
 */

const TIMEOUT_MS = 20_000;

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ...(opts.headers || {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function ddgSearch(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const resp = await fetchWithTimeout(url, { method: "POST", body: new URLSearchParams({ q: query }) });
  console.log(`  DDG status: ${resp.status}`);
  if (!resp.ok) return [];
  const html = await resp.text();
  const results = [];
  const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) && results.length < 10) {
    const href = m[1];
    const title = m[2].replace(/<[^>]+>/g, "").trim();
    results.push({ href, title });
  }
  return results;
}

async function main() {
  console.log("=== Перевірка доступності mon.gov.ua ===");
  try {
    const resp = await fetchWithTimeout("https://mon.gov.ua/ua");
    console.log(`статус: ${resp.status}`);
  } catch (err) {
    console.log(`помилка: ${err.message}`);
  }

  const queries = [
    "МОН підсумки вступної кампанії 2026",
    "вступна кампанія 2026 скільки вступили на бюджет",
    "site:mon.gov.ua вступна кампанія 2026",
    "ЄДЕБО підсумки прийому 2026 журналістика"
  ];

  for (const q of queries) {
    console.log(`\n=== Пошук: "${q}" ===`);
    try {
      const results = await ddgSearch(q);
      if (!results.length) console.log("  нічого не знайдено / порожній результат");
      for (const r of results) {
        console.log(`  - ${r.title}\n    ${r.href}`);
      }
    } catch (err) {
      console.log(`  помилка пошуку: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

main().catch((err) => {
  console.error("diagnose-mon-press-summary впав з помилкою:", err);
  process.exitCode = 1;
});
