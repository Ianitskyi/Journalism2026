/* =========================================================
   Легкий i18n-шар: перемикач UA/EN без перезавантаження сторінки.
   Статичний текст перекладається через data-i18n(-html|-content)
   атрибути в HTML; динамічний (JS-рендерений) текст — через t()
   виклики прямо в app.js / university.js.
   ========================================================= */

const I18N = {
  uk: {
    nav: {
      promedia: "← ПроМедіа",
      backToRating: "← До рейтингу"
    },
    meta: {
      indexTitle: "Рейтинг журфаків України. Вступ на «Журналістику»",
      indexDesc: "Рейтинг журфаків України за кількістю поданих заяв і середнім конкурсним балом вступників на спеціальність «Журналістика». Дані ЄДЕБО.",
      uniTitleSuffix: "Журфак.Рейтинг",
      uniDefaultTitle: "Динаміка журфаку — Рейтинг журфаків України",
      uniDesc: "Динаміка популярності журфаку або програми журналістики: середній конкурсний бал і кількість заяв по роках."
    },
    hero: {
      eyebrow: "Спеціальність C7 «Журналістика», програми з журналістики",
      title: "Рейтинг журфаків України",
      lede: "Рейтинг університетів за кількістю поданих заяв на програми з журналістики і середнім конкурсним балом вступників."
    },
    stats: {
      submitted: "Подано заяв",
      count: "Журфаків у рейтингу"
    },
    degree: {
      bachelor: "Бакалавр",
      master: "Магістр",
      bachelorLabel: "бакалаврат · денна форма",
      masterLabel: "магістратура · денна форма"
    },
    sort: {
      label: "Сортувати за",
      score: "Середнім балом",
      applications: "Заявами на програму"
    },
    search: {
      placeholder: "Знайти заклад освіти…"
    },
    year: {
      label: "Рік вступу",
      today: "Сьогодні"
    },
    caption: {
      final: "Підсумкові дані вступної кампанії {year} року. Заяви на програми з журналістики незалежно від пріоритету; заклади освіти щонайменше з {minApps} поданими заявами.",
      live: "Станом на {date}. Заяви на програми з журналістики незалежно від пріоритету; заклади освіти щонайменше з {minApps} поданими заявами."
    },
    table: {
      institution: "Заклад",
      score: "Середній бал",
      applications: "Заяв на програму",
      fullRanking: "Повний рейтинг",
      year: "Рік",
      rank: "Ранг"
    },
    systemChart: {
      appsTitle: "Динаміка заяв на одну програму з журналістики ({from}–{to})",
      scopeNote: "Дані в цілому по системі (усі заклади в рейтингу)"
    },
    methodology: {
      kicker: "Про рейтинг",
      title: "Методологія",
      bodyHtml: "<article><h3>Що ми вимірюємо</h3><p>Для кожного закладу освіти окремо агрегуємо освітні програми зі словом «журналістика» (у будь-якій формі — «Журналістика», «Економічна журналістика», «Журналістика та медіакомунікації» тощо) серед конкурсних пропозицій спеціальності «Журналістика»: код 061 у 2021–2024 роках і відповідний код C7 з 2025 року. Бакалаврат і магістратуру не змішуємо.</p><p>Показуємо два показники: середню кількість поданих заяв на одну таку програму; середній конкурсний бал вступників.</p></article><article><h3>Як рахуємо рейтинг</h3><p>Заклад освіти нерідко подає під спеціальністю «Журналістика» кілька освітніх програм — не лише саму «Журналістику», а й, наприклад, «Зв’язки з громадськістю» чи «Медіакомунікації». У рейтингу враховуємо лише ті програми, у назві яких справді є слово «журналіст…»: якщо в закладу освіти немає жодної такої програми, він до рейтингу не потрапляє.</p><p>Є два незалежні сортування: за середньою кількістю заяв на одну таку програму і за середнім конкурсним балом. Кількість заяв ділимо на кількість програм зі словом «журналіст…», щоб заклад із кількома такими програмами не мав штучної переваги над закладом з однією. Середній бал обчислюємо як зважене середнє з вагою — кількістю поданих заяв у кожній такій програмі.</p><p>До таблиці потрапляють заклади освіти, у яких сумарна кількість заяв на ці програми не менша за встановлений для рівня мінімум. Це зменшує випадкові стрибки середнього значення на дуже малих вибірках.</p></article><article><h3>Як читати числа</h3><p>Одна людина може подати кілька заяв до різних закладів освіти або програм, тому «заяв на програму» — це не кількість унікальних вступників. Показник описує попит на програму, а середній бал — конкурсний профіль її вступників. Це не рейтинг фактично зарахованих студентів.</p><p>Рейтинг не вимірює якість викладання, репутацію, працевлаштування чи додану цінність програми й не доводить причинно-наслідкових зв’язків.</p></article><article><h3>Що означають кольори чисел у таблиці?</h3><p>Бал і середня кількість заяв на програму пофарбовані відносно значення того самого закладу освіти за попередній рік: зелений — показник покращився (вищий бал або більше заяв), червоний — погіршився (нижчий бал або менше заяв). Звичайний колір без забарвлення означає, що показник не змінився або це перший рік закладу в рейтингу — порівнювати ще нема з чим.</p></article><article><h3>Порівнянність років</h3><p>Архівні роки подано за фінальними даними кампаній; 2026 рік — оперативний зріз, доки кампанія триває. Його слід порівнювати з минулими роками лише після фіналізації.</p><p>Формула та коефіцієнти конкурсного бала (як і правила вступу, дозволена кількість заяв, перелік і структура програм, форми навчання, класифікація спеціальностей) змінювалися рік від року. Тому середній бал коректно порівнювати між закладами освіти в межах одного року, але не порівнювати сам бал одного закладу різних років між собою — на графіку «Середній конкурсний бал по роках» це навмисно показано окремими стовпчиками, а не безперервною лінією.</p></article><article><h3>Чому в рейтингу трапляються заклади, що не готують «класичних» журналістів — або навпаки, не трапляються ті, що начебто готують?</h3><p>Рейтинг рахує заяви на програми зі словом «журналіст…» у назві, подані під спеціальністю (код 061 у 2021–2024 роках, C7 з 2025-го) — обидві умови мають виконуватися одночасно. Спеціальність — це формальна класифікація ЄДЕБО, і заклад освіти сам вирішує, яку саме освітню програму до неї віднести; назва програми не мусить збігатися з назвою спеціальності.</p><p>Звідси дві протилежні ситуації. Буває, що заклад освіти подає під спеціальністю «Журналістика» лише програми з іншою назвою (наприклад, «Зв’язки з громадськістю», «Медіакомунікації» тощо) — тоді жодна його програма не проходить фільтр, і в цьому рейтингу закладу немає, хоча формально він готує фахівців за цією спеціальністю. І навпаки: програма, що називається «Журналістика», може бути віднесена закладом до іншої спеціальності — тоді в цьому рейтингу її теж не буде.</p><p>Приклад — НаУКМА. Бакалаврська програма, яку заклад відносить до спеціальності 061/C7, називається «Зв’язки з громадськістю» — вона не проходить фільтр «журналіст…», тому бакалаврату НаУКМА в цьому рейтингу немає. На магістратурі та сама спеціальність включає окрему програму «Журналістика» (Могилянська школа журналістики) — вона в рейтингу є.</p></article><article><h3>Що таке середній бал?</h3><p>Середній бал — зважена оцінка для вступу на спеціальність «Журналістика» в Україні. Поєднує результати НМТ (українська мова, історія України або математика, іноземна мова) з коефіцієнтами МОН України та галузевими пріоритетами закладу освіти.</p></article>"
    },
    empty: {
      noDataDay: "Немає даних для цього дня.",
      uniNotFound: "Такий заклад освіти не знайдено.",
      backToRating: "Повернутись до рейтингу →",
      outOfRanking: "поза рейтингом (менше мінімуму заяв)"
    },
    showAll: {
      expand: "Показати всі {n} закладів →",
      collapse: "Згорнути ↑"
    },
    legend: {
      title: "Як читати Δ",
      up: "піднявся на 2 місця за добу",
      down: "опустився на 1 місце",
      new: "вперше в рейтингу цього дня"
    },
    footer: {
      initiative: "Ініціатива",
      dataSourceHtml: "Джерело даних: ЄДЕБО (<a href=\"https://vstup.edbo.gov.ua\" target=\"_blank\" rel=\"noopener\">vstup.edbo.gov.ua</a>)."
    },
    uni: {
      eyebrow: "Динаміка популярності · спеціальність «Журналістика»",
      bestRank: "Найкращий ранг",
      currentRank: "Ранг зараз",
      currentScore: "Бал зараз",
      trendSince: "Зміна балу з 2021",
      chartTitle: "Середній конкурсний бал по роках",
      scoreChartDisclaimer: "Формула конкурсного бала змінювалася рік від року — порівнюйте заклади в межах одного року, а не сам бал одного закладу різних років між собою.",
      appsChartTitle: "Середня кількість заяв на програму з журналістики по роках",
      compareLabel: "Порівняти з",
      compareLabel2: "І ще з",
      compareNone: "— не порівнювати —",
      compareVs: "{a} проти {b}",
      compareVsMulti: "{a} проти {b} і {c}",
      addCompare: "+ Додати ще одне порівняння",
      removeCompare: "− Прибрати друге порівняння",
      subtitlePlain: "середній конкурсний бал вступників",
      appsSubtitlePlain: "середня кількість заяв на програму з журналістики",
      admittedAverage: "Середній бал",
      rankingByYear: "Рейтинг по роках",
      noChartData: "Немає даних для побудови графіка.",
      chartAriaLabel: "Середній конкурсний бал по роках",
      metricRank: "Ранг ({year})",
      analysis: {
        scoreUp: "З {from} по {to} середній конкурсний бал зріс на {diff} бала — з {fromVal} до {toVal}.",
        scoreDown: "З {from} по {to} середній конкурсний бал знизився на {diff} бала — з {fromVal} до {toVal}.",
        scoreFlat: "З {from} по {to} середній конкурсний бал залишився приблизно на тому ж рівні (~{value}).",
        appsUp: "Середня кількість заяв на програму зросла на {pct}% — з {fromVal} до {toVal}.",
        appsDown: "Середня кількість заяв на програму скоротилася на {pct}% — з {fromVal} до {toVal}.",
        appsFlat: "Середня кількість заяв на програму залишилася приблизно на тому ж рівні (~{value}).",
        rankBetter: "Порівняно з іншими закладами позиція в рейтингу покращилася — з #{from} до #{to} місця.",
        rankWorse: "Порівняно з іншими закладами позиція в рейтингу погіршилася — з #{from} до #{to} місця.",
        rankSame: "Позиція в рейтингу порівняно з іншими закладами не змінилася — #{value} місце.",
        insufficientData: "Замало історичних даних для аналізу динаміки."
      }
    }
  },

  en: {
    nav: {
      promedia: "← ProMedia",
      backToRating: "← Back to ranking"
    },
    meta: {
      indexTitle: "Ukrainian Journalism Schools Ranking. Journalism Admissions",
      indexDesc: "Ranking of Ukrainian journalism schools by submitted application count and average competitive score of applicants. EDBO data.",
      uniTitleSuffix: "Journalism School Ranking",
      uniDefaultTitle: "Journalism Program Trends — Ukrainian Journalism Schools Ranking",
      uniDesc: "Popularity trend of a journalism school or program: average competitive score and number of applications by year."
    },
    hero: {
      eyebrow: "Major C7 “Journalism”, journalism programs",
      title: "Ukrainian Journalism Schools Ranking",
      lede: "Ranking of universities by submitted applications to journalism programs and the average competitive score of applicants."
    },
    stats: {
      submitted: "Applications submitted",
      count: "Schools in ranking"
    },
    degree: {
      bachelor: "Bachelor's",
      master: "Master's",
      bachelorLabel: "bachelor's · full-time",
      masterLabel: "master's · full-time"
    },
    sort: {
      label: "Sort by",
      score: "Average score",
      applications: "Applications per program"
    },
    search: {
      placeholder: "Find an institution…"
    },
    year: {
      label: "Admission year",
      today: "Today"
    },
    caption: {
      final: "Final data for the {year} admissions campaign. Applications to journalism programs regardless of priority; institutions with at least {minApps} submitted applications.",
      live: "As of {date}. Applications to journalism programs regardless of priority; institutions with at least {minApps} submitted applications."
    },
    table: {
      institution: "Institution",
      score: "Average score",
      applications: "Applications per program",
      fullRanking: "Full ranking",
      year: "Year",
      rank: "Rank"
    },
    systemChart: {
      appsTitle: "Applications per journalism program trend ({from}–{to})",
      scopeNote: "System-wide data (all institutions in the ranking)"
    },
    methodology: {
      kicker: "About the ranking",
      title: "Methodology",
      bodyHtml: "<article><h3>What we measure</h3><p>For each institution, we aggregate educational programs with the word “journalism” in their name (in any form — “Journalism,” “Economic Journalism,” “Journalism and Media Communications,” etc.) among the competitive offers filed under the Journalism speciality: code 061 in 2021–2024 and its successor C7 from 2025. Bachelor's and master's data are kept separate.</p><p>We show two measures: the average number of submitted applications per such program; and the average competitive score of applicants.</p></article><article><h3>How rankings are calculated</h3><p>An institution often files several educational programs under the Journalism speciality — not just “Journalism” itself, but also, for example, “Public Relations” or “Media Communications.” The ranking only counts programs whose name actually contains “journalis…”: if an institution has none, it doesn't appear in the ranking at all.</p><p>There are two independent sort orders: average applications per such program, and average competitive score. Applications are divided by the number of programs named “journalis…” so that an institution with several such programs doesn't get an unfair edge over one with a single program. The score is a weighted average across those programs, weighted by each one's number of submitted applications.</p><p>An institution enters the table only once the total applications to these programs reaches the level-specific minimum. This limits volatility caused by very small samples.</p></article><article><h3>How to interpret the figures</h3><p>One person may submit several applications to different institutions or programs, so “applications per program” is not a count of unique people. It indicates demand, while the average score describes the competitive profile of its applicants. This is not a ranking of students who ultimately enrolled.</p><p>The ranking does not measure teaching quality, reputation, employment outcomes or program value added, and it does not establish causality.</p></article><article><h3>What do the colors of the numbers mean?</h3><p>The score and applications-per-program figures are colored relative to the same institution's value the previous year: green means the figure improved (a higher score or more applications), red means it declined. The default, uncolored text means the figure stayed the same, or this is the institution's first year in the ranking — there's nothing yet to compare it against.</p></article><article><h3>Comparability across years</h3><p>Historical years use final campaign data. The 2026 figures are a live snapshot while admissions remain open and should be compared with earlier years only after finalisation.</p><p>Score formulas and coefficients (like admission rules, application limits, program structures, study modes, and speciality classifications) changed from year to year. So it's valid to compare the average score across institutions within a single year, but not to compare one institution's own score across different years — the “Average competitive score by year” chart deliberately shows separate bars rather than a continuous line for this reason.</p></article><article><h3>Why do some institutions with no “classic” journalism program appear in the ranking — or vice versa, why are some that seem to train journalists missing?</h3><p>The ranking counts applications to programs named “journalis…” filed under the speciality (code 061 in 2021–2024, C7 from 2025) — both conditions must hold at once. A speciality is a formal EDBO classification, and each institution decides for itself which of its programmes to file under it — the programme's name need not match the speciality's name.</p><p>This creates two opposite situations. An institution may file only differently-named programmes (e.g. “Public Relations,” “Media Communications”) under the Journalism speciality — then none of its programmes pass the filter, and the institution doesn't appear in this ranking at all, even though it formally trains specialists in this speciality. Conversely, a programme actually named “Journalism” may be filed by its institution under a different speciality entirely — in which case it won't appear here either.</p><p>NaUKMA is one example. The bachelor's programme it files under speciality 061/C7 is called “Public Relations” — it doesn't pass the “journalis…” filter, so NaUKMA's bachelor's program isn't in this ranking. At the master's level, the same speciality also includes a separate “Journalism” programme (the Mohyla School of Journalism) — that one is in the ranking.</p></article><article><h3>What is the average score?</h3><p>The average score is a weighted score used for admission to the Journalism major in Ukraine. It combines NMT results (Ukrainian language, history of Ukraine or mathematics, foreign language) with Ministry of Education coefficients and the institution's field priorities.</p></article>"
    },
    empty: {
      noDataDay: "No data for this day.",
      uniNotFound: "This institution was not found.",
      backToRating: "Back to ranking →",
      outOfRanking: "outside ranking (below minimum applications)"
    },
    showAll: {
      expand: "Show all {n} institutions →",
      collapse: "Collapse ↑"
    },
    legend: {
      title: "How to read Δ",
      up: "moved up 2 places in a day",
      down: "moved down 1 place",
      new: "first appearance in today's ranking"
    },
    footer: {
      initiative: "An initiative by",
      dataSourceHtml: "Data source: EDBO (<a href=\"https://vstup.edbo.gov.ua\" target=\"_blank\" rel=\"noopener\">vstup.edbo.gov.ua</a>)."
    },
    uni: {
      eyebrow: "Popularity trend · Journalism major",
      bestRank: "Best rank",
      currentRank: "Current rank",
      currentScore: "Current score",
      trendSince: "Score change since 2021",
      chartTitle: "Average competitive score by year",
      scoreChartDisclaimer: "The scoring formula changed from year to year — compare institutions within the same year, not one institution's own score across different years.",
      appsChartTitle: "Average applications per journalism program by year",
      compareLabel: "Compare with",
      compareLabel2: "And also with",
      compareNone: "— don't compare —",
      compareVs: "{a} vs {b}",
      compareVsMulti: "{a} vs {b} and {c}",
      addCompare: "+ Add another comparison",
      removeCompare: "− Remove second comparison",
      subtitlePlain: "average competitive score of applicants",
      appsSubtitlePlain: "average applications per journalism program",
      admittedAverage: "Average score",
      rankingByYear: "Ranking by year",
      noChartData: "No data to build a chart.",
      chartAriaLabel: "Average competitive score by year",
      metricRank: "Rank ({year})",
      analysis: {
        scoreUp: "From {from} to {to}, the average competitive score rose by {diff} points — from {fromVal} to {toVal}.",
        scoreDown: "From {from} to {to}, the average competitive score fell by {diff} points — from {fromVal} to {toVal}.",
        scoreFlat: "From {from} to {to}, the average competitive score stayed roughly the same (~{value}).",
        appsUp: "Average applications per program grew by {pct}% — from {fromVal} to {toVal}.",
        appsDown: "Average applications per program dropped by {pct}% — from {fromVal} to {toVal}.",
        appsFlat: "Average applications per program stayed roughly the same (~{value}).",
        rankBetter: "Relative to other institutions, its ranking position improved — from #{from} to #{to}.",
        rankWorse: "Relative to other institutions, its ranking position declined — from #{from} to #{to}.",
        rankSame: "Its ranking position relative to other institutions stayed unchanged — #{value}.",
        insufficientData: "Not enough historical data to analyze the trend."
      }
    }
  }
};

function getLang() {
  return localStorage.getItem("site-lang") === "en" ? "en" : "uk";
}

function setLang(lang) {
  localStorage.setItem("site-lang", lang === "en" ? "en" : "uk");
}

function localeTag() {
  return getLang() === "en" ? "en-US" : "uk-UA";
}

function numFmt() {
  return new Intl.NumberFormat(localeTag());
}

function tRaw(key) {
  const dict = I18N[getLang()];
  return key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : undefined), dict);
}

function t(key, vars) {
  let str = tRaw(key);
  if (str == null) return key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{${k}}`).join(v);
    }
  }
  return str;
}

function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-content]").forEach((el) => {
    el.setAttribute("content", t(el.dataset.i18nContent));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
}

function initLangToggle() {
  const buttons = document.querySelectorAll(".lang-btn");
  function sync() {
    const lang = getLang();
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  }
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.lang === getLang()) return;
      setLang(btn.dataset.lang);
      document.documentElement.lang = getLang();
      sync();
      applyStaticI18n();
      if (typeof window.onLangChange === "function") window.onLangChange();
    });
  });
  sync();
}

document.documentElement.lang = getLang();
applyStaticI18n();
initLangToggle();
