const state = {
  reports: [],
  activeDate: "",
  activeReport: null,
};

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toneLabel(tone) {
  return {
    positive: "机会",
    watch: "观察",
    risk: "风险",
  }[tone] || "观察";
}

function levelClass(value = "") {
  if (["高", "重要", "风险"].some((key) => value.includes(key))) return "risk";
  if (["中", "观察", "本周"].some((key) => value.includes(key))) return "watch";
  return "positive";
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function sourceLinks(sources = []) {
  if (!sources.length) return "";
  return `
    <div class="source-links">
      ${sources
        .map(
          (source) =>
            `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>`,
        )
        .join("")}
    </div>
  `;
}

function tagRow(tags = []) {
  if (!tags.length) return "";
  return `<div class="meta-row">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function renderMonitorBoard(items = []) {
  $("#monitorBoard").innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="monitor-card">
              <div class="monitor-top">
                <span class="mini-label">${escapeHtml(item.bucket)}</span>
                <span class="pill ${levelClass(item.alert)}">${escapeHtml(item.alert)}</span>
              </div>
              <h3>${escapeHtml(item.metric)}</h3>
              <p><strong>看什么：</strong>${escapeHtml(item.watch)}</p>
              <p><strong>触发阈值：</strong>${escapeHtml(item.trigger)}</p>
              <p class="emphasis"><strong>用途：</strong>${escapeHtml(item.use)}</p>
              ${sourceLinks(item.sources)}
            </article>
          `,
        )
        .join("")
    : `<p class="empty">本日暂无硬指标。</p>`;
}

function renderSignals(items = []) {
  $("#signalGrid").innerHTML = items
    .map(
      (item) => `
        <article class="signal ${escapeHtml(item.tone)}">
          <div class="signal-main">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </div>
          <span class="pill ${escapeHtml(item.tone)}">${toneLabel(item.tone)}</span>
          <p>${escapeHtml(item.note)}</p>
        </article>
      `,
    )
    .join("");
}

function renderMarket(items = []) {
  $("#marketRows").innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="insight-card">
              <div class="card-head">
                <div>
                  <span class="mini-label">${escapeHtml(item.market || "Market")}</span>
                  <h3>${escapeHtml(item.title)}</h3>
                </div>
                <span class="pill ${levelClass(item.level)}">${escapeHtml(item.level)}</span>
              </div>
              ${tagRow(item.tags)}
              <p class="fact"><strong>事实：</strong>${escapeHtml(item.fact)}</p>
              <p><strong>为什么重要：</strong>${escapeHtml(item.whyItMatters)}</p>
              ${item.evidence ? `<p><strong>证据强度：</strong><span class="evidence">${escapeHtml(item.evidence)}</span></p>` : ""}
              <div class="takeaway">${escapeHtml(item.readThrough)}</div>
              ${item.nextCheck ? `<p class="next-check"><strong>下一步验证：</strong>${escapeHtml(item.nextCheck)}</p>` : ""}
              ${sourceLinks(item.sources)}
            </article>
          `,
        )
        .join("")
    : `<p class="empty">本日暂无市场观察条目。</p>`;
}

function renderIpo(items = []) {
  $("#ipoPipeline").innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="ipo-card">
              <div class="ipo-top">
                <div>
                  <span class="mini-label">${escapeHtml(item.exchange)}</span>
                  <h3>${escapeHtml(item.name)}</h3>
                </div>
                <span class="pill ${levelClass(item.heat)}">${escapeHtml(item.heat)}</span>
              </div>
              <div class="ipo-chip-line">
                <span class="stage-chip">${escapeHtml(item.stage)}</span>
                <span class="stage-chip">${escapeHtml(item.sector)}</span>
                ${(item.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
              </div>
              <p><strong>公开数据：</strong>${escapeHtml(item.publicData)}</p>
              <p class="emphasis"><strong>研判：</strong>${escapeHtml(item.interpretation)}</p>
              ${item.evidence ? `<p><strong>证据强度：</strong><span class="evidence">${escapeHtml(item.evidence)}</span></p>` : ""}
              <div class="watch-list">
                ${(item.watchItems || []).map((watch) => `<span>${escapeHtml(watch)}</span>`).join("")}
              </div>
              ${item.nextCheck ? `<p class="next-check"><strong>下一步验证：</strong>${escapeHtml(item.nextCheck)}</p>` : ""}
              ${sourceLinks(item.sources)}
            </article>
          `,
        )
        .join("")
    : `<p class="empty">本日暂无打新条目。</p>`;
}

