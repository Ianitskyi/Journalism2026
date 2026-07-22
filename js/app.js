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

function fmtDateFull(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(localeTag(), { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

function fmtDateShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(localeTag(), { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

function fmtTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString(localeTag(), { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Kyiv" });
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
  const topScore = rows.length ? Math.max(...rows.map((r) => r.score)) : null;
  document.getElementById("stat-topscore").textContent = topScore != null ? topScore.toFixed(1) : "—";

}

function renderYearChips() {
  const wrap = document.getElementById("year-chips");
  wrap.innerHTML = "";
  DB.years.forEach((year) => {
    const btn = document.createElement("button");
    btn.className = "year-chip" + (year === state.year ? " active" : "");
    btn.textContent = year === DB.currentYear ? t("year.current", { year }) : String(year);
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

function renderPodium(rows) {
  const podium = document.getElementById("podium");
  podium.innerHTML = "";
  if (!rows.length) return;
  const top3 = rows.slice(0, 3);
  for (const r of top3) {
    const card = document.createElement("a");
    card.href = `university.html?id=${encodeURIComponent(r.id)}`;
    card.className = `podium-card rank-${r.rank}`;
    card.innerHTML = `
      <div class="podium-medal">${r.rank}</div>
      <div class="podium-logo" style="background:hsl(${r.hue} 62% 46%)">${uniShort(r).slice(0, 2).toUpperCase()}</div>
      <div class="podium-name">${uniName(r)}</div>
      <div class="podium-score">${r.score.toFixed(1)}</div>
      <div class="podium-apps">${numFmt().format(r.applications)} ${t("unit.submitted")} · ${numFmt().format(r.admitted || 0)} ${t("unit.admitted")}</div>
    `;
    podium.appendChild(card);
  }
}

/* ---------- діаграми топ-10 ---------- */

function renderBarChart(rawRows) {
  const top = [...rawRows].sort((a, b) => b.score - a.score).slice(0, 10);
  const max = top.length ? top[0].score : 1;
  document.getElementById("chart-bar").innerHTML = top.map((r) => `
    <div class="bar-row">
      <span class="bar-label">${uniShort(r)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, (r.score / max) * 100).toFixed(1)}%; background:hsl(${r.hue} 62% 46%)"></div></div>
      <span class="bar-value">${r.score.toFixed(1)}</span>
    </div>
  `).join("");
}

function renderBubbleChart(rawRows) {
  const top = [...rawRows].sort((a, b) => b.applications - a.applications).slice(0, 10);
  const max = top.length ? top[0].applications : 1;
  const minD = 56, maxD = 148;
  document.getElementById("chart-bubble").innerHTML = top.map((r) => {
    const d = minD + (maxD - minD) * Math.sqrt(r.applications / max);
    return `
      <div class="bubble" style="width:${d.toFixed(0)}px; height:${d.toFixed(0)}px; background:hsl(${r.hue} 62% 46%)" title="${uniShort(r)}: ${numFmt().format(r.applications)}">
        <span class="bubble-label">${uniShort(r)}</span>
        <span class="bubble-value">${numFmt().format(r.applications)}</span>
      </div>
    `;
  }).join("");
}

/* останній (актуальний) знімок конкретного року — для 2026 це найновіший
   день кампанії, для минулих років — єдиний підсумковий знімок */
function yearSnapshot(year) {
  const yd = DB.byYear[year];
  return yd.snapshots[yd.dates[yd.dates.length - 1]];
}

function buildUniTrend(id, degree) {
  return DB.years.map((year) => {
    const snap = yearSnapshot(year);
    const row = (snap[degree] || []).find((r) => r.id === id) || null;
    return { year, row };
  });
}

/* multi-series SVG-графік: по одній лінії (і опційно площі під нею) на
   заклад освіти з top10; area:true рахує yMin від 0 і додає заливку під
   лінією — для метрики "кількість заяв", де важлива саме площа */
function buildMultiSeriesSVG(top10, degree, metricKey, area) {
  const seriesData = top10.map((u) => ({ id: u.id, short: uniShort(u), hue: u.hue, trend: buildUniTrend(u.id, degree) }));

  const values = [];
  seriesData.forEach((s) => s.trend.forEach((x) => { if (x.row) values.push(x.row[metricKey]); }));
  if (!values.length) return `<div class="chart-empty">${t("empty.noDataDay")}</div>`;

  const w = 720, h = 260, padL = 40, padR = 16, padT = 16, padB = 30;
  const min = Math.min(...values), max = Math.max(...values);
  const range = Math.max(1, max - min);
  const yMin = area ? 0 : min - range * 0.1;
  const yMax = max + range * 0.1;
  const years = DB.years;
  const n = years.length;
  const xFor = (i) => padL + (n === 1 ? 0.5 : i / (n - 1)) * (w - padL - padR);
  const yFor = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);
  const baselineY = h - padB;

  function pathFor(trend) {
    let d = "";
    let started = false;
    trend.forEach((x, i) => {
      const v = x.row ? x.row[metricKey] : null;
      if (v == null) { started = false; return; }
      d += `${started ? "L" : "M"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)} `;
      started = true;
    });
    return d.trim();
  }

  function areaPathFor(trend) {
    const pts = [];
    trend.forEach((x, i) => { const v = x.row ? x.row[metricKey] : null; if (v != null) pts.push([xFor(i), yFor(v)]); });
    if (pts.length < 2) return "";
    let d = `M${pts[0][0].toFixed(1)},${baselineY.toFixed(1)} `;
    pts.forEach(([x, y]) => { d += `L${x.toFixed(1)},${y.toFixed(1)} `; });
    d += `L${pts[pts.length - 1][0].toFixed(1)},${baselineY.toFixed(1)} Z`;
    return d;
  }

  const labels = years.map((y, i) =>
    `<text class="chart-axis-label" x="${xFor(i).toFixed(1)}" y="${h - 8}" text-anchor="middle">${y}</text>`
  ).join("");

  const baseline = `<line class="chart-baseline" x1="${padL}" y1="${baselineY.toFixed(1)}" x2="${w - padR}" y2="${baselineY.toFixed(1)}" />`;

  const areas = !area ? "" : seriesData.map((s) => {
    const d = areaPathFor(s.trend);
    return d ? `<path d="${d}" fill="hsl(${s.hue} 65% 55%)" opacity="0.14" stroke="none" />` : "";
  }).join("");

  const paths = seriesData.map((s) => {
    const d = pathFor(s.trend);
    return d ? `<path class="chart-line" d="${d}" fill="none" stroke="hsl(${s.hue} 62% 46%)" />` : "";
  }).join("");

  const dots = seriesData.map((s) => s.trend.map((x, i) => {
    if (!x.row) return "";
    const v = x.row[metricKey];
    const cx = xFor(i).toFixed(1), cy = yFor(v).toFixed(1);
    const label = `${s.short} · ${x.year}: ${numFmt().format(v)}`;
    return `<circle cx="${cx}" cy="${cy}" r="3" fill="hsl(${s.hue} 62% 46%)"><title>${label}</title></circle>`;
  }).join("")).join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg" role="img">
      ${baseline}
      ${areas}
      ${paths}
      ${dots}
      ${labels}
    </svg>
  `;
}

function renderChartLegend(containerId, top10) {
  document.getElementById(containerId).innerHTML = top10.map((u) => `
    <span class="chart-legend-item" style="color:hsl(${u.hue} 62% 40%)">
      <span class="chart-legend-swatch" style="background:hsl(${u.hue} 62% 46%)"></span>${uniShort(u)}
    </span>
  `).join("");
}

function renderCharts(rawRows) {
  const byScore = [...rawRows].sort((a, b) => b.score - a.score).slice(0, 10);
  const byApps = [...rawRows].sort((a, b) => b.applications - a.applications).slice(0, 10);

  renderBarChart(rawRows);
  renderBubbleChart(rawRows);

  document.getElementById("chart-line").innerHTML = buildMultiSeriesSVG(byScore, state.degree, "score", false);
  renderChartLegend("chart-line-legend", byScore);

  document.getElementById("chart-area").innerHTML = buildMultiSeriesSVG(byApps, state.degree, "applications", true);
  renderChartLegend("chart-area-legend", byApps);
}

function render() {
  const yearData = activeYearData();
  const snap = currentSnapshot();
  const rawRows = snap[state.degree];
  const rows = sortedRows(rawRows, state.sortBy);
  const isFinal = state.year !== DB.currentYear;
  const minApps = DB.minApplications[state.degree];

  document.getElementById("asof-date").textContent = `${fmtDateFull(snap.date)}, ${fmtTime(snap.asOf)}`;

  document.getElementById("caption").textContent = isFinal
    ? t("caption.final", { year: state.year, minApps })
    : t("caption.live", { date: fmtDateUA(snap.date), minApps });

  document.getElementById("card-subtitle").textContent =
    t(state.degree === "bachelor" ? "degree.bachelorLabel" : "degree.masterLabel");

  document.getElementById("th-score").classList.toggle("sort-active", state.sortBy === "score");
  document.getElementById("th-apps").classList.toggle("sort-active", state.sortBy === "applications");

  renderStats(snap, rows);
  renderPodium(rows);
  renderCharts(rawRows);

  const rest = rows.slice(3);
  const tbody = document.getElementById("rank-body");
  tbody.innerHTML = "";

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">${t("empty.noDataDay")}</div></td></tr>`;
  } else if (!rest.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">${t("empty.allShown")}</div></td></tr>`;
  } else {
    const visible = state.expanded ? rest : rest.slice(0, 7);
    for (const r of visible) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><div class="rank">${r.rank}</div></td>
        <td>
          <a class="univ-cell" href="university.html?id=${encodeURIComponent(r.id)}">
            <div class="univ-logo" style="background:hsl(${r.hue} 62% 46%)">${uniShort(r).slice(0, 2).toUpperCase()}</div>
            <div class="univ-name">${uniName(r)}</div>
          </a>
        </td>
        <td class="num"><div class="score">${r.score.toFixed(1)}</div></td>
        <td class="num"><div class="applications">${numFmt().format(r.applications)}</div></td>
        <td class="num"><div class="applications">${numFmt().format(r.admitted || 0)}</div></td>
      `;
      tbody.appendChild(tr);
    }
  }

  const showAllBtn = document.getElementById("show-all");
  if (rest.length > 7) {
    showAllBtn.style.display = "block";
    showAllBtn.textContent = state.expanded
      ? t("showAll.collapse")
      : t("showAll.expand", { n: rows.length });
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

initTabs();
initSortTabs();
initShowAll();
window.onLangChange = () => { render(); resyncIndicators(); };
window.addEventListener("edbo-data-updated", () => { render(); resyncIndicators(); });
render();
