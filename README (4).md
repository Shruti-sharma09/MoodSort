# ✦ MoodSort — AI Moodboard Organizer

Upload a batch of inspiration photos and a pretrained neural network automatically sorts them into a clean, categorized moodboard — Nature, Architecture, People, Animals, Food, Objects — the way a designer would manually tag them, done in seconds.

**[Live Demo](#)** — replace this with your GitHub Pages link after deploying (steps below)

![MoodSort preview](https://via.placeholder.com/900x500/FAFAFC/A855F7?text=MoodSort+%E2%80%94+AI+Moodboard+Organizer)

## Features

- 🧠 **Real image classification** — every photo is run through MobileNet, a convolutional neural network pretrained on 1,000+ categories, via [ml5.js](https://ml5js.org/)
- 🗂️ **Automatic categorization** — raw predictions like *"Siamese cat"* or *"suspension bridge"* are mapped into broad, moodboard-friendly buckets (Animals, Architecture, ...) by a keyword-matching layer
- 📤 **Batch upload** — drop in as many photos at once as you like; a progress bar tracks classification as it works through them
- 🖼️ **Collapsible category groups** — click any category header to fold it away, so a big moodboard stays scannable
- 💾 **Saved locally** — your board persists across visits via `localStorage`
- 🔒 **100% client-side** — photos never leave your browser

## Tech Stack

- Vanilla JavaScript (no framework, no build step)
- [ml5.js](https://ml5js.org/) (via CDN) + MobileNet for the actual image classification
- A hand-written keyword-matching layer (`categorize.js`) that maps ImageNet's very specific labels into a handful of broad categories
- `localStorage` for persisting the board
- Google Fonts: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display), [Inter](https://fonts.google.com/specimen/Inter)

## Getting Started

```bash
git clone https://github.com/YOUR-USERNAME/moodsort.git
cd moodsort
open index.html   # or just double-click the file
```

No install, no dependencies to manage — ml5.js loads from a CDN. You need an internet connection the first time so the model's weights can download.

## Deploying to GitHub Pages (free hosting)

1. Push this repo to GitHub.
2. Go to **Settings → Pages** in your repo.
3. Under **Source**, select the `main` branch and `/ (root)` folder, then **Save**.
4. Your app goes live at `https://YOUR-USERNAME.github.io/moodsort/` within a minute or two.
5. Update the "Live Demo" link at the top of this README.

## How the categorization works

MobileNet is trained on ImageNet, which has 1,000 very specific categories — "Siamese cat" and "tabby cat" are two *different* classes, not one generic "cat." That's too granular for a moodboard, so `categorize.js` maps each raw label into one of six broad buckets using keyword matching: if the label contains a word like "bridge" or "cathedral," it's filed under Architecture; "retriever" or "tabby" go to Animals; anything unmatched falls into "Other."

The matching is whole-word aware (using regex word boundaries) specifically so that short keywords don't misfire — e.g. the keyword "cat" matches the label "tabby cat" but correctly ignores unrelated words like "cathedral" or "category," and "cow" matches "cow" but not "cowboy." This was validated with a small test suite covering real ImageNet-style labels and known edge cases.

This is a deliberately simple heuristic, not a trained classifier — it won't be perfect on every label, but it's transparent, easy to extend (just add keywords), and gets a real, working moodboard sort with very little code.

## Project Structure

```
moodsort/
├── index.html        # upload panel + progress bar + grouped moodboard
├── styles.css         # editorial theme, per-category tag colors
├── categorize.js      # keyword-based label → category mapping (unit-testable in isolation)
├── app.js             # model loading, batch upload, classification, rendering
└── README.md
```

## Possible Extensions

- Let users drag photos between category groups to correct a mis-sort
- Add a manual "rename category" option
- Export the moodboard as a single downloadable image or PDF
- Show a dominant color swatch per photo alongside its label

## License

MIT — free to use, modify, and share.

---

Built as a portfolio project connecting a beginner-friendly AI technique (transfer learning via a pretrained model) to an actual UI/UX design workflow: organizing visual inspiration.
