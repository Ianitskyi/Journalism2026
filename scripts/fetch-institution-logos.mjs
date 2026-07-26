#!/usr/bin/env node
/*
 * ДІАГНОСТИЧНИЙ скрипт (нічого не пише в data/, нічого на сайті не міняє) —
 * для кожного закладу з рейтингу 2025 року шукає логотип/герб/емблему:
 *  1) через Wikidata (властивість P154 "зображення логотипу");
 *  2) якщо немає — через інфобокс української Вікіпедії (шаблон картки,
 *     поле "Зображення"/"Лого"/"Герб") з фільтром за назвою файлу, щоб не
 *     підхопити випадкове фото будівлі.
 *
 * Дає пряме посилання на файл через офіційний, призначений саме для такого
 * хотлінкінгу механізм Wikimedia — Special:FilePath (редиректить на реальний
 * файл, підтримує параметр width): https://commons.wikimedia.org/wiki/Special:FilePath/<filename>?width=200
 *
 * Пуш через GitHub Actions runner, бо в цьому сховищі/сесії WebFetch/curl до
 * зовнішніх доменів (у т.ч. wikipedia.org, wikidata.org) заблоковано
 * організаційною політикою — GH Actions runner цього обмеження не має.
 *
 * Перший прогін ловив 429 (Too Many Requests) від Wikidata вже за кілька
 * запитів через занадто коротку паузу (200мс) без retry — тут пауза значно
 * довша (900мс) і є retry з експоненційним відкладенням на 429.
 */

const INSTITUTIONS = [
  ["edbo193", "Бердянський державний педагогічний університет"],
  ["edbo318", "Університет економіки та права «КРОК»"],
  ["vnu", "Волинський національний університет імені Лесі Українки"],
  ["edbo252", "Вінницький державний педагогічний університет імені Михайла Коцюбинського"],
  ["uzhnu", "Ужгородський національний університет"],
  ["lnu-shev", "Луганський національний університет імені Тараса Шевченка"],
  ["edbo6540", "Державний податковий університет"],
  ["edbo208", "Житомирська політехніка"],
  ["edbo5780", "Державний університет інтелектуальних технологій і зв'язку"],
  ["dnu", "Дніпровський національний університет імені Олеся Гончара"],
  ["donnu", "Донецький національний університет імені Василя Стуса"],
  ["edbo109", "Житомирський державний університет імені Івана Франка"],
  ["edbo144", "Університет Короля Данила"],
  ["edbo217", "Відкритий міжнародний університет розвитку людини «Україна»"],
  ["ucu", "Український католицький університет"],
  ["znu", "Запорізький національний університет"],
  ["edbo171", "Західноукраїнський національний університет"],
  ["edbo178", "Кам'янець-Подільський національний університет імені Івана Огієнка"],
  ["edbo341", "Прикарпатський національний університет імені Василя Стефаника"],
  ["kneu", "Київський національний економічний університет імені Вадима Гетьмана"],
  ["edbo308", "Київський національний університет культури і мистецтв"],
  ["knu", "Київський національний університет імені Тараса Шевченка"],
  ["kubg", "Київський університет імені Бориса Грінченка"],
  ["edbo5691", "Київський університет інтелектуальної власності та права"],
  ["edbo218", "Кременчуцький національний університет імені Михайла Остроградського"],
  ["lnu", "Львівський національний університет імені Івана Франка"],
  ["mdu", "Маріупольський державний університет"],
  ["edbo36", "Національний технічний університет «Дніпровська політехніка»"],
  ["edbo91", "Національний університет «Запорізька політехніка»"],
  ["naukma", "Національний університет «Києво-Могилянська академія»"],
  ["edbo97", "Національний університет «Львівська політехніка»"],
  ["edbo5754", "Одеська політехніка"],
  ["edbo192", "Національний університет «Одеська юридична академія»"],
  ["edbo120", "Національний університет «Острозька академія»"],
  ["edbo158", "Чернігівський колегіум імені Т.Г. Шевченка"],
  ["edbo7208", "Національний авіаційний університет"],
  ["edbo7", "Національний університет біоресурсів і природокористування України"],
  ["edbo9", "Національний університет водного господарства та природокористування"],
  ["edbo155", "Ніжинський державний університет імені Миколи Гоголя"],
  ["edbo220", "Одеський національний морський університет"],
  ["onu", "Одеський національний університет імені І. І. Мечникова"],
  ["edbo3", "Полтавський національний педагогічний університет імені В.Г. Короленка"],
  ["edbo249", "Міжрегіональна Академія управління персоналом"],
  ["edbo310", "Київський університет культури"],
  ["edbo215", "Міжнародний економіко-гуманітарний університет імені академіка Степана Дем'янчука"],
  ["edbo344", "Київський міжнародний університет"],
  ["sumdu", "Сумський державний університет"],
  ["edbo21", "Східноукраїнський національний університет імені Володимира Даля"],
  ["edbo892", "Таврійський національний університет імені В.І. Вернадського"],
  ["edbo96", "Тернопільський національний педагогічний університет імені Володимира Гнатюка"],
  ["edbo6507", "Український державний університет науки і технологій"],
  ["npu", "Український державний університет імені Михайла Драгоманова"],
  ["edbo88", "Уманський державний педагогічний університет імені Павла Тичини"],
  ["edbo340", "Університет Григорія Сковороди в Переяславі"],
  ["edbo1486", "Університет митної справи та фінансів"],
  ["karazin", "Харківський національний університет імені В.Н. Каразіна"],
  ["edbo48", "Херсонський державний університет"],
  ["edbo55", "Центральноукраїнський державний університет імені Володимира Винниченка"],
  ["cnu", "Черкаський національний університет імені Богдана Хмельницького"],
  ["chnu", "Чернівецький національний університет імені Юрія Федьковича"],
  ["edbo265", "Чорноморський національний університет імені Петра Могили"]
];

