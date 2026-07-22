#!/usr/bin/env node
/*
 * Перевірка, чи МОН/ЄДЕБО публікують рейтингові списки вступників як
 * відкритий датасет на data.gov.ua — щоб не залежати від Cloudflare-захисту
 * vstup.edbo.gov.ua (див. README). data.gov.ua зазвичай побудований на CKAN,
 * який має відкритий пошуковий API (/api/3/action/package_search).
 *
 * Використовує нативний fetch з AbortSignal.timeout — попередня версія на
 * Playwright context.request зависла на кілька хвилин без спрацювання
 * власного timeout (ймовірно проблема мережі/DNS на рівні раннера), тож тут
 * жорсткий контроль через AbortController, який точно перериває запит.
 */

import { writeFile, mkdir } from "node:fs/promises";

const OUT_DIR = new URL("../diagnostics-datagovua/", import.meta.url).pathname;
const QUERIES = ["ЄДЕБО", "вступ рейтинг", "конкурсний бал"];
const TIMEOUT_MS = 12_000;

function log(line) {
  console.log(line);
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`hard timeout ${ms}ms`)), ms);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    const text = await resp.text();
    return { status: resp.status, ok: resp.ok, text };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  log("=== Пробую CKAN package_search API напряму (fetch + AbortSignal) ===");
  const apiResults = {};

  for (const q of QUERIES) {
    const apiUrl = `https://data.gov.ua/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=15`;
    log(`\n--- Запит "${q}" → ${apiUrl} ---`);
    try {
      const { status, ok, text } = await fetchWithTimeout(apiUrl, TIMEOUT_MS);
      let body = null;
      try {
        body = JSON.parse(text);
      } catch {
        body = text.slice(0, 500);
      }
      apiResults[q] = { status, ok, body };
      log(`status ${status}`);
      if (ok && body?.result) {
        log(`count: ${body.result.count}`);
        for (const pkg of (body.result.results || []).slice(0, 10)) {
          log(`- [${pkg.name}] "${pkg.title}" — org: ${pkg.organization?.title || "?"} — resources: ${(pkg.resources || []).map((r) => r.format).join(",")}`);
        }
      } else {
        log(typeof body === "string" ? body : JSON.stringify(body).slice(0, 500));
      }
    } catch (err) {
      apiResults[q] = { error: err.message };
      log(`Помилка/таймаут запиту "${q}": ${err.message}`);
    }
  }

  await writeFile(`${OUT_DIR}api-results.json`, JSON.stringify(apiResults, null, 2), "utf8");

  // Базова перевірка досяжності самого хоста (для діагностики, чи це
  // проблема мережі раннера, чи специфічно CKAN API)
  log("\n=== Перевірка досяжності https://data.gov.ua/ (простий GET) ===");
  try {
    const { status } = await fetchWithTimeout("https://data.gov.ua/", TIMEOUT_MS);
    log(`status ${status}`);
  } catch (err) {
    log(`Помилка/таймаут: ${err.message}`);
  }

  const summary = [
    `## Розвідка data.gov.ua`,
    ``,
    ...QUERIES.map((q) => {
      const r = apiResults[q];
      return `- "${q}": ${r?.error ? `помилка: ${r.error}` : `status ${r.status}, count ${r.body?.result?.count ?? "?"}`}`;
    })
  ].join("\n");

  log("\n" + summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
  }
}

main().catch((err) => {
  console.error("Розвідка data.gov.ua впала з помилкою:", err);
  process.exitCode = 1;
});
