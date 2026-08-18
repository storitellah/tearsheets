/* ============================================================================
 *  tearsheets.js  —  CENTRAL DATA FILE  (edit this file to update the archive)
 * ----------------------------------------------------------------------------
 *  This is the ONLY file you need to touch to add, remove, or edit clippings.
 *  Everything else (layout, filtering, lightbox) reads from the arrays below.
 *
 *  ── HOW TO ADD A TEARSHEET ──────────────────────────────────────────────
 *  Copy one { ... } block inside TEARSHEETS, paste it, and change the fields.
 *
 *  Each entry supports:
 *    id            unique slug, e.g. "nyt-2025-somalia"        (required)
 *    title         the story headline                          (required)
 *    outlet        publication name, e.g. "The New York Times" (required)
 *    date          publication date "YYYY-MM-DD"               (required)
 *    year          "2025"  — optional; auto-derived from date if omitted
 *    page          e.g. "Front Page", "Page A1", "World"       (optional)
 *    category      topic tag, e.g. "Foreign Affairs"           (optional)
 *    summary       one or two sentence synopsis                (optional)
 *    imageUrl      a Google Drive SHARE link, a direct image
 *                  URL, or a local path like "img/story.jpg".
 *                  Drive share links are auto-converted — see
 *                  driveToImage() in app.js.                   (required)
 *    articleUrl    link to the original online story           (optional)
 *
 *  ── GOOGLE DRIVE IMAGES ─────────────────────────────────────────────────
 *  Just paste the normal "Share" link that Drive gives you:
 *      https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *  The app converts it to a hot-linkable image automatically. For the images
 *  to appear, the file's sharing must be set to "Anyone with the link".
 * ========================================================================== */


/* ── MASTHEAD / EDITION CONFIG  (change the newspaper's identity here) ────── */
const CONFIG = {
  title:    "THE OTIENO CHRONICLE",          // masthead nameplate
  motto:    "Photojournalism · Tearsheets · Front-Page Features",
  location: "Nairobi, Kenya",
  weather:  "26°C · Clear Skies",            // static — front-end only, no API
  volume:   "Vol. XII",                       // decorative edition numbers
  issue:    "No. 214",
  price:    "The Archive Edition",
};


