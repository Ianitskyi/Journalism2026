// Crawls membershipguide.org/handbook and saves clean per-page text content
// to scratch/<OUT_DIR>/ as JSON + combined markdown. Runs only in GitHub
// Actions (real internet) — the Claude Code sandbox has no outbound access.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const START_URL = process.env.MG_START_URL || "https://membershipguide.org/handbook/";
const OUT_DIR = process.env.MG_OUT_DIR || "scratch/membership-guide-raw";
const ORIGIN = "https://membershipguide.org";

mkdirSync(OUT_DIR, { recursive: true });

function normalize(url) {
  try {
    const u = new URL(url, ORIGIN);
    u.hash = "";
    if (u.pathname !== "/" && u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);
    return u.href;
  } catch {
    return null;
  }
}

async function extractPage(page) {
  return page.evaluate(() => {
    function clean(el) {
      if (!el) return null;
      const clone = el.cloneNode(true);
      clone.querySelectorAll("script,style,noscript,nav,header,footer").forEach((n) => n.remove());
      return clone;
    }
    const main =
      document.querySelector("main") ||
      document.querySelector("article") ||
      document.querySelector("#content") ||
      document.body;
    const clone = clean(main);
    const title = document.title || "";
    const h1 = document.querySelector("h1")?.innerText?.trim() || "";

    const blocks = [];
    if (clone) {
      clone.querySelectorAll("h1,h2,h3,h4,p,li,blockquote,figcaption").forEach((node) => {
        const text = node.innerText?.trim();
        if (!text) return;
        blocks.push({ tag: node.tagName.toLowerCase(), text });
      });
    }

    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => a.getAttribute("href"))
      .filter(Boolean);

    return { title, h1, blocks, links };
  });
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();

  const start = normalize(START_URL);
  const toVisit = [start];
  const visited = new Set();
  const results = [];
  const combinedMd = [];

  while (toVisit.length) {
    const url = toVisit.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    let data;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(500);
      data = await extractPage(page);
    } catch (e) {
      console.error("FAILED", url, e.message);
      continue;
    }

    const slug = url.replace(ORIGIN, "").replace(/^\/|\/$/g, "") || "index";
    const fileSafe = slug.replace(/[^a-z0-9\-]+/gi, "_") || "index";
    results.push({ url, slug, title: data.title, h1: data.h1, blocks: data.blocks });
    writeFileSync(
      path.join(OUT_DIR, `${fileSafe}.json`),
      JSON.stringify({ url, title: data.title, h1: data.h1, blocks: data.blocks }, null, 2)
    );

    combinedMd.push(`\n\n===== ${url} =====\nTITLE: ${data.title}\nH1: ${data.h1}\n`);
    for (const b of data.blocks) {
      const prefix = b.tag.startsWith("h") ? "#".repeat(Number(b.tag[1])) + " " : b.tag === "li" ? "- " : "";
      combinedMd.push(prefix + b.text);
    }

    console.log(`Visited (${visited.size}): ${url} — ${data.blocks.length} blocks`);

    for (const href of data.links) {
      const norm = normalize(href);
      if (!norm) continue;
      if (!norm.startsWith(ORIGIN + "/handbook")) continue;
      if (norm.includes("/wp-admin") || norm.includes("/wp-login")) continue;
      if (!visited.has(norm) && !toVisit.includes(norm)) toVisit.push(norm);
    }
  }

  writeFileSync(path.join(OUT_DIR, "_combined.md"), combinedMd.join("\n"));
  writeFileSync(
    path.join(OUT_DIR, "_index.json"),
    JSON.stringify(
      results.map((r) => ({ url: r.url, slug: r.slug, title: r.title, h1: r.h1, blockCount: r.blocks.length })),
      null,
      2
    )
  );

  console.log(`\nDone. ${results.length} pages saved to ${OUT_DIR}/`);
  await browser.close();
})();
