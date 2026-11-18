# Interactives

Hands-on Python labs for the TMU *Data Structures and Algorithms* course. Python runs in the browser
(Pyodide in a Web Worker), so students need nothing installed.

Live: https://yuehhua.github.io/interactives/

## Layout
- `index.html`, `manifest.js`, `manifest.zh.js`: gallery of all interactives (the `.zh` file is generated from each lab's `lesson.zh.js`)
- `shared/`: engine, `i18n.js` (English / 繁體中文 toggle), styles, Python runtime and worker used by every Python lab
- `<topic>/`: one folder per data structure or algorithm (`index.html` + `lesson.js`), served at `/<topic>/`
  - one folder per lab, listed in lecture order in `manifest.js` (run `python3 dev/gen_manifest.py` locally to regenerate it)

## Add a new interactive
1. `mkdir my-topic`, copy `dev/lab-template.html` (local) or another topic's `index.html`, and write `my-topic/lesson.js`
   (it sets `window.LESSON`: levels with `starter`, `demo`, `viz`, `tests`).
2. Add an entry to `manifest.js`. Fill-in blanks use `pass  # TODO: hint`.
3. Write `my-topic/lesson.zh.js`: `window.LESSON_ZH = {title, topic, blurb, intro, levels:[{title, brief, hints, reflect, scaleNote?, baselineLabel?}]}`
   (same level order as `lesson.js`; code, identifiers and test messages stay English). Missing fields fall back to English.
   Run `python3 dev/gen_manifest.py` to refresh `manifest.js` and `manifest.zh.js`.
4. A non-Python interactive can live in its own folder too; it only needs a card in `manifest.js`.

Each language has its own URL: `/en/<lab>/` and `/zh/<lab>/` (the switch at the top right moves between them). The old `/<lab>/` and `/` URLs redirect by the saved or browser language.
The `en/` and `zh/` page trees and the root redirects are generated: after `gen_manifest.py` run `python3 dev/gen_lang_pages.py` (needs the local `dev/lab-template.html` and `dev/index-template.html`) and commit the output.
No build step. Use relative URLs only (the site is served under `/interactives/`).
