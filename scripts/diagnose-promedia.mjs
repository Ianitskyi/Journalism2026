#!/usr/bin/env node
/*
 * Діагностика реального дизайну promedia.report — запускається в GitHub
 * Actions (повний доступ в інтернет), бо агентська сесія, в якій верстався
 * ребрендинг journalism2026, не мала мережевого доступу й фарбувала
 * "наосліп". Друкує в stdout (не тільки в артефакт), щоб результат був
 * видний прямо в логах джоба:
 *  - усі hex/rgb кольори, знайдені в підключених стилях (з частотою) —
 *    щоб звірити наш --ink/--accent з реальною палітрою;
 *  - font-family, які реально використовуються;
 *  - чи є хедер/навігація зверху сторінки, і що в ній;
 *  - лого: src/alt усіх <img>, що схожі на лого.
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";

const START_URL = "https://promedia.report";
const OUT_DIR = new URL("../diagnostics-promedia/", import.meta.url).pathname;

function log(line) {
  console.log(line);
}

function extractColors(css) {
  const counts = new Map();
  const re = /#(?:[0-9a-fA-F]{3}){1,2}\b|rgba?\([^)]+\)/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const v = m[0].toLowerCase();
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return counts;
}

function extractFontFamilies(css) {
  const counts = new Map();
  const re = /font-family\s*:\s*([^;{}]+)[;}]/gi;
  let m;
  while ((m = re.exec(css)) !== null) {
    const v = m[1].trim();
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return counts;
}

function topEntries(map, n) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  log(`Відкриваю ${START_URL} …`);
  try {
    await page.goto(START_URL, { waitUntil: "load", timeout: 45_000 });
  } catch (err) {
    log(`Навігація завершилась з помилкою (продовжуємо): ${err.message}`);
  }
  await page.waitForTimeout(3000);

  await page.screenshot({ path: OUT_DIR + "screenshot-full.png", fullPage: true }).catch(() => {});
  await page.screenshot({ path: OUT_DIR + "screenshot-viewport.png" }).catch(() => {});

  const title = await page.title().catch(() => "");
  log(`\n=== TITLE ===\n${title}`);

  // ---------- зовнішні й інлайн стилі: збираємо кольори і шрифти ----------
  const styleHrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.href)
  );
  log(`\n=== <link rel="stylesheet"> (${styleHrefs.length}) ===`);
  log(JSON.stringify(styleHrefs, null, 2));

  let allCss = await page.evaluate(() =>
    Array.from(document.querySelectorAll("style")).map((s) => s.textContent).join("\n")
  );

  for (const href of styleHrefs.slice(0, 10)) {
    try {
      const resp = await context.request.get(href, { timeout: 15_000 });
      allCss += "\n" + (await resp.text());
    } catch (err) {
      log(`Не вдалось завантажити ${href}: ${err.message}`);
    }
  }

  await writeFile(OUT_DIR + "combined.css", allCss, "utf8");

  const colors = extractColors(allCss);
  const fonts = extractFontFamilies(allCss);

  log(`\n=== ТОП-30 КОЛЬОРІВ у CSS (значення × частота) ===`);
  log(JSON.stringify(topEntries(colors, 30), null, 2));

  log(`\n=== ТОП-15 font-family У CSS ===`);
  log(JSON.stringify(topEntries(fonts, 15), null, 2));

  // ---------- обчислені стилі ключових елементів ----------
  const computed = await page.evaluate(() => {
    function cs(el) {
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        className: el.className?.toString().slice(0, 120),
        backgroundColor: s.backgroundColor,
        color: s.color,
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontSize: s.fontSize
      };
    }
    const header = document.querySelector("header") || document.querySelector("nav") || document.querySelector("[class*=header]");
    const h1 = document.querySelector("h1");
    const bodyEl = document.body;
    const firstButtonOrLink = document.querySelector("a, button");
    return {
      body: cs(bodyEl),
      header: cs(header),
      h1: cs(h1),
      firstButtonOrLink: cs(firstButtonOrLink)
    };
  }).catch((err) => ({ error: err.message }));

  log(`\n=== ОБЧИСЛЕНІ СТИЛІ (body/header/h1/перший лінк-кнопка) ===`);
  log(JSON.stringify(computed, null, 2));

  // ---------- лого/навігація ----------
  const images = await page.evaluate(() =>
    Array.from(document.querySelectorAll("img")).map((img) => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight
    }))
  ).catch(() => []);
  log(`\n=== ВСІ <img> (${images.length}) ===`);
  log(JSON.stringify(images.slice(0, 30), null, 2));

  const navText = await page.evaluate(() => {
    const nav = document.querySelector("header") || document.querySelector("nav");
    return nav ? nav.innerText.replace(/\s+/g, " ").slice(0, 500) : null;
  }).catch(() => null);
  log(`\n=== ТЕКСТ HEADER/NAV ===\n${navText}`);

  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 1500)).catch(() => "");
  log(`\n=== ПЕРШІ 1500 СИМВОЛІВ ТЕКСТУ СТОРІНКИ ===\n${bodyText}`);

  const html = await page.content().catch(() => "");
  await writeFile(OUT_DIR + "page.html", html, "utf8");

  await browser.close();

  const summary = [
    `## Діагностика promedia.report`,
    ``,
    `- Title: ${title}`,
    `- Топ кольори: ${topEntries(colors, 8).map(([c, n]) => `${c} (${n})`).join(", ")}`,
    `- Топ шрифти: ${topEntries(fonts, 5).map(([f, n]) => `${f} (${n})`).join(", ")}`
  ].join("\n");

  log("\n" + summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
  }
}

main().catch((err) => {
  console.error("Діагностика promedia.report впала з помилкою:", err);
  process.exitCode = 1;
});
