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
    filter: {
      priorityOnly: "Лише 1 та 2 пріоритет",
      budgetOnly: "Лише бюджет"
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
      live: "Станом на {date}. Заяви на програми з журналістики незалежно від пріоритету; заклади освіти щонайменше з {minApps} поданими заявами.",
      finalPriority: "Підсумкові дані вступної кампанії {year} року. Лише заяви 1-го та 2-го пріоритету на програми з журналістики; заклади освіти щонайменше з {minApps} поданими заявами.",
      livePriority: "Станом на {date}. Лише заяви 1-го та 2-го пріоритету на програми з журналістики; заклади освіти щонайменше з {minApps} поданими заявами.",
      finalBudget: "Підсумкові дані вступної кампанії {year} року. Лише бюджетні місця (без контрактних) на програми з журналістики; заклади освіти щонайменше з {minApps} поданими заявами.",
      liveBudget: "Станом на {date}. Лише бюджетні місця (без контрактних) на програми з журналістики; заклади освіти щонайменше з {minApps} поданими заявами.",
      finalBudgetPriority: "Підсумкові дані вступної кампанії {year} року. Лише заяви 1-го та 2-го пріоритету на бюджетні місця (без контрактних) на програми з журналістики; заклади освіти щонайменше з {minApps} поданими заявами.",
      liveBudgetPriority: "Станом на {date}. Лише заяви 1-го та 2-го пріоритету на бюджетні місця (без контрактних) на програми з журналістики; заклади освіти щонайменше з {minApps} поданими заявами."
    },
    table: {
      institution: "Заклад",
      score: "Середній бал",
      applications: "Заяв на програму",
      applicationsColumn: "Заяв на програму",
      fullRanking: "Повний рейтинг",
      year: "Рік",
      rank: "Ранг"
    },
    systemChart: {
      appsTitle: "Динаміка заяв на одну програму з журналістики ({from}–{to})",
      appsTitlePriority: "Динаміка заяв 1-го та 2-го пріоритету на одну програму з журналістики ({from}–{to})",
      appsTitleBudget: "Динаміка заяв на бюджет на одну програму з журналістики ({from}–{to})",
      appsTitleBudgetPriority: "Динаміка заяв 1-го та 2-го пріоритету на бюджет на одну програму з журналістики ({from}–{to})",
      scopeNote: "Дані в цілому по системі (усі заклади в рейтингу)"
    },
    methodology: {
      kicker: "Про рейтинг",
      title: "Методологія",
      bodyHtml: "<article><h3>Що ми вимірюємо</h3><p>Для кожного закладу освіти окремо агрегуємо освітні програми зі словом «журналістика» (у будь-якій формі — «Журналістика», «Економічна журналістика», «Журналістика та медіакомунікації» тощо) серед конкурсних пропозицій спеціальності «Журналістика»: код 061 у 2021–2024 роках і відповідний код C7 з 2025 року. Бакалаврат і магістратуру не змішуємо.</p><p>Показуємо два показники: середню кількість поданих заяв на одну таку програму; середній конкурсний бал вступників.</p></article><article><h3>Як рахуємо рейтинг</h3><p>Заклад освіти нерідко подає під спеціальністю «Журналістика» кілька освітніх програм — не лише саму «Журналістику», а й, наприклад, «Зв’язки з громадськістю» чи «Медіакомунікації». У рейтингу враховуємо лише ті програми, у назві яких справді є слово «журналіст…»: якщо в закладу освіти немає жодної такої програми, він до рейтингу не потрапляє.</p><p>Є два незалежні сортування: за середньою кількістю заяв на одну таку програму і за середнім конкурсним балом. Кількість заяв ділимо на кількість програм зі словом «журналіст…», щоб заклад із кількома такими програмами не мав штучної переваги над закладом з однією. Середній бал обчислюємо як зважене середнє з вагою — кількістю поданих заяв у кожній такій програмі.</p><p>До таблиці потрапляють заклади освіти, у яких сумарна кількість заяв на ці програми не менша за встановлений для рівня мінімум. Це зменшує випадкові стрибки середнього значення на дуже малих вибірках.</p></article><article><h3>Як читати числа</h3><p>Одна людина може подати кілька заяв до різних закладів освіти або програм, тому «заяв на програму» — це не кількість унікальних вступників. Показник описує попит на програму, а середній бал — конкурсний профіль її вступників. Це не рейтинг фактично зарахованих студентів.</p><p>Рейтинг не вимірює якість викладання, репутацію, працевлаштування чи додану цінність програми й не доводить причинно-наслідкових зв’язків.</p></article><article><h3>Що означають кольори чисел у таблиці?</h3><p>Кількість заяв на програму пофарбована відносно значення того самого закладу освіти за попередній рік: зелений — заяв стало більше, червоний — менше. Звичайний колір без забарвлення означає, що показник не змінився або це перший рік закладу в рейтингу — порівнювати ще нема з чим. Середній бал так не фарбуємо: формула його розрахунку змінювалася рік від року, тому пряме порівняння балу одного закладу між роками було б оманливим (див. «Порівнянність років» нижче).</p></article><article><h3>Порівнянність років</h3><p>Архівні роки подано за фінальними даними кампаній; 2026 рік — оперативний зріз, доки кампанія триває. Його слід порівнювати з минулими роками лише після фіналізації.</p><p>Формула та коефіцієнти конкурсного бала (як і правила вступу, дозволена кількість заяв, перелік і структура програм, форми навчання, класифікація спеціальностей) змінювалися рік від року. Тому середній бал коректно порівнювати між закладами освіти в межах одного року, але не порівнювати сам бал одного закладу різних років між собою — на графіку «Середній конкурсний бал по роках» це навмисно показано окремими стовпчиками, а не безперервною лінією.</p></article><article><h3>Чому в рейтингу трапляються заклади, що не готують «класичних» журналістів — або навпаки, не трапляються ті, що начебто готують?</h3><p>Рейтинг рахує заяви на програми зі словом «журналіст…» у назві, подані під спеціальністю (код 061 у 2021–2024 роках, C7 з 2025-го) — обидві умови мають виконуватися одночасно. Спеціальність — це формальна класифікація ЄДЕБО, і заклад освіти сам вирішує, яку саме освітню програму до неї віднести; назва програми не мусить збігатися з назвою спеціальності.</p><p>Звідси дві протилежні ситуації. Буває, що заклад освіти подає під спеціальністю «Журналістика» лише програми з іншою назвою (наприклад, «Зв’язки з громадськістю», «Медіакомунікації» тощо) — тоді жодна його програма не проходить фільтр, і в цьому рейтингу закладу немає, хоча формально він готує фахівців за цією спеціальністю. І навпаки: програма, що називається «Журналістика», може бути віднесена закладом до іншої спеціальності — тоді в цьому рейтингу її теж не буде.</p><p>Приклад — НаУКМА. Бакалаврська програма, яку заклад відносить до спеціальності 061/C7, називається «Зв’язки з громадськістю» — вона не проходить фільтр «журналіст…», тому бакалаврату НаУКМА в цьому рейтингу немає. На магістратурі та сама спеціальність включає окрему програму «Журналістика» (Могилянська школа журналістики) — вона в рейтингу є.</p><p>Для кількох програм, назва яких не містить «журналіст…», але за змістом це той самий напрям цифрових медіа, ми вручну зробили виняток і додали їх до рейтингу: «Цифрові медіа» (КНУ ім. Тараса Шевченка, магістратура), «Контент-продюсування цифрових медіапроєктів» і «Міжнародні медіа та цифрові комунікації» (обидві — Київський столичний університет імені Бориса Грінченка, магістратура).</p></article><article><h3>Що означає перемикач «Показати лише заяви 1 та 2 пріоритету»?</h3><p>Вступник може подати заяви одразу на кілька закладів і програм, і для кожної заяви сам вказує пріоритет — наскільки це справді його бажаний вибір, а не «про всяк випадок». За замовчуванням рейтинг враховує всі подані заяви незалежно від пріоритету — це показник загального попиту. Перемикач звужує вибірку лише до заяв, які вступники позначили 1-м чи 2-м пріоритетом, — тобто до тих закладів/програм, які для них дійсно найбажаніші.</p><p>Дані про пріоритет заяви беремо з рейтингового списку вступників кожної конкурсної пропозиції — того самого списку, що публічно доступний на сторінці пропозиції на vstup.edbo.gov.ua. Показники «Заяв на програму» і «Середній бал» при увімкненому фільтрі рахуються за тією самою формулою, що й завжди, — лише на звуженій вибірці заяв.</p></article><article><h3>Що означає перемикач «Лише бюджет»?</h3><p>Кожна конкурсна пропозиція ЄДЕБО має тип: «Відкрита» (бюджетне місце, розподілене через загальнонаціональний відкритий конкурс), «Фіксована» (бюджетне місце із заздалегідь визначеною для програми кількістю — так розподілялись усі бюджетні місця на магістратуру до 2023 року, коли відкритого конкурсу для неї ще не було) або «Небюджетна» (контрактне, платне місце). Перемикач прибирає з підрахунку лише контрактні місця — і «Відкрита», і «Фіксована» це реальний бюджет, тому обидві враховуються.</p><p>Для магістратури 2021-2022 років тоді ще не існувало й самого механізму подачі заяв із пріоритетом — тому за увімкненого перемикача «лише 1-2 пріоритет» цифри цих років лишаються такими самими, як без фільтра, а не нульовими.</p><p>Обидва перемикачі — за пріоритетом і за бюджетом — можна вмикати одночасно.</p></article><article><h3>Що таке середній бал?</h3><p>Середній бал — зважена оцінка для вступу на спеціальність «Журналістика» в Україні. Поєднує результати НМТ (українська мова, історія України або математика, іноземна мова) з коефіцієнтами МОН України та галузевими пріоритетами закладу освіти.</p></article>"
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
    /* точкові редакційні примітки про конкретні заклади (напр. реорганізація) —
       ключ = id закладу (як у DB), показуються на сторінці закладу, якщо є */
    institutionNotes: {
      edbo87: "Заклад перебуває в процесі реорганізації: набрані вступники здобуватимуть освіту та отримають дипломи Харківського національного університету мистецтв імені І. П. Котляревського."
    },
    uni: {
      eyebrow: "Динаміка популярності · спеціальність «Журналістика»",
      bestRank: "Найкращий ранг",
      currentRank: "Ранг зараз",
      currentScore: "Бал зараз",
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
    filter: {
      priorityOnly: "1st & 2nd priority only",
      budgetOnly: "Budget only"
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
      live: "As of {date}. Applications to journalism programs regardless of priority; institutions with at least {minApps} submitted applications.",
      finalPriority: "Final data for the {year} admissions campaign. Only 1st and 2nd priority applications to journalism programs; institutions with at least {minApps} submitted applications.",
      livePriority: "As of {date}. Only 1st and 2nd priority applications to journalism programs; institutions with at least {minApps} submitted applications.",
      finalBudget: "Final data for the {year} admissions campaign. Only budget-funded places (excluding contract places) for journalism programs; institutions with at least {minApps} submitted applications.",
      liveBudget: "As of {date}. Only budget-funded places (excluding contract places) for journalism programs; institutions with at least {minApps} submitted applications.",
      finalBudgetPriority: "Final data for the {year} admissions campaign. Only 1st and 2nd priority applications to budget-funded places (excluding contract places) for journalism programs; institutions with at least {minApps} submitted applications.",
      liveBudgetPriority: "As of {date}. Only 1st and 2nd priority applications to budget-funded places (excluding contract places) for journalism programs; institutions with at least {minApps} submitted applications."
    },
    table: {
      institution: "Institution",
      score: "Average score",
      applications: "Applications per program",
      applicationsColumn: "Apps per program",
      fullRanking: "Full ranking",
      year: "Year",
      rank: "Rank"
    },
    systemChart: {
      appsTitle: "Applications per journalism program trend ({from}–{to})",
      appsTitlePriority: "1st/2nd priority applications per journalism program trend ({from}–{to})",
      appsTitleBudget: "Applications per journalism program trend — budget places only ({from}–{to})",
      appsTitleBudgetPriority: "1st/2nd priority applications per journalism program trend — budget places only ({from}–{to})",
      scopeNote: "System-wide data (all institutions in the ranking)"
    },
    methodology: {
      kicker: "About the ranking",
      title: "Methodology",
      bodyHtml: "<article><h3>What we measure</h3><p>For each institution, we aggregate educational programs with the word “journalism” in their name (in any form — “Journalism,” “Economic Journalism,” “Journalism and Media Communications,” etc.) among the competitive offers filed under the Journalism speciality: code 061 in 2021–2024 and its successor C7 from 2025. Bachelor's and master's data are kept separate.</p><p>We show two measures: the average number of submitted applications per such program; and the average competitive score of applicants.</p></article><article><h3>How rankings are calculated</h3><p>An institution often files several educational programs under the Journalism speciality — not just “Journalism” itself, but also, for example, “Public Relations” or “Media Communications.” The ranking only counts programs whose name actually contains “journalis…”: if an institution has none, it doesn't appear in the ranking at all.</p><p>There are two independent sort orders: average applications per such program, and average competitive score. Applications are divided by the number of programs named “journalis…” so that an institution with several such programs doesn't get an unfair edge over one with a single program. The score is a weighted average across those programs, weighted by each one's number of submitted applications.</p><p>An institution enters the table only once the total applications to these programs reaches the level-specific minimum. This limits volatility caused by very small samples.</p></article><article><h3>How to interpret the figures</h3><p>One person may submit several applications to different institutions or programs, so “applications per program” is not a count of unique people. It indicates demand, while the average score describes the competitive profile of its applicants. This is not a ranking of students who ultimately enrolled.</p><p>The ranking does not measure teaching quality, reputation, employment outcomes or program value added, and it does not establish causality.</p></article><article><h3>What do the colors of the numbers mean?</h3><p>Applications-per-program figures are colored relative to the same institution's value the previous year: green means more applications, red means fewer. The default, uncolored text means the figure stayed the same, or this is the institution's first year in the ranking — there's nothing yet to compare it against. The average score is deliberately not colored this way: its scoring formula changed from year to year, so comparing one institution's own score across years directly would be misleading (see “Comparability across years” below).</p></article><article><h3>Comparability across years</h3><p>Historical years use final campaign data. The 2026 figures are a live snapshot while admissions remain open and should be compared with earlier years only after finalisation.</p><p>Score formulas and coefficients (like admission rules, application limits, program structures, study modes, and speciality classifications) changed from year to year. So it's valid to compare the average score across institutions within a single year, but not to compare one institution's own score across different years — the “Average competitive score by year” chart deliberately shows separate bars rather than a continuous line for this reason.</p></article><article><h3>Why do some institutions with no “classic” journalism program appear in the ranking — or vice versa, why are some that seem to train journalists missing?</h3><p>The ranking counts applications to programs named “journalis…” filed under the speciality (code 061 in 2021–2024, C7 from 2025) — both conditions must hold at once. A speciality is a formal EDBO classification, and each institution decides for itself which of its programmes to file under it — the programme's name need not match the speciality's name.</p><p>This creates two opposite situations. An institution may file only differently-named programmes (e.g. “Public Relations,” “Media Communications”) under the Journalism speciality — then none of its programmes pass the filter, and the institution doesn't appear in this ranking at all, even though it formally trains specialists in this speciality. Conversely, a programme actually named “Journalism” may be filed by its institution under a different speciality entirely — in which case it won't appear here either.</p><p>NaUKMA is one example. The bachelor's programme it files under speciality 061/C7 is called “Public Relations” — it doesn't pass the “journalis…” filter, so NaUKMA's bachelor's program isn't in this ranking. At the master's level, the same speciality also includes a separate “Journalism” programme (the Mohyla School of Journalism) — that one is in the ranking.</p><p>For a few programmes whose name doesn't contain “journalis…” but which cover the same digital-media territory in substance, we manually added an exception to include them: “Digital Media” (Taras Shevchenko National University of Kyiv, master's), and “Digital Media Project Production” and “International Media and Digital Communications” (both at Borys Grinchenko Kyiv Metropolitan University, master's).</p></article><article><h3>What does the “Show only 1st and 2nd priority applications” toggle mean?</h3><p>An applicant can submit applications to several institutions and programs at once, and marks a priority on each one — how much it's genuinely their preferred choice rather than a backup. By default the ranking counts all submitted applications regardless of priority, since that reflects overall demand. This toggle narrows the sample to only the applications marked 1st or 2nd priority — the institutions/programs applicants actually wanted most.</p><p>Priority data comes from each competitive offer's ranked list of applicants — the same list that's publicly available on that offer's page on vstup.edbo.gov.ua. The “Applications per program” and “Average score” figures are computed with the same formula as always when the toggle is on — just over a narrower set of applications.</p></article><article><h3>What does the “Budget only” toggle mean?</h3><p>Every EDBO competitive offer has a type: “Відкрита” (Open) — a budget place filled through nationwide open competition; “Фіксована” (Fixed) — a budget place with a pre-set number of seats for that program (this is how all master's budget places were allocated before 2023, when open competition didn't yet exist for master's); or “Небюджетна” (Non-budget) — a paid, contract place. This toggle only removes contract places from the count — both “Open” and “Fixed” places are genuine budget funding, so both are included.</p><p>For master's programs in 2021-2022, the very mechanism of submitting applications with a priority ranking didn't exist yet — so with the “1st/2nd priority only” toggle on, those years' figures stay the same as without the filter, rather than showing zero.</p><p>Both toggles — priority and budget — can be enabled together.</p></article><article><h3>What is the average score?</h3><p>The average score is a weighted score used for admission to the Journalism major in Ukraine. It combines NMT results (Ukrainian language, history of Ukraine or mathematics, foreign language) with Ministry of Education coefficients and the institution's field priorities.</p></article>"
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
    institutionNotes: {
      edbo87: "This institution is being reorganized: admitted students will complete their studies and receive diplomas from the I. P. Kotlyarevsky Kharkiv National University of Arts."
    },
    uni: {
      eyebrow: "Popularity trend · Journalism major",
      bestRank: "Best rank",
      currentRank: "Current rank",
      currentScore: "Current score",
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

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
  if (!isPlainObject(source)) return target;
  Object.keys(source).forEach((key) => {
    if (isPlainObject(source[key]) && isPlainObject(target[key])) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });
  return target;
}

function applySiteContent(content) {
  window.PM_SITE_CONTENT = content || {};
  if (content && isPlainObject(content.i18n)) {
    deepMerge(I18N, content.i18n);
  }
}

function loadJson(url) {
  if (typeof window.fetch === "function") {
    return window.fetch(url, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("site content unavailable");
        return response.json();
      });
  }

  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url + "?v=" + Date.now(), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error("site content unavailable"));
      }
    };
    xhr.onerror = function () { reject(new Error("site content unavailable")); };
    xhr.send();
  });
}

