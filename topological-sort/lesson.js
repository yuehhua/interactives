const TOPO_TESTS = `
import random

NAMES = ["CUL", "ISO", "CLN", "RST", "ESC", "REO"]
PLAN = [[3], [2], [4], [4], [5], []]
PLAN_CYCLE = [[3], [2], [4], [4], [5, 0], []]

def valid(adj, order):
    n = len(adj)
    if not isinstance(order, list) or sorted(order) != list(range(n)):
        return f"The order must list every task exactly once; got {short(order)}."
    pos = {u: i for i, u in enumerate(order)}
    for u in range(n):
        for v in adj[u]:
            if pos[u] > pos[v]:
                a = NAMES[u] if n == 6 else u
                b = NAMES[v] if n == 6 else v
                return f"{a} must come before {b}, but your order puts it after."
    return None

def has_cycle(adj):
    n = len(adj); indeg = [0] * n
    for u in range(n):
        for v in adj[u]: indeg[v] += 1
    q = [u for u in range(n) if indeg[u] == 0]; seen = 0
    while q:
        u = q.pop(); seen += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0: q.append(v)
    return seen < n

def _dag(ns, adj):
    got = need(ns, "topo_order")([list(a) for a in adj])
    if has_cycle(adj):
        if got is not None:
            raise AssertionError(f"There is a cycle, so no order exists. Return None, not {short(got)}.")
        return
    if got is None:
        raise AssertionError("This plan has no cycle, but you returned None.")
    msg = valid(adj, got)
    if msg: raise AssertionError(msg)

def rand_dag(n, seed):
    rng = random.Random(seed)
    perm = list(range(n)); rng.shuffle(perm)
    adj = [[] for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            if rng.random() < 3.0 / n: adj[perm[i]].append(perm[j])
    return adj

def t_plan(ns):
    _dag(ns, PLAN)
    got = ns["topo_order"]([list(a) for a in PLAN])
    if got[:2] != [0, 1]:
        raise AssertionError("Seed the queue in vertex order: CUL (0) and ISO (1) have nobody blocking them, so they come out first.")
def t_diamond(ns): _dag(ns, [[1, 2], [3], [3], []])
def t_alone(ns): _dag(ns, [[], [], []])
def t_one(ns): _dag(ns, [[]])
def t_random(ns):
    for s in range(6): _dag(ns, rand_dag(30, s))
def t_cycle(ns): _dag(ns, PLAN_CYCLE)
def t_self(ns): _dag(ns, [[0]])
def t_partial(ns): _dag(ns, [[1], [], [3], [2]])
def t_perf(ns): _dag(ns, rand_dag(1500, 3))

TESTS = [
    ("whiteboard plan: CUL, ISO come first", "basic", t_plan),
    ("two routes into one task (diamond)", "basic", t_diamond),
    ("random 30-task plans", "basic", t_random),
    ("tasks with no dependencies at all", "edge", t_alone),
    ("a single task", "edge", t_one),
    ("add ESC -> CUL: a cycle, so None", "edge", t_cycle),
    ("a task that waits on itself", "edge", t_self),
    ("cycle hiding in only part of the plan", "edge", t_partial),
    ("1,500 tasks, linear work", "perf", t_perf, 120000),
]
`;
const TOPO_DAG_TESTS = TOPO_TESTS + `
TESTS = [t for t in TESTS if t[2] not in (t_cycle, t_self, t_partial)]
`;
window.LESSON = {
  id: 'topological-sort',
  title: 'Topological Sort: In What Order May the Team Act?',
  topic: 'Graphs',
  intro: `The incident whiteboard is a second graph: tasks are the vertices, and an arrow <code>u -> v</code> means
    "<b>v can start only after u is done</b>". Kahn's algorithm peels off tasks that nobody is blocking, one at a time.
    Tasks: <code>0 CUL cultures, 1 ISO isolate, 2 CLN deep-clean, 3 RST results, 4 ESC escalate, 5 REO reopen</code>.
    The plan: CUL to RST to ESC to REO, and ISO to CLN to ESC.`,
  levels: [
    {
      id: 'fill',
      title: 'Peel off the unblocked tasks',
      entry: 'topo_order',
      brief: `The in-degrees are counted and the queue is seeded with tasks that nobody blocks. Fill in the heart of Kahn's
        loop: after taking <code>u</code>, <b>lower the in-degree of each task it points to</b>, and <b>enqueue it when it
        reaches 0</b>. Step through the whiteboard: the lecture's order is CUL, ISO, RST, CLN, ESC, REO.`,
      hints: [
        'Each arrow out of <code>u</code> removes one blocker: <code>indeg[v] -= 1</code>.',
        'No blockers left: <code>if indeg[v] == 0:</code> then <code>queue.append(v)</code>.',
      ],
      starter: `def topo_order(adj):
    """Return the tasks in an order where every arrow u -> v has u before v."""
    n = len(adj)
    indeg = [0] * n
    for u in range(n):
        for v in adj[u]:
            indeg[v] += 1
    queue = [u for u in range(n) if indeg[u] == 0]
    order = []
    while queue:
        u = queue.pop(0)
        order.append(u)
        for v in adj[u]:
            pass           # TODO: one blocker of v is now done: lower indeg[v]
            if False:      # TODO: replace False: is v now unblocked?
                pass       # TODO: put v on the queue
    return order
`,
      reflect: 'In one sentence: why can several different orders all be correct, and what makes two tasks free to swap?',
      demo: 'DEMO_ARGS = ([[3], [2], [4], [4], [5], []],)',
      viz: { pointers: ['u', 'v'], lists: ['indeg', 'queue', 'order'] },
      tests: TOPO_DAG_TESTS,
    },
    {
      id: 'cycle',
      title: 'A free cycle detector',
      entry: 'topo_order',
      brief: `Someone adds the arrow <code>ESC -> CUL</code> ("cultures only after escalation"). Now CUL to RST to ESC to CUL is a
        cycle and the plan deadlocks. Only ISO and CLN can be ordered; the rest wait on each other forever. This loop silently returns
        the <b>short</b> list. Fill in the check at the end: <b>did fewer tasks get ordered than exist</b>, and if so
        <b>report that there is no order</b> by returning <code>None</code>.`,
      hints: [
        'Compare <code>len(order)</code> with <code>n</code>: a short order means some tasks never became free.',
        'The check is <code>len(order) &lt; n</code>, and the report is <code>return None</code>.',
      ],
      starter: `def topo_order(adj):
    n = len(adj)
    indeg = [0] * n
    for u in range(n):
        for v in adj[u]:
            indeg[v] += 1
    queue = [u for u in range(n) if indeg[u] == 0]
    order = []
    while queue:
        u = queue.pop(0)
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    if False:          # TODO: replace False: were fewer tasks ordered than exist?
        pass           # TODO: no order exists: report it
    return order
`,
      reflect: 'In one sentence: why are the tasks left over exactly the ones on or behind a cycle?',
      demo: 'DEMO_ARGS = ([[3], [2], [4], [4], [5, 0], []],)',
      viz: { pointers: ['u', 'v'], lists: ['indeg', 'queue', 'order'] },
      tests: TOPO_TESTS,
    },
    {
      id: 'duplicates',
      title: 'Bug hunt: enqueued too early',
      entry: 'topo_order',
      brief: `ESC waits on <b>two</b> tasks (RST and CLN). This version puts a task on the queue the <b>first</b> time any
        blocker finishes, instead of when the <b>last</b> one does. ESC then runs before RST is done, and gets listed twice.
        Step through the demo and watch <code>queue</code>. Change <b>one line</b> so a task is enqueued only when its in-degree
        reaches 0.`,
      hints: [
        'The test that decides "unblocked" is <code>indeg[v] == 0</code>.',
        'The buggy line asks <code>indeg[v] &gt;= 0</code>, which is true for every touched task.',
      ],
      starter: `def topo_order(adj):
    n = len(adj)
    indeg = [0] * n
    for u in range(n):
        for v in adj[u]:
            indeg[v] += 1
    queue = [u for u in range(n) if indeg[u] == 0]
    order = []
    while queue:
        u = queue.pop(0)
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] >= 0:      # <- when is v really unblocked?
                queue.append(v)
    if len(order) < n:
        return None
    return order
`,
      reflect: 'In one sentence: what does an in-degree above 0 tell you about a task, and why is it wrong to start it then?',
      demo: 'DEMO_ARGS = ([[3], [2], [4], [4], [5], []],)',
      viz: { pointers: ['u', 'v'], lists: ['indeg', 'queue', 'order'] },
      tests: TOPO_TESTS,
    },
  ],
};
