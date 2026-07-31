// Розвідувальний/службовий скрипт: сесія Claude Code не має мережевого
// доступу до довільних зовнішніх сайтів, а GitHub Actions runner — має.
// Скролить сторінку-референс і робить viewport-скриншоти на кожному кроці
// (fullPage-стітчинг ламає position:fixed/sticky елементи), щоб побачити
// липку ліву колонку змісту, якщо вона є. Також зберігає HTML.
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
  viewport: { width: 1920, height: 1080 },
});
const page = await context.newPage();

console.log(`Opening ${pageUrl}`);
await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);

const html = await page.content();
await writeFile(path.join(outDir, "page-rendered.html"), html);

const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
console.log(`scrollHeight=${scrollHeight}`);
await writeFile(path.join(outDir, "scroll-height.txt"), String(scrollHeight));

const samples = 20;
for (let i = 0; i <= samples; i++) {
  const y = Math.round((scrollHeight * i) / samples);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(400);
  const name = `scroll-${String(i).padStart(3, "0")}-y${y}.png`;
  await page.screenshot({ path: path.join(outDir, name) });
}

await browser.close();
console.log("Done.");
