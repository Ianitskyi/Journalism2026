/*
 * Консольний скрипт для РУЧНОГО збереження вже відкритої сторінки ЄДЕБО.
 *
 * 1. Людина сама проходить Turnstile і знаходить потрібну пропозицію.
 * 2. На сторінці /offer/<id> відкриває DevTools -> Console.
 * 3. Вставляє цей файл і натискає Enter.
 *
 * Скрипт не робить мережевих запитів. Він завантажує HTML і структурований
 * JSON з уже показаними в браузері даними: готовими
 * rqs_total/rqs_allowed/rqs_kv_avg,
 * конкурсними балами та пріоритетами. JSON можна передати в
 * scripts/import-edbo-manual.mjs через --capture.
 */
(function () {
  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function numberFromRsc(html, field) {
    const normalized = html.replace(/\\"/g, '"');
    const match = normalized.match(new RegExp(`"${field}":"?(-?\\d+(?:\\.\\d+)?)`));
    return match ? Number(match[1]) : null;
  }

  const html = document.documentElement.outerHTML;
  const normalizedRsc = html.replace(/\\"/g, '"');
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const offerId = numberFromRsc(html, "university_specialities_id") ||
    Number(location.pathname.match(/^\/offer\/(\d+)/)?.[1] || 0) || null;
  const universityId = numberFromRsc(html, "university_id");
  const qualificationGroupId = numberFromRsc(html, "qualification_group_id");

  const main = document.querySelector("main");
  const mainText = (main?.innerText || "").replace(/\s+/g, " ");
  const level = qualificationGroupId === 1 || /БАКАЛАВР/i.test(mainText)
    ? "bachelor"
    : qualificationGroupId === 2 || /МАГІСТР/i.test(mainText)
      ? "master"
      : null;

  const rows = [...document.querySelectorAll("table tbody tr")];
  const applicantRows = rows
    .map((row) => [...row.querySelectorAll("td")].map((cell) => cell.innerText.trim()))
    .filter((cells) => cells.length >= 7 && /^\d+$/.test(cells[0] || ""));

  const visibleScores = applicantRows
    .map((cells) => Number((cells[6] || "").replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value >= 100 && value <= 200);
  const visiblePriority1Scores = applicantRows
    .filter((cells) => /^1(?:\s|$)/.test(cells[3] || ""))
    .map((cells) => Number((cells[6] || "").replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value >= 100 && value <= 200);

  // HTML Next.js містить усі заяви, навіть якщо таблиця показує лише одну
  // сторінку. Беремо повний набір із RSC, а DOM лишаємо як fallback.
  const rscScores = [];
  const rscPriority1Scores = [];
  const requestPattern = /"konkurs_value":([0-9.]+),"priority":(\d+|null)/g;
  for (const match of normalizedRsc.matchAll(requestPattern)) {
    const score = Number(match[1]);
    if (!Number.isFinite(score) || score < 100 || score > 200) continue;
    rscScores.push(score);
    if (match[2] === "1") rscPriority1Scores.push(score);
  }
  const scores = rscScores.length ? rscScores : visibleScores;
  const priority1Scores = rscScores.length ? rscPriority1Scores : visiblePriority1Scores;

  const universityName = [...document.querySelectorAll("main div, main span")]
    .map((el) => el.textContent?.trim() || "")
    .find((text) => /університет|академія|інститут/i.test(text) && text.length < 250) || null;

  const capture = {
    schemaVersion: 1,
    url: location.href,
    capturedAt: new Date().toISOString(),
    offer: offerId ? {
      offerId,
      universityId,
      universityName,
      level,
      applications: numberFromRsc(html, "rqs_total") ?? scores.length,
      admitted: numberFromRsc(html, "rqs_allowed") ?? scores.length,
      averageScore: numberFromRsc(html, "rqs_kv_avg") ??
        (scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null),
      scores,
      priority1Scores
    } : null
  };

  download(`edbo-capture-${ts}.html`, html, "text/html");
  download(`edbo-capture-${ts}.json`, JSON.stringify(capture, null, 2), "application/json");

  if (capture.offer) {
    console.log(
      `Збережено пропозицію ${capture.offer.offerId}: ` +
      `${capture.offer.applications} заяв, допущено ${capture.offer.admitted}, ` +
      `середній бал допущених ${capture.offer.averageScore}.`
    );
  } else {
    console.warn("HTML збережено, але це не сторінка /offer/<id>. Відкрий «До списку вступників» і повтори.");
  }
})();
