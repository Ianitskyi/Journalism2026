#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/) — чергова перевірка, чи
 * з'явився архівний субдомен vstup2026.edbo.gov.ua (за аналогією з
 * vstup2018.., vstup2019.. і т.д. для попередніх завершених кампаній).
 */

const base = "https://vstup2026.edbo.gov.ua";

async function postForm(path, data) {
  const body = new URLSearchParams(data).toString();
  const resp = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/javascript, */*; q=0.01",
      Referer: `${base}/`
    },
    body,
    signal: AbortSignal.timeout(20000)
  });
  return { status: resp.status, ok: resp.ok, json: resp.ok ? await resp.json().catch(() => null) : null };
}

async function main() {
  console.log(`Перевірка ${base} ...`);
  try {
    const rootResp = await fetch(`${base}/`, { signal: AbortSignal.timeout(20000) });
    console.log(`GET / -> статус ${rootResp.status}`);
  } catch (err) {
    console.log(`GET / -> помилка: ${err.message}`);
  }

  try {
    const result = await postForm("/offers-universities/", {
      qualification: "1", education_base: "40", speciality: "061",
      region: "", education_form: "", course: ""
    });
    console.log(`POST /offers-universities/ -> статус ${result.status}`);
    if (result.json) {
      console.log(`ЗВО знайдено: ${(result.json.universities || []).length}`);
    }
  } catch (err) {
    console.log(`POST /offers-universities/ -> помилка: ${err.message}`);
  }
}

main().catch((err) => {
  console.error("diagnose-2026-archived впав з помилкою:", err);
  process.exitCode = 1;
});
