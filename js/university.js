const UAH_NUM = new Intl.NumberFormat("uk-UA");

const state = { degree: "bachelor", compareId: null };

function findUniMeta(id) {
  const b = BACHELOR_UNIS.find((u) => u.id === id);
  const m = MASTER_UNIS.find((u) => u.id === id);
  const src = b || m;
  if (!src) return null;
  return { id, name: src.name, short: src.short, hue: src.hue, hasBachelor: !!b, hasMaster: !!m };
}

function allUniMetas() {
  const ids = new Set([...BACHELOR_UNIS, ...MASTER_UNIS].map((u) => u.id));
  return [...ids].map(findUniMeta).sort((a, b) => a.name.localeCompare(b.name, "uk"));
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
    const rowP1 = (snap[degree + "P1"] || []).find((r) => r.id === id) || null;
    return { year, row, rowP1 };
  });
}

/* series: [{ getVal(t)->number|null, lineClass, dotClass }] — до 2 ліній на графіку */
function buildChartSVG(trend, series) {
  const values = [];
  trend.forEach((t) => series.forEach((s) => {
    const v = s.getVal(t);
    if (v != null) values.push(v);
  }));
  if (!values.length) return `<div class="chart-empty">Немає даних для побудови графіка.</div>`;

  const w = 640, h = 220, padL = 34, padR = 12, padT = 16, padB = 30;
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

  function dotsFor(getVal, cls) {
    return trend.map((t, i) => {
      const v = getVal(t);
      if (v == null) return "";
      return `<circle class="${cls}" cx="${xFor(i).toFixed(1)}" cy="${yFor(v).toFixed(1)}" r="4"><title>${t.year}: ${v.toFixed(1)}</title></circle>`;
    }).join("");
  }

  const labels = trend.map((t, i) =>
    `<text class="chart-axis-label" x="${xFor(i).toFixed(1)}" y="${h - 8}" text-anchor="middle">${t.year}</text>`
  ).join("");

  const baseline = `<line class="chart-baseline" x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" />`;

  const paths = series.map((s) => {
    const d = pathFor(s.getVal);
    return d ? `<path class="chart-line ${s.lineClass}" d="${d}" fill="none" />` : "";
  }).join("");

  const dots = series.map((s) => dotsFor(s.getVal, s.dotClass)).join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg" role="img" aria-label="Динаміка балу по роках">
      ${baseline}
      ${paths}
      ${dots}
      ${labels}
    </svg>
  `;
}

function renderCompareOptions(meta) {
  const select = document.getElementById("compare-select");
  const current = state.compareId;
  select.innerHTML = `<option value="">— не порівнювати —</option>`;
  allUniMetas()
    .filter((u) => u.id !== meta.id && (state.degree === "bachelor" ? u.hasBachelor : u.hasMaster))
    .forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      select.appendChild(opt);
    });
  select.value = current && [...select.options].some((o) => o.value === current) ? current : "";
  if (select.value !== current) state.compareId = select.value || null;
}

function renderComparePanel(meta, trend, compareMeta, compareTrend) {
  const panel = document.getElementById("compare-panel");
  if (!compareMeta) {
    panel.style.display = "none";
    panel.innerHTML = "";
    return;
  }
  panel.style.display = "grid";

  function colHTML(m, t, isPrimary) {
    const withData = t.filter((x) => x.row);
    const latest = [...withData].reverse()[0] || null;
    return `
      <div class="compare-col ${isPrimary ? "is-primary" : ""}">
        <div class="compare-col-name">${m.name}</div>
        <div class="compare-metric"><span>Ранг (${latest ? latest.year : "—"})</span><span>${latest ? "#" + latest.row.rank : "—"}</span></div>
        <div class="compare-metric"><span>Бал</span><span>${latest ? latest.row.score.toFixed(1) : "—"}</span></div>
        <div class="compare-metric"><span>Заяв</span><span>${latest ? UAH_NUM.format(latest.row.applications) : "—"}</span></div>
      </div>
    `;
  }

  panel.innerHTML = colHTML(meta, trend, true) + colHTML(compareMeta, compareTrend, false);
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

  document.title = `${meta.name} — Журфак.Рейтинг`;

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

  renderCompareOptions(meta);
  const compareMeta = state.compareId ? findUniMeta(state.compareId) : null;
  const compareTrend = compareMeta ? buildTrend(compareMeta.id, state.degree) : null;

  let legendItems, subtitle;
  if (compareMeta) {
    subtitle = `${meta.short} проти ${compareMeta.short}`;
    legendItems = [
      { cls: "", color: "var(--accent-dark)", label: meta.name },
      { cls: "", color: "var(--ink-soft)", label: compareMeta.name }
    ];

    // об'єднуємо роки основного і порівнюваного ЗВО в один спільний ряд для графіка
    const combined = DB.years.map((year, i) => ({
      year,
      row: trend[i].row,
      compareRow: compareTrend[i].row
    }));
    document.getElementById("chart-wrap").innerHTML = buildChartSVG(combined, [
      { getVal: (t) => t.row ? t.row.score : null, lineClass: "chart-line-all", dotClass: "chart-dot-all" },
      { getVal: (t) => t.compareRow ? t.compareRow.score : null, lineClass: "chart-line-compare", dotClass: "chart-dot-compare" }
    ]);
  } else {
    subtitle = "суцільна — усі заяви, пунктир — лише пріоритет 1";
    legendItems = [
      { cls: "", color: "var(--accent-dark)", label: "Усі заяви" },
      { cls: "dashed", color: "var(--gold)", label: "Пріоритет 1" }
    ];
    document.getElementById("chart-wrap").innerHTML = buildChartSVG(trend, [
      { getVal: (t) => t.row ? t.row.score : null, lineClass: "chart-line-all", dotClass: "chart-dot-all" },
      { getVal: (t) => t.rowP1 ? t.rowP1.score : null, lineClass: "chart-line-p1", dotClass: "chart-dot-p1" }
    ]);
  }

  document.getElementById("chart-subtitle").textContent = subtitle;

  document.getElementById("chart-legend").innerHTML = legendItems.map((li) => `
    <span class="chart-legend-item" style="color:${li.color}">
      <span class="chart-legend-swatch ${li.cls}"></span>${li.label}
    </span>
  `).join("");

  renderComparePanel(meta, trend, compareMeta, compareTrend);

  document.getElementById("uni-table-subtitle").textContent =
    state.degree === "bachelor" ? "бакалаврат · денна форма" : "магістратура · денна форма";

  const tbody = document.getElementById("uni-year-body");
  tbody.innerHTML = "";
  [...trend].reverse().forEach((t) => {
    const tr = document.createElement("tr");
    if (!t.row) {
      tr.innerHTML = `
        <td><strong>${t.year}</strong></td>
        <td class="num" colspan="3"><span class="applications">поза рейтингом (менше мінімуму заяв)</span></td>
      `;
    } else {
      tr.innerHTML = `
        <td><strong>${t.year}</strong></td>
        <td class="num"><div class="score">#${t.row.rank}</div></td>
        <td class="num"><div class="score">${t.row.score.toFixed(1)}</div></td>
        <td class="num"><div class="applications">${UAH_NUM.format(t.row.applications)}</div></td>
      `;
    }
    tbody.appendChild(tr);
  });
}

function initDegreeTabs() {
  const indicator = document.getElementById("uni-degree-indicator");
  document.querySelectorAll("#uni-degree-tabs [data-degree]").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      state.degree = btn.dataset.degree;
      document.querySelectorAll("#uni-degree-tabs [data-degree]").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      indicator.style.transform = `translateX(${i * 100}%)`;
      render();
    });
  });
}

function initCompareSelect() {
  document.getElementById("compare-select").addEventListener("change", (e) => {
    state.compareId = e.target.value || null;
    render();
  });
}

initDegreeTabs();
initCompareSelect();
render();
