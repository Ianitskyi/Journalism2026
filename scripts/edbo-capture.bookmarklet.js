/*
 * Bookmarklet/консольний скрипт для РУЧНОГО імпорту даних ЄДЕБО.
 *
 * Навіщо: реальний пошук на vstup.edbo.gov.ua захищений Cloudflare Turnstile
 * (див. README, розділ "Підключення реальних даних ЄДЕБО") — автоматичний
 * headless-скрипт отримує капчу замість даних. Але коли пошук робить
 * ЖИВА ЛЮДИНА у звичайному браузері (Turnstile проходить як завжди), сторінка
 * з результатами відкрита нормально — і ось цей скрипт лише ЗБЕРІГАЄ те, що
 * вже показано в браузері. Жодного обходу захисту тут немає: дані вже
 * доступні тобі як звичайному користувачу, скрипт просто економить
 * копіювання вручну.
 *
 * ЯК КОРИСТУВАТИСЬ:
 * 1. Зайди на https://vstup.edbo.gov.ua у звичайному браузері, пройди пошук:
 *    відкрий "Конкурсні пропозиції" → обери Спеціальність "Журналістика" (061),
 *    Освітній рівень (бакалавр або магістр), Регіон "усі" → "Пошук".
 * 2. Відкрий DevTools → Console (F12) на сторінці з результатами.
 * 3. Встав увесь вміст цього файлу в консоль і натисни Enter.
 * 4. Браузер завантажить (download) два файли:
 *      edbo-capture-<timestamp>.html  — повний HTML сторінки як є
 *      edbo-capture-<timestamp>.json  — best-effort здогад по "рядках" з
 *                                        числами, що схожі на бал/кількість
 * 5. Якщо це сторінка зі списком конкурсних пропозицій — повтори для кожного
 *    рівня (бакалавр/магістр). Якщо це вже рейтинговий список абітурієнтів
 *    конкретної пропозиції — збережи так само для кожної пропозиції ЗВО.
 * 6. Віддай збережені .html файли (або мені, або
 *    node scripts/import-edbo-manual.mjs) для перетворення в data/*.json.
 *
 * Скрипт нічого нікуди не відправляє — тільки завантажує файли локально.
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

  const ts = new Date().toISOString().replace(/[:.]/g, "-");

  // 1) повний HTML сторінки — найнадійніше джерело, парситься пізніше
  download(`edbo-capture-${ts}.html`, document.documentElement.outerHTML, "text/html");

  // 2) best-effort здогад: шукаємо елементи, чий текст містить число
  // схоже на конкурсний бал (100-200, 1-3 знаки після коми) — типові
  // "листові" елементи (без дітей-блоків), щоб не хапати контейнери
  const scoreLike = /\b(1[0-9]{2}(?:[.,]\d{1,3})?)\b/;
  const candidates = [];
  document.querySelectorAll("body *").forEach((el) => {
    if (el.children.length > 2) return; // пропускаємо контейнери
    const text = (el.textContent || "").trim().replace(/\s+/g, " ");
    if (!text || text.length > 200) return;
    if (scoreLike.test(text)) {
      candidates.push({
        tag: el.tagName.toLowerCase(),
        className: (el.className || "").toString().slice(0, 80),
        text
      });
    }
  });

  download(
    `edbo-capture-${ts}.json`,
    JSON.stringify({ url: location.href, capturedAt: new Date().toISOString(), candidates }, null, 2),
    "application/json"
  );

  console.log(`Збережено edbo-capture-${ts}.html і .json. Кандидатів з числами: ${candidates.length}`);
})();
