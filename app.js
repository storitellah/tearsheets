/* ============================================================================
 *  app.js  —  ARCHIVE LOGIC
 * ----------------------------------------------------------------------------
 *  Vanilla JS, no build. Reads CONFIG / BIO / CONTACT / TEARSHEETS from
 *  tearsheets.js and renders the masthead, tabs, side rails, story grid,
 *  photographer panel and lightbox. Edit the data file, not this one.
 * ========================================================================== */
(function () {
  "use strict";

  const state = { tab: "all", year: "All", outlet: "All" };

  /* ── Google Drive direct-link helper ───────────────────────────────────── */
  function extractDriveId(url) {
    if (!url) return null;
    let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/); if (m) return m[1];
    m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);   if (m) return m[1];
    return null;
  }
  function driveToImage(url, size) {
    const id = extractDriveId(url);
    if (!id) return url;                 // local path or already-direct URL
    return `https://drive.google.com/thumbnail?id=${id}&sz=w${size || 1000}`;
  }
  function driveToFullImage(url) {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w2400` : url;
  }
  function driveViewLink(url) {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/file/d/${id}/view` : null;
  }

  /* ── Utilities ─────────────────────────────────────────────────────────── */
  const $  = (s, r) => (r || document).querySelector(s);
  const yearOf = (it) => it.year || (it.date ? it.date.slice(0, 4) : "");
  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  const sorted = () => TEARSHEETS.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

  // Items in the current tab (before year/outlet filters).
  function tabItems() {
    const all = sorted();
    if (state.tab === "cover") return all.filter((i) => i.cover);
    return all;
  }
  // Items after year + outlet filters.
  function filtered() {
    return tabItems().filter((i) => {
      const okY = state.year === "All" || yearOf(i) === state.year;
      const okO = state.outlet === "All" || i.outlet === state.outlet;
      return okY && okO;
    });
  }

  /* ── Masthead + top bar ────────────────────────────────────────────────── */
  function renderMasthead() {
    $("#masthead-title").textContent = CONFIG.title;
    $("#masthead-link").href = CONFIG.titleUrl || "#";
    $("#masthead-link").target = "_blank";
    $("#masthead-link").rel = "noopener";
    $("#masthead-motto").textContent = CONFIG.motto;
    $("#bar-location").textContent = CONFIG.location;
    $("#bar-weather").textContent = CONFIG.weather;
    $("#bar-edition").textContent = `${CONFIG.volume} · ${CONFIG.issue}`;
    $("#bar-site").href = CONFIG.siteUrl;
    $("#bar-site").textContent = (CONFIG.siteUrl || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    $("#bar-date").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    $("#footer-line").innerHTML =
      "All photographs © Brian Otieno, and their respective photographers and publications. Set for archival &amp; portfolio use. · " +
      `<a href="${esc(CONFIG.siteUrl)}">${esc((CONFIG.siteUrl || "").replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>`;
    document.title = CONFIG.title;
  }

  /* ── Tabs ──────────────────────────────────────────────────────────────── */
  function renderTabs() {
    const covers = TEARSHEETS.filter((i) => i.cover).length;
    const tabs = [
      { id: "all",   label: "Front Page",       count: TEARSHEETS.length },
      { id: "cover", label: "Cover Pages",      count: covers },
      { id: "about", label: "The Photographer", count: null },
    ];
    $("#tabs").innerHTML = tabs
      .map((t) => `<button class="nav-tab ${state.tab === t.id ? "is-active" : ""}" data-tab="${t.id}">${esc(t.label)}${
        t.count != null ? ` <span class="count">${t.count}</span>` : ""
      }</button>`)
      .join("");
  }

  /* ── Left rail: year timeline + outlet list ────────────────────────────── */
  function counts(items, keyFn) {
    const m = {};
    items.forEach((i) => { const k = keyFn(i); if (k) m[k] = (m[k] || 0) + 1; });
    return m;
  }
  function renderRailFilters() {
    const base = tabItems();
    // Years (desc)
    const yc = counts(base, yearOf);
    const years = Object.keys(yc).sort().reverse();
    $("#year-list").innerHTML =
      `<button class="year-btn ${state.year === "All" ? "is-active" : ""}" data-year="All">All Years <span class="n">${base.length}</span></button>` +
      years.map((y) => `<button class="year-btn ${state.year === y ? "is-active" : ""}" data-year="${y}">${y} <span class="n">${yc[y]}</span></button>`).join("");

    // Outlets by frequency
    const oc = counts(base, (i) => i.outlet);
    const outlets = Object.keys(oc).sort((a, b) => oc[b] - oc[a] || a.localeCompare(b));
    $("#outlet-list").innerHTML =
      `<button class="outlet-btn ${state.outlet === "All" ? "is-active" : ""}" data-outlet="All">All Outlets <span class="n">${base.length}</span></button>` +
      outlets.map((o) => `<button class="outlet-btn ${state.outlet === o ? "is-active" : ""}" data-outlet="${esc(o)}">${esc(o)} <span class="n">${oc[o]}</span></button>`).join("");

    // Mobile dropdowns mirror the same options
    $("#m-year").innerHTML = [`<option value="All">All Years</option>`].concat(years.map((y) => `<option value="${y}" ${state.year === y ? "selected" : ""}>${y} (${yc[y]})</option>`)).join("");
    $("#m-outlet").innerHTML = [`<option value="All">All Outlets</option>`].concat(outlets.map((o) => `<option value="${esc(o)}" ${state.outlet === o ? "selected" : ""}>${esc(o)} (${oc[o]})</option>`)).join("");
  }

  /* ── Right rail: bio, stats, contact ───────────────────────────────────── */
  function renderRightRail() {
    $("#bio-card").innerHTML =
      `<p class="bio-name">${esc(BIO.name)}</p>` +
      `<p class="bio-role">${esc(BIO.role)}</p>` +
      BIO.paragraphs.slice(0, 1).map((p) => `<p>${p}</p>`).join("");

    const years = TEARSHEETS.map(yearOf).filter(Boolean).map(Number);
    const outlets = new Set(TEARSHEETS.map((i) => i.outlet));
    const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";
    $("#stat-row").innerHTML =
      `<div class="stat"><span class="stat-num">${TEARSHEETS.length}</span><span class="stat-label">Tearsheets</span></div>` +
      `<div class="stat"><span class="stat-num">${span}</span><span class="stat-label">Years</span></div>` +
      `<div class="stat"><span class="stat-num">${outlets.size}</span><span class="stat-label">Outlets</span></div>`;

    const emails = CONTACT.emails.map((e) => `<a href="mailto:${esc(e)}">${esc(e)}</a>`).join("<br>");
    const tel = CONTACT.phone.replace(/[^+\d]/g, "");
    $("#contact-block").innerHTML =
      `<div class="ci"><span class="lab">Email</span><span class="val">${emails}</span></div>` +
      `<div class="ci"><span class="lab">Phone</span><span class="val"><a href="tel:${esc(tel)}">${esc(CONTACT.phone)}</a></span></div>` +
      `<div class="ci"><span class="lab">WhatsApp</span><span class="val"><a href="https://wa.me/${esc(tel.replace(/^\+/, ""))}" target="_blank" rel="noopener">${esc(CONTACT.whatsapp)}</a></span></div>` +
      `<div class="ci"><span class="lab">Web</span><span class="val"><a href="${esc(CONTACT.website)}" target="_blank" rel="noopener">${esc(CONTACT.website.replace(/^https?:\/\//, ""))}</a></span></div>`;
    $("#nyt-btn").href = CONTACT.nytProfile;
  }

  /* ── About panel (full bio + contact) ──────────────────────────────────── */
  function renderAbout() {
    const emails = CONTACT.emails.map((e) => `<div class="ci"><span class="lab">Email</span><span class="val"><a href="mailto:${esc(e)}">${esc(e)}</a></span></div>`).join("");
    const tel = CONTACT.phone.replace(/[^+\d]/g, "");
    $("#about-view").innerHTML = `
      <div class="about-panel">
        <h2>${esc(BIO.name)}</h2>
        <p class="role">${esc(BIO.role)}</p>
        ${BIO.paragraphs.map((p) => `<p>${p}</p>`).join("")}
        <div class="about-grid">
          <div>
            <h3>Contact</h3>
            <div class="contact-block">
              ${emails}
              <div class="ci"><span class="lab">Phone</span><span class="val"><a href="tel:${esc(tel)}">${esc(CONTACT.phone)}</a></span></div>
              <div class="ci"><span class="lab">WhatsApp</span><span class="val"><a href="https://wa.me/${esc(tel.replace(/^\+/, ""))}" target="_blank" rel="noopener">${esc(CONTACT.whatsapp)}</a></span></div>
            </div>
          </div>
          <div>
            <h3>Elsewhere</h3>
            <div class="contact-block">
              <div class="ci"><span class="lab">Website</span><span class="val"><a href="${esc(CONTACT.website)}" target="_blank" rel="noopener">${esc(CONTACT.website.replace(/^https?:\/\//, ""))}</a></span></div>
              <div class="ci"><span class="lab">NYT</span><span class="val"><a href="${esc(CONTACT.nytProfile)}" target="_blank" rel="noopener">nytimes.com/by/brian-otieno</a></span></div>
              <div class="ci"><span class="lab">Archive</span><span class="val"><a href="${esc(CONFIG.siteUrl)}" target="_blank" rel="noopener">${esc((CONFIG.siteUrl || "").replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a></span></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  /* ── Lead + grid ───────────────────────────────────────────────────────── */
  function cardMeta(it) {
    return `${esc(fmtDate(it.date))}${it.page ? " · " + esc(it.page) : ""}`;
  }
  let leadId = null;
  function renderLead(items) {
    // Feature the most recent story that has a written summary (a curated piece).
    const lead = items.find((i) => i.summary);
    leadId = lead ? lead.id : null;
    const wrap = $("#lead-story");
    if (!lead) { wrap.hidden = true; wrap.innerHTML = ""; return; }
    wrap.hidden = false;
    wrap.innerHTML = `
      <figure class="lead-figure" data-id="${esc(lead.id)}" role="button" tabindex="0" aria-label="Open ${esc(lead.title)}">
        <div class="lead-imgwrap">
          <img class="lead-img" loading="eager" src="${esc(driveToImage(lead.imageUrl, 1400))}" alt="${esc(lead.title)}" onerror="this.classList.add('img-failed')">
          <span class="zoom-cue">⌕</span>
        </div>
        <figcaption>
          <div class="kicker"><span class="outlet-badge">${esc(lead.outlet)}</span><span class="dot">•</span><span>${esc(lead.category || "")}</span></div>
          <h2 class="lead-headline">${esc(lead.title)}</h2>
          <p class="dateline"><b>${esc((CONFIG.location || "").toUpperCase())}</b> — ${cardMeta(lead)}</p>
          <p class="lead-excerpt">${esc(lead.summary)}</p>
          <p class="byline">Photograph by Brian Otieno</p>
        </figcaption>
      </figure>`;
  }
  function renderGrid(items) {
    const rest = items.filter((it) => it.id !== leadId);
    $("#grid").innerHTML = rest.map((it) => `
      <article class="card" data-id="${esc(it.id)}" role="button" tabindex="0" aria-label="Open ${esc(it.title)}">
        <div class="card-imgwrap">
          <img class="card-img" loading="lazy" src="${esc(driveToImage(it.imageUrl, 800))}" alt="${esc(it.title)}" onerror="this.classList.add('img-failed')">
          <span class="zoom-cue">⌕</span>
        </div>
        <div class="kicker"><span class="outlet-badge">${esc(it.outlet)}</span></div>
        <h3 class="card-headline">${esc(it.title)}</h3>
        <p class="card-meta">${cardMeta(it)}</p>
        ${it.summary ? `<p class="card-summary">${esc(it.summary)}</p>` : ""}
      </article>`).join("");
  }

  function render() {
    renderTabs();
    const about = state.tab === "about";
    $("#about-view").hidden = !about;
    $("#archive-view").hidden = about;
    document.querySelector(".layout").classList.toggle("layout--about", about);
    $(".rail-left").style.display = about ? "none" : "";
    $(".rail-right").style.display = about ? "none" : "";
    $("#section-head").style.display = about ? "none" : "";

    if (about) { renderAbout(); return; }

    renderRailFilters();
    const items = filtered();
    $("#section-title").textContent = state.tab === "cover" ? "Cover Pages & Front Pages" : "The Front Page";
    $("#results-count").textContent = items.length + (items.length === 1 ? " tearsheet" : " tearsheets");
    if (items.length === 0) {
      $("#lead-story").hidden = true; $("#lead-story").innerHTML = "";
      $("#grid").innerHTML = ""; $("#empty-state").hidden = false; return;
    }
    $("#empty-state").hidden = true;
    renderLead(items);
    renderGrid(items);
  }

  /* ── Lightbox ──────────────────────────────────────────────────────────── */
  const modal = {
    el: null,
    open(id) {
      const it = TEARSHEETS.find((t) => t.id === id);
      if (!it) return;
      const link = it.articleUrl || driveViewLink(it.imageUrl);
      const label = it.articleUrl ? "Read the original story ↗" : "View in Google Drive ↗";
      $("#modal-img").src = driveToFullImage(it.imageUrl);
      $("#modal-img").alt = it.title;
      $("#modal-img").classList.remove("is-zoomed");
      $("#modal-outlet").textContent = it.outlet;
      $("#modal-category").textContent = it.category || "";
      $("#modal-title").textContent = it.title;
      $("#modal-date").textContent = fmtDate(it.date);
      $("#modal-page").textContent = it.page || (it.cover ? "Front Page" : "—");
      $("#modal-summary").textContent = it.summary || "";
      const l = $("#modal-link");
      if (link) { l.href = link; l.textContent = label; l.hidden = false; } else l.hidden = true;
      this.el.classList.add("is-open");
      this.el.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $("#modal-close").focus();
    },
    close() {
      this.el.classList.remove("is-open");
      this.el.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    },
  };

  /* ── Events ────────────────────────────────────────────────────────────── */
  function wire() {
    $("#tabs").addEventListener("click", (e) => {
      const b = e.target.closest(".nav-tab"); if (!b) return;
      state.tab = b.dataset.tab; state.year = "All"; state.outlet = "All";
      render(); window.scrollTo({ top: 0, behavior: "smooth" });
    });
    $("#year-list").addEventListener("click", (e) => {
      const b = e.target.closest(".year-btn"); if (!b) return;
      state.year = b.dataset.year; render();
    });
    $("#outlet-list").addEventListener("click", (e) => {
      const b = e.target.closest(".outlet-btn"); if (!b) return;
      state.outlet = b.dataset.outlet; render();
    });
    $("#m-year").addEventListener("change", (e) => { state.year = e.target.value; render(); });
    $("#m-outlet").addEventListener("change", (e) => { state.outlet = e.target.value; render(); });

    // Open modal from any card / lead
    document.addEventListener("click", (e) => {
      if (e.target.closest("#lightbox")) return;
      const host = e.target.closest("#archive-view [data-id]");
      if (host) modal.open(host.dataset.id);
    });
    document.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-id]")) { e.preventDefault(); modal.open(e.target.dataset.id); }
      if (e.key === "Escape" && modal.el.classList.contains("is-open")) modal.close();
    });

    modal.el = $("#lightbox");
    $("#modal-close").addEventListener("click", () => modal.close());
    modal.el.addEventListener("click", (e) => { if (e.target === modal.el || e.target.classList.contains("modal-backdrop")) modal.close(); });
    $("#modal-img").addEventListener("click", (e) => e.currentTarget.classList.toggle("is-zoomed"));
  }

  function init() { renderMasthead(); renderRightRail(); render(); wire(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
