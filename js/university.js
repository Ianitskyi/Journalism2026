const state = { degree: "bachelor", compareIds: [null, null], secondCompareVisible: false };

function findUniMeta(id) {
  const src = DB.allUniversitiesMeta().get(id);
  if (!src) return null;
  const name = getLang() === "en" ? (src.nameEn || src.name) : src.name;
  const short = getLang() === "en" ? (src.shortEn || src.short) : src.short;
  return { id, name, short, hue: src.hue, hasBachelor: !!src.hasBachelor, hasMaster: !!src.hasMaster };
}

function allUniMetas() {
  const registry = DB.allUniversitiesMeta();
  return [...registry.keys()].map(findUniMeta).sort((a, b) => a.name.localeCompare(b.name, getLang() === "en" ? "en" : "uk"));
}

/* останній (актуальний) знімок конкретного року — для 2026 це найновіший
   день кампанії, для минулих років — єдиний підсумковий знімок */
function yearSnapshot(year) {
  const yd = DB.byYear[year];
  return yd.snapshots[yd.dates[yd.dates.length - 1]];
}

function buildTrend(id, degree) {
  return DB.years.map((year) => {
    const snap = yearSnapshot(year);
    const row = (snap[degree] || []).find((r) => r.id === id) || null;
    return { year, row };
  });
}

/* series: [{ getVal(t)->number|null, lineClass, dotClass, label }] — до 2 ліній на графіку.
   formatValue — форматування чисел і на осі Y, і в підказках (бал: 178.4, заяви: 1 234) */
