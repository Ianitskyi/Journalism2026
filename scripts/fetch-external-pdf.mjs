// Розвідувальний/службовий скрипт: iwpr.net стоїть за Cloudflare managed
// challenge, тому звичайний curl отримує сторінку-заглушку "Just a
// moment...". Playwright-браузер виконує JS і зазвичай проходить managed
// challenge автоматично (без інтерактивної Turnstile-капчі); після цього
// той самий контекст (з cf_clearance cookie) вже може скачати сам PDF.
//
// Використання: node scripts/fetch-external-pdf.mjs <pageUrl> <outDir>
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , pageUrl, outDir] = process.argv;
if (!pageUrl || !outDir) {
  console.error("Usage: node scripts/fetch-external-pdf.mjs <pageUrl> <outDir>");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  viewport: { width: 1366, height: 900 },
});
const page = await context.newPage();

console.log(`Opening ${pageUrl}`);
await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

// Дати Cloudflare managed challenge час пройти й перенаправити.
let title = await page.title();
let waited = 0;
while (/just a moment/i.test(title) && waited < 30000) {
  await page.waitForTimeout(2000);
  waited += 2000;
  title = await page.title();
}
console.log(`Final title after ${waited}ms: ${title}`);

await page.waitForTimeout(1500);
const html = await page.content();
await writeFile(path.join(outDir, "page-rendered.html"), html);

const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.href));
const pdfLinks = [...new Set(hrefs.filter((h) => /\.pdf(\?|$)/i.test(h)))];
await writeFile(path.join(outDir, "pdf-links.json"), JSON.stringify(pdfLinks, null, 2));
console.log(`Found ${pdfLinks.length} pdf link(s):`, pdfLinks);

if (pdfLinks.length > 0) {
  const pdfUrl = pdfLinks[0];
  console.log(`Downloading ${pdfUrl} via same browser context`);
  const resp = await context.request.get(pdfUrl);
  console.log(`Status: ${resp.status()}`);
  if (resp.ok()) {
    const buf = await resp.body();
    await writeFile(path.join(outDir, "source.pdf"), buf);
    console.log(`Saved ${buf.length} bytes to source.pdf`);
  } else {
    console.log("Download failed, not saving.");
  }
} else {
  console.log("No PDF link found on rendered page.");
}

await browser.close();
