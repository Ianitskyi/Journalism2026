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
      indexDesc: "Рейтинг журфаків України за кількістю заяв і середнім конкурсним балом допущених до конкурсу на спеціальність «Журналістика». Дані ЄДЕБО.",
      uniTitleSuffix: "Журфак.Рейтинг",
      uniDefaultTitle: "Динаміка журфаку — Рейтинг журфаків України",
      uniDesc: "Динаміка популярності журфаку або програми журналістики: середній конкурсний бал і кількість заяв по роках."
    },
    hero: {
      eyebrow: "Вступна кампанія 2026 · спеціальність C7 «Журналістика»",
      title: "Рейтинг журфаків України",
      lede: "Рейтинг факультетів і програм журналістики за кількістю поданих заяв і середнім конкурсним балом допущених до конкурсу — окремо бакалаврат, окремо магістратура.",
      updated: "Оновлено"
    },
    banner: {
      demo: "Дані за <strong>2021–2025 роки — реальні підсумкові дані ЄДЕБО</strong>. Для поточного 2026 року до завершення підключення показано демонстраційний fallback; стан даних завжди зазначено під обраним роком.",
      demoUni: "⚠️ Демонстраційна версія: бали й кількість заяв нижче — <strong>згенеровані тестові дані</strong>, а не реальна вибірка ЄДЕБО. Деталі — у README."
    },
    stats: {
      submitted: "Подано заяв",
      admitted: "Допущено до конкурсу",
      count: "Журфаків у рейтингу",
      topScore: "Найвищий середній бал допущених"
    },
    degree: {
      bachelor: "Бакалавр",
      master: "Магістр",
      bachelorLabel: "бакалаврат · денна форма",
      masterLabel: "магістратура · денна форма"
    },
    sort: {
      label: "Сортувати за",
      score: "Середнім балом допущених",
      applications: "Кількістю заяв"
    },
    year: {
      label: "Рік вступу",
      current: "{year} · зараз",
      today: "Сьогодні"
    },
    caption: {
      final: "Підсумкові дані вступної кампанії {year} року. Усі подані заяви незалежно від пріоритету; заклади освіти щонайменше з {minApps} поданими заявами.",
      live: "Станом на {date}. Усі подані заяви незалежно від пріоритету; заклади освіти щонайменше з {minApps} поданими заявами."
    },
    table: {
      institution: "Заклад",
      score: "Середній бал допущених",
      applications: "Подано заяв",
      admitted: "Допущено",
      fullRanking: "Повний рейтинг",
      year: "Рік",
      rank: "Ранг"
    },
    unit: { applications: "заяв", submitted: "подано", admitted: "допущено" },
    disclaimer: {
      liveHtml: "<strong>2026 рік — поточні, незавершені дані.</strong> Кількість заяв, кількість допущених і середній бал можуть змінюватися протягом кампанії. Коректно зіставляти 2026 рік із підсумковими даними попередніх років можна буде лише після завершення вступної кампанії та фіксації фінального знімка."
    },
    methodology: {
      kicker: "Про рейтинг",
      title: "Методологія, обмеження та припущення",
      bodyHtml: "<article><h3>Що ми вимірюємо</h3><p>Для кожного закладу освіти окремо агрегуємо конкурсні пропозиції спеціальності «Журналістика»: код 061 у 2021–2024 роках і відповідний код C7 з 2025 року. Бакалаврат і магістратуру не змішуємо.</p><p>Показуємо три показники: <strong>усі подані заяви</strong> незалежно від пріоритету; <strong>заяви, допущені до конкурсу</strong>; <strong>середній конкурсний бал допущених</strong>.</p></article><article><h3>Як рахуємо рейтинг</h3><p>Є два незалежні сортування: за кількістю всіх поданих заяв і за середнім балом допущених. Якщо ЗВО має кілька конкурсних пропозицій, кількість заяв і допущених підсумовуємо, а середній бал обчислюємо як зважене середнє, де вага — кількість допущених у кожній пропозиції.</p><p>До таблиці потрапляють ЗВО, що мають щонайменше встановлений для рівня мінімум поданих заяв. Це зменшує випадкові стрибки середнього бала на дуже малих вибірках.</p></article><article><h3>Як читати числа</h3><p>Одна людина може подати кілька заяв до різних ЗВО або програм, тому «подано заяв» — це не кількість унікальних вступників. Показник описує попит на програму, а середній бал допущених — конкурсний профіль її допущених кандидатів. Це не рейтинг фактично зарахованих студентів.</p><p>Рейтинг не вимірює якість викладання, репутацію, працевлаштування чи додану цінність програми й не доводить причинно-наслідкових зв’язків.</p></article><article><h3>Порівнянність років</h3><p>Архівні роки подано за фінальними даними кампаній; 2026 рік — оперативний зріз, доки кампанія триває. Його слід порівнювати з минулими роками лише після фіналізації.</p><p>Навіть фінальні значення треба трактувати обережно: між роками змінювалися правила вступу, формула та коефіцієнти конкурсного бала, дозволена кількість заяв, перелік і структура програм, форми навчання та класифікація спеціальностей. Ми припускаємо, що агреговані поля ЄДЕБО мають однаковий зміст у межах порівнюваних кампаній.</p></article>"
    },
    faq: {
      kicker: "Питання, що часто виникають",
      title: "FAQ",
      bodyHtml: "<article><h3>Чому в рейтингу бакалаврату є НаУКМА, якщо Могилянська школа журналістики не готує бакалаврів?</h3><p>Рейтинг формується за конкурсними пропозиціями спеціальності 061 «Журналістика» в ЄДЕБО, а не лише за програмами, що безпосередньо готують журналістів.</p><p>У НаУКМА до цієї спеціальності належить бакалаврська освітня програма «Зв’язки з громадськістю». Тому заяви її вступників враховані в рейтингу бакалаврату. Водночас освітня програма «Журналістика» Могилянської школи журналістики є магістерською.</p><p>Отже, показник НаУКМА в бакалаврському рейтингу стосується вступу на програму зі зв’язків з громадськістю, а не на класичну програму підготовки журналістів.</p></article>"
    },
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
      dataSourceHtml: "Джерело даних: ЄДЕБО (<a href=\"https://vstup.edbo.gov.ua\" target=\"_blank\" rel=\"noopener\">vstup.edbo.gov.ua</a>).",
      dataSourceNote: "Архівні кампанії показано за фінальними даними; статус поточного року зазначено в рейтингу."
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
      subtitlePlain: "середній конкурсний бал допущених до конкурсу",
      admittedAverage: "Середній бал допущених",
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
      indexDesc: "Ranking of Ukrainian journalism schools by application count and average competitive score of candidates admitted to the competition. EDBO data.",
      uniTitleSuffix: "Journalism School Ranking",
      uniDefaultTitle: "Journalism Program Trends — Ukrainian Journalism Schools Ranking",
      uniDesc: "Popularity trend of a journalism school or program: average competitive score and number of applications by year."
    },
    hero: {
      eyebrow: "2026 admissions campaign · major C7 “Journalism”",
      title: "Ukrainian Journalism Schools Ranking",
      lede: "Ranking of journalism faculties and programs by submitted applications and the average competitive score of candidates admitted to the competition — bachelor's and master's shown separately.",
      updated: "Updated"
    },
    banner: {
      demo: "<strong>2021–2025 use real final EDBO data.</strong> Until the current 2026 connection is complete, that year uses a demo fallback; the status is always stated below the selected year.",
      demoUni: "⚠️ Demo version: the scores and application counts below are <strong>generated test data</strong>, not a real EDBO sample. See README for details."
    },
    stats: {
      submitted: "Applications submitted",
      admitted: "Admitted to competition",
      count: "Schools in ranking",
      topScore: "Highest admitted average"
    },
    degree: {
      bachelor: "Bachelor's",
      master: "Master's",
      bachelorLabel: "bachelor's · full-time",
      masterLabel: "master's · full-time"
    },
    sort: {
      label: "Sort by",
      score: "Admitted average score",
      applications: "Application count"
    },
    year: {
      label: "Admission year",
      current: "{year} · current",
      today: "Today"
    },
    caption: {
      final: "Final data for the {year} admissions campaign. All submitted applications regardless of priority; institutions with at least {minApps} submitted applications.",
      live: "As of {date}. All submitted applications regardless of priority; institutions with at least {minApps} submitted applications."
    },
    table: {
      institution: "Institution",
      score: "Average score of admitted",
      applications: "Applications submitted",
      admitted: "Admitted",
      fullRanking: "Full ranking",
      year: "Year",
      rank: "Rank"
    },
    unit: { applications: "applications", submitted: "submitted", admitted: "admitted" },
    disclaimer: {
      liveHtml: "<strong>2026 figures are live and incomplete.</strong> Submitted and admitted application counts and the average score may change during the campaign. A sound comparison with final historical figures will only be possible after the 2026 campaign closes and a final snapshot is fixed."
    },
    methodology: {
      kicker: "About the ranking",
      title: "Methodology, limitations and assumptions",
      bodyHtml: "<article><h3>What we measure</h3><p>For each institution, we aggregate competitive offers in Journalism: code 061 in 2021–2024 and its successor C7 from 2025. Bachelor's and master's data are kept separate.</p><p>We show three measures: <strong>all submitted applications</strong>, regardless of priority; <strong>applications admitted to the competition</strong>; and the <strong>average competitive score of admitted applications</strong>.</p></article><article><h3>How rankings are calculated</h3><p>There are two independent sort orders: all submitted applications and average score of admitted applications. If an institution has several competitive offers, submitted and admitted counts are summed. Its score is a weighted average, using the admitted count for each offer as the weight.</p><p>An institution enters the table only after reaching the level-specific minimum number of submitted applications. This limits volatility caused by very small samples.</p></article><article><h3>How to interpret the figures</h3><p>One person may submit several applications to different institutions or programs. “Applications submitted” is therefore not a count of unique people. It indicates demand, while the admitted average describes the competitive profile of eligible candidates. This is not a ranking of students who ultimately enrolled.</p><p>The ranking does not measure teaching quality, reputation, employment outcomes or program value added, and it does not establish causality.</p></article><article><h3>Comparability across years</h3><p>Historical years use final campaign data. The 2026 figures are a live snapshot while admissions remain open and should be compared with earlier years only after finalisation.</p><p>Even final values require caution: admission rules, score formulas and coefficients, application limits, program structures, study modes and speciality classifications changed over time. We assume that the selected aggregate EDBO fields retain comparable meanings within the campaigns shown.</p></article>"
    },
    faq: {
      kicker: "Frequently asked",
      title: "FAQ",
      bodyHtml: "<article><h3>Why does NaUKMA appear in the bachelor's ranking if the Mohyla School of Journalism has no bachelor's program?</h3><p>The ranking is built from competitive admission offers under speciality 061 “Journalism” in EDBO, not only from programs that directly train journalists.</p><p>At NaUKMA, this speciality includes the bachelor's programme “Public Relations.” Applications to that programme are therefore counted in the bachelor's ranking. The Mohyla School of Journalism's own “Journalism” programme, meanwhile, is master's-level only.</p><p>So NaUKMA's bachelor's-ranking figures reflect admission to the public relations programme, not to a classic journalism-training programme.</p></article>"
    },
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
      dataSourceHtml: "Data source: EDBO (<a href=\"https://vstup.edbo.gov.ua\" target=\"_blank\" rel=\"noopener\">vstup.edbo.gov.ua</a>).",
      dataSourceNote: "Archived campaigns use final figures; the current year's status is stated in the ranking."
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
      subtitlePlain: "average competitive score of candidates admitted to the competition",
      admittedAverage: "Average score of admitted",
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
