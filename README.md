<h1 align="center">The Tearsheet Archives of Brian Otieno</h1>

<p align="center">
  <em>A broadsheet-style, front-end-only archive of editorial photojournalism —<br>
  print spreads, cover pages and front-page features.</em>
</p>

<p align="center">
  <strong>🌐 Live:</strong> <a href="https://tearsheets.pages.dev/">tearsheets.pages.dev</a>
  &nbsp;·&nbsp; <strong>📷 Photographer:</strong> <a href="https://storitellah.com">storitellah.com</a>
  &nbsp;·&nbsp; <strong>🗞 NYT:</strong> <a href="https://www.nytimes.com/by/brian-otieno">nytimes.com/by/brian-otieno</a>
</p>

---

### What it is

A single, static newspaper laid out like the front page of a great daily — a warm
newsprint palette, a readable editorial serif, and a three-column homepage grid
(**timeline & outlet rails · lead story · the photographer**). Every tearsheet in
Brian Otieno's Google Drive archive is pulled in automatically; where the original
online story is known, the card links straight to it.

### Highlights

| | |
|---|---|
| 🏛 **Broadsheet design** | Masthead, oxblood kickers, minimal rules, ink-on-paper grain |
| 🗂 **Front Page & Cover Pages tabs** | A dedicated tab for cover & front-page work (New York Times–heavy) |
| 🕰 **Timeline + outlet filters** | Filter instantly by year or publication in the left rail |
| 🖼 **Original aspect ratios** | Masonry grid shows every clipping at its true proportions |
| 🔍 **Reader lightbox** | Click any sheet for a high-res, zoomable view with metadata & source link |
| 👤 **The Photographer** | Bio + full contact card (email · phone · WhatsApp · web · NYT) |
| 📱 **Responsive** | Three columns on desktop, a clean single column on mobile |

### Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `styles.css` | Broadsheet design system — reskin from the `:root` variables |
| `tearsheets.js` | **Data** — `CONFIG`, `BIO`, `CONTACT` and the `TEARSHEETS` array |
| `app.js` | Rendering, filtering, tabs and the lightbox |
| `favicon.svg` | `BO` monogram tab icon |

### Run it

```bash
python3 -m http.server 8000    # → http://localhost:8000
```

### Add or edit a tearsheet

Everything lives in **`tearsheets.js`**. Copy a block in the `TEARSHEETS` array:

```js
{
  id: "nyt-2025-example",
  title: "Cover Story: Title Here",
  outlet: "The New York Times",
  date: "2025-11-14",           // drives the timeline & sorting
  page: "Front Page",
  category: "Foreign Affairs",
  cover: true,                  // show under the “Cover Pages” tab
  summary: "Brief synopsis of the photo feature…",
  imageUrl: "https://drive.google.com/file/d/FILE_ID/view?usp=sharing",
  articleUrl: "https://…"       // optional — links to the original story
}
```

> **Google Drive images** — paste the normal *Share* link; it is converted to a
> hot-linkable image automatically. For images to appear, set each file's sharing
> to **“Anyone with the link.”** Local paths and direct URLs also work.

<p align="center"><sub>All photographs © Brian Otieno, and their respective photographers and publications. Set for archival &amp; portfolio use.</sub></p>
