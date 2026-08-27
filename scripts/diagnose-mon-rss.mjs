#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — попередня спроба
 * (diagnose-mon-press-summary.mjs) провалилась технічно: mon.gov.ua дав
 * 403, DuckDuckGo HTML дав 202 без результатів (антибот). Пробуємо RSS-
 * стрічку новин mon.gov.ua (часто без бот-захисту) та Bing HTML-пошук.
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(opts.headers || {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function tryRss(url) {
  console.log(`\n--- RSS спроба: ${url} ---`);
  try {
    const resp = await fetchWithTimeout(url);
    console.log(`статус: ${resp.status}`);
    if (resp.ok) {
      const text = await resp.text();
      console.log(`довжина: ${text.length}`);
      const titles = [...text.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => m[1]).slice(0, 15);
      console.log("перші заголовки:");
      for (const t of titles) console.log(`  - ${t}`);
    }
  } catch (err) {
    console.log(`помилка: ${err.message}`);
  }
}

async function bingSearch(query) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  console.log(`\n--- Bing пошук: "${query}" ---`);
  try {
    const resp = await fetchWithTimeout(url);
    console.log(`статус: ${resp.status}`);
    if (!resp.ok) return;
    const html = await resp.text();
    console.log(`довжина сторінки: ${html.length}`);
    const re = /<h2><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/g;
    let m;
    let count = 0;
    while ((m = re.exec(html)) && count < 10) {
      const href = m[1];
      const title = m[2].replace(/<[^>]+>/g, "").trim();
      console.log(`  - ${title}\n    ${href}`);
      count++;
    }
    if (count === 0) console.log("  (результатів не розпізнано парсером — можливо, інша розмітка)");
  } catch (err) {
    console.log(`помилка: ${err.message}`);
  }
}

async function main() {
  await tryRss("https://mon.gov.ua/ua/news/rss");
  await tryRss("https://mon.gov.ua/feed");
  await tryRss("https://mon.gov.ua/ua/rss");

  await bingSearch("МОН підсумки вступної кампанії 2026 бюджет");
  await bingSearch("вступна кампанія 2026 журналістика скільки вступили");
  await bingSearch("site:mon.gov.ua вступна кампанія 2026 підсумки");
}

main().catch((err) => {
  console.error("diagnose-mon-rss впав з помилкою:", err);
  process.exitCode = 1;
});
