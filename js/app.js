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

function renderYearSelect() {
  const select = document.getElementById("year-select");
  select.innerHTML = DB.years.map((year) => `<option value="${year}">${year}</option>`).join("");
  select.value = String(state.year);
}

function initYearSelect() {
  document.getElementById("year-select").addEventListener("change", (e) => {
    const year = Number(e.target.value);
    if (state.year === year) return;
    state.year = year;
    state.dateIndex = DB.byYear[year].dates.length - 1;
    state.expanded = false;
    render();
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

function render() {
  const yearData = activeYearData();
  const snap = currentSnapshot();
  const rawRows = snap[state.degree];
  const rows = sortedRows(rawRows, state.sortBy);
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

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">${t("empty.noDataDay")}</div></td></tr>`;
  } else {
    const visible = state.expanded ? rows : rows.slice(0, VISIBLE_ROWS);
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
  if (rows.length > VISIBLE_ROWS) {
    showAllBtn.style.display = "block";
    showAllBtn.textContent = state.expanded
      ? t("showAll.collapse")
      : t("showAll.expand", { n: rows.length });
  } else {
    showAllBtn.style.display = "none";
  }

  renderYearSelect();
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
initYearSelect();
window.onLangChange = () => { render(); resyncIndicators(); };
window.addEventListener("edbo-data-updated", () => { render(); resyncIndicators(); });
render();
