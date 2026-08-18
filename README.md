# The Otieno Chronicle — Photojournalism Tearsheet Archive

A modern, **static, front-end-only** web archive styled like a classic broadsheet
newspaper, for showcasing editorial photojournalism tearsheets, print spreads and
front-page features. No backend, no build step — just open `index.html`.

## Files

| File            | What it is                                                        |
| --------------- | ----------------------------------------------------------------- |
| `index.html`    | Page structure (masthead, ticker, filters, grid, lightbox).       |
| `styles.css`    | The broadsheet design system — edit the `:root` variables to reskin. |
| `tearsheets.js` | **The data file.** Edit this to add/remove/change clippings.       |
| `app.js`        | Rendering, filtering and lightbox logic (rarely needs edits).      |

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

An internet connection is needed for the Google Fonts, Tailwind CDN, and the
Google Drive images to load.

## Add a tearsheet

Open `tearsheets.js` and copy one `{ ... }` block inside the `TEARSHEETS` array:

```javascript
{
  id: "nyt-2025-example",
  title: "Cover Story: Title Here",
  outlet: "The New York Times",
  date: "2025-11-14",          // YYYY-MM-DD — powers the year filter & sorting
  page: "Page A1",
  category: "Front Page",
  summary: "Brief synopsis of the photo feature...",
  imageUrl: "https://drive.google.com/file/d/FILE_ID/view?usp=sharing",
  articleUrl: "https://...",   // optional link to the original online story
}
```

The most recent item (by `date`) automatically becomes the **Lead Story** above
the fold; the rest fill the clippings grid.

### Google Drive images

Just paste the normal Drive **Share** link — the app converts it to a
hot-linkable image for you (see `driveToImage()` in `app.js`). For images to
appear, set each file's sharing to **"Anyone with the link."** Local paths
(e.g. `img/story.jpg`) and direct image URLs also work.

## Customize the newspaper

Edit the `CONFIG` object at the top of `tearsheets.js` to change the masthead
title, motto, location, weather line and edition numbers. Colours and fonts live
in the `:root` block of `styles.css`.
