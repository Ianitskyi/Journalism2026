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
  },
  crh: {
    nav: {
      promedia: "← ProMedia",
      backToRating: "← Reytingke qaytmaq"
    },
    meta: {
      indexTitle: "Ukraina jurnalistika fakülteleriniñ reytingi. «Jurnalistika»ğa kirüv",
      indexDesc: "Ukraina jurnalistika fakülteleriniñ berilgen arzalar sayısı ve abituriyentlerniñ orta yarış balı boyunca reytingi. EDEBO malümatı.",
      uniTitleSuffix: "Jurnalistika fakülteleri reytingi",
      uniDefaultTitle: "Jurnalistika programmalarınıñ dinamikası — Ukraina jurnalistika fakülteleri reytingi",
      uniDesc: "Jurnalistika fakülteti ya da programmasınıñ populârlik dinamikası: seneler boyunca orta yarış balı ve arzalar sayısı."
    },
    hero: {
      eyebrow: "C7 «Jurnalistika» ihtisası, jurnalistika programmaları",
      title: "Ukraina jurnalistika fakülteleriniñ reytingi",
      lede: "Ali oquv yurtlarınıñ jurnalistika programmalarına berilgen arzalar ve abituriyentlerniñ orta yarış balı boyunca reytingi."
    },
    stats: {
      submitted: "Berilgen arzalar",
      count: "Reytingdeki fakülteler"
    },
    degree: {
      bachelor: "Bakalavr",
      master: "Magistr",
      bachelorLabel: "bakalavr · kündüzki oquv",
      masterLabel: "magistr · kündüzki oquv"
    },
    sort: {
      label: "Sıralamaq",
      score: "Orta bal boyunca",
      applications: "Programmağa arzalar boyunca"
    },
    filter: {
      priorityOnly: "Tek 1 ve 2 ögelik",
      budgetOnly: "Tek byudjet"
    },
    search: {
      placeholder: "Oquv yurtunı tapmaq…"
    },
    year: {
      label: "Kirüv senesi",
      today: "Bugün"
    },
    caption: {
      final: "{year} senesi kirüv kampaniyasınıñ soñki malümatı. Ögelikke baqmadan jurnalistika programmalarına arzalar; eñ az {minApps} arza berilgen oquv yurtları.",
      live: "{date} vaziyetine köre. Ögelikke baqmadan jurnalistika programmalarına arzalar; eñ az {minApps} arza berilgen oquv yurtları.",
      finalPriority: "{year} senesi kirüv kampaniyasınıñ soñki malümatı. Jurnalistika programmalarına tek 1 ve 2 ögelikli arzalar; eñ az {minApps} arza berilgen oquv yurtları.",
      livePriority: "{date} vaziyetine köre. Jurnalistika programmalarına tek 1 ve 2 ögelikli arzalar; eñ az {minApps} arza berilgen oquv yurtları.",
      finalBudget: "{year} senesi kirüv kampaniyasınıñ soñki malümatı. Jurnalistika programmalarında tek byudjet yerleri (kontrakt yerlerisiz); eñ az {minApps} arza berilgen oquv yurtları.",
      liveBudget: "{date} vaziyetine köre. Jurnalistika programmalarında tek byudjet yerleri (kontrakt yerlerisiz); eñ az {minApps} arza berilgen oquv yurtları.",
      finalBudgetPriority: "{year} senesi kirüv kampaniyasınıñ soñki malümatı. Jurnalistika programmalarınıñ byudjet yerlerine (kontrakt yerlerisiz) tek 1 ve 2 ögelikli arzalar; eñ az {minApps} arza berilgen oquv yurtları.",
      liveBudgetPriority: "{date} vaziyetine köre. Jurnalistika programmalarınıñ byudjet yerlerine (kontrakt yerlerisiz) tek 1 ve 2 ögelikli arzalar; eñ az {minApps} arza berilgen oquv yurtları."
    },
    table: {
      institution: "Oquv yurtu",
      score: "Orta bal",
      applications: "Programmağa arzalar",
      applicationsColumn: "Programmağa arzalar",
      fullRanking: "Tolu reyting",
      year: "Sene",
      rank: "Yer"
    },
    systemChart: {
      appsTitle: "Bir jurnalistika programmasına arzalar dinamikası ({from}–{to})",
      appsTitlePriority: "Bir jurnalistika programmasına 1/2 ögelikli arzalar dinamikası ({from}–{to})",
      appsTitleBudget: "Bir jurnalistika programmasına arzalar dinamikası — tek byudjet yerleri ({from}–{to})",
      appsTitleBudgetPriority: "Bir jurnalistika programmasına 1/2 ögelikli arzalar dinamikası — tek byudjet yerleri ({from}–{to})",
      scopeNote: "Bütün sistema boyunca malümat (reytingdeki bütün oquv yurtları)"
    },
    methodology: {
      kicker: "Reyting aqqında",
      title: "Metodologiya",
      bodyHtml: "<article><h3>Neni ölçeymiz</h3><p>Er oquv yurtu içün «Jurnalistika» ihtisası boyunca (2021–2024 senelerinde 061 kodu, 2025 senesinden onıñ varisi C7) berilgen yarış tekliflerinden adında «jurnalistika» sözü olğan tasil programmalarını (er türlü şekilde — «Jurnalistika», «İqtisadiy jurnalistika», «Jurnalistika ve mediya kommunikatsiyaları» ve ilâhre) birleştiremiz. Bakalavr ve magistr malümatı ayrı kösterile.</p><p>İki köstergiç kösteremiz: bir böyle programmağa berilgen arzalarnıñ orta sayısı ve abituriyentlerniñ orta yarış balı.</p></article><article><h3>Reyting nasıl esaplana</h3><p>Oquv yurtu «Jurnalistika» ihtisası boyunca çoqusı bir qaç tasil programmasını bere — tek «Jurnalistika»nı degil, meselâ «Cemiyetnen bağlar» ya da «Mediya kommunikatsiyaları»nı da. Reyting tek adında «jurnalist…» olğan programmalarnı saya: eger oquv yurtunda böyle programma olmasa, o reytingke ümumen kirmey.</p><p>İki mustaqil sıralav bar: böyle bir programmağa orta arzalar sayısı ve orta yarış balı. Arzalar «jurnalist…» adlı programmalar sayısına bölüne, ki bir qaç böyle programması olğan oquv yurtu tek bir programması olğan oquv yurtundan aqsız üstünlik almasın. Bal — bu programmalar boyunca orta tartılğan qıymet, er birine berilgen arzalar sayısı boyunca tartıla.</p><p>Oquv yurtu cedvelge tek bu programmalarğa umumiy arzalar sayısı seviyege köre belgilengen eñ az miqdarğa yetkende kire. Bu pek kiçik saylamlardan kelip çıqqan tebeddüllerni sıñırlay.</p></article><article><h3>Raqamlarnı nasıl añlamalı</h3><p>Bir insan türlü oquv yurtlarına ya da programmalarğa bir qaç arza berip ola, bu sebepten «programmağa arzalar» — yegâne insanlar sayısı degil. Bu talapnı köstere, orta bal ise abituriyentlerniñ yarış profilini tarif ete. Bu soñunda oquvğa kirgen talebeler reytingi degil.</p><p>Reyting oquv keyfiyetini, şöhretni, işke yerleşüvni ya da programmanıñ qoşqan qıymetini ölçemey ve sebep-netice bağını belgilemey.</p></article><article><h3>Raqamlarnıñ reñkleri ne demek?</h3><p>Programmağa arzalar raqamları ayn oquv yurtunıñ keçken senedeki qıymetine köre boyala: yeşil — arzalar daa çoq, qırmızı — daa az. Reñksiz adiy metin raqam deñişmegenini ya da bu oquv yurtunıñ reytingdeki ilk senesi olğanını bildire — şimdilik qıyaslamağa bir şey yoq. Orta bal mahsus olaraq böyle boyalmay: onı esaplav formulası seneden-senege deñişti, bu sebepten bir oquv yurtunıñ öz balını seneler arasında doğrudan qıyaslamaq yañlış olur edi (aşağıda «Seneler arasında qıyaslav» bölügine baqıñız).</p></article><article><h3>Seneler arasında qıyaslav</h3><p>Keçken seneler içün kampaniyanıñ soñki malümatı qullanıla. 2026 senesi raqamları — kirüv kampaniyası devam etkende canlı halı, olarnı evelki seneler ile tek kampaniya bitken soñ qıyaslamalı.</p><p>Bal formulaları ve koeffitsiyentleri (kirüv qaideleri, arzalar sıñırları, programmalar strukturası, oquv şekilleri ve ihtisaslar tasnifi kibi) seneden-senege deñişti. Bu sebepten orta balnı bir sene içinde oquv yurtları arasında qıyaslamaq doğru, amma bir oquv yurtunıñ öz balını türlü seneler arasında qıyaslamaq doğru degil — «Seneler boyunca orta yarış balı» grafigi bu sebepten devamlı sızıq degil, ayrı sütünler köstere.</p></article><article><h3>Nege reytingde «klassik» jurnalistika programması olmağan oquv yurtları bar — ya da aksine, jurnalist azırlağanğa beñzegen bazıları yoq?</h3><p>Reyting ihtisas boyunca (2021–2024 senelerinde 061 kodu, 2025 senesinden C7) berilgen «jurnalist…» adlı programmalarğa arzalarnı saya — eki şart da bir vaqıtta olmalı. İhtisas — EDEBO-nıñ resmiy tasnifi, ve er oquv yurtu öz programmalarından hangisini onıñ altında bermesini özü qarar bere — programmanıñ adı ihtisasnıñ adına uyğun olmağa mecbur degil.</p><p>Bu eki qarşı vaziyet doğura. Oquv yurtu «Jurnalistika» ihtisası altında tek başqa adlı programmalarnı (meselâ, «Cemiyetnen bağlar», «Mediya kommunikatsiyaları») berip ola — o zaman onıñ programmalarından hiç biri süzgüçten keçmey ve oquv yurtu, resmen bu ihtisas boyunca mutehassıslar azırlasa da, bu reytingde ümumen yoq. Aksine, aqiqattan «Jurnalistika» adlı programmanı oquv yurtu bütünley başqa ihtisas altında berip ola — o zaman o da mında körünmey.</p><p>Misal olaraq — «Kiev-Mogila akademiyası» Milliy universiteti. 061/C7 ihtisası altında bergen bakalavr programması «Cemiyetnen bağlar» dep adlana — o «jurnalist…» süzgüçinden keçmey, bu sebepten akademiyanıñ bakalavriatı bu reytingde yoq. Magistr seviyesinde ayn ihtisasta ayrı «Jurnalistika» programması (Mogila jurnalistika mektebi) da bar — o reytingde bar.</p><p>Adında «jurnalist…» olmağan, amma maneviy taraftan ayn sanal mediya saasını qaplağan bir qaç programma içün qolnen istisna qoştıq: «Sanal mediya» (Taras Şevçenko adına Kiev milliy universiteti, magistratura), ve «Sanal mediya loyihalarını yaratuv» ile «Halqara mediya ve sanal kommunikatsiyalar» (ekisi de Borıs Grinçenko adına Kiev metropolitan universiteti, magistratura).</p></article><article><h3>«Tek 1 ve 2 ögelikli arzalarnı köstermek» deñiştirgiçi ne demek?</h3><p>Abituriyent bir vaqıtta bir qaç oquv yurtuna ve programmağa arza berip ola ve er birinde ögelikni belgiley — bu onıñ aqiqiy istegen saylavımı ya da yedek variantmı. Adeten reyting ögelikke baqmadan bütün berilgen arzalarnı saya, çünki bu umumiy talapnı köstere. Bu deñiştirgiç saylamnı tek 1 ya da 2 ögelikli arzalarğa qadar tarlay — abituriyentler eñ ziyade istegen oquv yurtları/programmalar.</p><p>Ögelik malümatı er yarış teklifiniñ abituriyentler reyting cedvelinden alına — vstup.edbo.gov.ua saytında ayn teklif saifesinde açıq olğan ayn cedvel. Deñiştirgiç açıq olğanda «Programmağa arzalar» ve «Orta bal» köstergiçleri ayn formula ile esaplana — tek daa tar arzalar toplumı boyunca.</p></article><article><h3>«Tek byudjet» deñiştirgiçi ne demek?</h3><p>EDEBO-nıñ er yarış teklifiniñ türü bar: «Açıq» — umummilliy açıq yarış vastasınen toldurılğan byudjet yeri; «Fiksirlengen» — programma içün evelden belgilengen yerler sayısı olğan byudjet yeri (2023 senesine qadar, magistratura içün açıq yarış daa olmağanda, bütün magistr byudjet yerleri böyle bölüngen edi); ya da «Byudjetsiz» — paralı, kontrakt yeri. Bu deñiştirgiç sayımdan tek kontrakt yerlerini çıqara — «Açıq» ve «Fiksirlengen» yerler ekisi de aqiqiy byudjet finanslaşuvı, bu sebepten ekisi de esapqa alına.</p><p>2021–2022 senelerindeki magistr programmaları içün ögelik belgilep arza berüv mehanizmi ümumen daa yoq edi — bu sebepten «Tek 1/2 ögelik» deñiştirgiçi açıq olğanda bu seneler raqamları süzgüçsiz kibi qala, sıfır kösterilmey.</p><p>Eki deñiştirgiç — ögelik ve byudjet — beraber açılıp olur.</p></article><article><h3>Orta bal nedir?</h3><p>Orta bal — Ukrainada «Jurnalistika» ihtisasına kirüvde qullanılğan tartılğan baldır. O MMT neticelerini (ukrain tili, Ukraina tarihı ya da matematika, ecnebiy til) Tasil nazirliginiñ koeffitsiyentleri ve oquv yurtunıñ saa ögelikleri ile birleştire.</p></article>"
    },
    empty: {
      noDataDay: "Bu kün içün malümat yoq.",
      uniNotFound: "Bu oquv yurtu tapılmadı.",
      backToRating: "Reytingke qaytmaq →",
      outOfRanking: "reytingden tış (arzalar eñ az miqdardan az)"
    },
    showAll: {
      expand: "Bütün {n} oquv yurtunı köstermek →",
      collapse: "Bükmek ↑"
    },
    legend: {
      title: "Δ nasıl oqumalı",
      up: "bir künde 2 yerge yükseldi",
      down: "1 yerge tüşti",
      new: "bugünki reytingde ilk kere"
    },
    footer: {
      initiative: "Tesebbüs",
      dataSourceHtml: "Malümat menbası: EDEBO (<a href=\"https://vstup.edbo.gov.ua\" target=\"_blank\" rel=\"noopener\">vstup.edbo.gov.ua</a>)."
    },
    institutionNotes: {
      edbo87: "Bu oquv yurtu yañıdan teşkil etile: qabul etilgen talebeler oquvnı İ. P. Kotlârevskiy adına Harkiv milliy sanat universitetinde bitirip, diplomnı anda alacaqlar."
    },
    uni: {
      eyebrow: "Populârlik dinamikası · «Jurnalistika» ihtisası",
      bestRank: "Eñ yahşı yer",
      currentRank: "Şimdiki yer",
      currentScore: "Şimdiki bal",
      chartTitle: "Seneler boyunca orta yarış balı",
      scoreChartDisclaimer: "Bal formulası seneden-senege deñişti — oquv yurtlarını bir sene içinde qıyaslañız, bir oquv yurtunıñ öz balını türlü seneler arasında degil.",
      appsChartTitle: "Seneler boyunca bir jurnalistika programmasına orta arzalar",
      compareLabel: "Qıyaslamaq",
      compareLabel2: "Ve daa",
      compareNone: "— qıyaslamamaq —",
      compareVs: "{a} — {b}",
      compareVsMulti: "{a} — {b} ve {c}",
      addCompare: "+ Daa bir qıyaslav qoşmaq",
      removeCompare: "− Ekinci qıyaslavnı çıqarmaq",
      subtitlePlain: "abituriyentlerniñ orta yarış balı",
      appsSubtitlePlain: "bir jurnalistika programmasına orta arzalar",
      admittedAverage: "Orta bal",
      rankingByYear: "Seneler boyunca reyting",
      noChartData: "Grafik qurmaq içün malümat yoq.",
      chartAriaLabel: "Seneler boyunca orta yarış balı",
      metricRank: "Yer ({year})",
      analysis: {
        appsUp: "Programmağa orta arzalar sayısı {pct}% arttı — {fromVal}-dan {toVal}-ğa qadar.",
        appsDown: "Programmağa orta arzalar sayısı {pct}% azaldı — {fromVal}-dan {toVal}-ğa qadar.",
        appsFlat: "Programmağa orta arzalar sayısı taqriben deñişmedi (~{value}).",
        rankBetter: "Diger oquv yurtlarına köre reytingdeki yeri yahşılaştı — #{from}-dan #{to}-ğa qadar.",
        rankWorse: "Diger oquv yurtlarına köre reytingdeki yeri fenalaştı — #{from}-dan #{to}-ğa qadar.",
        rankSame: "Diger oquv yurtlarına köre reytingdeki yeri deñişmedi — #{value}.",
        insufficientData: "Dinamikanı analiz etmek içün keçmiş malümat yeterli degil."
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
  const root = document.body && document.body.dataset.root ? document.body.dataset.root : "";
  return loadJson(`${root}content/site.json`)
    .then((content) => {
      applySiteContent(content);
      return content;
    })
    .catch(() => {
      applySiteContent({});
      return window.PM_SITE_CONTENT;
    });
}

const SUPPORTED_LANGS = ["uk", "en", "crh"];

function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : "uk";
}

// Адреси сайтів мережі ПроМедіа для кожної мови; promedia.report не має
// crh-версії, тож отримує українську адресу.
const NETWORK_URLS = {
  home: { uk: "https://promedia.report", en: "https://promedia.report/en", crh: "https://promedia.report" },
  news: { uk: "https://news.promedia.report/", en: "https://news.promedia.report/?lang=en", crh: "https://news.promedia.report/?lang=crh" },
  communities: { uk: "https://communities.promedia.report/", en: "https://communities.promedia.report/en/", crh: "https://communities.promedia.report/crh/" },
  research: { uk: "https://research.promedia.report/", en: "https://research.promedia.report/en/", crh: "https://research.promedia.report/crh/" },
  atlas: { uk: "https://atlas.promedia.report/", en: "https://atlas.promedia.report/en/", crh: "https://atlas.promedia.report/crh/" }
};
const NETWORK_ARIA = { uk: "Проєкти ПроМедіа", en: "ProMedia projects", crh: "ProMedia loyihaları" };

function syncLangFromUrl() {
  try {
    const pathLang = window.location.pathname.match(/^\/(en|crh)(?:\/|$)/);
    if (pathLang) {
      localStorage.setItem("site-lang", pathLang[1]);
      return;
    }
    const lang = new URLSearchParams(window.location.search).get("lang");
    // Сторінки без мовного префікса — українські: інакше після відвідин
    // /en/ чи /crh/ збережена мова перемальовувала б українську адресу.
    localStorage.setItem("site-lang", SUPPORTED_LANGS.includes(lang) ? lang : "uk");
  } catch (_) {}
}

function getLang() {
  return normalizeLang(localStorage.getItem("site-lang"));
}

function setLang(lang, options = {}) {
  const normalized = normalizeLang(lang);
  localStorage.setItem("site-lang", normalized);

  if (options.updateUrl && window.history && window.history.replaceState) {
    const url = new URL(window.location.href);
    const path = url.pathname.replace(/^\/(en|crh)(?=\/|$)/, "") || "/";
    url.pathname = normalized === "uk" ? path : `/${normalized}${path}`;
    url.searchParams.delete("lang");
    window.location.assign(url.toString());
  }
}

// Латинська транслітерація українських назв (як у каталозі спільнот) — для
// кримськотатарської версії, що пишеться латинкою: офіційні назви ЗВО
// лишаються українськими, але читаються латиницею.
const UK_LATIN = {
  "А": "A", "Б": "B", "В": "V", "Г": "H", "Ґ": "G", "Д": "D", "Е": "E", "Є": "Ye",
  "Ж": "Zh", "З": "Z", "И": "Y", "І": "I", "Ї": "Yi", "Й": "Y", "К": "K", "Л": "L",
  "М": "M", "Н": "N", "О": "O", "П": "P", "Р": "R", "С": "S", "Т": "T", "У": "U",
  "Ф": "F", "Х": "Kh", "Ц": "Ts", "Ч": "Ch", "Ш": "Sh", "Щ": "Shch", "Ь": "",
  "Ю": "Yu", "Я": "Ya",
  "а": "a", "б": "b", "в": "v", "г": "h", "ґ": "g", "д": "d", "е": "e", "є": "ie",
  "ж": "zh", "з": "z", "и": "y", "і": "i", "ї": "i", "й": "i", "к": "k", "л": "l",
  "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
  "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ь": "",
  "ю": "iu", "я": "ia", "'": "", "’": "", "ʼ": ""
};

function transliterateUk(value) {
  return String(value || "").replace(/[А-ЩЬЮЯҐЄІЇа-щьюяґєії'’ʼ]/g, (ch) => (ch in UK_LATIN ? UK_LATIN[ch] : ch));
}

// Назва закладу мовою сторінки: en — англійська (якщо є), crh — латинська
// транслітерація української, uk — як є.
function localizedUniName(name, nameEn) {
  const lang = getLang();
  if (lang === "en") return nameEn || name;
  if (lang === "crh") return transliterateUk(name);
  return name;
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

function lookup(dict, key) {
  return key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : undefined), dict);
}

// Ключі, яких немає в crh-словнику, беруться з української.
function tRaw(key) {
  const value = lookup(I18N[getLang()], key);
  return value != null ? value : lookup(I18N.uk, key);
}

// Посилання мережі ПроМедіа (data-network="news|communities|research|atlas")
// і «← ПроМедіа» ведуть на версію сусіднього сайту тією самою мовою.
function syncNetworkLinks() {
  const lang = getLang();
  document.querySelectorAll("a[data-network]").forEach((a) => {
    const urls = NETWORK_URLS[a.dataset.network];
    if (urls) a.setAttribute("href", urls[lang] || urls.uk);
  });
  document.querySelectorAll("a.home-btn").forEach((a) => a.setAttribute("href", NETWORK_URLS.home[lang]));
  document.querySelectorAll("nav.network-nav, nav.network-footer").forEach((nav) => nav.setAttribute("aria-label", NETWORK_ARIA[lang]));
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
  syncNetworkLinks();
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
