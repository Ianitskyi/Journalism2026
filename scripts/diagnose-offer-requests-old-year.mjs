#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/, нічого на сайті не міняє) —
 * остання перевірка перед побудовою повного конвеєра: чи працює
 * /offer-requests/ так само на СТАРОМУ архівному році (2021, спеціальність
 * "061"), а не лише на 2025 (де вже перевірено). Спершу дістаємо реальний
 * usid якоїсь журналістської пропозиції 2021 року через звичний
 * offers-universities + offers-list, тоді пробуємо /offer-requests/.
 */

const YEAR = 2021;
const BASE = `https://vstup${YEAR}.edbo.gov.ua`;

async function postForm(path, data) {
  const body = new URLSearchParams(data).toString();
  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/javascript, */*; q=0.01",
      Referer: `${BASE}/`
    },
    body,
    signal: AbortSignal.timeout(20000)
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} для ${path}`);
  return resp.json();
}

async function main() {
  const uniResp = await postForm("/offers-universities/", {
    qualification: "1", education_base: "40", speciality: "061", region: "", education_form: "", course: ""
  });
  const uni = (uniResp.universities || []).find((u) => u.uid === 41) || (uniResp.universities || [])[0];
  console.log("заклад:", uni?.un, "ids:", uni?.ids);
  const ids = (uni.ids || "").split(",").filter(Boolean);
  const offersResp = await postForm("/offers-list/", { ids: ids.join(",") });
  const offer = (offersResp.offers || []).find((o) => /журналіст/i.test(o.spn || "")) || (offersResp.offers || [])[0];
  console.log("обрана пропозиція:", JSON.stringify({ usid: offer.usid, spn: offer.spn, t: offer.st?.c?.t, a: offer.st?.c?.a }));

  console.log("\n--- пробуємо /offer-requests/ для 2021 ---");
  const resp = await fetch(`${BASE}/offer-requests/`, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: `${BASE}/offer/${offer.usid}`
    },
    body: new URLSearchParams({ id: String(offer.usid), last: "0" }).toString(),
    signal: AbortSignal.timeout(20000)
  });
  const text = await resp.text();
  console.log("status:", resp.status, "content-type:", resp.headers.get("content-type"), "length:", text.length);
  console.log("тіло (перші 1000 символів):", text.slice(0, 1000));
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json.requests) && json.requests.length) {
      console.log("\nключі першого запису:", JSON.stringify(Object.keys(json.requests[0])));
      console.log("перший запис:", JSON.stringify(json.requests[0]));
    } else {
      console.log("json.requests порожній або відсутній:", JSON.stringify(Object.keys(json)));
    }
  } catch (err) {
    console.log("не вдалось розпарсити як JSON:", err.message);
  }
}

main().catch((err) => {
  console.error("diagnose-offer-requests-old-year впав з помилкою:", err);
  process.exitCode = 1;
});
