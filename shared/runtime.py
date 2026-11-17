"""Runtime for the in-browser labs (runs inside Pyodide, in a Web Worker).

Student code is compiled with the filename "<student>". A line tracer counts executed
lines of that file only. The count is (a) the budget that stops infinite loops and
(b) the deterministic "operation counter" shown in the scale experiments. In trace mode
the tracer also snapshots the local variables so the page can replay the run.

All public entry points return JSON strings.
"""
import sys, io, json, copy, traceback

STUDENT_FILE = "<student>"
DEFAULT_BUDGET = 300_000


class StepBudgetExceeded(BaseException):
    """BaseException so a student's `except Exception:` cannot swallow it."""


class _State:
    steps = 0
    budget = DEFAULT_BUDGET
    record = False
    snaps = []
    max_snaps = 1200


S = _State()


# ---------------------------------------------------------------- snapshots
def _cell(x):
    if x is None or isinstance(x, (bool, int, float)):
        return x
    if isinstance(x, list):
        return {"sub": [_cell(y) if not isinstance(y, list) else "[..]" for y in x[:10]], "n": len(x)}
    r = repr(x)
    return r if len(r) <= 14 else r[:12] + ".."


def _snap_value(v):
    if v is None or isinstance(v, (bool, int, float)):
        return v
    if isinstance(v, str):
        return v if len(v) <= 24 else v[:21] + "..."
    if isinstance(v, (list, tuple)):
        return {"list": [_cell(x) for x in v[:48]], "n": len(v)}
    return None


def _snapshot(frame, ret=False):
    vars_ = {}
    for name, v in frame.f_locals.items():
        if name.startswith("_") or callable(v):
            continue
        sv = _snap_value(v)
        if sv is not None or v is None:
            vars_[name] = sv
    return {"line": frame.f_lineno, "fn": frame.f_code.co_name, "vars": vars_, "ret": ret}


# ------------------------------------------------------------------ tracer
def _tracer(frame, event, arg):
    if frame.f_code.co_filename != STUDENT_FILE:
        return None
    return _local


def _local(frame, event, arg):
    if event == "line":
        S.steps += 1
        if S.steps > S.budget:
            raise StepBudgetExceeded(S.budget)
        if S.record and len(S.snaps) < S.max_snaps and frame.f_code.co_name != "<module>":
            S.snaps.append(_snapshot(frame))
    elif event == "return":
        if S.record and len(S.snaps) < S.max_snaps and frame.f_code.co_name != "<module>":
            S.snaps.append(_snapshot(frame, ret=True))
    return _local


def _reset(budget=DEFAULT_BUDGET, record=False):
    S.steps = 0
    S.budget = budget
    S.record = record
    S.snaps = []


def _err(e):
    line = None
    tb = e.__traceback__
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == STUDENT_FILE:
            line = tb.tb_lineno
        tb = tb.tb_next
    if isinstance(e, SyntaxError):
        line = e.lineno
    if isinstance(e, StepBudgetExceeded):
        return {"type": "StepBudgetExceeded", "msg": "", "line": line, "budget": S.budget}
    return {"type": type(e).__name__, "msg": str(e)[:300], "line": line}


def _exec_student(code):
    """Compile and run the module-level code (defs); returns the namespace."""
    compiled = compile(code, STUDENT_FILE, "exec")
    ns = {"__name__": "student"}
    _reset()
    sys.settrace(_tracer)
    try:
        exec(compiled, ns)
    finally:
        sys.settrace(None)
    return ns


class _Capture:
    def __enter__(self):
        self.buf, self.old = io.StringIO(), sys.stdout
        sys.stdout = self.buf
        return self

    def __exit__(self, *a):
        sys.stdout = self.old

    def text(self):
        return self.buf.getvalue()[:4000]


# ------------------------------------------------------------ test helpers
def short(x, n=90):
    r = repr(x)
    return r if len(r) <= n else r[: n - 3] + "..."


def need(ns, name):
    f = ns.get(name)
    if not callable(f):
        raise AssertionError(f"Define a function named {name}.")
    return f


_PRELUDE = {"short": short, "need": need, "AssertionError": AssertionError}


# --------------------------------------------------------------- public API
def run_tests(code, tests_src):
    cap = _Capture()
    with cap:
        res = _run_tests(code, tests_src)
    res["stdout"] = cap.text()
    return json.dumps(res)