function loadSiteContent() {
  return loadJson("content/site.json")
    .then((content) => {
      applySiteContent(content);
      return content;
    })
    .catch(() => {
      applySiteContent({});
      return window.PM_SITE_CONTENT;
    });
}

function normalizeLang(lang) {
  return lang === "en" ? "en" : "uk";
}

function syncLangFromUrl() {
  try {
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang === "en" || lang === "uk") localStorage.setItem("site-lang", lang);
  } catch (_) {}
}

function getLang() {
  return localStorage.getItem("site-lang") === "en" ? "en" : "uk";
}

function setLang(lang, options = {}) {
  const normalized = normalizeLang(lang);
  localStorage.setItem("site-lang", normalized);

  if (options.updateUrl && window.history && window.history.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", normalized);
    window.history.replaceState({}, "", url.toString());
  }
}

function localeTag() {
  return getLang() === "en" ? "en-US" : "uk-UA";
}

function numFmt() {
  return new Intl.NumberFormat(localeTag());
}

function typographicQuotes(value) {
  const text = String(value ?? "");
  const isUkText = /[А-Яа-яІіЇїЄєҐґ]/.test(text);

  if (isUkText) {
    return text
      .replace(/"Вищий навчальний заклад "([^"]+)"$/g, "«Вищий навчальний заклад “$1”»")
      .replace(/"Університет економіки та права "([^"]+)"$/g, "«Університет економіки та права “$1”»")
      .replace(/"([^"]+)"/g, "«$1»")
      .replace(/"/g, "«");
  }

  let open = true;
  return text.replace(/"/g, () => {
    const quote = open ? "“" : "”";
    open = !open;
    return quote;
  });
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

// Якщо ключа немає у словнику (напр. через розсинхрон кешу — новий HTML
// із старим закешованим i18n.js, або навпаки), лишаємо як є вже написаний
// у HTML фолбек-текст замість того, щоб показати користувачу сирий ключ.
function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = tRaw(el.dataset.i18n);
    if (value != null) el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const value = tRaw(el.dataset.i18nHtml);
    if (value != null) el.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-content]").forEach((el) => {
    const value = tRaw(el.dataset.i18nContent);
    if (value != null) el.setAttribute("content", value);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const value = tRaw(el.dataset.i18nPlaceholder);
    if (value != null) el.setAttribute("placeholder", value);
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
      setLang(btn.dataset.lang, { updateUrl: true });
      document.documentElement.lang = getLang();
      sync();
      applyStaticI18n();
      if (typeof window.onLangChange === "function") window.onLangChange();
    });
  });
  sync();
}

window.siteContentReady = loadSiteContent().then(() => {
  syncLangFromUrl();
  document.documentElement.lang = getLang();
  applyStaticI18n();
  initLangToggle();
  return window.PM_SITE_CONTENT;
});
