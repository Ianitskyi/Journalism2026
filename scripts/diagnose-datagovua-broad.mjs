#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — попередній запит
 * ("ЄДЕБО") дав лише застарілий датасет МОН (2012-2021). Тут шукаємо
 * ширше: інші ключові слова, пов'язані зі вступною кампанією 2025/2026,
 * та перелічуємо ВСІ датасети організацій МОН/ЄДЕБО з датою останнього
 * оновлення — щоб знайти щось, що реально оновлювалось у 2025-2026.
 */

const TIMEOUT_MS = 20_000;

const QUERIES = [
  "вступна кампанія",
  "прийом до закладів вищої освіти 2025",
  "рейтингові списки вступників",
  "заяви вступників",
  "конкурсна пропозиція",
  "державне замовлення",
  "рекомендовані до зарахування"
];

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function searchOrganizations(term) {
  const url = `https://data.gov.ua/api/3/action/organization_list?q=${encodeURIComponent(term)}&all_fields=true&limit=20`;
  const resp = await fetchWithTimeout(url);
  if (!resp.ok) return [];
  const json = await resp.json();
  return json.result || [];
}

async function listOrgPackages(orgName) {
  const url = `https://data.gov.ua/api/3/action/organization_show?id=${encodeURIComponent(orgName)}&include_datasets=true`;
  const resp = await fetchWithTimeout(url);
  if (!resp.ok) return null;
  const json = await resp.json();
  return json.result;
}

async function main() {
  console.log("=== Пошук за додатковими ключовими словами ===");
  for (const q of QUERIES) {
    const url = `https://data.gov.ua/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=15`;
    const resp = await fetchWithTimeout(url);
    const json = resp.ok ? await resp.json() : null;
    const count = json?.result?.count ?? "?";
    console.log(`\n"${q}": status ${resp.status}, count ${count}`);
    for (const pkg of json?.result?.results || []) {
      console.log(`  - [${pkg.id}] ${pkg.title} (org: ${pkg.organization?.title}, modified: ${pkg.metadata_modified}, resources: ${(pkg.resources || []).map((r) => r.format).join(",")})`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n\n=== Пошук організацій МОН/ЄДЕБО ===");
  const orgTerms = ["освіти", "ЄДЕБО", "єдебо"];
  const orgsFound = new Map();
  for (const term of orgTerms) {
    const orgs = await searchOrganizations(term);
    for (const org of orgs) orgsFound.set(org.name, org);
  }
  console.log(`Знайдено організацій: ${orgsFound.size}`);
  for (const org of orgsFound.values()) {
    console.log(`  - ${org.name} (${org.title}), package_count=${org.package_count}`);
  }

  console.log("\n\n=== Усі датасети знайдених організацій, з датою оновлення ===");
  for (const org of orgsFound.values()) {
    const detail = await listOrgPackages(org.name);
    if (!detail) continue;
    console.log(`\n--- ${org.title} (${org.name}) ---`);
    const packages = (detail.packages || []).slice();
    packages.sort((a, b) => new Date(b.metadata_modified) - new Date(a.metadata_modified));
    for (const pkg of packages) {
      console.log(`  [${pkg.metadata_modified}] ${pkg.title} (id=${pkg.id}, resources=${(pkg.resources || []).map((r) => r.format).join(",")})`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

main().catch((err) => {
  console.error("diagnose-datagovua-broad впав з помилкою:", err);
  process.exitCode = 1;
});
