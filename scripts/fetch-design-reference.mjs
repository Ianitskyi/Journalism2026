// Розвідувальний/службовий скрипт: сесія Claude Code не має мережевого
// доступу до довільних зовнішніх сайтів, а GitHub Actions runner — має.
// Робить десктопний і мобільний скриншоти сторінки-референсу та зберігає
// відрендерений HTML і CSS, щоб проаналізувати макет (напр. ліва колонка
// змісту на десктопі).
//
// Використання: node scripts/fetch-design-reference.mjs <pageUrl> <outDir>
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , pageUrl, outDir] = process.argv;
if (!pageUrl || !outDir) {
  console.error("Usage: node scripts/fetch-design-reference.mjs <pageUrl> <outDir>");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
});

// Desktop pass
{
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  console.log(`Opening (desktop) ${pageUrl}`);
  await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, "desktop-viewport.png") });
  await page.screenshot({ path: path.join(outDir, "desktop-full.png"), fullPage: true });
  const html = await page.content();
  await writeFile(path.join(outDir, "page-rendered.html"), html);

  // Grab layout metrics for a plausible sidebar/content split
  const layout = await page.evaluate(() => {
    function describe(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id,
        class: el.className,
        rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        display: cs.display,
        position: cs.position,
        fontFamily: cs.fontFamily,
      };
    }
    const candidates = Array.from(document.querySelectorAll("nav, aside, [class*='toc' i], [class*='sidebar' i], [id*='toc' i]"));
    return candidates.slice(0, 20).map(describe);
  });
  await writeFile(path.join(outDir, "layout-candidates.json"), JSON.stringify(layout, null, 2));

  // Collect linked stylesheet contents
  const cssHrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.href)
  );
  await writeFile(path.join(outDir, "css-links.json"), JSON.stringify(cssHrefs, null, 2));
  let combinedCss = "";
  for (const href of cssHrefs) {
    try {
      const res = await context.request.get(href);
      combinedCss += `\n/* ===== ${href} ===== */\n` + (await res.text());
    } catch (e) {
      combinedCss += `\n/* failed to fetch ${href}: ${e} */\n`;
    }
  }
  await writeFile(path.join(outDir, "combined.css"), combinedCss);

  await page.close();
}

// Mobile pass
{
  const page = await context.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  console.log(`Opening (mobile) ${pageUrl}`);
  await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, "mobile-viewport.png") });
  await page.screenshot({ path: path.join(outDir, "mobile-full.png"), fullPage: true });
  await page.close();
}

await browser.close();
console.log("Done.");
