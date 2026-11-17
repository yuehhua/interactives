# Interactives: plan

Goal: browser-only, English, Python-in-the-browser labs for the TMU DSA course, served at
https://yuehhua.github.io/interactives/ (repo yuehhua/interactives, GitHub Pages from `main` root).

## Design (from plans/interactive-website.md, Octalysis-driven)
- Zero install: Pyodide (pinned 0.29.5) in a Web Worker; students' code runs on their own device.
- Scaffolded fill-in-the-blank levels + bug-fix levels, instant tiered tests (basic / edge / perf).
- Visualization is driven by the student's own code: a line tracer snapshots locals, JS replays them
  (array cells, pointer tags, heap tree, highlighted source line).
- No SharedArrayBuffer on Pages, so infinite loops are stopped by a line-step budget (BaseException) plus a
  worker-terminate watchdog.
- Step counts (line events) are the deterministic "operation counter" for scale experiments.
- Last step of each level: copy/download the code into the real lab file.
- Static, no build step, relative URLs only (site lives under /interactives/).

## v1 scope
1. counting-sort (wk11): fill in 3 phases (+ scale table vs insertion sort); stability bug hunt.
2. heaps (wk10): insert/sift-up fill-in; extract-max with an infinite-loop bug.

## To-do
- [x] runtime.py, worker.js, engine.js, style.css, lab.html, index.html, 2 lessons
- [x] headless verify (node + pyodide): reference solutions pass all tiers, scaffolds fail, buggy level hits budget
- [x] serve under /interactives/ subpath locally, check worker loads
- [ ] git init, noreply commit email, gh repo create, enable Pages, fetch live URL

## Experiment log
(see bottom; filled in as verification runs)

## Experiment log
- 2026-11-17 node+pyodide (dev/verify.mjs): reference passes all tiers, scaffolds fail, buggy extract-max hits step budget (not hang). Scale: counting sort 804 -> 6204 -> 60204 lines for n=100/1k/10k; insertion sort 7188 -> 726546 -> >2M.
- Browser e2e (dev/e2e.mjs, chrome headless, served under /interactives/): both labs, all levels pass, no page errors.
- Restructured per user: one folder per topic, shared/ for common code.
