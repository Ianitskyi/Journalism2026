const state = {
  degree: "bachelor",
  sortBy: "score", // "score" | "applications"
  year: DB.currentYear,
  dateIndex: DB.byYear[DB.currentYear].dates.length - 1,
  expanded: false
};

function uniName(row) {
  return getLang() === "en" ? (row.nameEn || row.name) : row.name;
}

function uniShort(row) {
  return getLang() === "en" ? (row.shortEn || row.short) : row.short;
}

/* середній бал закладу за 2021 рік (підсумковий знімок) — база для
   стовпця "Зміна балу з 2021" у таблиці; null, якщо закладу тоді не було
   в рейтингу цього рівня */
function scoreIn2021(id, degree) {
  const yd = DB.byYear[2021];
  if (!yd) return null;
  const snap = yd.snapshots[yd.dates[yd.dates.length - 1]];
  const row = (snap[degree] || []).find((r) => r.id === id);
  return row ? row.score : null;
}

/* заклади освіти, що є в реєстрі (хоч раз траплялись у будь-якому році),
   але відсутні цього року в rows — додаються в кінець списку з
   порожніми даними, відсортовані за назвою */
function placeholderRows(rows, degree) {
  const present = new Set(rows.map((r) => r.id));
  const missing = [...DB.allUniversities(degree).values()].filter((u) => !present.has(u.id));
  return missing
    .map((u) => ({ ...u, score: null, applications: null, admitted: null, rank: null }))
    .sort((a, b) => uniName(a).localeCompare(uniName(b), getLang() === "en" ? "en" : "uk"));
}

/* повертає новий масив, відсортований і проранжований за обраним
   критерієм — сирі дані завжди зберігають ранг за балом, тож для
   сортування за кількістю заяв ранги рахуємо наново */