def _run_tests(code, tests_src):
    try:
        ns = _exec_student(code)
    except BaseException as e:  # noqa: BLE001 - includes StepBudgetExceeded and SyntaxError
        return {"fatal": _err(e), "results": []}
    tns = dict(_PRELUDE, __name__="tests")
    exec(compile(tests_src, "<tests>", "exec"), tns)
    results = []
    for t in tns["TESTS"]:
        name, tier, fn = t[0], t[1], t[2]
        budget = t[3] if len(t) > 3 else DEFAULT_BUDGET
        _reset(budget)
        item = {"name": name, "tier": tier, "ok": False, "msg": "", "steps": 0, "line": None}
        sys.settrace(_tracer)
        try:
            fn(ns)
            item["ok"] = True
        except AssertionError as e:
            item["msg"] = str(e)
        except BaseException as e:  # noqa: BLE001
            info = _err(e)
            item["line"] = info["line"]
            if info["type"] == "StepBudgetExceeded":
                item["msg"] = (
                    f"Over the budget of {budget:,} executed lines. "
                    + ("That is too slow for this input size." if tier == "perf"
                       else "Probably an infinite loop: what makes each `while` stop?")
                )
                item["budget_exceeded"] = True
            else:
                item["msg"] = f"{info['type']}: {info['msg']}"
        finally:
            sys.settrace(None)
        item["steps"] = S.steps
        results.append(item)
    return {"fatal": None, "results": results}


def run_trace(code, entry, demo_src, budget=3000):
    cap = _Capture()
    with cap:
        out = _run_trace(code, entry, demo_src, budget)
    out["stdout"] = cap.text()
    return json.dumps(out)


def _run_trace(code, entry, demo_src, budget):
    out = {"snaps": [], "ret": None, "error": None, "args": None, "steps": 0}
    try:
        ns = _exec_student(code)
    except BaseException as e:  # noqa: BLE001
        out["error"] = _err(e)
        return out
    dns = {}
    exec(compile(demo_src, "<demo>", "exec"), dns)
    args = dns["DEMO_ARGS"]
    out["args"] = [_snap_value(a) for a in args]
    fn = ns.get(entry)
    if not callable(fn):
        out["error"] = {"type": "NameError", "msg": f"Define a function named {entry}.", "line": None}
        return out
    _reset(budget, record=True)
    sys.settrace(_tracer)
    try:
        r = fn(*copy.deepcopy(args))
        out["ret"] = short(r, 120)
    except BaseException as e:  # noqa: BLE001
        out["error"] = _err(e)
    finally:
        sys.settrace(None)
    out["snaps"] = S.snaps
    out["steps"] = S.steps
    S.record = False
    return out


def run_scale(code, entry, gen_src, sizes, baseline_src=None, budget=2_000_000):
    """Line counts of the student's function (and an optional baseline) at several sizes."""
    cap = _Capture()
    with cap:
        out = _run_scale(code, entry, gen_src, sizes, baseline_src, budget)
    return json.dumps(out)


def _count(fn, args, budget):
    _reset(budget)
    sys.settrace(_tracer)
    try:
        fn(*copy.deepcopy(args))
        return S.steps
    except StepBudgetExceeded:
        return None
    finally:
        sys.settrace(None)


def _run_scale(code, entry, gen_src, sizes, baseline_src, budget):
    out = {"rows": [], "error": None, "budget": budget}
    try:
        ns = _exec_student(code)
        fn = need(ns, entry)
        gns = {}
        exec(compile(gen_src, "<gen>", "exec"), gns)
        base = None
        if baseline_src:
            bns = {}
            _reset()
            exec(compile(baseline_src, STUDENT_FILE, "exec"), bns)
            base = bns["baseline"]
        for n in sizes:
            args = gns["gen"](n)
            row = {"n": n, "steps": _count(fn, args, budget), "baseline": None}
            if base:
                row["baseline"] = _count(base, args, budget)
            out["rows"].append(row)
    except AssertionError as e:
        out["error"] = {"type": "AssertionError", "msg": str(e), "line": None}
    except BaseException as e:  # noqa: BLE001
        out["error"] = _err(e)
    return out
