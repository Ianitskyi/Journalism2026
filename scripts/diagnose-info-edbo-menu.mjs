#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — info.edbo.gov.ua
 * ("Реєстри | ЄДИНА ДЕРЖАВНА ЕЛЕКТРОННА БАЗА з питань ОСВІТИ") виявився
 * доступним (200), на відміну від edbo.gov.ua/vstup*. Дивимось повне
 * меню/навігацію сторінки — чи є там розділи про прийом/вступ/статистику.
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

async function main() {
  const resp = await fetchWithTimeout("https://info.edbo.gov.ua/");
  console.log(`статус: ${resp.status}`);
  const html = await resp.text();
  console.log(`довжина: ${html.length}`);

  // всі href на сторінці
  const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const links = [];
  let m;
  while ((m = linkRe.exec(html))) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    if (!href || href === "#" || href.startsWith("javascript:")) continue;
    links.push({ href, text });
  }
  console.log(`\nВсього посилань: ${links.length}`);
  console.log("Список (href — текст):");
  for (const { href, text } of links) {
    console.log(`  ${href} — "${text}"`);
  }
}

main().catch((err) => {
  console.error("diagnose-info-edbo-menu впав з помилкою:", err);
  process.exitCode = 1;
});