function sortedRows(rawRows, sortBy) {
  return [...rawRows]
    .sort((a, b) => b[sortBy] - a[sortBy])
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

function fmtDateUA(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(localeTag(), { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

function fmtDateShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(localeTag(), { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

function activeYearData() {
  return DB.byYear[state.year];
}

function snapshotAt(index) {
  const yearData = activeYearData();
  return yearData.snapshots[yearData.dates[index]];
}

function currentSnapshot() {
  return snapshotAt(state.dateIndex);
}

function renderStats(snap, rows) {
  document.getElementById("stat-submitted").textContent =
    numFmt().format(snap.totalApplications[state.degree] || 0);
  document.getElementById("stat-admitted").textContent =
    numFmt().format(snap.totalAdmitted?.[state.degree] ?? rows.reduce((sum, row) => sum + (row.admitted || 0), 0));
  document.getElementById("stat-count").textContent = rows.length;
}

function renderYearChips() {
  const wrap = document.getElementById("year-chips");
  wrap.innerHTML = "";
  DB.years.forEach((year) => {
    const btn = document.createElement("button");
    btn.className = "year-chip" + (year === state.year ? " active" : "");
    btn.textContent = String(year);
    btn.addEventListener("click", () => {
      if (state.year === year) return;
      state.year = year;
      state.dateIndex = DB.byYear[year].dates.length - 1;
      state.expanded = false;
      render();
    });
    wrap.appendChild(btn);
  });
}

function renderDateChips() {
  const wrap = document.getElementById("date-chips");
  const yearData = activeYearData();
  wrap.innerHTML = "";

  if (yearData.dates.length <= 1) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "flex";

  yearData.dates.forEach((date, i) => {
    const btn = document.createElement("button");
    btn.className = "date-chip" + (i === state.dateIndex ? " active" : "");
    btn.textContent = i === yearData.dates.length - 1 ? t("year.today") : fmtDateShort(date);
    btn.addEventListener("click", () => {
      state.dateIndex = i;
      render();
    });
    wrap.appendChild(btn);
  });
  const active = wrap.querySelector(".date-chip.active");
  if (active) {
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    if (left < wrap.scrollLeft) {
      wrap.scrollLeft = left - 8;
    } else if (right > wrap.scrollLeft + wrap.clientWidth) {
      wrap.scrollLeft = right - wrap.clientWidth + 8;
    }
  }
}

/* ---------- діаграми динаміки по системі в цілому (усі роки) ---------- */

/* останній знімок конкретного року — для минулих років це єдиний
   підсумковий знімок, для поточного (2026) — найсвіжіший оперативний
   зріз, доки кампанія не завершена (деталі — у методології) */
function yearSnapshot(year) {
  const yd = DB.byYear[year];
  return yd.snapshots[yd.dates[yd.dates.length - 1]];
}

/* сумарна кількість заяв і зважений середній бал (вага — кількість
   допущених) по всій системі за рік і рівень, за всі роки, що є в DB */
function systemWideTrend(degree) {
  return DB.years.map((year) => {
    const snap = yearSnapshot(year);
    const rows = snap[degree] || [];
    const applications = snap.totalApplications?.[degree] ?? rows.reduce((s, r) => s + r.applications, 0);
    const admitted = snap.totalAdmitted?.[degree] ?? rows.reduce((s, r) => s + (r.admitted || 0), 0);
    const weightedScoreSum = rows.reduce((s, r) => s + r.score * (r.admitted || 0), 0);
    const avgScore = admitted > 0 ? weightedScoreSum / admitted : null;
    return { year, applications, avgScore };
  });
}

/* дволінійний SVG-графік (бакалавр/магістр) по роках для однієї метрики */
function buildSystemChartSVG(bachelorSeries, masterSeries, valueKey) {
  const values = [...bachelorSeries, ...masterSeries].map((d) => d[valueKey]).filter((v) => v != null);
  if (!values.length) return `<div class="chart-empty">${t("empty.noDataDay")}</div>`;

  const w = 640, h = 220, padL = 44, padR = 12, padT = 16, padB = 30;
  const min = Math.min(...values), max = Math.max(...values);
  const range = Math.max(1, max - min);
  const yMin = min - range * 0.1, yMax = max + range * 0.1;
  const years = DB.years;
  const n = years.length;
  const xFor = (i) => padL + (n === 1 ? 0.5 : i / (n - 1)) * (w - padL - padR);
  const yFor = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);
  const baselineY = h - padB;

  function pathFor(series) {
    let d = "";
    let started = false;
    series.forEach((point, i) => {
      const v = point[valueKey];
      if (v == null) { started = false; return; }
      d += `${started ? "L" : "M"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)} `;
      started = true;
    });
    return d.trim();
  }

  function dotsFor(series, cls, label) {
    return series.map((point, i) => {
      const v = point[valueKey];
      if (v == null) return "";
      const cx = xFor(i).toFixed(1), cy = yFor(v).toFixed(1);
      const formatted = valueKey === "applications" ? numFmt().format(Math.round(v)) : v.toFixed(1);
      return `<circle class="${cls}" cx="${cx}" cy="${cy}" r="4"><title>${label} · ${point.year}: ${formatted}</title></circle>`;
    }).join("");
  }

  const labels = years.map((y, i) =>
    `<text class="chart-axis-label" x="${xFor(i).toFixed(1)}" y="${h - 8}" text-anchor="middle">${y}</text>`
  ).join("");

  const baseline = `<line class="chart-baseline" x1="${padL}" y1="${baselineY}" x2="${w - padR}" y2="${baselineY}" />`;
  const bachelorLabel = t("degree.bachelor");
  const masterLabel = t("degree.master");

  return `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg" role="img">
      ${baseline}
      <path class="chart-line chart-line-all" d="${pathFor(bachelorSeries)}" fill="none" />
      <path class="chart-line chart-line-compare" d="${pathFor(masterSeries)}" fill="none" />
      ${dotsFor(bachelorSeries, "chart-dot-all", bachelorLabel)}
      ${dotsFor(masterSeries, "chart-dot-compare", masterLabel)}
      ${labels}
    </svg>
  `;
}

function renderSystemChartLegend(containerId) {
  document.getElementById(containerId).innerHTML = `
    <span class="chart-legend-item" style="color:var(--accent-dark)"><span class="chart-legend-swatch" style="background:var(--accent-dark)"></span>${t("degree.bachelor")}</span>
    <span class="chart-legend-item" style="color:var(--ink-soft)"><span class="chart-legend-swatch" style="background:var(--ink-soft)"></span>${t("degree.master")}</span>
  `;
}

function renderSystemCharts() {
  const bachelorApps = systemWideTrend("bachelor");
  const masterApps = systemWideTrend("master");
  const yearVars = { from: DB.years[0], to: DB.years[DB.years.length - 1] };

  document.getElementById("system-chart-apps-title").textContent = t("systemChart.appsTitle", yearVars);
  document.getElementById("system-chart-apps").innerHTML = buildSystemChartSVG(bachelorApps, masterApps, "applications");
  renderSystemChartLegend("system-chart-apps-legend");

  document.getElementById("system-chart-score-title").textContent = t("systemChart.scoreTitle", yearVars);
  document.getElementById("system-chart-score").innerHTML = buildSystemChartSVG(bachelorApps, masterApps, "avgScore");
  renderSystemChartLegend("system-chart-score-legend");
}

function render() {
  const yearData = activeYearData();
  const snap = currentSnapshot();
  const rawRows = snap[state.degree];
  const rows = sortedRows(rawRows, state.sortBy);
  const displayRows = [...rows, ...placeholderRows(rows, state.degree)];
  const isFinal = state.year !== DB.currentYear;
  const minApps = DB.minApplications[state.degree];

  document.getElementById("caption").textContent = isFinal
    ? t("caption.final", { year: state.year, minApps })
    : t("caption.live", { date: fmtDateUA(snap.date), minApps });

  document.getElementById("card-subtitle").textContent =
    `${t(state.degree === "bachelor" ? "degree.bachelorLabel" : "degree.masterLabel")} · ${state.year}`;

  document.getElementById("th-score").classList.toggle("sort-active", state.sortBy === "score");
  document.getElementById("th-apps").classList.toggle("sort-active", state.sortBy === "applications");

  renderStats(snap, rows);

  const VISIBLE_ROWS = 10;
  const tbody = document.getElementById("rank-body");
  tbody.innerHTML = "";

  if (!displayRows.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">${t("empty.noDataDay")}</div></td></tr>`;
  } else {
    const visible = state.expanded ? displayRows : displayRows.slice(0, VISIBLE_ROWS);
    for (const r of visible) {
      const baseline2021 = r.score != null ? scoreIn2021(r.id, state.degree) : null;
      const trendDiff = baseline2021 != null ? Math.round((r.score - baseline2021) * 10) / 10 : null;
      const trendHtml = trendDiff == null
        ? "—"
        : `${trendDiff > 0 ? "+" : ""}${trendDiff.toFixed(1)}`;
      const trendClass = trendDiff == null ? "" : trendDiff > 0 ? "trend-up" : trendDiff < 0 ? "trend-down" : "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><div class="rank">${r.rank || "—"}</div></td>
        <td>
          <a class="univ-cell" href="university.html?id=${encodeURIComponent(r.id)}">
            <div class="univ-logo" style="background:hsl(${r.hue} 62% 46%)">${uniShort(r).slice(0, 2).toUpperCase()}</div>
            <div class="univ-name">${uniName(r)}</div>
          </a>
        </td>
        <td class="num"><div class="score">${r.score != null ? r.score.toFixed(1) : "—"}</div></td>
        <td class="num"><div class="applications">${r.applications != null ? numFmt().format(r.applications) : "—"}</div></td>
        <td class="num"><div class="applications">${r.admitted != null ? numFmt().format(r.admitted) : "—"}</div></td>
        <td class="num"><div class="${trendClass}">${trendHtml}</div></td>
      `;
      tbody.appendChild(tr);
    }
  }

  const showAllBtn = document.getElementById("show-all");
  if (displayRows.length > VISIBLE_ROWS) {
    showAllBtn.style.display = "block";
    showAllBtn.textContent = state.expanded
      ? t("showAll.collapse")
      : t("showAll.expand", { n: displayRows.length });
  } else {
    showAllBtn.style.display = "none";
  }

  renderYearChips();
  renderDateChips();
}

/* позиціонує повзунок-індикатор по фактичних пікселях активної кнопки —
   ширини вкладок нерівні між мовами (напр. "Bachelor's" довше за
   "Бакалавр"), тож фіксовані 50%/translateX тут не підходять */
function syncIndicator(indicator, activeBtn) {
  if (!indicator || !activeBtn) return;
  indicator.style.left = `${activeBtn.offsetLeft}px`;
  indicator.style.width = `${activeBtn.offsetWidth}px`;
}

function initTabs() {
  const indicator = document.getElementById("tabs-indicator");
  const buttons = [...document.querySelectorAll("[data-degree]")];
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.degree = btn.dataset.degree;
      state.expanded = false;
      buttons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      syncIndicator(indicator, btn);
      render();
    });
  });
  syncIndicator(indicator, buttons.find((b) => b.classList.contains("active")));
}

function initSortTabs() {
  const indicator = document.getElementById("sort-tabs-indicator");
  const buttons = [...document.querySelectorAll("[data-sort]")];
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.sortBy = btn.dataset.sort;
      buttons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      syncIndicator(indicator, btn);
      render();
    });
  });
  syncIndicator(indicator, buttons.find((b) => b.classList.contains("active")));
}

function resyncIndicators() {
  syncIndicator(document.getElementById("tabs-indicator"), document.querySelector("#tabs .pill.active"));
  syncIndicator(document.getElementById("sort-tabs-indicator"), document.querySelector("#sort-tabs .pill.active"));
}

function initShowAll() {
  document.getElementById("show-all").addEventListener("click", () => {
    state.expanded = !state.expanded;
    render();
  });
}

/* пошук закладу освіти на головній: datalist з усіма відомими назвами
   (обидва рівні, усі роки) — вибір зі списку чи Enter на точному
   збігу назви переходить на сторінку закладу */
function renderUniSearchOptions() {
  const datalist = document.getElementById("uni-search-list");
  if (!datalist) return;
  const lang = getLang();
  const items = [...DB.allUniversitiesMeta().values()]
    .map((u) => ({ id: u.id, name: lang === "en" ? (u.nameEn || u.name) : u.name }))
    .sort((a, b) => a.name.localeCompare(b.name, lang === "en" ? "en" : "uk"));
  datalist.innerHTML = items.map((it) => `<option value="${it.name.replace(/"/g, "&quot;")}"></option>`).join("");
}

function initUniSearch() {
  const input = document.getElementById("uni-search");
  if (!input) return;

  function go() {
    const value = input.value.trim().toLowerCase();
    if (!value) return;
    const lang = getLang();
    const match = [...DB.allUniversitiesMeta().values()].find((u) => {
      const name = lang === "en" ? (u.nameEn || u.name) : u.name;
      return name.toLowerCase() === value;
    });
    if (match) location.href = `university.html?id=${encodeURIComponent(match.id)}`;
  }

  input.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  input.addEventListener("change", go);
}

initTabs();
initSortTabs();
initShowAll();
initUniSearch();
window.onLangChange = () => { render(); resyncIndicators(); renderSystemCharts(); renderUniSearchOptions(); };
window.addEventListener("edbo-data-updated", () => { render(); resyncIndicators(); renderSystemCharts(); renderUniSearchOptions(); });
render();
renderUniSearchOptions();
renderSystemCharts();
