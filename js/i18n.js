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
      indexTitle: "Рейтинг журфаків України. Вступ 2026",
      indexDesc: "Рейтинг журфаків України за середнім конкурсним балом вступників на спеціальність «Журналістика» — бакалаврат і магістратура. Дані ЄДЕБО.",
      uniTitleSuffix: "Журфак.Рейтинг",
      uniDefaultTitle: "Динаміка журфаку — Рейтинг журфаків України",
      uniDesc: "Динаміка популярності журфаку або програми журналістики: середній конкурсний бал і кількість заяв по роках."
    },
    hero: {
      eyebrow: "Вступна кампанія 2026 · спеціальність 061 «Журналістика»",
      title: "Рейтинг журфаків України",
      lede: "Рейтинг факультетів і програм журналістики за середнім конкурсним балом вступників — окремо бакалаврат, окремо магістратура.",
      updated: "Оновлено"
    },
    banner: {
      demo: "⚠️ Демонстраційна версія: бали й кількість заяв нижче — <strong>згенеровані тестові дані</strong>, а не реальна вибірка ЄДЕБО. Список університетів — справжній. Деталі підключення живих даних — у README.",
      demoUni: "⚠️ Демонстраційна версія: бали й кількість заяв нижче — <strong>згенеровані тестові дані</strong>, а не реальна вибірка ЄДЕБО. Деталі — у README."
    },
    stats: {
      appsBachelor: "Заяв · бакалаврат",
      appsBachelorP1: "Заяв · бакалаврат (пріоритет 1)",
      appsMaster: "Заяв · магістратура",
      appsMasterP1: "Заяв · магістратура (пріоритет 1)",
      count: "Журфаків у рейтингу",
      topScore: "Найвищий бал"
    },
    degree: {
      bachelor: "Бакалавр",
      master: "Магістр",
      bachelorLabel: "бакалаврат · денна форма",
      masterLabel: "магістратура · денна форма"
    },
    view: {
      all: "Усі заяви",
      p1: "Пріоритет 1",
      p1Suffix: " · пріоритет 1"
    },
    sort: {
      label: "Сортувати за",
      score: "Балом",
      applications: "Заявами"
    },
    hint: "«Пріоритет 1» — рейтинг лише по заявах, де журналістика в цьому закладі вказана вступником як перший, свідомий вибір (а не запасний варіант).",
    year: {
      label: "Рік вступу",
      current: "{year} · зараз",
      today: "Сьогодні"
    },
    caption: {
      final: "Підсумкові дані вступної кампанії {year} року. Заклади освіти щонайменше з {minApps} заявами.{scopeNote}",
      live: "Станом на {date}. Заклади освіти щонайменше з {minApps} заявами.{scopeNote}",
      p1Note: " Лише заяви з пріоритетом №1."
    },
    table: {
      institution: "Заклад",
      score: "Бал",
      applications: "Заяв",
      fullRanking: "Повний рейтинг",
      year: "Рік",
      rank: "Ранг"
    },
    unit: { applications: "заяв" },
    empty: {
      noDataDay: "Немає даних для цього дня.",
      allShown: "Це весь рейтинг — топ-3 показано вище.",
      uniNotFound: "Такий заклад освіти не знайдено.",
      backToRating: "Повернутись до рейтингу →",
      outOfRanking: "поза рейтингом (менше мінімуму заяв)"
    },
    showAll: {
      expand: "Показати всі {n} закладів →",
      collapse: "Згорнути ↑"
    },
    info: {
      kbHtml: "<strong>КБ (конкурсний бал)</strong> — зважена оцінка для вступу на спеціальність «Журналістика» в Україні. Поєднує результати НМТ (українська мова, історія України або математика, іноземна мова) з коефіцієнтами МОН України та галузевими пріоритетами закладу освіти."
    },
    legend: {
      title: "Як читати Δ",
      up: "піднявся на 2 місця за добу",
      down: "опустився на 1 місце",
      new: "вперше в рейтингу цього дня"
    },
    source: {
      title: "Джерело",
      html: "Єдина державна електронна база з питань освіти (<strong>ЄДЕБО</strong>), рейтингові списки вступників по конкурсних пропозиціях спеціальності «Журналістика».",
      link: "vstup.edbo.gov.ua ↗"
    },
    footer: {
      initiative: "Ініціатива",
      dataSourceHtml: "Джерело даних (після підключення): ЄДЕБО (<a href=\"https://vstup.edbo.gov.ua\" target=\"_blank\" rel=\"noopener\">vstup.edbo.gov.ua</a>).",
      dataSourceNote: "Наразі показано тестові дані — дашборд ще не підключено до живого фіда."
    },
    uni: {
      eyebrow: "Динаміка популярності · спеціальність «Журналістика»",
      bestRank: "Найкращий ранг",
      currentRank: "Ранг зараз",
      currentScore: "Бал зараз",
      trendSince: "Зміна балу з 2021",
      chartTitle: "Середній конкурсний бал по роках",
      compareLabel: "Порівняти з",
      compareNone: "— не порівнювати —",
      compareVs: "{a} проти {b}",
      subtitlePlain: "суцільна — усі заяви, пунктир — лише пріоритет 1",
      rankingByYear: "Рейтинг по роках",
      noChartData: "Немає даних для побудови графіка.",
      chartAriaLabel: "Динаміка балу по роках",
      metricRank: "Ранг ({year})"
    }
  },

  en: {
    nav: {
      promedia: "← ProMedia",
      backToRating: "← Back to ranking"
    },
    meta: {
      indexTitle: "Ukrainian Journalism Schools Ranking. Admissions 2026",
      indexDesc: "Ranking of Ukrainian journalism schools by average competitive score of applicants to the Journalism major — bachelor's and master's. Data from EDBO.",
      uniTitleSuffix: "Journalism School Ranking",
      uniDefaultTitle: "Journalism Program Trends — Ukrainian Journalism Schools Ranking",
      uniDesc: "Popularity trend of a journalism school or program: average competitive score and number of applications by year."
    },
    hero: {
      eyebrow: "2026 admissions campaign · major 061 “Journalism”",
      title: "Ukrainian Journalism Schools Ranking",
      lede: "Ranking of journalism faculties and programs by applicants' average competitive score — bachelor's and master's shown separately.",
      updated: "Updated"
    },
    banner: {
      demo: "⚠️ Demo version: the scores and application counts below are <strong>generated test data</strong>, not a real EDBO sample. The list of universities is real. See README for details on connecting live data.",
      demoUni: "⚠️ Demo version: the scores and application counts below are <strong>generated test data</strong>, not a real EDBO sample. See README for details."
    },
    stats: {
      appsBachelor: "Applications · bachelor's",
      appsBachelorP1: "Applications · bachelor's (priority 1)",
      appsMaster: "Applications · master's",
      appsMasterP1: "Applications · master's (priority 1)",
      count: "Schools in ranking",
      topScore: "Highest score"
    },
    degree: {
      bachelor: "Bachelor's",
      master: "Master's",
      bachelorLabel: "bachelor's · full-time",
      masterLabel: "master's · full-time"
    },
    view: {
      all: "All applications",
      p1: "Priority 1",
      p1Suffix: " · priority 1"
    },
    sort: {
      label: "Sort by",
      score: "Score",
      applications: "Applications"
    },
    hint: "“Priority 1” ranks only applications where the applicant listed journalism at this school as their first, deliberate choice (not a fallback option).",
    year: {
      label: "Admission year",
      current: "{year} · current",
      today: "Today"
    },
    caption: {
      final: "Final data for the {year} admissions campaign. Institutions with at least {minApps} applications.{scopeNote}",
      live: "As of {date}. Institutions with at least {minApps} applications.{scopeNote}",
      p1Note: " Priority 1 applications only."
    },
    table: {
      institution: "Institution",
      score: "Score",
      applications: "Applications",
      fullRanking: "Full ranking",
      year: "Year",
      rank: "Rank"
    },
    unit: { applications: "applications" },
    empty: {
      noDataDay: "No data for this day.",
      allShown: "This is the entire ranking — top 3 shown above.",
      uniNotFound: "This institution was not found.",
      backToRating: "Back to ranking →",
      outOfRanking: "outside ranking (below minimum applications)"
    },
    showAll: {
      expand: "Show all {n} institutions →",
      collapse: "Collapse ↑"
    },
    info: {
      kbHtml: "<strong>Competitive score</strong> is a weighted score used for admission to the Journalism major in Ukraine. It combines NMT results (Ukrainian language, history of Ukraine or mathematics, foreign language) with Ministry of Education coefficients and the institution's field priorities."
    },
    legend: {
      title: "How to read Δ",
      up: "moved up 2 places in a day",
      down: "moved down 1 place",
      new: "first appearance in today's ranking"
    },
    source: {
      title: "Source",
      html: "The Unified State Electronic Database on Education (<strong>EDBO</strong>), applicant ranking lists for competitive proposals in the Journalism major.",
      link: "vstup.edbo.gov.ua ↗"
    },
    footer: {
      initiative: "An initiative by",
      dataSourceHtml: "Data source (once connected): EDBO (<a href=\"https://vstup.edbo.gov.ua\" target=\"_blank\" rel=\"noopener\">vstup.edbo.gov.ua</a>).",
      dataSourceNote: "Currently showing test data — the dashboard is not yet connected to a live feed."
    },
    uni: {
      eyebrow: "Popularity trend · Journalism major",
      bestRank: "Best rank",
      currentRank: "Current rank",
      currentScore: "Current score",
      trendSince: "Score change since 2021",
      chartTitle: "Average competitive score by year",
      compareLabel: "Compare with",
      compareNone: "— don't compare —",
      compareVs: "{a} vs {b}",
      subtitlePlain: "solid — all applications, dashed — priority 1 only",
      rankingByYear: "Ranking by year",
      noChartData: "No data to build a chart.",
      chartAriaLabel: "Score trend by year",
      metricRank: "Rank ({year})"
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
