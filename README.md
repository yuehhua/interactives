# Interactives

Hands-on Python labs for the TMU *Data Structures and Algorithms* course. Python runs in the browser
(Pyodide in a Web Worker), so students need nothing installed.

Live: https://yuehhua.github.io/interactives/

## Layout
- `index.html`, `manifest.js`: gallery of all interactives
- `shared/`: engine, styles, Python runtime and worker used by every Python lab
- `<topic>/`: one folder per data structure or algorithm (`index.html` + `lesson.js`), served at `/<topic>/`
  - one folder per lab, listed in lecture order in `manifest.js` (run `python3 dev/gen_manifest.py` locally to regenerate it)

## Add a new interactive
1. `mkdir my-topic`, copy `dev/lab-template.html` (local) or another topic's `index.html`, and write `my-topic/lesson.js`
   (it sets `window.LESSON`: levels with `starter`, `demo`, `viz`, `tests`).
2. Add an entry to `manifest.js`. Fill-in blanks use `pass  # TODO: hint`.
3. A non-Python interactive can live in its own folder too; it only needs a card in `manifest.js`.

No build step. Use relative URLs only (the site is served under `/interactives/`).
