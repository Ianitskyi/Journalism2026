#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — попередня спроба
 * (diagnose-mon-rss.mjs) отримала від Bing статус 200, але специфічний
 * regex-парсер результатів (<h2><a...) нічого не знайшов — розмітка,
 * очевидно, інша. Тут витягуємо ВСІ посилання зі сторінки узагальненим
 * регексом і фільтруємо ті, що ведуть на зовнішні (не bing.com) сайти —
 * щоб побачити реальні результати пошуку без здогадок про CSS-класи.
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

async function bingSearch(query) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=uk`;
  console.log(`\n=== Bing пошук: "${query}" ===`);
  const resp = await fetchWithTimeout(url);
  console.log(`статус: ${resp.status}`);
  if (!resp.ok) return;
  const html = await resp.text();
  console.log(`довжина сторінки: ${html.length}`);

  // усі href, що ведуть на зовнішні домени (не bing/microsoft)
  const hrefRe = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>/g;
  const seen = new Set();
  let m;
  let count = 0;
  while ((m = hrefRe.exec(html)) && count < 40) {
    const href = m[1];
    if (/bing\.com|microsoft\.com|msn\.com/i.test(href)) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    console.log(`  - ${href}`);
    count++;
  }
  if (count === 0) console.log("  жодного зовнішнього посилання не знайдено");
}

async function main() {
  await bingSearch("МОН підсумки вступної кампанії 2026 бюджет");
  await bingSearch("вступна кампанія 2026 журналістика скільки вступили");
  await bingSearch("site:mon.gov.ua вступна кампанія 2026");
  await bingSearch("вступ 2026 рейтингові списки ЄДЕБО");
}

main().catch((err) => {
  console.error("diagnose-bing-search впав з помилкою:", err);
  process.exitCode = 1;
});