/* ── THE ARCHIVE  (real published tearsheets — edit / extend freely) ──────── */
const TEARSHEETS = [
  {
    id: "nyt-2025-somalia-aid",
    title: "America's Retreat From Aid Is Devastating Somalia's Health System",
    outlet: "The New York Times",
    date: "2025-10-18",
    page: "Front Page",
    category: "Foreign Affairs",
    summary:
      "Hunger and the diseases that stalk small children have surged in Somalia " +
      "after the United States slashed its aid to the country.",
    imageUrl: "https://drive.google.com/file/d/1CLUU47pzA6gNz2-ds2cwc2p1_T7xqQv4/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "nrc-2025-nyokabi-kariuki",
    title: "As the Birds Pass On Their Song, So We Africans Pass On Our Stories",
    outlet: "NRC Handelsblad",
    date: "2025-09-06",
    page: "Culture",
    category: "Arts & Music",
    summary:
      "A portrait interview with Kenyan composer and performer Nyokabi Kariuki, " +
      "ahead of the world premiere of her work at the Gaudeamus Festival in Utrecht.",
    imageUrl: "https://drive.google.com/file/d/1Nk41KwOZ6YmYJqr22qGRjCAiKnh7iz4d/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "nyt-2025-zambia-chickens",
    title: "Can Climate-Resilient Chickens Help Fight Poverty?",
    outlet: "The New York Times",
    date: "2025-03-31",
    page: "Climate",
    category: "Climate & Environment",
    summary:
      "An initiative in Zambia shows that a profit-seeking company can help rural " +
      "farmers battling extreme weather breed chickens that lay more eggs.",
    imageUrl: "https://drive.google.com/file/d/1VA5dwVMSuZ2gPMxNjCVTp6ZL4McJuM6u/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "ft-2025-usaid-east-africa",
    title: "Trump's Assault on Aid Sparks Chaos in East Africa's Relief Hub",
    outlet: "Financial Times",
    date: "2025-02-23",
    page: "World",
    category: "Foreign Affairs",
    summary:
      "Kenya's economy and healthcare system are reeling from the president's bid " +
      "to shut down USAID, stalling projects across Nairobi's aid sector.",
    imageUrl: "https://drive.google.com/file/d/1KWcDckqVaO4dproHOwFrQ1LqKcLoVQyy/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "nyt-2025-venomous-snakes",
    title: "In Africa, Danger Slithers Through Homes and Fields",
    outlet: "The New York Times",
    date: "2025-01-09",
    page: "Health",
    category: "Health & Science",
    summary:
      "Venomous snakes bite millions of people worldwide each year, killing at " +
      "least 120,000 — many of them poor people in rural Africa without treatment.",
    imageUrl: "https://drive.google.com/file/d/1Absg6yehq7hyiBNDfONMccXA7K7Hk8k1/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "nyt-2024-year-in-pictures",
    title: "The Year in Pictures: A Showdown on the Streets of Nairobi",
    outlet: "The New York Times",
    date: "2024-12-18",
    page: "Front Page",
    category: "Protest & Unrest",
    summary:
      "Outrage over proposed tax increases drove Kenyans into the streets nationwide, " +
      "leading to violent clashes with police — selected for the Year in Pictures.",
    imageUrl: "https://drive.google.com/file/d/1RDmPXMIq_fIsY9VMQwR38jJf85xZltgi/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "nyt-2024-serial-killer",
    title: "Did Police in Kenya Catch a Serial Killer or Coerce a Confession?",
    outlet: "The New York Times",
    date: "2024-07-19",
    page: "Front Page",
    category: "Investigations",
    summary:
      "After at least 10 sacks of body parts were found in a dump, a suspect was said " +
      "to admit to 42 murders — but some doubt the case against him.",
    imageUrl: "https://drive.google.com/file/d/1N-gYo0wcpTbX6U0siakr3yB7wDDV71XN/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "nyt-2024-abductions",
    title: "After Deadly Protests, Kenyans Tell of Brutal Abductions",
    outlet: "The New York Times",
    date: "2024-07-05",
    page: "World",
    category: "Protest & Unrest",
    summary:
      "Dozens of activists say they were snatched by hooded, armed men. Some are still " +
      "missing, and the disappearances have unnerved a nation long seen as stable.",
    imageUrl: "https://drive.google.com/file/d/1TOcpwqEJb8OsRSKVyjPNVROF8qbN13gw/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "spiegel-2023-hospitals-covid",
    title: "Hospitals Experience the Fringe Benefits of the COVID Pandemic",
    outlet: "Der Spiegel",
    date: "2023-04-27",
    page: "Global Societies",
    category: "Health & Science",
    summary:
      "Changes to Africa's health-care system that would otherwise have taken years " +
      "happened overnight — and some Nairobi hospitals found good news in the tragedy.",
    imageUrl: "https://drive.google.com/file/d/14txx87dT8AsaHa0PtNyeso8lGoPbRKB5/view?usp=sharing",
    articleUrl: "",
  },
  {
    id: "dw-2017-germany-africa",
    title: "Germany Urges More Investment in Africa",
    outlet: "Deutsche Welle",
    date: "2017-02-10",
    page: "Business",
    category: "Business & Economy",
    summary:
      "As the German-African Business Summit concludes in Nairobi, Germany's " +
      "development minister argues that investment helps reduce poverty.",
    imageUrl: "https://drive.google.com/file/d/1TvFGBzQIm9kfn7Wv5wg6cO5LHd2rIR2t/view?usp=sharing",
    articleUrl: "",
  },
];