function renderEcosystem(items = []) {
  $("#ecosystemList").innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="move-card">
              <div class="move-title">
                <h3>${escapeHtml(item.title)}</h3>
                <span class="pill ${levelClass(item.priority)}">优先级 ${escapeHtml(item.priority)}</span>
              </div>
              ${tagRow(item.tags)}
              <div class="move-body">
                <p><strong>事实：</strong>${escapeHtml(item.fact)}</p>
                <p class="emphasis"><strong>影响：</strong>${escapeHtml(item.impact)}</p>
                <p><strong>继续观察：</strong>${escapeHtml(item.watch)}</p>
              </div>
              ${item.nextCheck ? `<p class="next-check"><strong>下一步验证：</strong>${escapeHtml(item.nextCheck)}</p>` : ""}
              ${sourceLinks(item.sources)}
            </article>
          `,
        )
        .join("")
    : `<p class="empty">本日暂无生态条目。</p>`;
}

function renderRegulation(items = []) {
  $("#regulatoryList").innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="reg-card">
              <div class="reg-head">
                <span class="agency">${escapeHtml(item.agency)}</span>
                <span class="pill ${levelClass(item.severity)}">${escapeHtml(item.severity)}</span>
              </div>
              <h3>${escapeHtml(item.topic)}</h3>
              <p><strong>政策原文要点：</strong>${escapeHtml(item.policy)}</p>
              <p class="emphasis"><strong>潜在影响：</strong>${escapeHtml(item.impact)}</p>
              <p><strong>跟进方式：</strong>${escapeHtml(item.action)}</p>
              ${item.nextCheck ? `<p class="next-check"><strong>下一步验证：</strong>${escapeHtml(item.nextCheck)}</p>` : ""}
              ${sourceLinks(item.sources)}
            </article>
          `,
        )
        .join("")
    : `<p class="empty">本日暂无监管条目。</p>`;
}

function renderActions(items = []) {
  $("#actionList").innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="action-card">
              <div class="owner-line">
                <h3>${escapeHtml(item.owner)}</h3>
                <span class="pill ${levelClass(item.urgency)}">${escapeHtml(item.urgency)}</span>
              </div>
              <p>${escapeHtml(item.task)}</p>
            </article>
          `,
        )
        .join("")
    : `<p class="empty">本日暂无跟进事项。</p>`;
}

function renderArchive() {
  $("#archiveList").innerHTML = state.reports
    .map(
      (report) => `
        <button type="button" class="archive-item ${report.date === state.activeDate ? "selected" : ""}" data-date="${escapeHtml(report.date)}">
          <span>${escapeHtml(formatReportLabel(report))}</span>
          <strong>${escapeHtml(report.headline)}</strong>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll(".archive-item").forEach((item) => {
    item.addEventListener("click", () => setActiveReport(item.dataset.date));
  });
}

function renderSourceCloud(sources = []) {
  $("#sourceCloud").innerHTML = sources
    .map(
      (source) =>
        `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>`,
    )
    .join("");
}

function formatReportLabel(report) {
  const coverage = report.coverageDate ? ` / 覆盖 ${report.coverageDate}` : "";
  return `生成 ${report.date}${coverage} · ${report.edition}`;
}

function renderReport(report) {
  state.activeReport = report;
  state.activeDate = report.date;
  $("#dateSelect").value = report.date;
  $("#briefHeadline").textContent = report.brief;
  $("#editionLabel").textContent = formatReportLabel(report);
  $("#mainHeadline").textContent = report.headline;
  $("#briefText").textContent = report.brief;
  $("#keywordRow").innerHTML = report.keywords.map((key) => `<span>${escapeHtml(key)}</span>`).join("");
  renderSignals(report.topSignals);
  renderMonitorBoard(report.monitorBoard);
  renderMarket(report.marketPulse);
  renderIpo(report.ipoPipeline);
  renderEcosystem(report.ecosystemMoves);
  renderRegulation(report.regulatoryWatch);
  renderActions(report.actions);
  renderSourceCloud(report.sources);
  renderArchive();
}

function setActiveReport(date) {
  const report = state.reports.find((item) => item.date === date) || state.reports[0];
  renderReport(report);
  localStorage.setItem("offshore-brief-active-date", report.date);
}

