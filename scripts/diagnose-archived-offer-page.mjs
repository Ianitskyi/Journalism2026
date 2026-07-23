#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — перевіряє, чи доступна
 * сторінка /offer/<id> для АРХІВНОГО року (аналог живої vstup.edbo.gov.ua,
 * яка захищена Cloudflare Turnstile), і чи містить вона таблицю вступників
 * з розбивкою за пріоритетом заяви — потрібно для ідеї фільтра
 * "лише заяви 1 та 2 пріоритету".
 *
 * usid з відповіді /offers-list/ (напр. НаУКМА, бакалавр, 2025: 1443014)
 * використовується як ймовірний offerId для /offer/<id>, за аналогією з
 * тим, як fetch-edbo-current.mjs звертається до живої /offer/<id>.
 */

const YEAR = 2025;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;
const CANDIDATE_OFFER_IDS = [1443014, 1443013, 1443012];

async function main() {
  for (const offerId of CANDIDATE_OFFER_IDS) {
    console.log(`\n=== /offer/${offerId} ===`);
    try {
      const resp = await fetch(`${BASE}/offer/${offerId}`, {
        headers: { Accept: "text/html", "User-Agent": "Journalism2026 diagnostic" },
        signal: AbortSignal.timeout(20000)
      });
      console.log("status:", resp.status);
      const html = await resp.text();
      console.log("length:", html.length);
      console.log("looks like Cloudflare challenge:", /cloudflare|cf-browser-verification|challenge-platform|Just a moment/i.test(html));
      console.log("has table:", /<table/i.test(html));
      console.log("mentions пріоритет:", /пріоритет/i.test(html));
      // шукаємо будь-яке поле з "priority"/"prior" у сирому HTML (RSC-дані Next.js)
      const priorityFields = [...html.matchAll(/"(\w*priorit\w*)":/gi)].map((m) => m[1]);
      console.log("priority-related field names found:", JSON.stringify([...new Set(priorityFields)]));
      // невеликий фрагмент навколо першого входження "пріоритет", якщо є
      const idx = html.search(/пріоритет/i);
      if (idx >= 0) console.log("context:", html.slice(Math.max(0, idx - 150), idx + 150));
    } catch (err) {
      console.log("error:", err.message);
    }
  }
}

main().catch((err) => {
  console.error("diagnose-archived-offer-page впав з помилкою:", err);
  process.exitCode = 1;
});