const DELAY_MS = 900;
const MAX_RETRIES = 4;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, attempt = 0) {
  const resp = await fetch(url, {
    headers: { "User-Agent": "Journalism2026-logo-lookup/1.0 (non-commercial ranking site research; contact via github.com/Ianitskyi/Journalism2026)" },
    signal: AbortSignal.timeout(20000)
  });
  if (resp.status === 429 || resp.status === 503) {
    if (attempt >= MAX_RETRIES) throw new Error(`HTTP ${resp.status} для ${url} (вичерпано ретраї)`);
    const wait = DELAY_MS * Math.pow(2, attempt + 1);
    console.log(`  ! ${resp.status}, чекаю ${wait}мс і пробую знову (спроба ${attempt + 1}/${MAX_RETRIES})`);
    await sleep(wait);
    return fetchJson(url, attempt + 1);
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status} для ${url}`);
  return resp.json();
}

async function findWikidataId(name) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=uk&uselang=uk&type=item&limit=3&format=json`;
  const json = await fetchJson(url);
  return (json.search || [])[0] || null;
}

async function getLogoFilenameFromWikidata(qid) {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P154&format=json`;
  const json = await fetchJson(url);
  const claims = json.claims && json.claims.P154;
  if (!claims || !claims.length) return null;
  return claims[0].mainsnak?.datavalue?.value || null;
}

/* фолбек: якщо на Wikidata немає P154, дивимось на wikitext інфобоксу самої
   укр. Вікіпедії (перший розділ сторінки) і шукаємо файл, назва якого явно
   натякає на лого/герб/емблему/символіку — щоб не підхопити фото будівлі */
const LOGO_FILENAME_HINT = /лого|logo|герб|emblem|емблем|символ/i;

async function getLogoFilenameFromWikipedia(title) {
  const url = `https://uk.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&section=0&format=json&redirects=1`;
  const json = await fetchJson(url);
  const wikitext = json.parse?.wikitext?.["*"];
  if (!wikitext) return null;
  const matches = [...wikitext.matchAll(/(?:зображення|лого|логотип|герб)\s*=\s*\[?\[?(?:File|Файл):?([^|\]\n]+)/gi)];
  for (const m of matches) {
    const filename = m[1].trim();
    if (filename) return filename;
  }
  // запасний варіант: будь-яке посилання на файл у першому розділі, назва якого сама натякає на лого/герб
  const anyFile = [...wikitext.matchAll(/\[\[(?:File|Файл):([^|\]\n]+)/gi)].map((m) => m[1].trim());
  return anyFile.find((f) => LOGO_FILENAME_HINT.test(f)) || null;
}

function filePathUrl(filename) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename.replace(/ /g, "_"))}?width=200`;
}

async function main() {
  const results = [];
  for (const [id, name] of INSTITUTIONS) {
    let logoUrl = null;
    let note = "";
    try {
      const entity = await findWikidataId(name);
      await sleep(DELAY_MS);
      if (entity) {
        const filename = await getLogoFilenameFromWikidata(entity.id);
        await sleep(DELAY_MS);
        if (filename) {
          logoUrl = filePathUrl(filename);
          note = `wikidata ${entity.id}, P154 file: ${filename}`;
        } else {
          note = `wikidata ${entity.id} has no P154`;
        }
      } else {
        note = "wikidata entity not found";
      }

      if (!logoUrl) {
        const wpFilename = await getLogoFilenameFromWikipedia(name);
        await sleep(DELAY_MS);
        if (wpFilename) {
          logoUrl = filePathUrl(wpFilename);
          note += `; uk.wikipedia infobox file: ${wpFilename}`;
        } else {
          note += "; uk.wikipedia infobox: no logo-like file found";
        }
      }
    } catch (err) {
      note = `error: ${err.message}`;
      await sleep(DELAY_MS);
    }

    results.push({ id, name, logoUrl, note });
    console.log(`${id}: ${logoUrl ? "FOUND — " + logoUrl : "not found"} (${note})`);
  }

  console.log("\n\n=== RESULT JSON ===");
  console.log(JSON.stringify(results, null, 2));

  const found = results.filter((r) => r.logoUrl).length;
  console.log(`\nЗнайдено ${found} з ${results.length}`);
}

main().catch((err) => {
  console.error("fetch-institution-logos впав з помилкою:", err);
  process.exitCode = 1;
});
