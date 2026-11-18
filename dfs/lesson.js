const DFS_COMMON = `
import random

NAMES = ["P0", "P1", "N1", "P2", "PT", "P3", "P5", "V1"]
WARD = [[1, 2], [4, 7], [3], [5], [6], [], [], []]
WARD_D = [1, 2, 10, 11, 3, 12, 4, 7]
WARD_F = [16, 9, 15, 14, 6, 13, 5, 8]

def ref_times(adj):
    n = len(adj); d = [0] * n; f = [0] * n; seen = [False] * n; t = [0]
    def go(u):
        seen[u] = True; t[0] += 1; d[u] = t[0]
        for v in adj[u]:
            if not seen[v]: go(v)
        t[0] += 1; f[u] = t[0]
    for u in range(n):
        if not seen[u]: go(u)
    return d, f

def ref_cycle(adj):
    n = len(adj); c = [0] * n
    def go(u):
        c[u] = 1
        for v in adj[u]:
            if c[v] == 1 or (c[v] == 0 and go(v)): return True
        c[u] = 2; return False
    return any(c[u] == 0 and go(u) for u in range(n))

def rand_graph(n, k, seed):
    rng = random.Random(seed)
    return [[rng.randrange(n) for _ in range(rng.randint(0, k))] for _ in range(n)]
`;
const DFS_TIME_TESTS = DFS_COMMON + `
def _check(ns, adj):
    f = need(ns, "dfs_times")
    got = f([list(a) for a in adj])
    try:
        d, fin = got
    except Exception:
        raise AssertionError("Return two lists: (d, f).")
    wd, wf = ref_times(adj)
    for v in range(len(adj)):
        who = NAMES[v] if adj == WARD else f"vertex {v}"
        if d[v] != wd[v]:
            raise AssertionError(f"{who}: discovery time should be {wd[v]}, got {d[v]}.")
        if fin[v] != wf[v]:
            raise AssertionError(f"{who}: finish time should be {wf[v]}, got {fin[v]}.")

def t_ward(ns):
    _check(ns, WARD)
    f = need(ns, "dfs_times")
    d, fin = f([list(a) for a in WARD])
    if list(d) != WARD_D or list(fin) != WARD_F:
        raise AssertionError("The ward times should match the lecture: P0 is (1, 16), PT is (3, 6), V1 is (7, 8).")
def t_chain(ns): _check(ns, [[1], [2], [3], []])
def t_forest(ns): _check(ns, [[1], [], [3], [], []])
def t_back(ns): _check(ns, [[1], [2], [0]])
def t_cross(ns): _check(ns, [[1, 2], [3], [3], []])
def t_one(ns): _check(ns, [[]])
def t_random(ns): _check(ns, rand_graph(50, 3, 4))
def t_deep(ns): _check(ns, [[i + 1] for i in range(300)] + [[]])

TESTS = [
    ("ward: the dive from P0 gives the lecture's times", "basic", t_ward),
    ("a chain", "basic", t_chain),
    ("random 50-vertex graph", "basic", t_random),
    ("a loop 0 -> 1 -> 2 -> 0", "edge", t_back),
    ("two routes into the same vertex", "edge", t_cross),
    ("unreached vertices start new trees", "edge", t_forest),
    ("a single vertex", "edge", t_one),
    ("a 300-long chain (deep recursion)", "perf", t_deep, 60000),
]
`;
const DFS_CYCLE_TESTS = DFS_COMMON + `
def _check(ns, adj):
    f = need(ns, "has_cycle")
    got = f([list(a) for a in adj])
    want = ref_cycle(adj)
    if got is not want:
        raise AssertionError(f"Expected {want}, got {short(got)}.")

def t_ward(ns): _check(ns, WARD)
def t_loop(ns): _check(ns, [[1], [2], [0]])
def t_self(ns): _check(ns, [[0]])
def t_diamond(ns): _check(ns, [[1, 2], [3], [3], []])
def t_tail(ns): _check(ns, [[1], [2], [3], [1]])
def t_empty(ns): _check(ns, [])
def t_random(ns):
    for s in range(8): _check(ns, rand_graph(12, 2, s))
def t_big(ns): _check(ns, [[i + 1] for i in range(400)] + [[200]])

TESTS = [
    ("ward is acyclic: False", "basic", t_ward),
    ("0 -> 1 -> 2 -> 0 is a cycle", "basic", t_loop),
    ("two routes into one vertex is NOT a cycle", "edge", t_diamond),
    ("a cycle reachable only after a tail", "edge", t_tail),
    ("a vertex pointing at itself", "edge", t_self),
    ("no vertices", "edge", t_empty),
    ("8 random graphs agree with the reference", "basic", t_random),
    ("a 400-long chain closing a loop", "perf", t_big, 60000),
]
`;
window.LESSON = {
  id: 'dfs',
  title: 'Depth-First Search: Where Does the Chain Go?',
  topic: 'Graphs',
  intro: `Same ward, different question: not "who is near?" but <b>"where does this chain go?"</b>. Depth-first search (DFS)
    follows one arrow as deep as it leads, backs up to the last junction, and tries the next branch. A global clock stamps each
    person twice: <code>d</code> when first discovered, <code>f</code> when everything reachable from them is finished.
    People: <code>0 P0, 1 P1, 2 N1, 3 P2, 4 PT, 5 P3, 6 P5, 7 V1</code>.`,
  levels: [
    {
      id: 'fill',
      title: 'Visit and recurse',
      entry: 'dfs_times',
      brief: `Return two lists <code>(d, f)</code>. The clock ticks once when a person is discovered and once when they are finished.
        Everything is written for you except the heart of the dive: <b>is this neighbour still white (undiscovered)</b>, and if so
        <b>visit it</b>. Step through the ward and check your times against the lecture: P0 is (1, 16), PT is (3, 6).`,
      hints: [
        'Undiscovered means <code>color[v] == "white"</code>.',
        'Dive into it with <code>visit(v)</code>: the recursion does the backtracking for you.',
      ],
      starter: `def dfs_times(adj):
    """Return (d, f): discovery and finish time of every vertex."""
    n = len(adj)
    d = [0] * n
    f = [0] * n
    color = ["white"] * n
    clock = [0]

    def visit(u):
        clock[0] += 1
        d[u] = clock[0]
        color[u] = "gray"
        for v in adj[u]:
            if False:      # TODO: replace False: is v still white?
                pass       # TODO: dive into v
        clock[0] += 1
        f[u] = clock[0]
        color[u] = "black"

    for u in range(n):
        if color[u] == "white":
            visit(u)
    return d, f
`,
      reflect: 'In one sentence: why does PT finish (f = 6) before V1 is even discovered (d = 7)?',
      demo: 'DEMO_ARGS = ([[1, 2], [4, 7], [3], [5], [6], [], [], []],)',
      viz: { pointers: ['u', 'v'], lists: ['d', 'f'] },
      tests: DFS_TIME_TESTS,
    },
    {
      id: 'clock',
      title: 'Bug hunt: a clock that forgets to tick',
      entry: 'dfs_times',
      brief: `Everything looks right, yet two people end up with the <b>same</b> finish stamp as a discovery stamp, and the
        nesting of the brackets breaks. Step through the demo and watch the clock. Change <b>one line</b> so that
        a finish also moves the clock forward.`,
      hints: [
        'Discovery does <code>clock[0] += 1</code> before it stores <code>d[u]</code>. Does the finish do the same?',
        'Add <code>clock[0] += 1</code> just before <code>f[u] = clock[0]</code>.',
      ],
      starter: `def dfs_times(adj):
    n = len(adj)
    d = [0] * n
    f = [0] * n
    color = ["white"] * n
    clock = [0]

    def visit(u):
        clock[0] += 1
        d[u] = clock[0]
        color[u] = "gray"
        for v in adj[u]:
            if color[v] == "white":
                visit(v)
        f[u] = clock[0]            # <- does finishing advance the clock?
        color[u] = "black"

    for u in range(n):
        if color[u] == "white":
            visit(u)
    return d, f
`,
      reflect: 'In one sentence: why must every one of the 2|V| events (discoveries and finishes) get its own distinct time?',
      demo: 'DEMO_ARGS = ([[1, 2], [3], [], []],)',
      viz: { pointers: ['u', 'v'], lists: ['d', 'f'] },
      tests: DFS_TIME_TESTS,
    },
    {
      id: 'cycle',
      title: 'A gray neighbour means a cycle',
      entry: 'has_cycle',
      brief: `A vertex is <b>gray</b> (<code>1</code>) while its dive is still running. If an arrow leads to a gray vertex, you have
        walked back into your own chain: a <b>cycle</b> (a back edge). Fill in the two blanks: <b>is this neighbour gray</b>, and
        if so <b>report the cycle</b>. A neighbour that is already black (<code>2</code>) is harmless: two routes into one
        vertex are not a loop.`,
      hints: [
        'Gray is <code>color[v] == 1</code>.',
        'Report it with <code>return True</code>.',
      ],
      starter: `def has_cycle(adj):
    """True if the directed graph contains a cycle."""
    n = len(adj)
    color = [0] * n            # 0 white, 1 gray (on the current chain), 2 black (finished)

    def visit(u):
        color[u] = 1
        for v in adj[u]:
            if False:          # TODO: replace False: is v gray, i.e. on the chain we are walking?
                pass           # TODO: a back edge: report the cycle
            if color[v] == 0 and visit(v):
                return True
        color[u] = 2
        return False

    for u in range(n):
        if color[u] == 0 and visit(u):
            return True
    return False
`,
      reflect: 'In one sentence: why is a black neighbour safe to ignore but a gray one is not?',
      demo: 'DEMO_ARGS = ([[1], [2], [3], [1]],)',
      viz: { pointers: ['u', 'v'], lists: ['color'] },
      tests: DFS_CYCLE_TESTS,
    },
  ],
};
