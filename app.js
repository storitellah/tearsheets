/* ============================================================================
 *  app.js  —  ARCHIVE LOGIC  (rendering, filtering, lightbox)
 * ----------------------------------------------------------------------------
 *  Pure vanilla JavaScript. No build step, no framework. Reads its data from
 *  the global TEARSHEETS + CONFIG defined in tearsheets.js.
 *  You should rarely need to edit this file — edit tearsheets.js instead.
 * ========================================================================== */

(function () {
  "use strict";

  /* ── State ─────────────────────────────────────────────────────────────── */
  const state = {
    year: "All",     // active year filter
    outlet: "All",   // active outlet filter
  };

  /* ────────────────────────────────────────────────────────────────────────
   *  GOOGLE DRIVE DIRECT-LINK HELPER
   *  Accepts any of:
   *    • a standard share link  https://drive.google.com/file/d/FILE_ID/view?...
   *    • an "open?id=" link      https://drive.google.com/open?id=FILE_ID
   *    • an already-direct link  https://lh3.googleusercontent.com/d/FILE_ID
   *    • a local/relative path   img/story.jpg   (returned untouched)
   *  Returns a hot-linkable image URL. `size` controls the Drive thumbnail
   *  width, e.g. driveToImage(url, 1600).
   * ──────────────────────────────────────────────────────────────────────── */
  function extractDriveId(url) {
    if (!url) return null;
    // /file/d/FILE_ID/...   or   /d/FILE_ID
    let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    // ?id=FILE_ID  or  &id=FILE_ID
    m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    return null;
  }

  function driveToImage(url, size) {
    const id = extractDriveId(url);
    if (!id) return url; // not a Drive link — assume local path / direct URL
    const w = size || 1200;
    // The thumbnail endpoint is the most reliable for hot-linking Drive images.
    return `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
  }

  // High-resolution variant used in the lightbox.
  function driveToFullImage(url) {
    const id = extractDriveId(url);
    if (!id) return url;
    return `https://drive.google.com/thumbnail?id=${id}&sz=w2400`;
  }

  // A "view in Drive" link for the original file.
  function driveViewLink(url) {
    const id = extractDriveId(url);
    if (!id) return null;
    return `https://drive.google.com/file/d/${id}/view`;
  }

  /* ── Small utilities ───────────────────────────────────────────────────── */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function yearOf(item) {
    return item.year || (item.date ? item.date.slice(0, 4) : "");
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Sorted copy of the archive, newest first.
  function sortedItems() {
    return TEARSHEETS.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  // Apply the active year + outlet filters.
  function filteredItems() {
    return sortedItems().filter((it) => {
      const okYear = state.year === "All" || yearOf(it) === state.year;
      const okOutlet = state.outlet === "All" || it.outlet === state.outlet;
      return okYear && okOutlet;
    });
  }

  /* ── Masthead + top bar ────────────────────────────────────────────────── */
  function renderMasthead() {
    $("#masthead-title").textContent = CONFIG.title;
    $("#masthead-motto").textContent = CONFIG.motto;
    $("#bar-location").textContent = CONFIG.location;
    $("#bar-weather").textContent = CONFIG.weather;
    $("#bar-volume").textContent = `${CONFIG.volume} · ${CONFIG.issue}`;
    $("#bar-price").textContent = CONFIG.price;

    // Live, current dateline.
    $("#bar-date").textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /* ── Summary statistics ────────────────────────────────────────────────── */
  function renderStats() {
    const items = TEARSHEETS;
    const years = items.map(yearOf).filter(Boolean).map(Number);
    const outlets = new Set(items.map((i) => i.outlet));
    const span =
      years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";

    $("#stat-publications").textContent = items.length;
    $("#stat-years").textContent = span;
    $("#stat-outlets").textContent = outlets.size;
  }

  /* ── News ticker (scrolling latest headlines) ──────────────────────────── */
  function renderTicker() {
    const heads = sortedItems()
      .slice(0, 8)
      .map(
        (it) =>
          `<span class="ticker-item"><span class="ticker-outlet">${escapeHtml(
            it.outlet
          )}</span> ${escapeHtml(it.title)}</span><span class="ticker-sep">◆</span>`
      )
      .join("");
    // Duplicated so the marquee loops seamlessly.
    $("#ticker-track").innerHTML = heads + heads;
  }

  /* ── Year ribbon + outlet chips ────────────────────────────────────────── */
  function renderFilters() {
    // Years, descending.
    const years = Array.from(new Set(sortedItems().map(yearOf))).filter(Boolean);
    const yearRibbon = $("#year-ribbon");
    yearRibbon.innerHTML = ["All", ...years]
      .map(
        (y) =>
          `<button class="year-btn ${
            state.year === y ? "is-active" : ""
          }" data-year="${escapeHtml(y)}">${y === "All" ? "All Years" : y}</button>`
      )
      .join("");

    // Outlets, alphabetical.
    const outlets = Array.from(new Set(TEARSHEETS.map((i) => i.outlet))).sort();
    const chips = $("#outlet-chips");
    chips.innerHTML = ["All", ...outlets]
      .map(
        (o) =>
          `<button class="outlet-chip ${
            state.outlet === o ? "is-active" : ""
          }" data-outlet="${escapeHtml(o)}">${
            o === "All" ? "All Outlets" : escapeHtml(o)
          }</button>`
      )
      .join("");
  }

  /* ── Lead story (above the fold) ───────────────────────────────────────── */
  function renderLead(items) {
    const lead = items[0];
    const wrap = $("#lead-story");
    if (!lead) {
      wrap.innerHTML = "";
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    wrap.innerHTML = `
      <figure class="lead-figure" data-id="${escapeHtml(lead.id)}" role="button"
              tabindex="0" aria-label="Open ${escapeHtml(lead.title)}">
        <div class="lead-imgwrap">
          <img class="lead-img" loading="eager"
               src="${escapeHtml(driveToImage(lead.imageUrl, 1600))}"
               alt="${escapeHtml(lead.title)}"
               onerror="this.classList.add('img-failed')">
          <span class="zoom-cue" aria-hidden="true">⌕</span>
        </div>
        <figcaption class="lead-body">
          <div class="kicker">
            <span class="outlet-badge">${escapeHtml(lead.outlet)}</span>
            <span class="dot">•</span>
            <span>${escapeHtml(lead.category || "")}</span>
          </div>
          <h2 class="lead-headline">${escapeHtml(lead.title)}</h2>
          <p class="dateline">
            <span class="dateline-place">${escapeHtml(
              (CONFIG.location || "").toUpperCase()
            )}</span> — ${escapeHtml(formatDate(lead.date))}
            ${lead.page ? " · " + escapeHtml(lead.page) : ""}
          </p>
          <p class="lead-excerpt">${escapeHtml(lead.summary || "")}</p>
          <p class="byline">Photographs by Brian Otieno</p>
        </figcaption>
      </figure>`;
  }

  /* ── Clippings grid (sub-features) ─────────────────────────────────────── */
  function renderGrid(items) {
    const rest = items.slice(1); // everything except the lead
    const grid = $("#grid");
    const empty = $("#empty-state");

    if (items.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    grid.innerHTML = rest
      .map(
        (it) => `
      <article class="card" data-id="${escapeHtml(it.id)}" role="button"
               tabindex="0" aria-label="Open ${escapeHtml(it.title)}">
        <div class="card-imgwrap">
          <img class="card-img" loading="lazy"
               src="${escapeHtml(driveToImage(it.imageUrl, 900))}"
               alt="${escapeHtml(it.title)}"
               onerror="this.classList.add('img-failed')">
          <span class="zoom-cue" aria-hidden="true">⌕</span>
        </div>
        <div class="card-body">
          <div class="kicker">
            <span class="outlet-badge">${escapeHtml(it.outlet)}</span>
          </div>
          <h3 class="card-headline">${escapeHtml(it.title)}</h3>
          <p class="card-meta">${escapeHtml(formatDate(it.date))}${
          it.page ? " · " + escapeHtml(it.page) : ""
        }</p>
          <p class="card-summary">${escapeHtml(it.summary || "")}</p>
        </div>
      </article>`
      )
      .join("");
  }

  function renderArchive() {
    const items = filteredItems();
    renderLead(items);
    renderGrid(items);
    $("#results-count").textContent =
      items.length + (items.length === 1 ? " clipping" : " clippings");
  }

  /* ── Lightbox / reader modal ───────────────────────────────────────────── */
  const modal = {
    el: null,
    open(id) {
      const it = TEARSHEETS.find((t) => t.id === id);
      if (!it) return;
      const viewLink = it.articleUrl || driveViewLink(it.imageUrl);
      const linkLabel = it.articleUrl ? "Read the original story ↗" : "View in Google Drive ↗";

      $("#modal-img").src = driveToFullImage(it.imageUrl);
      $("#modal-img").alt = it.title;
      $("#modal-outlet").textContent = it.outlet;
      $("#modal-category").textContent = it.category || "";
      $("#modal-title").textContent = it.title;
      $("#modal-date").textContent = formatDate(it.date);
      $("#modal-page").textContent = it.page || "—";
      $("#modal-summary").textContent = it.summary || "";

      const linkEl = $("#modal-link");
      if (viewLink) {
        linkEl.href = viewLink;
        linkEl.textContent = linkLabel;
        linkEl.hidden = false;
      } else {
        linkEl.hidden = true;
      }

      // Reset zoom each time.
      $("#modal-img").classList.remove("is-zoomed");

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

  /* ── Event wiring ──────────────────────────────────────────────────────── */
  function wireEvents() {
    // Year ribbon.
    $("#year-ribbon").addEventListener("click", (e) => {
      const btn = e.target.closest(".year-btn");
      if (!btn) return;
      state.year = btn.dataset.year;
      renderFilters();
      renderArchive();
    });

    // Outlet chips.
    $("#outlet-chips").addEventListener("click", (e) => {
      const btn = e.target.closest(".outlet-chip");
      if (!btn) return;
      state.outlet = btn.dataset.outlet;
      renderFilters();
      renderArchive();
    });

    // Open modal from any card or the lead (click + keyboard).
    function openFrom(target) {
      const host = target.closest("[data-id]");
      if (host) modal.open(host.dataset.id);
    }
    document.addEventListener("click", (e) => {
      if (e.target.closest("#lightbox")) return; // modal handles its own clicks
      openFrom(e.target);
    });
    document.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-id]")) {
        e.preventDefault();
        modal.open(e.target.dataset.id);
      }
    });

    // Modal controls.
    modal.el = $("#lightbox");
    $("#modal-close").addEventListener("click", () => modal.close());
    modal.el.addEventListener("click", (e) => {
      if (e.target === modal.el || e.target.classList.contains("modal-backdrop")) {
        modal.close();
      }
    });
    // Click the image to toggle a zoom-in.
    $("#modal-img").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("is-zoomed");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.el.classList.contains("is-open")) modal.close();
    });
  }

  /* ── Boot ──────────────────────────────────────────────────────────────── */
  function init() {
    renderMasthead();
    renderStats();
    renderTicker();
    renderFilters();
    renderArchive();
    wireEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
