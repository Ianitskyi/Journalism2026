const DEGREE_META = {
  bachelor: { label: "бакалаврат · денна форма", cardTitle: "СЕРЕДНІЙ КОНКУРСНИЙ БАЛ" },
  master:   { label: "магістратура · денна форма", cardTitle: "СЕРЕДНІЙ КОНКУРСНИЙ БАЛ" }
};

const state = {
  degree: "bachelor",
  dateIndex: DB.dates.length - 1,
  expanded: false
};

const UAH_NUM = new Intl.NumberFormat("uk-UA");

function fmtDateUA(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

function fmtDateFull(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

function fmtTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Kyiv" });
}

function currentSnapshot() {
  return DB.snapshots[DB.dates[state.dateIndex]];
}

function render() {
  const snap = currentSnapshot();
  const rows = snap[state.degree];
  const meta = DEGREE_META[state.degree];

  document.getElementById("asof-date").textContent = `${fmtDateFull(snap.date)}, ${fmtTime(snap.asOf)}`;
  document.getElementById("source-count").textContent =
    UAH_NUM.format(snap.totalApplications[state.degree]);
  document.getElementById("degree-word").textContent =
    state.degree === "bachelor" ? "бакалаврат" : "магістратуру";

  document.getElementById("date-current").textContent = fmtDateUA(snap.date);
  document.getElementById("date-slider").value = state.dateIndex;

  document.getElementById("caption").textContent =
    `Станом на ${fmtDateUA(snap.date)}. Заклади освіти щонайменше з ${DB.minApplications[state.degree]} заявами.`;

  document.getElementById("card-subtitle").textContent = meta.label;

  const tbody = document.getElementById("rank-body");
  tbody.innerHTML = "";

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state">Немає даних для цього дня.</div></td></tr>`;
  } else {
    const visible = state.expanded ? rows : rows.slice(0, 10);
    for (const r of visible) {
      const tr = document.createElement("tr");
      if (r.rank === 1) tr.className = "top";
      tr.innerHTML = `
        <td><div class="rank">${r.rank}</div></td>
        <td>
          <div class="univ-cell">
            <div class="univ-logo" style="background:hsl(${r.hue} 62% 46%)">${r.short.slice(0, 2).toUpperCase()}</div>
            <div class="univ-name">${r.name}</div>
          </div>
        </td>
        <td class="num"><div class="score">${r.score.toFixed(1)}</div></td>
        <td class="num"><div class="applications">${UAH_NUM.format(r.applications)}</div></td>
      `;
      tbody.appendChild(tr);
    }
  }

  const showAllBtn = document.getElementById("show-all");
  if (rows.length > 10) {
    showAllBtn.style.display = "block";
    showAllBtn.textContent = state.expanded
      ? "Згорнути ↑"
      : `Показати всі ${rows.length} ВНЗ →`;
  } else {
    showAllBtn.style.display = "none";
  }
}

function initTabs() {
  document.querySelectorAll("[data-degree]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.degree = btn.dataset.degree;
      state.expanded = false;
      document.querySelectorAll("[data-degree]").forEach((b) => b.classList.toggle("active", b === btn));
      render();
    });
  });
}

function initSlider() {
  const slider = document.getElementById("date-slider");
  slider.min = 0;
  slider.max = DB.dates.length - 1;
  slider.value = state.dateIndex;
  slider.addEventListener("input", (e) => {
    state.dateIndex = Number(e.target.value);
    render();
  });
}

function initShowAll() {
  document.getElementById("show-all").addEventListener("click", () => {
    state.expanded = !state.expanded;
    render();
  });
}

initTabs();
initSlider();
initShowAll();
render();
