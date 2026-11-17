// Shared engine for the Python labs. A lab folder loads ../shared/engine.js and ./lesson.js (window.LESSON).
(() => {
  const BASE = new URL('.', document.currentScript.src).href;   // .../shared/
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, ...kids) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const k of kids) n.append(k instanceof Node ? k : document.createTextNode(String(k)));
    return n;
  };
  const store = {
    get(k) { try { return localStorage.getItem('dsa-int:v1:' + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('dsa-int:v1:' + k, v); } catch {} },
  };
  const fmt = (n) => n.toLocaleString('en-US');

  // ---------------------------------------------------------- Python runner
  class Runner {
    constructor(onStatus) { this.onStatus = onStatus; this.spawn(); }
    spawn() {
      this.pending = new Map(); this.nextId = 1;
      this.onStatus('loading');
      this.worker = new Worker(BASE + 'worker.js');
      this.ready = new Promise((res, rej) => { this._res = res; this._rej = rej; });
      this.ready.catch(() => {});
      this.worker.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'ready') { this.onStatus('ready'); this._res(); }
        else if (m.type === 'fatal') { this.onStatus('error'); this._rej(new Error(m.error)); }
        else { const p = this.pending.get(m.id); if (!p) return; this.pending.delete(m.id);
               m.type === 'result' ? p.resolve(m.result) : p.reject(new Error(m.error)); }
      };
      this.worker.onerror = () => { this.onStatus('error'); this._rej(new Error('worker failed')); };
    }
    restart() {
      this.worker.terminate();
      for (const p of this.pending.values()) p.reject(Object.assign(new Error('stopped'), { timeout: true }));
      this.spawn();
    }
    async call(fn, args, timeoutMs) {
      await this.ready;
      return new Promise((resolve, reject) => {
        const id = this.nextId++;
        const t = setTimeout(() => this.restart(), timeoutMs);
        this.pending.set(id, { resolve: (v) => { clearTimeout(t); resolve(v); }, reject: (e) => { clearTimeout(t); reject(e); } });
        this.worker.postMessage({ id, fn, args });
      });
    }
  }

  // ------------------------------------------------------------------ page
  const L = window.LESSON;
  const key = (lv, what) => `${L.id}:${lv.id}:${what}`;
  const passed = () => L.levels.map((lv) => store.get(key(lv, 'passed')) === '1');
  let level = 0, cm, trace = null, pos = 0, timer = null, busy = false, lineMarks = [];

  const T = (k, ...a) => I18N.t(k, ...a);
  const ZH = window.LESSON_ZH || {};
  const zh = () => I18N.lang === 'zh';
  // Localised view of a level: Chinese overlay fields win when present, English otherwise.
  const view = (i) => { const lv = L.levels[i], z = zh() && ZH.levels ? ZH.levels[i] || {} : {}; return { ...lv, ...z, scale: lv.scale && { ...lv.scale, note: z.scaleNote ?? lv.scale.note } }; };

  const status = $('#runtime-status');
  let pyState = 'loading';
  const showStatus = () => { status.className = 'pill' + (pyState === 'ready' ? ' ready' : ''); status.textContent = pyState === 'ready' ? T('pyReady') : pyState === 'error' ? T('pyFail') : T('pyLoading'); };
  const runner = new Runner((s) => { pyState = s; showStatus(); });
  const head = () => {
    $('#topic').textContent = zh() && ZH.topic || L.topic;
    const ti = zh() && ZH.title || L.title;
    $('#title').textContent = ti; $('#intro').innerHTML = zh() && ZH.intro || L.intro;
    document.title = ti + ' · ' + T('siteTitle');
  };
  head();

  cm = CodeMirror($('#editor'), {
    mode: 'python', lineNumbers: true, indentUnit: 4, viewportMargin: Infinity,
    extraKeys: { Tab: (c) => (c.somethingSelected() ? c.indentSelection('add') : c.execCommand('insertSoftTab')), 'Shift-Tab': 'indentLess' },
  });
  cm.on('change', () => { store.set(key(L.levels[level], 'code'), cm.getValue()); clearMarks(); });

  function clearMarks() {
    for (const [ln, w] of lineMarks) cm.removeLineClass(ln, 'background', w);
    lineMarks = [];
  }
  function mark(line, cls) {
    if (!line || line < 1 || line > cm.lineCount()) return;
    cm.addLineClass(line - 1, 'background', cls); lineMarks.push([line - 1, cls]);
  }
  function notice(html, info) {
    const n = $('#notice'); n.innerHTML = ''; if (!html) return;
    const d = el('div', 'notice' + (info ? ' info' : '')); d.innerHTML = html; n.append(d);
  }
  function setBusy(b) { busy = b; document.querySelectorAll('button.act').forEach((x) => (x.disabled = b)); }
  const errText = (e) => e.type === 'StepBudgetExceeded'
    ? T('budget', fmt(e.budget), e.line)
    : `${e.type}: ${e.msg}${e.line ? (zh() ? `（第 ${e.line} 行）` : ` (line ${e.line})`) : ''}`;

  function renderTabs() {
    const p = passed(); const nav = $('#levels'); nav.innerHTML = '';
    L.levels.forEach((lv, i) => {
      const b = el('button', '', `${p[i] ? '✓ ' : ''}${zh() ? `第 ${i + 1} 關：` : `Level ${i + 1}: `}${view(i).title}`);
      b.setAttribute('aria-current', i === level); b.onclick = () => selectLevel(i); nav.append(b);
    });
  }
  function renderLevelText() {
    const v = view(level);
    $('#brief').innerHTML = `<h2>${zh() ? `第 ${level + 1} 關：` : `Level ${level + 1}: `}${v.title}</h2><p>${v.brief}</p>`;
    $('#hints').innerHTML = `<summary>${T('hints')}</summary>` + v.hints.map((h) => `<p>${h}</p>`).join('');
    if (!$('#finish').hidden) $('#reflect').textContent = v.reflect || '';
    renderTabs();
  }
  function selectLevel(i) {
    stopPlay(); level = i; const lv = L.levels[i]; trace = null;
    cm.setValue(store.get(key(lv, 'code')) ?? lv.starter); clearMarks(); notice('');
    $('#results').textContent = T('runToSee'); $('#stdout').textContent = '';
    $('#viz').innerHTML = `<p class="vlabel">${T('pressStep')}</p>`;
    $('#controls').hidden = true; $('#finish').hidden = true;
    $('#scale-card').hidden = !lv.scale; $('#scale').innerHTML = ''; renderLevelText();
  }

  // ------------------------------------------------------------ visualizer
  const isSub = (x) => x !== null && typeof x === 'object' && Array.isArray(x.sub);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function drawTree(list, focusIdx, changed) {
    const n = Math.min(list.length, 31); if (!n) return null;
    const levels = Math.floor(Math.log2(n)) + 1, W = 400, H = 20 + levels * 46;
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'tree');
    const P = (i) => { const lv = Math.floor(Math.log2(i + 1)), p = i + 1 - 2 ** lv; return [(W * (p + 0.5)) / 2 ** lv, 22 + lv * 46]; };
    const add = (t, a, txt) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; svg.append(e); };
    for (let i = 1; i < n; i++) { const [x1, y1] = P((i - 1) >> 1), [x2, y2] = P(i); add('line', { x1, y1, x2, y2 }); }
    for (let i = 0; i < n; i++) { const [x, y] = P(i); add('circle', { cx: x, cy: y, r: 15, class: i === focusIdx ? 'focus' : changed.has(i) ? 'chg' : '' }); add('text', { x, y }, String(list[i])); }
    return svg;
  }
  function drawNodeTree(root) {
    let rank = 0, maxD = 0; const pts = [];
    const place = (n, d) => { if (!n) return null; const l = place(n.l, d + 1); const me = { n, x: rank++, d }; maxD = Math.max(maxD, d); const r = place(n.r, d + 1); pts.push(me); me.l = l; me.r = r; return me; };
    const top = place(root, 0); if (!top) return null;
    const step = 38, W = Math.max(rank * step, 90), H = 34 + maxD * 46;
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'tree'); svg.style.maxWidth = Math.max(W, 120) + 'px';
    const X = (p) => (p.x + 0.5) * step, Y = (p) => 24 + p.d * 46;
    const add = (t, a, txt) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; svg.append(e); };
    for (const p of pts) for (const c of [p.l, p.r]) if (c) add('line', { x1: X(p), y1: Y(p), x2: X(c), y2: Y(c) });
    for (const p of pts) { add('circle', { cx: X(p), cy: Y(p), r: 14, class: p.n.tags.length ? 'focus' : '' }); add('text', { x: X(p), y: Y(p) }, String(p.n.v));
      if (p.n.tags.length) { const t = document.createElementNS(ns, 'text'); t.setAttribute('x', X(p)); t.setAttribute('y', Y(p) - 19); t.setAttribute('class', 'ptag'); t.textContent = p.n.tags.join(','); svg.append(t); } }
    return svg;
  }
  function renderStep(i) {
    pos = i; const s = trace.snaps[i], prev = i > 0 ? trace.snaps[i - 1] : null, v = L.levels[level].viz;
    clearMarks(); if (!s.ret) mark(s.line, 'cur-line');
    const box = $('#viz'); box.innerHTML = '';
    box.append(el('div', 'vlabel', s.ret ? `${s.fn}() ${T('returns')}` : T('aboutToRun', s.fn, s.line)));
    if (s.nodes) {
      for (const ch of s.nodes.chains) {
        const row = el('div', 'vrow', el('div', 'vname', 'nodes')), chain = el('div', 'chain');
        for (const it of ch.items) chain.append(el('div', 'node', el('div', 'cell', String(it.v)), el('div', 'tag', it.tags.join(',') || '\u00a0')), el('span', 'arrow', '\u2192'));
        chain.append(el('span', 'idx', ch.more ? '\u2026' : 'None')); row.append(chain); box.append(row);
      }
      for (const t of s.nodes.trees) { const svg = drawNodeTree(t); if (svg) box.append(svg); }
    }
    const names = Object.keys(s.vars), lists = names.filter((k) => s.vars[k] && s.vars[k].list);
    lists.sort((a, b) => (v.lists.indexOf(a) + 99) % 99 - (v.lists.indexOf(b) + 99) % 99);
    const ptrs = v.pointers.filter((k) => Number.isInteger(s.vars[k]));
    for (const name of lists) {
      const cur = s.vars[name].list, old = prev && prev.vars[name] && prev.vars[name].list;
      const row = el('div', 'vrow', el('div', 'vname', name)), cells = el('div', 'cells');
      if (cur.some(isSub)) {
        cells.className = 'drawers';
        cur.forEach((x, j) => {
          const d = el('div', 'drawer' + (old && !same(old[j], x) ? ' chg' : ''), el('span', 'idx', j));
          for (const y of isSub(x) ? x.sub : []) d.append(el('span', 'dchip', String(y)));
          if (isSub(x) && x.n > x.sub.length) d.append(el('span', 'idx', `+${x.n - x.sub.length}`));
          cells.append(d);
        });
        row.append(cells); box.append(row); continue;
      }
      cur.forEach((x, j) => {
        const tags = ptrs.filter((p) => s.vars[p] === j).join(',');
        cells.append(el('div', 'cellw', el('div', 'cell' + (old && !same(old[j], x) ? ' chg' : ''), x === null ? 'None' : String(x)), el('div', 'idx', j), el('div', 'tag', tags || ' ')));
      });
      if (s.vars[name].n > cur.length) cells.append(el('div', 'idx', zh() ? `另有 ${s.vars[name].n - cur.length} 個` : `+${s.vars[name].n - cur.length} more`));
      row.append(cells); box.append(row);
    }
    if (v.tree && s.vars[v.tree] && s.vars[v.tree].list) {
      const lst = s.vars[v.tree].list, old = (prev && prev.vars[v.tree] && prev.vars[v.tree].list) || [];
      const ch = new Set(); lst.forEach((x, j) => { if (!same(old[j], x)) ch.add(j); });
      const t = drawTree(lst, s.vars[v.focus], ch); if (t) box.append(t);
    }
    const chips = el('div', 'chips');
    for (const k of names) if (!(s.vars[k] && s.vars[k].list)) {
      const x = s.vars[k], c = prev && prev.vars[k] !== undefined && !same(prev.vars[k], x);
      chips.append(el('span', 'chip' + (c ? ' chg' : ''), `${k} = ${x === null ? 'None' : x}`));
    }
    box.append(chips); $('#step').value = i; $('#steplabel').textContent = `${i + 1} / ${trace.snaps.length}`;
  }
  function stopPlay() { if (timer) clearInterval(timer); timer = null; $('#play').textContent = '▶'; }
  function togglePlay() {
    if (timer) return stopPlay();
    if (pos >= trace.snaps.length - 1) renderStep(0);
    $('#play').textContent = '⏸';
    timer = setInterval(() => { if (pos >= trace.snaps.length - 1) return stopPlay(); renderStep(pos + 1); }, Number($('#speed').value));
  }

  // --------------------------------------------------------------- actions
  async function guarded(fn) {
    if (busy) return; setBusy(true);
    try { await fn(); }
    catch (e) { notice(e.timeout ? T('timeout') : T('wrong') + e.message); }
    finally { setBusy(false); }
  }
  const lv = () => L.levels[level];
  const doTrace = () => guarded(async () => {
    stopPlay(); notice('Running…', true);
    trace = await runner.call('run_trace', [cm.getValue(), lv().entry, lv().demo], 15000);
    notice(trace.error ? errText(trace.error) : '');
    if (trace.error) mark(trace.error.line, 'err-line');
    $('#stdout').textContent = trace.stdout || '';
    if (!trace.snaps.length) { $('#viz').textContent = T('nothing'); return; }
    $('#controls').hidden = false; $('#step').max = trace.snaps.length - 1;
    renderStep(0); togglePlay();
  });
  const doTests = () => guarded(async () => {
    stopPlay(); notice(T('running'), true);
    const r = await runner.call('run_tests', [cm.getValue(), lv().tests], 30000);
    notice(r.fatal ? errText(r.fatal) : ''); clearMarks(); if (r.fatal) mark(r.fatal.line, 'err-line');
    $('#stdout').textContent = r.stdout || '';
    const box = $('#results'); box.innerHTML = '';
    for (const t of r.results) {
      const row = el('div', 'res', el('span', t.ok ? 'ok' : 'no', t.ok ? '✓' : '✗'),
        el('div', '', t.name, el('span', 'tier', t.tier), el('span', 'tier', `${fmt(t.steps)} ${T('lines')}`)));
      if (!t.ok) { row.append(el('div', 'm', t.msg)); if (t.line) mark(t.line, 'err-line'); }
      box.append(row);
    }
    const all = !r.fatal && r.results.length && r.results.every((t) => t.ok);
    $('#finish').hidden = !all;
    if (all) {
      store.set(key(lv(), 'passed'), '1'); renderTabs();
      $('#reflect').textContent = view(level).reflect || '';
      $('#next').hidden = level >= L.levels.length - 1;
    }
  });
  const doScale = () => guarded(async () => {
    const s = view(level).scale, box = $('#scale'); box.textContent = T('measuring');
    const r = await runner.call('run_scale', [cm.getValue(), s.entry, s.gen, s.sizes, s.baseline ?? null], 60000);
    if (r.error) { box.textContent = errText(r.error); return; }
    const t = el('table', 'scale'), head = el('tr', '', el('th', '', 'n'), el('th', '', T('yourLines')), el('th', '', T('growth')));
    if (s.baseline) head.append(el('th', '', zh() && view(level).baselineLabel || s.baselineLabel), el('th', '', T('growth'))); t.append(head);
    const cell = (x) => (x === null ? `> ${fmt(r.budget)}` : fmt(x));
    const grow = (a, b) => (a && b ? `×${(a / b).toFixed(1)}` : '');
    r.rows.forEach((row, i) => {
      const p = r.rows[i - 1], tr = el('tr', '', el('td', '', fmt(row.n)), el('td', '', cell(row.steps)), el('td', '', p ? grow(row.steps, p.steps) : ''));
      if (s.baseline) tr.append(el('td', '', cell(row.baseline)), el('td', '', p ? grow(row.baseline, p.baseline) : ''));
      t.append(tr);
    });
    box.innerHTML = ''; box.append(t, el('p', 'vlabel', s.note));
  });

  $('#run').onclick = doTests; $('#trace').onclick = doTrace; $('#measure').onclick = doScale;
  $('#reset').onclick = () => { if (confirm(T('confirmReset'))) { cm.setValue(lv().starter); } };
  $('#copy').onclick = async () => { try { await navigator.clipboard.writeText(cm.getValue()); notice(T('copied'), true); } catch { cm.focus(); cm.execCommand('selectAll'); notice(T('selectAll'), true); } };
  $('#download').onclick = () => { const a = el('a'); a.href = URL.createObjectURL(new Blob([cm.getValue()], { type: 'text/x-python' })); a.download = `${L.id}-${lv().id}.py`; a.click(); URL.revokeObjectURL(a.href); };
  $('#next').onclick = () => { selectLevel(level + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  $('#play').onclick = () => trace && togglePlay();
  $('#prev').onclick = () => { stopPlay(); if (trace && pos > 0) renderStep(pos - 1); };
  $('#fwd').onclick = () => { stopPlay(); if (trace && pos < trace.snaps.length - 1) renderStep(pos + 1); };
  $('#step').oninput = (e) => { stopPlay(); renderStep(Number(e.target.value)); };

  I18N.onChange(() => { head(); showStatus(); renderLevelText(); if (trace) renderStep(pos); });
  I18N.apply(); showStatus();
  selectLevel(0);
})();
