// Language layer: English / Traditional Chinese. Loaded before engine.js and on the front page.
// Lab content overlays live in <lab>/lesson.zh.js as window.LESSON_ZH; the front page uses manifest.zh.js.
(() => {
  const KEY = 'dsa-int:v1:lang';
  const DICT = {
    en: {
      allLabs: '← All interactives', loadingPy: 'Loading Python…', pyReady: 'Python ready', pyFail: 'Python failed to load (check your connection)',
      pyLoading: 'Loading Python (about 10 MB, cached after the first visit)…', hints: 'Stuck? Hints', level: 'Level', levels: 'Levels',
      run: 'Run tests', trace: 'Step through', reset: 'Reset', copy: 'Copy code', download: 'Download .py', visualizer: 'Visualizer', tests: 'Tests',
      scaleIt: 'Scale it up', measure: 'Measure', output: 'Output', cleared: 'Level cleared',
      clearedBody: 'All tests pass. Now make it real: copy this code into your own lab file and run it there.', reflect: 'Reflect:', next: 'Next level',
      slow: 'slow', normal: 'normal', fast: 'fast', runToSee: 'Run the tests to see results.', pressStep: 'Press “Step through” to run the demo input on your code.',
      nothing: 'Nothing to show: the function did not execute any lines.', running: 'Running tests…', measuring: 'Measuring…', lines: 'lines',
      yourLines: 'your lines', growth: 'growth', more: 'more', returns: 'returns', aboutToRun: (fn, ln) => `in ${fn}(), about to run line ${ln}`,
      budget: (b, ln) => `Stopped after ${b} executed lines: probably an infinite loop${ln ? ` (last line ${ln})` : ''}.`, lastLine: 'line',
      timeout: 'Your code ran too long, so Python was stopped and restarted. Check your loops.', wrong: 'Something went wrong: ',
      confirmReset: 'Reset this level to the starting code?', copied: 'Copied. Paste it into your lab file.', selectAll: 'Select-all done: press Ctrl/Cmd+C.',
      siteTitle: 'Interactives', pill: 'Data Structures & Algorithms, TMU', h1: 'Learn by running your own code',
      lead: 'Short, hands-on labs that run Python right in your browser. Nothing to install: your code runs on your own device. Progress is saved in this browser.',
      progress: (a, b) => `${a} / ${b} levels cleared`, langBtn: '中文',
    },
    zh: {
      allLabs: '← 所有互動練習', loadingPy: '正在載入 Python…', pyReady: 'Python 已就緒', pyFail: 'Python 載入失敗（請檢查網路連線）',
      pyLoading: '正在載入 Python（約 10 MB，首次之後會快取）…', hints: '卡住了？看提示', level: '關卡', levels: '關卡',
      run: '執行測試', trace: '逐步執行', reset: '重設', copy: '複製程式碼', download: '下載 .py', visualizer: '視覺化', tests: '測試',
      scaleIt: '放大規模', measure: '量測', output: '輸出', cleared: '過關',
      clearedBody: '所有測試都通過了。接著把它變成真的：把這段程式碼複製到你自己的實作檔案中執行。', reflect: '想一想：', next: '下一關',
      slow: '慢', normal: '正常', fast: '快', runToSee: '執行測試以查看結果。', pressStep: '按下「逐步執行」，用示範輸入跑你的程式碼。',
      nothing: '沒有可顯示的內容：函式沒有執行任何一行。', running: '正在執行測試…', measuring: '量測中…', lines: '行',
      yourLines: '你的行數', growth: '成長', more: '個', returns: '回傳', aboutToRun: (fn, ln) => `在 ${fn}() 中，即將執行第 ${ln} 行`,
      budget: (b, ln) => `執行 ${b} 行後被中止：可能是無窮迴圈${ln ? `（最後一行：第 ${ln} 行）` : ''}。`, lastLine: '第',
      timeout: '你的程式執行太久，Python 已被中止並重新啟動。請檢查迴圈。', wrong: '發生錯誤：',
      confirmReset: '要把這一關重設為初始程式碼嗎？', copied: '已複製。請貼到你的實作檔案中。', selectAll: '已全選：請按 Ctrl/Cmd+C。',
      siteTitle: '互動練習', pill: '資料結構與演算法，臺北醫學大學', h1: '用自己寫的程式碼來學習',
      lead: '簡短的動手練習，Python 直接在瀏覽器中執行。不需要安裝任何東西：程式碼在你自己的裝置上執行。進度會儲存在這個瀏覽器中。',
      progress: (a, b) => `已通過 ${a} / ${b} 關`, langBtn: 'EN',
    },
  };
  const get = () => { try { const v = localStorage.getItem(KEY); if (v === 'en' || v === 'zh') return v; } catch {} return /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; };
  const fromUrl = new URLSearchParams(location.search).get('lang');
  let lang = fromUrl === 'zh' || fromUrl === 'en' ? fromUrl : get();
  const subs = [];
  const I18N = {
    get lang() { return lang; },
    t(k, ...a) { const v = DICT[lang][k] ?? DICT.en[k]; return typeof v === 'function' ? v(...a) : v; },
    onChange(f) { subs.push(f); },
    set(l) { lang = l; try { localStorage.setItem(KEY, l); } catch {} document.documentElement.lang = l === 'zh' ? 'zh-Hant' : 'en'; I18N.apply(); subs.forEach((f) => f(l)); },
    // Static strings in the page template: <el data-i18n="key">
    apply() {
      document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = I18N.t(e.dataset.i18n); });
      document.querySelectorAll('[data-i18n-aria]').forEach((e) => e.setAttribute('aria-label', I18N.t(e.dataset.i18nAria)));
      const b = document.getElementById('lang'); if (b) { b.textContent = I18N.t('langBtn'); b.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切換為繁體中文'); }
      const sp = document.getElementById('speed'); if (sp) { sp.options[0].text = I18N.t('slow'); sp.options[1].text = I18N.t('normal'); sp.options[2].text = I18N.t('fast'); }
    },
    mount() {
      document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
      const top = document.querySelector('header.top'); if (!top || document.getElementById('lang')) return;
      const b = document.createElement('button'); b.id = 'lang'; b.className = 'btn'; b.type = 'button';
      b.onclick = () => I18N.set(lang === 'zh' ? 'en' : 'zh');
      const right = document.createElement('div'); right.className = 'right';
      const last = top.lastElementChild; if (last) right.append(last); right.append(b); top.append(right);
      I18N.apply();
    },
  };
  window.I18N = I18N;
  document.addEventListener('DOMContentLoaded', () => I18N.mount());
})();