function buildChartSVG(trend, series, formatValue = (v) => v.toFixed(1)) {
  const values = [];
  trend.forEach((t) => series.forEach((s) => {
    const v = s.getVal(t);
    if (v != null) values.push(v);
  }));
  if (!values.length) return `<div class="chart-empty">${t("uni.noChartData")}</div>`;

  const w = 640, h = 220, padL = 46, padR = 12, padT = 16, padB = 30;
  const min = Math.min(...values), max = Math.max(...values);
  const range = Math.max(1, max - min);
  const yMin = min - range * 0.15, yMax = max + range * 0.15;
  const n = trend.length;
  const xFor = (i) => padL + (n === 1 ? 0.5 : i / (n - 1)) * (w - padL - padR);
  const yFor = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);

  function pathFor(getVal) {
    let d = "";
    let started = false;
    trend.forEach((t, i) => {
      const v = getVal(t);
      if (v == null) { started = false; return; }
      d += `${started ? "L" : "M"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)} `;
      started = true;
    });
    return d.trim();
  }

  function dotsFor(getVal, cls, label) {
    return trend.map((t, i) => {
      const v = getVal(t);
      if (v == null) return "";
      const cx = xFor(i).toFixed(1);
      const cy = yFor(v).toFixed(1);
      const tooltipText = label ? `${label} · ${t.year}: ${formatValue(v)}` : `${t.year}: ${formatValue(v)}`;
      return `
        <circle class="${cls}" cx="${cx}" cy="${cy}" r="4"></circle>
        <circle class="chart-dot-hit" cx="${cx}" cy="${cy}" r="11" tabindex="0" role="img" aria-label="${escapeAttr(tooltipText)}" data-tooltip="${escapeAttr(tooltipText)}"></circle>
      `;
    }).join("");
  }

  const labels = trend.map((t, i) =>
    `<text class="chart-axis-label" x="${xFor(i).toFixed(1)}" y="${h - 8}" text-anchor="middle">${t.year}</text>`
  ).join("");

  const yAxis = buildYAxisSVG(yMin, yMax, { w, h, padL, padR, padT, padB, formatValue });

  const baseline = `<line class="chart-baseline" x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" />`;

  const paths = series.map((s) => {
    const d = pathFor(s.getVal);
    return d ? `<path class="chart-line ${s.lineClass}" d="${d}" fill="none" />` : "";
  }).join("");

  const dots = series.map((s) => dotsFor(s.getVal, s.dotClass, s.label)).join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg" role="img" aria-label="${t("uni.chartAriaLabel")}">
      ${yAxis}
      ${baseline}
      ${paths}
      ${dots}
      ${labels}
    </svg>
  `;
}

/* заповнює один <select> порівняння, виключаючи основний заклад і той,
   що вже обраний у ІНШОМУ слоті порівняння (щоб не можна було обрати
   той самий заклад двічі) */
function renderCompareSelect(slot, meta) {
  const select = document.getElementById(`compare-select-${slot}`);
  if (!select) return;
  const otherSlotId = state.compareIds[1 - slot];
  const current = state.compareIds[slot];
  select.innerHTML = `<option value="">${t("uni.compareNone")}</option>`;
  allUniMetas()
    .filter((u) => u.id !== meta.id && u.id !== otherSlotId && (state.degree === "bachelor" ? u.hasBachelor : u.hasMaster))
    .forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      select.appendChild(opt);
    });
  select.value = current && [...select.options].some((o) => o.value === current) ? current : "";
  if (select.value !== current) state.compareIds[slot] = select.value || null;
}

function renderCompareOptions(meta) {
  renderCompareSelect(0, meta);
  renderCompareSelect(1, meta);

  const row1 = document.getElementById("compare-row-1");
  const addBtn = document.getElementById("add-compare-btn");
  const showRow1 = state.secondCompareVisible || state.compareIds[1] != null;
  row1.style.display = showRow1 ? "flex" : "none";
  addBtn.textContent = showRow1 ? t("uni.removeCompare") : t("uni.addCompare");
}

function renderComparePanel(meta, trend, compareMetas, compareTrends) {
  const panel = document.getElementById("compare-panel");
  if (!compareMetas.length) {
    panel.style.display = "none";
    panel.innerHTML = "";
    return;
  }
  panel.style.display = "grid";

  function colHTML(m, trendData, isPrimary) {
    const withData = trendData.filter((x) => x.row);
    const latest = [...withData].reverse()[0] || null;
    return `
      <div class="compare-col ${isPrimary ? "is-primary" : ""}">
        <div class="compare-col-name">${m.name}</div>
        <div class="compare-metric"><span>${t("uni.metricRank", { year: latest ? latest.year : "—" })}</span><span>${latest ? "#" + latest.row.rank : "—"}</span></div>
        <div class="compare-metric"><span>${t("table.score")}</span><span>${latest ? latest.row.score.toFixed(1) : "—"}</span></div>
        <div class="compare-metric"><span>${t("table.applications")}</span><span>${latest ? numFmt().format(latest.row.applications) : "—"}</span></div>
        <div class="compare-metric"><span>${t("table.admitted")}</span><span>${latest ? numFmt().format(latest.row.admitted || 0) : "—"}</span></div>
      </div>
    `;
  }

  panel.innerHTML = colHTML(meta, trend, true) +
    compareMetas.map((m, i) => colHTML(m, compareTrends[i], false)).join("");
}

/* короткий аналітичний висновок про динаміку закладу: рахується виключно
   з реальних даних, які вже є в системі (бал/заяви по роках, ранг) —
   без жодних вигаданих фактів про сам заклад */
function buildAnalysisText(first, latest) {
  if (!first || !latest || first.year === latest.year) {
    return t("uni.analysis.insufficientData");
  }

  const scoreDiff = Math.round((latest.row.score - first.row.score) * 10) / 10;
  let scoreSentence;
  if (Math.abs(scoreDiff) < 0.1) {
    scoreSentence = t("uni.analysis.scoreFlat", { from: first.year, to: latest.year, value: latest.row.score.toFixed(1) });
  } else if (scoreDiff > 0) {
    scoreSentence = t("uni.analysis.scoreUp", {
      from: first.year, to: latest.year, diff: Math.abs(scoreDiff).toFixed(1),
      fromVal: first.row.score.toFixed(1), toVal: latest.row.score.toFixed(1)
    });
  } else {
    scoreSentence = t("uni.analysis.scoreDown", {
      from: first.year, to: latest.year, diff: Math.abs(scoreDiff).toFixed(1),
      fromVal: first.row.score.toFixed(1), toVal: latest.row.score.toFixed(1)
    });
  }

  const appsPct = first.row.applications > 0
    ? Math.round(((latest.row.applications - first.row.applications) / first.row.applications) * 100)
    : 0;
  let appsSentence;
  if (Math.abs(appsPct) < 3) {
    appsSentence = t("uni.analysis.appsFlat", { value: numFmt().format(latest.row.applications) });
  } else if (appsPct > 0) {
    appsSentence = t("uni.analysis.appsUp", { pct: appsPct, fromVal: numFmt().format(first.row.applications), toVal: numFmt().format(latest.row.applications) });
  } else {
    appsSentence = t("uni.analysis.appsDown", { pct: Math.abs(appsPct), fromVal: numFmt().format(first.row.applications), toVal: numFmt().format(latest.row.applications) });
  }

  const rankDiff = first.row.rank - latest.row.rank; // позитивне значення = покращення (менший ранг = вище місце)
  let rankSentence;
  if (rankDiff === 0) {
    rankSentence = t("uni.analysis.rankSame", { value: latest.row.rank });
  } else if (rankDiff > 0) {
    rankSentence = t("uni.analysis.rankBetter", { from: first.row.rank, to: latest.row.rank });
  } else {
    rankSentence = t("uni.analysis.rankWorse", { from: first.row.rank, to: latest.row.rank });
  }

  return `${scoreSentence} ${appsSentence} ${rankSentence}`;
}

function render() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const meta = id ? findUniMeta(id) : null;

  if (!meta) {
    document.getElementById("uni-content").style.display = "none";
    document.getElementById("uni-not-found").style.display = "block";
    return;
  }

  // якщо перший синхронний render() пройшов до завантаження реальних
  // історичних даних (не знайшов заклад) — скидаємо стан "не знайдено"
  // після успішного повторного render() з уже підвантаженими даними
  document.getElementById("uni-content").style.display = "";
  document.getElementById("uni-not-found").style.display = "none";

  document.title = `${meta.name} — ${t("meta.uniTitleSuffix")}`;

  // якщо для обраного рівня немає даних узагалі — переключитись на доступний
  if (state.degree === "master" && !meta.hasMaster) state.degree = "bachelor";
  if (state.degree === "bachelor" && !meta.hasBachelor) state.degree = "master";

  const degreeTabs = document.getElementById("uni-degree-tabs");
  degreeTabs.style.display = meta.hasBachelor && meta.hasMaster ? "inline-flex" : "none";

  document.getElementById("uni-logo").textContent = meta.short.slice(0, 2).toUpperCase();
  document.getElementById("uni-logo").style.background = `hsl(${meta.hue} 62% 46%)`;
  document.getElementById("uni-name").textContent = meta.name;

  const trend = buildTrend(meta.id, state.degree);
  const withData = trend.filter((t) => t.row);

  const bestRank = withData.length ? Math.min(...withData.map((t) => t.row.rank)) : null;
  const latest = [...withData].reverse()[0] || null;
  const first = withData[0] || null;

  document.getElementById("uni-best-rank").textContent = bestRank != null ? `#${bestRank}` : "—";
  document.getElementById("uni-current-rank").textContent = latest ? `#${latest.row.rank}` : "—";
  document.getElementById("uni-current-score").textContent = latest ? latest.row.score.toFixed(1) : "—";

  const trendEl = document.getElementById("uni-trend");
  if (latest && first && first.year !== latest.year) {
    const diff = Math.round((latest.row.score - first.row.score) * 10) / 10;
    trendEl.textContent = `${diff > 0 ? "+" : ""}${diff.toFixed(1)}`;
    trendEl.className = "stat-value " + (diff > 0 ? "trend-up" : diff < 0 ? "trend-down" : "");
  } else {
    trendEl.textContent = "—";
    trendEl.className = "stat-value";
  }

  document.getElementById("uni-analysis").textContent = buildAnalysisText(first, latest);

  renderCompareOptions(meta);
  const compareMetas = state.compareIds.map((id) => id && findUniMeta(id)).filter(Boolean);
  const compareTrends = compareMetas.map((m) => buildTrend(m.id, state.degree));
  const COMPARE_STYLES = [
    { lineClass: "chart-line-compare", dotClass: "chart-dot-compare", color: "var(--ink-soft)" },
    { lineClass: "chart-line-compare2", dotClass: "chart-dot-compare2", color: "var(--green)" }
  ];

  // об'єднуємо роки основного й усіх порівнюваних закладів в один спільний
  // ряд — спільний для обох графіків (бал і кількість заяв)
  const combined = compareMetas.length
    ? DB.years.map((year, i) => ({
        year,
        row: trend[i].row,
        compareRows: compareTrends.map((ct) => ct[i].row)
      }))
    : null;

  function renderMetricChart(chartId, legendId, metricKey, plainLabel) {
    const formatValue = metricKey === "applications" ? (v) => numFmt().format(Math.round(v)) : (v) => v.toFixed(1);
    let legendItems, chartHtml;
    if (compareMetas.length) {
      legendItems = [
        { color: "var(--accent-dark)", label: meta.name },
        ...compareMetas.map((m, i) => ({ color: COMPARE_STYLES[i].color, label: m.name }))
      ];
      const series = [
        { getVal: (x) => x.row ? x.row[metricKey] : null, lineClass: "chart-line-all", dotClass: "chart-dot-all", label: meta.short },
        ...compareMetas.map((m, i) => ({
          getVal: (x) => x.compareRows[i] ? x.compareRows[i][metricKey] : null,
          lineClass: COMPARE_STYLES[i].lineClass,
          dotClass: COMPARE_STYLES[i].dotClass,
          label: m.short
        }))
      ];
      chartHtml = buildChartSVG(combined, series, formatValue);
    } else {
      legendItems = [{ color: "var(--accent-dark)", label: plainLabel }];
      chartHtml = buildChartSVG(trend, [
        { getVal: (x) => x.row ? x.row[metricKey] : null, lineClass: "chart-line-all", dotClass: "chart-dot-all", label: plainLabel }
      ], formatValue);
    }
    document.getElementById(chartId).innerHTML = chartHtml;
    document.getElementById(legendId).innerHTML = legendItems.map((li) => `
      <span class="chart-legend-item" style="color:${li.color}">
        <span class="chart-legend-swatch" style="background:${li.color}"></span>${li.label}
      </span>
    `).join("");
  }

  const compareSubtitle = () => {
    if (!compareMetas.length) return null;
    if (compareMetas.length === 1) return t("uni.compareVs", { a: meta.short, b: compareMetas[0].short });
    return t("uni.compareVsMulti", { a: meta.short, b: compareMetas[0].short, c: compareMetas[1].short });
  };

  document.getElementById("chart-subtitle").textContent = compareSubtitle() || t("uni.subtitlePlain");
  renderMetricChart("chart-wrap", "chart-legend", "score", t("uni.admittedAverage"));

  document.getElementById("chart-apps-subtitle").textContent = compareSubtitle() || t("uni.appsSubtitlePlain");
  renderMetricChart("chart-wrap-apps", "chart-legend-apps", "applications", t("table.applications"));

  renderComparePanel(meta, trend, compareMetas, compareTrends);

  document.getElementById("uni-table-subtitle").textContent =
    t(state.degree === "bachelor" ? "degree.bachelorLabel" : "degree.masterLabel");

  const tbody = document.getElementById("uni-year-body");
  tbody.innerHTML = "";
  [...trend].reverse().forEach((entry) => {
    const tr = document.createElement("tr");
    if (!entry.row) {
      tr.innerHTML = `
        <td><strong>${entry.year}</strong></td>
        <td class="num" colspan="4"><span class="applications">${t("empty.outOfRanking")}</span></td>
      `;
    } else {
      tr.innerHTML = `
        <td><strong>${entry.year}</strong></td>
        <td class="num"><div class="score">#${entry.row.rank}</div></td>
        <td class="num"><div class="score">${entry.row.score.toFixed(1)}</div></td>
        <td class="num"><div class="applications">${numFmt().format(entry.row.applications)}</div></td>
        <td class="num"><div class="applications">${numFmt().format(entry.row.admitted || 0)}</div></td>
      `;
    }
    tbody.appendChild(tr);
  });
}

