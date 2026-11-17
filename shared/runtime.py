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
def _num(x):
    # json.dumps would emit bare Infinity/NaN, which JSON.parse rejects
    if isinstance(x, float) and (x != x or x in (float("inf"), float("-inf"))):
        return repr(x)
    return x


def _cell(x):
    if x is None or isinstance(x, (bool, int, float)):
        return _num(x)
    if isinstance(x, list):
        return {"sub": [_cell(y) if not isinstance(y, list) else "[..]" for y in x[:10]], "n": len(x)}
    r = repr(x)
    return r if len(r) <= 20 else r[:18] + ".."


def _snap_value(v):
    if v is None or isinstance(v, (bool, int, float)):
        return _num(v)
    if isinstance(v, str):
        return v if len(v) <= 24 else v[:21] + "..."
    if isinstance(v, (list, tuple)):
        return {"list": [_cell(x) for x in v[:48]], "n": len(v)}
    if isinstance(v, (dict, set)):
        r = repr(v)
        return r if len(r) <= 50 else r[:47] + "..."
    return None


_VAL_ATTRS = ("val", "value", "data", "key")


def _nval(n):
    for a in _VAL_ATTRS:
        if hasattr(n, a):
            return _cell(getattr(n, a))
    return "o"


def _kind(v):
    if v is None or callable(v) or isinstance(v, (bool, int, float, str, list, tuple, dict, set)):
        return None
    if hasattr(v, "left") and hasattr(v, "right"):
        return "tree"
    if hasattr(v, "next"):
        return "list"
    return None


def _chain(n, limit=12):
    out, seen = [], set()
    while n is not None and id(n) not in seen and len(out) < limit:
        seen.add(id(n))
        out.append(n)
        n = getattr(n, "next", None)
    return out


def _subtree(n, depth=0, out=None):
    out = [] if out is None else out
    if n is not None and depth < 5 and len(out) < 31 and not any(n is x for x in out):
        out.append(n)
        _subtree(getattr(n, "left", None), depth + 1, out)
        _subtree(getattr(n, "right", None), depth + 1, out)
    return out


def _roots(names, members):
    """A variable is a root unless another variable's structure already contains its node."""
    roots = []
    for i, k in enumerate(names):
        f = members[k][0]
        hidden = False
        for j, m in enumerate(names):
            if j == i:
                continue
            pos = next((p for p, x in enumerate(members[m]) if x is f), None)
            if pos is not None and (pos > 0 or j < i):
                hidden = True
                break
        if not hidden:
            roots.append(k)
    return roots


def _tree_json(n, depth, tags, budget):
    if n is None or depth >= 5 or budget[0] <= 0:
        return None
    budget[0] -= 1
    return {"v": _nval(n), "tags": tags(n),
            "l": _tree_json(getattr(n, "left", None), depth + 1, tags, budget),
            "r": _tree_json(getattr(n, "right", None), depth + 1, tags, budget)}


def _structs(loc):
    names = [k for k, v in loc.items() if not k.startswith("_") and _kind(v)]
    if not names:
        return None
    tags = lambda obj: [k for k in names if loc[k] is obj]
    out = {"chains": [], "trees": []}
    lnames = [k for k in names if _kind(loc[k]) == "list"]
    chains = {k: _chain(loc[k]) for k in lnames}
    for k in _roots(lnames, chains):
        ch = chains[k]
        more = getattr(ch[-1], "next", None) is not None
        out["chains"].append({"items": [{"v": _nval(n), "tags": tags(n)} for n in ch], "more": more})
    tnames = [k for k in names if _kind(loc[k]) == "tree"]
    subs = {k: _subtree(loc[k]) for k in tnames}
    for k in _roots(tnames, subs):
        out["trees"].append(_tree_json(loc[k], 0, tags, [31]))
    return out


def _snapshot(frame, ret=False):
    vars_ = {}
    loc = dict(frame.f_locals)
    for name, v in loc.items():
        if name.startswith("_") or callable(v):
            continue
        sv = _snap_value(v)
        if sv is not None or v is None:
            vars_[name] = sv
    snap = {"line": frame.f_lineno, "fn": frame.f_code.co_name, "vars": vars_, "ret": ret}
    st = _structs(loc)
    if st:
        snap["nodes"] = st
    return snap


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
                       else "Probably an infinite loop, or far too slow for this input: what makes each `while` stop?")
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
