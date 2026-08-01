#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — продовження
 * diagnose-promedia-footer.mjs: минулого разу regex для <link rel=...>
 * не знайшов жодного CSS-файлу (ймовірно інший порядок атрибутів або
 * бандл). Тут шукаємо ширше — будь-які .css посилання в HTML — і тягнемо
 * знайдені файли, друкуючи правила для футер-класів
 * (footer, footer-cols, footer-col, footer-logo, footer-contacts,
 * footerPrimaryNav, organization-details, detail-row, copyright,
 * powerdby, footerSecondNav).
 */

async function fetchText(url) {
  const resp = await fetch(url, {
    headers: { "User-Agent": "Journalism2026 diagnostic" },
    signal: AbortSignal.timeout(20000)
  });
  return { status: resp.status, text: await resp.text() };
}

function extractRulesFor(css, selectors) {
  const out = [];
  for (const sel of selectors) {
    // шукаємо будь-яке CSS-правило, чий селектор містить цю підрядок-назву класу
    const re = new RegExp(`[^{}]*\\.${sel}[^{}]*\\{[^}]*\\}`, "g");
    const matches = css.match(re) || [];
    out.push(...matches);
  }
  return out;
}

async function main() {
  const { text: html } = await fetchText("https://promedia.report/");

  const allCssRefs = [...html.matchAll(/href=["']([^"']+\.css[^"']*)["']/gi)].map((m) => m[1]);
  console.log("усі .css посилання:", JSON.stringify(allCssRefs));

  const selectors = [
    "footer-cols", "footer-col\\b", "footer-logo", "footer-contacts",
    "footerPrimaryNav", "footerSecondNav", "organization-details",
    "detail-row", "detail-label", "detail-value", "copyright", "powerdby",
    "center-line"
  ];

  for (const ref of allCssRefs) {
    const url = ref.startsWith("http") ? ref : new URL(ref, "https://promedia.report/").href;
    console.log(`\n=== ${url} ===`);
    try {
      const { status, text: css } = await fetchText(url);
      console.log("status:", status, "length:", css.length);
      const rules = extractRulesFor(css, selectors);
      console.log(`знайдено ${rules.length} правил для футер-класів:`);
      for (const r of rules) console.log("  " + r.replace(/\s+/g, " ").trim());
    } catch (err) {
      console.log("помилка:", err.message);
    }
  }

  // якщо взагалі нічого не знайдено — друкуємо будь-які inline <style> блоки
  if (!allCssRefs.length) {
    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
    console.log(`\nінлайн <style> блоків: ${styleBlocks.length}`);
    for (const block of styleBlocks) {
      const rules = extractRulesFor(block, selectors);
      if (rules.length) {
        console.log("знайдені правила у inline style:");
        for (const r of rules) console.log("  " + r.replace(/\s+/g, " ").trim());
      }
    }
  }
}

main().catch((err) => {
  console.error("diagnose-promedia-footer-css впав з помилкою:", err);
  process.exitCode = 1;
});
