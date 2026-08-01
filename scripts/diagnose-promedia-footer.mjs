#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — витягує HTML футера
 * головного сайту promedia.report і підключені CSS-файли, щоб перенести
 * той самий футер на journalism2026 (зараз тут спрощений плейсхолдер-
 * футер, а не той, що на promedia.report).
 */

async function fetchText(url) {
  const resp = await fetch(url, {
    headers: { "User-Agent": "Journalism2026 diagnostic" },
    signal: AbortSignal.timeout(20000)
  });
  return { status: resp.status, text: await resp.text() };
}

async function main() {
  const { status, text } = await fetchText("https://promedia.report/");
  console.log("status:", status, "length:", text.length);

  // друкуємо HTML довкола тегу <footer ...> ... </footer>
  const footerStart = text.search(/<footer[\s>]/i);
  if (footerStart === -1) {
    console.log("тег <footer> не знайдено, шукаємо клас footer у розмітці");
    const idx = text.toLowerCase().indexOf("footer");
    console.log(text.slice(Math.max(0, idx - 300), idx + 3000));
  } else {
    const footerEndTagIdx = text.toLowerCase().indexOf("</footer>", footerStart);
    const footerEnd = footerEndTagIdx === -1 ? footerStart + 4000 : footerEndTagIdx + 9;
    console.log("\n=== <footer> HTML ===\n");
    console.log(text.slice(footerStart, footerEnd));
  }

  // підключені CSS файли
  const cssLinks = [...text.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  console.log("\nCSS файли:", JSON.stringify(cssLinks));

  // весь текст навколо "Ініціатива"/"initiative"/copyright/socials
  for (const kw of ["Ініціатива", "ГО", "©", "info@promedia", "instagram", "facebook", "telegram", "linkedin"]) {
    const idx = text.indexOf(kw);
    if (idx >= 0) {
      console.log(`\n--- контекст навколо "${kw}" ---`);
      console.log(text.slice(Math.max(0, idx - 200), idx + 400));
    }
  }
}

main().catch((err) => {
  console.error("diagnose-promedia-footer впав з помилкою:", err);
  process.exitCode = 1;
});