function flattenReport(report) {
  const buckets = [
    ["总览", [report.headline, report.brief, ...(report.keywords || [])]],
    ["指标", report.monitorBoard || []],
    ["市场", report.marketPulse || []],
    ["打新", report.ipoPipeline || []],
    ["生态", report.ecosystemMoves || []],
    ["监管", report.regulatoryWatch || []],
    ["跟进", report.actions || []],
  ];

  return buckets.map(([category, value]) => ({
    date: report.date,
    category,
    report,
    text: JSON.stringify(value),
  }));
}

function fuzzyMatch(text, query) {
  const source = text.toLowerCase();
  const target = query.toLowerCase().trim();
  if (!target) return false;
  if (source.includes(target)) return true;
  let index = 0;
  for (const char of source) {
    if (char === target[index]) index += 1;
    if (index === target.length) return true;
  }
  return false;
}

function renderSearch(query) {
  const panel = $("#searchPanel");
  const results = $("#searchResults");
  if (!query.trim()) {
    panel.hidden = true;
    results.innerHTML = "";
    return;
  }

  const matches = state.reports.flatMap(flattenReport).filter((item) => fuzzyMatch(item.text, query));
  panel.hidden = false;
  results.innerHTML = matches.length
    ? matches
        .slice(0, 12)
        .map(
          (item) => `
            <button type="button" class="search-hit" data-date="${escapeHtml(item.date)}">
              <span>${escapeHtml(item.date)} · ${escapeHtml(item.category)}</span>
              <strong>${escapeHtml(item.report.headline)}</strong>
            </button>
          `,
        )
        .join("")
    : `<p class="empty">没有找到相关内容。</p>`;

  document.querySelectorAll(".search-hit").forEach((item) => {
    item.addEventListener("click", () => setActiveReport(item.dataset.date));
  });
}

function buildMarkdown() {
  const report = state.activeReport;
  const notes = $("#pmNotes").value.trim();
  const lines = [
    `# 境外投资业务内参 ${report.date}`,
    "",
    `## 主线`,
    report.headline,
    "",
    report.brief,
    "",
    `## 关键信号`,
    ...report.topSignals.map((item) => `- ${item.label}：${item.value}。${item.note}`),
    "",
    `## 后续跟进`,
    ...report.actions.map((item) => `- ${item.owner}（${item.urgency}）：${item.task}`),
    "",
    `## 本期来源`,
    ...report.sources.map((source) => `- ${source.name}：${source.url}`),
  ];

  if (notes) lines.push("", "## 临时补充", notes);
  return lines.join("\n");
}

async function copyBrief() {
  await navigator.clipboard.writeText(buildMarkdown());
  showToast("已复制当前日报摘要");
}

function exportJson() {
  const updated = {
    ...state.activeReport,
    pmNotes: $("#pmNotes").value.trim(),
  };
  const blob = new Blob([JSON.stringify(updated, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daily-brief-${updated.date}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("已导出当前日报 JSON");
}

function bindEvents() {
  $("#copyBrief").addEventListener("click", copyBrief);
  $("#exportJson").addEventListener("click", exportJson);
  $("#printPage").addEventListener("click", () => window.print());
  $("#dateSelect").addEventListener("change", (event) => setActiveReport(event.target.value));
  $("#searchInput").addEventListener("input", (event) => renderSearch(event.target.value));
  $("#clearSearch").addEventListener("click", () => {
    $("#searchInput").value = "";
    renderSearch("");
  });

  const notesKey = "offshore-brief-notes";
  $("#pmNotes").value = localStorage.getItem(notesKey) || "";
  $("#pmNotes").addEventListener("input", (event) => {
    localStorage.setItem(notesKey, event.target.value);
  });

  document.querySelectorAll(".nav-list a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-list a").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

async function init() {
  bindEvents();
  const response = await fetch("data/daily.json");
  const data = await response.json();
  state.reports = data.reports.sort((a, b) => b.date.localeCompare(a.date));
  $("#dateSelect").innerHTML = state.reports
    .map((report) => `<option value="${escapeHtml(report.date)}">${escapeHtml(formatReportLabel(report))}</option>`)
    .join("");
  const savedDate = localStorage.getItem("offshore-brief-active-date");
  setActiveReport(savedDate || state.reports[0].date);
}

init().catch((error) => {
  console.error(error);
  showToast("日报数据加载失败，请检查 data/daily.json");
});
