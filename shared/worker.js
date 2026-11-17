// Runs Pyodide off the main thread so a stuck student program can be terminated.
const PYODIDE_VERSION = '0.29.5';
importScripts(`https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`);

const ready = (async () => {
  const py = await loadPyodide();
  const src = await (await fetch(new URL('runtime.py?v=1', self.location.href))).text();
  py.runPython(src);
  self.postMessage({ type: 'ready' });
  return py;
})().catch((e) => { self.postMessage({ type: 'fatal', error: String(e) }); throw e; });

self.onmessage = async (e) => {
  const { id, fn, args } = e.data;
  try {
    const py = await ready;
    const result = py.globals.get(fn)(...args);
    self.postMessage({ type: 'result', id, result: JSON.parse(result) });
  } catch (err) {
    self.postMessage({ type: 'error', id, error: String(err) });
  }
};