/* позиціонує повзунок-індикатор по фактичних пікселях активної кнопки —
   ширини вкладок нерівні між мовами, тож фіксовані 50%/translateX не підходять */
function syncIndicator(indicator, activeBtn) {
  if (!indicator || !activeBtn) return;
  indicator.style.left = `${activeBtn.offsetLeft}px`;
  indicator.style.width = `${activeBtn.offsetWidth}px`;
}

function initDegreeTabs() {
  const indicator = document.getElementById("uni-degree-indicator");
  const buttons = [...document.querySelectorAll("#uni-degree-tabs [data-degree]")];
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.degree = btn.dataset.degree;
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
  syncIndicator(document.getElementById("uni-degree-indicator"), document.querySelector("#uni-degree-tabs .pill.active"));
}

function initCompareSelect() {
  document.getElementById("compare-select-0").addEventListener("change", (e) => {
    state.compareIds[0] = e.target.value || null;
    render();
  });
  document.getElementById("compare-select-1").addEventListener("change", (e) => {
    state.compareIds[1] = e.target.value || null;
    render();
  });
  document.getElementById("add-compare-btn").addEventListener("click", () => {
    if (state.secondCompareVisible) {
      state.secondCompareVisible = false;
      state.compareIds[1] = null;
    } else {
      state.secondCompareVisible = true;
    }
    render();
  });
}

initDegreeTabs();
initCompareSelect();
initChartTooltips();
window.onLangChange = () => { render(); resyncIndicators(); };
window.addEventListener("edbo-data-updated", () => { render(); resyncIndicators(); });
render();
