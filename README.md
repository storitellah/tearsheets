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

A single, static front page in the **New York Times house style** — self-hosted
NYT type (Cheltenham headlines, Imperial body, Franklin labels), a white ground,
column rules, and a three-column layout (**filters · stories · the photographer**).
Brian Otieno's full Google Drive archive is pulled in automatically; where the
original online story is known, it links straight to it.

### Highlights

| | |
|---|---|
| 🗞 **NYT design system** | Cheltenham / Imperial / Franklin, column rules, no external CDNs |
| 🗂 **Four tabs** | Front Page · Cover Pages (NYT-heavy) · The Articles · The Photographer |
| 🔗 **The Articles** | A curated, clickable list of 25 published stories, incl. ProPublica |
| 🕰 **Timeline + outlet filters** | Filter instantly by year or publication in the left rail |
| 🖼 **Original aspect ratios** | Masonry grid shows every clipping at its true proportions |
| ⚡ **Instant lightbox** | Opens with the cached thumbnail, then swaps in the hi-res image |
| 👤 **The Photographer** | Bio + contacts (email · phone · WhatsApp · web · NYT / Spiegel / ProPublica) |
| 📱 **Responsive** | Three columns on desktop, a clean single column on mobile |

### Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `styles.css` | NYT design system — self-hosted `@font-face`, reskin from `:root` |
| `tearsheets.js` | **Data** — `CONFIG`, `BIO`, `CONTACT`, `ARTICLES`, `TEARSHEETS` |
| `app.js` | Rendering, filtering, tabs and the lightbox |
| `fonts/` | NYT Cheltenham / Imperial / Franklin (`.ttf`) |
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
