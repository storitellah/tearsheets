/* ============================================================================
 *  app.js  —  ARCHIVE LOGIC
 * ----------------------------------------------------------------------------
 *  Vanilla JS, no build. Reads CONFIG / BIO / CONTACT / ARTICLES / TEARSHEETS
 *  from tearsheets.js. Renders masthead, tabs, side rails, the story grid,
 *  the articles list, the photographer panel and the lightbox.
 *  Edit the data file, not this one.
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
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w${size || 800}` : url;
  }
  const driveFull = (url) => driveToImage(url, 1600);
  function driveViewLink(url) {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/file/d/${id}/view` : null;
  }

  /* ── Utilities ─────────────────────────────────────────────────────────── */
  const $ = (s, r) => (r || document).querySelector(s);
  const yearOf = (it) => it.year || (it.date ? it.date.slice(0, 4) : "");
  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1);

  /* Collection backing the active tab (before year/outlet filters). */
  function tabItems() {
    if (state.tab === "articles") return ARTICLES.slice().sort(byDateDesc);
    if (state.tab === "about") return [];
    const all = TEARSHEETS.slice().sort(byDateDesc);
    return state.tab === "cover" ? all.filter((i) => i.cover) : all;
  }
  function filtered() {
    return tabItems().filter((i) => {
      const okY = state.year === "All" || yearOf(i) === state.year;
      const okO = state.outlet === "All" || i.outlet === state.outlet;
      return okY && okO;
    });
  }

  /* ── Masthead + top bar + footer ───────────────────────────────────────── */
  function renderMasthead() {
    $("#masthead-title").textContent = CONFIG.title;
    Object.assign($("#masthead-link"), { href: CONFIG.titleUrl || "#", target: "_blank", rel: "noopener" });
    $("#masthead-motto").textContent = CONFIG.motto;
    $("#bar-location").textContent = CONFIG.location;
    $("#bar-weather").textContent = CONFIG.weather;
    $("#bar-edition").textContent = `${CONFIG.volume} · ${CONFIG.issue}`;
    const siteShort = (CONFIG.siteUrl || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    Object.assign($("#bar-site"), { href: CONFIG.siteUrl, textContent: siteShort });
    $("#bar-date").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    $("#footer-line").innerHTML =
      "All photographs © Brian Otieno, and their respective photographers and publications. Set for archival &amp; portfolio use. · " +
      `<a href="${esc(CONFIG.siteUrl)}">${esc(siteShort)}</a>`;
    document.title = CONFIG.title;
  }

  /* ── Tabs ──────────────────────────────────────────────────────────────── */
  function renderTabs() {
    const tabs = [
      { id: "all",      label: "Front Page",       count: TEARSHEETS.length },
      { id: "cover",    label: "Cover Pages",      count: TEARSHEETS.filter((i) => i.cover).length },
      { id: "articles", label: "The Articles",     count: ARTICLES.length },
      { id: "about",    label: "The Photographer", count: null },
    ];
    $("#tabs").innerHTML = tabs.map((t) =>
      `<button class="nav-tab ${state.tab === t.id ? "is-active" : ""}" data-tab="${t.id}">${esc(t.label)}${
        t.count != null ? ` <span class="count">${t.count}</span>` : ""}</button>`).join("");
  }

  /* ── Left rail ─────────────────────────────────────────────────────────── */
  function counts(items, keyFn) {
    const m = {}; items.forEach((i) => { const k = keyFn(i); if (k) m[k] = (m[k] || 0) + 1; }); return m;
  }
  function renderFilters() {
    const base = tabItems();
    const yc = counts(base, yearOf);
    const years = Object.keys(yc).sort().reverse();
    $("#year-list").innerHTML =
      `<button class="year-btn ${state.year === "All" ? "is-active" : ""}" data-year="All">All Years <span class="n">${base.length}</span></button>` +
      years.map((y) => `<button class="year-btn ${state.year === y ? "is-active" : ""}" data-year="${y}">${y} <span class="n">${yc[y]}</span></button>`).join("");

    const oc = counts(base, (i) => i.outlet);
    const outlets = Object.keys(oc).sort((a, b) => oc[b] - oc[a] || a.localeCompare(b));
    $("#outlet-list").innerHTML =
      `<button class="outlet-btn ${state.outlet === "All" ? "is-active" : ""}" data-outlet="All">All Outlets <span class="n">${base.length}</span></button>` +
      outlets.map((o) => `<button class="outlet-btn ${state.outlet === o ? "is-active" : ""}" data-outlet="${esc(o)}">${esc(o)} <span class="n">${oc[o]}</span></button>`).join("");

    $("#m-year").innerHTML = `<option value="All">All Years</option>` + years.map((y) => `<option value="${y}" ${state.year === y ? "selected" : ""}>${y} (${yc[y]})</option>`).join("");
    $("#m-outlet").innerHTML = `<option value="All">All Outlets</option>` + outlets.map((o) => `<option value="${esc(o)}" ${state.outlet === o ? "selected" : ""}>${esc(o)} (${oc[o]})</option>`).join("");
  }
  // Career facts fill the left rail on the About tab (never blank).
  function renderFacts() {
    const facts = [
      ["Based in", "Nairobi, Kenya"],
      ["Project", "KiberaStories, since 2013"],
      ["Selected", "NYT Portfolio Review, 2019"],
      ["Grant", "Reuters Photojournalism, 2019"],
      ["Award", "East African Photography Award, 2018"],
      ["Collective", "Everyday Africa, since 2017"],
    ];
    $("#rail-facts").innerHTML =
      `<div class="rail-block"><p class="rail-heading">Career</p><div class="facts">` +
      facts.map((f) => `<div class="f"><b>${esc(f[1])}</b>${esc(f[0])}</div>`).join("") +
      `</div></div>`;
  }

  /* ── Right rail (bio card, stats, contact, profiles) — on every tab ─────── */
  function renderRightRail() {
    $("#bio-card").innerHTML =
      `<p class="bio-name">${esc(BIO.name)}</p><p class="bio-role">${esc(BIO.role)}</p><p>${BIO.paragraphs[0]}</p>`;

    const years = TEARSHEETS.map(yearOf).filter(Boolean).map(Number);
    const outlets = new Set(TEARSHEETS.map((i) => i.outlet));
    const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";
    $("#stat-row").innerHTML =
      `<div class="stat"><span class="stat-num">${TEARSHEETS.length}</span><span class="stat-label">Tearsheets</span></div>` +
      `<div class="stat"><span class="stat-num">${span}</span><span class="stat-label">Years</span></div>` +
      `<div class="stat"><span class="stat-num">${outlets.size}</span><span class="stat-label">Outlets</span></div>`;

    $("#contact-block").innerHTML = contactRows();
    $("#profile-links").innerHTML =
      `<a href="${esc(CONTACT.nytProfile)}" target="_blank" rel="noopener">New York Times profile ↗</a>` +
      `<a href="${esc(CONTACT.spiegelProfile)}" target="_blank" rel="noopener">Der Spiegel profile ↗</a>` +
      `<a href="${esc(CONTACT.proPublicaProfile)}" target="_blank" rel="noopener">ProPublica profile ↗</a>`;
  }
  function contactRows() {
    const tel = CONTACT.phone.replace(/[^+\d]/g, "");
    const emails = CONTACT.emails.map((e) => `<a href="mailto:${esc(e)}">${esc(e)}</a>`).join("<br>");
    return `<div class="ci"><span class="lab">Email</span><span class="val">${emails}</span></div>` +
      `<div class="ci"><span class="lab">Phone</span><span class="val"><a href="tel:${esc(tel)}">${esc(CONTACT.phone)}</a></span></div>` +
      `<div class="ci"><span class="lab">WhatsApp</span><span class="val"><a href="https://wa.me/${esc(tel.replace(/^\+/, ""))}" target="_blank" rel="noopener">${esc(CONTACT.whatsapp)}</a></span></div>` +
      `<div class="ci"><span class="lab">Website</span><span class="val"><a href="${esc(CONTACT.website)}" target="_blank" rel="noopener">${esc(CONTACT.website.replace(/^https?:\/\//, ""))}</a></span></div>`;
  }

  /* ── About panel ───────────────────────────────────────────────────────── */
  function renderAbout() {
    $("#about-view").innerHTML = `
      <div class="about-panel">
        <h2>${esc(BIO.name)}</h2>
        <p class="role">${esc(BIO.role)}</p>
        ${BIO.paragraphs.map((p, i) => `<p${i === 0 ? ' class="lead-para"' : ""}>${p}</p>`).join("")}
        <div class="about-contact">
          <div class="section-head"><h2>Contact</h2></div>
          <div class="contact-block">${contactRows()}</div>
          <div class="profile-links" style="margin-top:14px">
            <a href="${esc(CONTACT.nytProfile)}" target="_blank" rel="noopener">New York Times profile ↗</a>
            <a href="${esc(CONTACT.spiegelProfile)}" target="_blank" rel="noopener">Der Spiegel profile ↗</a>
            <a href="${esc(CONTACT.proPublicaProfile)}" target="_blank" rel="noopener">ProPublica profile ↗</a>
          </div>
        </div>
      </div>`;
  }

  /* ── Articles list ─────────────────────────────────────────────────────── */
  function renderArticles(list) {
    $("#articles-view").innerHTML =
      `<p class="articles-note">Selected stories published with Brian Otieno's photography — each links to the original.</p>` +
      `<div class="articles">` + list.map((a) => `
        <a class="article-item" href="${esc(a.url)}" target="_blank" rel="noopener">
          <div class="kicker"><span class="outlet-badge">${esc(a.outlet)}</span></div>
          <div class="article-title">${esc(a.title)}</div>
          <div class="article-meta">${esc(fmtDate(a.date))} &nbsp;·&nbsp; <span class="go">Read ↗</span></div>
        </a>`).join("") + `</div>`;
  }

  /* ── Lead + grid ───────────────────────────────────────────────────────── */
  const cardMeta = (it) => `${esc(fmtDate(it.date))}${it.page ? " · " + esc(it.page) : ""}`;
  let leadId = null;
  function renderLead(items) {
    const lead = items.find((i) => i.summary);
    leadId = lead ? lead.id : null;
    const wrap = $("#lead-story");
    if (!lead) { wrap.hidden = true; wrap.innerHTML = ""; return; }
    wrap.hidden = false;
    wrap.innerHTML = `
      <figure class="lead-figure" data-id="${esc(lead.id)}" role="button" tabindex="0" aria-label="Open ${esc(lead.title)}">
        <div class="lead-imgwrap">
          <img class="lead-img" loading="eager" decoding="async" src="${esc(driveToImage(lead.imageUrl, 1200))}" alt="${esc(lead.title)}" onerror="this.classList.add('img-failed')">
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
    $("#grid").innerHTML = items.filter((it) => it.id !== leadId).map((it) => `
      <article class="card" data-id="${esc(it.id)}" role="button" tabindex="0" aria-label="Open ${esc(it.title)}">
        <div class="card-imgwrap">
          <img class="card-img" loading="lazy" decoding="async" src="${esc(driveToImage(it.imageUrl, 700))}" alt="${esc(it.title)}" onerror="this.classList.add('img-failed')">
          <span class="zoom-cue">⌕</span>
        </div>
        <div class="kicker"><span class="outlet-badge">${esc(it.outlet)}</span></div>
        <h3 class="card-headline">${esc(it.title)}</h3>
        <p class="card-meta">${cardMeta(it)}</p>
        ${it.summary ? `<p class="card-summary">${esc(it.summary)}</p>` : ""}
      </article>`).join("");
  }

  /* ── Main render / view switch ─────────────────────────────────────────── */
  function render() {
    renderTabs();
    const t = state.tab;
    const about = t === "about", articles = t === "articles";

    $("#about-view").hidden = !about;
    $("#articles-view").hidden = !articles;
    $("#archive-view").hidden = about || articles;
    $("#section-head").style.display = about ? "none" : "";
    // Left rail: filters for browse/articles, career facts for about — never empty.
    $("#rail-filters").hidden = about;
    $("#rail-facts").hidden = !about;
    $(".mobile-filters").style.display = about ? "none" : "";

    if (about) { renderFacts(); renderAbout(); return; }

    renderFilters();
    const items = filtered();

    if (articles) {
      $("#section-title").textContent = "Published Work";
      $("#results-count").textContent = items.length + (items.length === 1 ? " story" : " stories");
      $("#year-heading").textContent = "By Year";
      renderArticles(items);
      return;
    }

    $("#year-heading").textContent = "Timeline";
    $("#section-title").textContent = t === "cover" ? "Cover Pages & Front Pages" : "The Front Page";
    $("#results-count").textContent = items.length + (items.length === 1 ? " tearsheet" : " tearsheets");
    if (!items.length) { $("#lead-story").hidden = true; $("#lead-story").innerHTML = ""; $("#grid").innerHTML = ""; $("#empty-state").hidden = false; return; }
    $("#empty-state").hidden = true;
    renderLead(items);
    renderGrid(items);
  }

  /* ── Lightbox (opens instantly: cached thumb first, hi-res swapped in) ──── */
  const modal = {
    el: null,
    open(id) {
      const it = TEARSHEETS.find((t) => t.id === id);
      if (!it) return;
      const img = $("#modal-img");
      const col = img.parentElement;
      const thumb = driveToImage(it.imageUrl, 700);   // already cached from the grid
      const full = driveFull(it.imageUrl);

      img.classList.remove("is-zoomed");
      img.src = thumb;                                 // instant paint
      if (full !== thumb) {
        col.classList.add("loading");
        const hi = new Image();
        hi.onload = () => { img.src = full; col.classList.remove("loading"); };
        hi.onerror = () => col.classList.remove("loading");
        hi.src = full;
      }
      const link = it.articleUrl || driveViewLink(it.imageUrl);
      const label = it.articleUrl ? "Read the original story ↗" : "View in Google Drive ↗";
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
    $("#year-list").addEventListener("click", (e) => { const b = e.target.closest(".year-btn"); if (b) { state.year = b.dataset.year; render(); } });
    $("#outlet-list").addEventListener("click", (e) => { const b = e.target.closest(".outlet-btn"); if (b) { state.outlet = b.dataset.outlet; render(); } });
    $("#m-year").addEventListener("change", (e) => { state.year = e.target.value; render(); });
    $("#m-outlet").addEventListener("change", (e) => { state.outlet = e.target.value; render(); });

    document.addEventListener("click", (e) => {
      if (e.target.closest("#lightbox")) return;
      const host = e.target.closest("#archive-view [data-id]");
      if (host) modal.open(host.dataset.id);
    });
    document.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches("#archive-view [data-id]")) { e.preventDefault(); modal.open(e.target.dataset.id); }
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
