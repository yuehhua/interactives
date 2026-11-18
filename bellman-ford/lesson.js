const BF_COMMON = `
import random
INF = float("inf")

# covered walkway: C=0, J=1, A=2, T=3 (ward 7); A->J = -4. Edge order from the lecture: (J,7) (A,7) (A,J) (C,J) (C,A)
WALKWAY = [(1, 3, 2), (2, 3, 1), (2, 1, -4), (0, 1, 4), (0, 2, 5)]
# ward map: C=0, E=1, J=2, A=3, T=4
WARD = [(0, 1, 2), (0, 2, 4), (1, 2, 1), (2, 3, 2), (2, 4, 2), (3, 4, 1)]
# pharmacy P=0, ward store S=1, lab L=2, plus the cart station C=3 that reaches P: loop -2 - 3 + 1 = -4
LOOP = [(0, 1, -2), (1, 2, -3), (2, 0, 1), (3, 0, 1)]

def ref(n, edges, s):
    """Reference: returns (dist, ok) where ok is False if a negative cycle is reachable from s."""
    dist = [INF] * n; dist[s] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return dist, False
    return dist, True

def rand_dag(rng, n, m, lo=-4, hi=9):
    edges = set(); m = min(m, n * (n - 1) // 2)
    while len(edges) < m:
        u, v = sorted(rng.sample(range(n), 2))
        edges.add((u, v))
    edges = sorted(edges); rng.shuffle(edges)
    return [(u, v, rng.randint(lo, hi)) for u, v in edges]
`;

window.LESSON = {
  id: 'bellman-ford',
  title: 'Bellman-Ford: When a Shortcut Saves Time',
  topic: 'Shortest paths',
  intro: `The covered walkway saves four minutes, so its corridor has weight <code>-4</code>. Dijkstra cannot be trusted
    with negative weights, but <b>Bellman-Ford</b> can: relax <i>every</i> corridor, and repeat for
    <code>|V| - 1</code> passes. A shortest path never repeats a place, so it has at most <code>|V| - 1</code>
    corridors, and each pass fixes one more hop. A graph is <code>n</code> places numbered <code>0..n-1</code> and a list of
    directed <code>(u, v, w)</code> corridors.`,
  levels: [
    {
      id: 'passes',
      title: 'Relax every corridor, |V| - 1 times',
      entry: 'bellman_ford',
      brief: `The pass loop is written. Fill in the two blanks of <b>relaxation</b>: test whether going through
        <code>u</code> beats <code>dist[v]</code>, and if so <b>update it</b>. Step through the walkway map
        (corridors in the order of the lecture) and watch ward 7 go <code>inf</code>, <code>6</code>, then
        <code>3</code> as the saving travels along the walkway.`,
      hints: [
        'The test: <code>dist[u] + w &lt; dist[v]</code>. In Python <code>inf + w</code> is still <code>inf</code>, so unreached places are safe.',
        'The update: <code>dist[v] = dist[u] + w</code>.',
        'After <code>n - 1</code> passes nothing can improve further, as long as there is no negative cycle.',
      ],
      starter: `INF = float("inf")

def bellman_ford(n, edges, s):
    """Shortest distance from s to every place; the map has no negative cycles."""
    dist = [INF] * n
    dist[s] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if False:                   # TODO: does going through u beat dist[v]?
                pass                    # TODO: record the better distance
    return dist
`,
      reflect: 'Why is n - 1 passes enough? What does pass k guarantee about paths that use k corridors?',
      demo: 'DEMO_ARGS = (4, [(1, 3, 2), (2, 3, 1), (2, 1, -4), (0, 1, 4), (0, 2, 5)], 0)',
      viz: { pointers: ['u', 'v', 'w'], lists: ['dist'] },
      tests: BF_COMMON + `
def check(ns, n, edges, s, want):
    got = need(ns, "bellman_ford")(n, list(edges), s)
    if list(got) != want:
        raise AssertionError(f"Distances from {s} should be {short(want)}, but your code returned {short(got)}.")

def t_walkway(ns): check(ns, 4, WALKWAY, 0, [0, 1, 5, 3])
def t_ward(ns): check(ns, 5, WARD, 0, [0, 2, 3, 5, 5])
def t_unreach(ns): check(ns, 3, [(0, 1, 5)], 0, [0, 5, INF])
def t_backwards(ns):
    # corridors listed against the flow of the search: it takes the full n-1 passes
    check(ns, 5, [(3, 4, 1), (2, 3, 1), (1, 2, 1), (0, 1, 1)], 0, [0, 1, 2, 3, 4])
def t_random(ns):
    rng = random.Random(31)
    for _ in range(25):
        n = rng.randint(2, 10)
        edges = rand_dag(rng, n, rng.randint(1, n * 2))
        check(ns, n, edges, 0, ref(n, edges, 0)[0])
def t_perf(ns):
    rng = random.Random(32)
    n = 40
    edges = rand_dag(rng, n, 3 * n)
    check(ns, n, edges, 0, ref(n, edges, 0)[0])

TESTS = [
    ("walkway map: ward 7 in 3 minutes", "basic", t_walkway),
    ("ordinary ward map", "basic", t_ward),
    ("corridors listed backwards need every pass", "edge", t_backwards),
    ("an unreachable place stays infinite", "edge", t_unreach),
    ("25 random maps with negative corridors", "edge", t_random),
    ("40 places in O(V E) lines", "perf", t_perf, 60000),
]
`,
      scale: {
        entry: 'bellman_ford',
        sizes: [10, 20, 40, 80],
        gen: `import random
def gen(n):
    rng = random.Random(6)
    edges = set()
    while len(edges) < 3 * n:
        u, v = sorted(rng.sample(range(n), 2))
        edges.add((u, v))
    edges = sorted(edges); rng.shuffle(edges)
    return (n, [(u, v, rng.randint(1, 9)) for u, v in edges], 0)`,
        note: 'Doubling the places doubles both V and E, so the work grows about four times: O(V E).',
      },
    },
    {
      id: 'cycle',
      title: 'Detect a loop that saves forever',
      entry: 'bellman_ford',
      brief: `A pharmacy, a ward store and a lab form a loop whose corridors add up to
        <code>-2 - 3 + 1 = -4</code>: every extra lap saves four minutes, so "fastest" means nothing. The passes are
        written. Add the <b>extra pass</b>: if any corridor can <i>still</i> be relaxed after <code>|V| - 1</code>
        passes, a negative cycle is reachable and the function must return <code>(dist, False)</code>.
        Otherwise it returns <code>(dist, True)</code>.`,
      hints: [
        'The same test as relaxation: <code>dist[u] + w &lt; dist[v]</code>.',
        'If the test is true, <code>return dist, False</code>.',
        'A loop the source cannot reach never makes <code>dist[u]</code> finite, so <code>inf + w &lt; inf</code> is false and it does not matter.',
      ],
      starter: `INF = float("inf")

def bellman_ford(n, edges, s):
    """Return (dist, ok). ok is False when a negative cycle is reachable from s."""
    dist = [INF] * n
    dist[s] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if False:                       # TODO: can this corridor still be relaxed?
            pass                        # TODO: negative cycle found: return (dist, False)
    return dist, True
`,
      reflect: 'Why does one more pass prove a negative cycle exists? What can you say about the distances inside the loop?',
      demo: 'DEMO_ARGS = (4, [(0, 1, -2), (1, 2, -3), (2, 0, 1), (3, 0, 1)], 3)',
      viz: { pointers: ['u', 'v', 'w'], lists: ['dist'] },
      tests: BF_COMMON + `
def check(ns, n, edges, s):
    got = need(ns, "bellman_ford")(n, list(edges), s)
    try:
        dist, ok = got
    except Exception:
        raise AssertionError(f"Return a pair (dist, ok). Got {short(got)}.")
    want_dist, want_ok = ref(n, edges, s)
    if ok != want_ok:
        raise AssertionError("There IS a reachable negative cycle: ok should be False." if not want_ok else "There is no reachable negative cycle: ok should be True.")
    if want_ok and list(dist) != want_dist:
        raise AssertionError(f"Distances should be {short(want_dist)}, got {short(dist)}.")

def t_loop(ns): check(ns, 4, LOOP, 3)
def t_walkway(ns): check(ns, 4, WALKWAY, 0)
def t_ward(ns): check(ns, 5, WARD, 0)
def t_hidden(ns):
    # a negative loop the source cannot reach is not a problem for this source
    check(ns, 5, [(0, 1, 2), (2, 3, -2), (3, 4, -3), (4, 2, 1)], 0)
def t_self(ns): check(ns, 2, [(0, 1, 1), (1, 1, -1)], 0)
def t_random(ns):
    rng = random.Random(41)
    for k in range(30):
        n = rng.randint(3, 9)
        edges = rand_dag(rng, n, rng.randint(2, n * 2))
        if k % 2:
            a, b = sorted(rng.sample(range(n), 2))
            edges.append((b, a, -50))
        check(ns, n, edges, 0)

TESTS = [
    ("pharmacy, ward store, lab: loop of -4", "basic", t_loop),
    ("walkway map has no negative loop", "basic", t_walkway),
    ("ordinary ward map has no negative loop", "basic", t_ward),
    ("a negative loop the source cannot reach", "edge", t_hidden),
    ("a corridor from a place to itself", "edge", t_self),
    ("30 random maps, half with a loop planted", "edge", t_random),
]
`,
    },
    {
      id: 'false-alarm',
      title: 'The detector that cries wolf',
      entry: 'bellman_ford',
      brief: `This version finds the pharmacy loop, but it also shouts "negative cycle!" on the perfectly ordinary
        ward map and on the walkway map. Run the tests and read which ones fail. A finished shortest-path map is full of
        <b>tight</b> corridors: <code>dist[u] + w == dist[v]</code>. Fix <b>one character</b> in the extra pass.`,
      hints: [
        'Which comparison treats a tight corridor (equal) as improvable?',
        'Change <code>&lt;=</code> to <code>&lt;</code> in the extra pass. Only a <b>strict</b> improvement means a cycle.',
        'Zero-weight corridors are tight too, so a map with a zero corridor is a good test of your fix.',
      ],
      starter: `INF = float("inf")

def bellman_ford(n, edges, s):
    """Return (dist, ok). ok is False only when a negative cycle is reachable from s."""
    dist = [INF] * n
    dist[s] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if dist[u] + w <= dist[v]:
            return dist, False
    return dist, True
`,
      reflect: 'In a correct answer, which corridors are tight? Draw them on the ward map: what shape do they form?',
      demo: 'DEMO_ARGS = (5, [(0, 1, 2), (0, 2, 4), (1, 2, 1), (2, 3, 2), (2, 4, 2), (3, 4, 1)], 0)',
      viz: { pointers: ['u', 'v', 'w'], lists: ['dist'] },
      tests: BF_COMMON + `
def check(ns, n, edges, s):
    got = need(ns, "bellman_ford")(n, list(edges), s)
    dist, ok = got
    want_dist, want_ok = ref(n, edges, s)
    if ok != want_ok:
        raise AssertionError("False alarm: this map has no negative cycle, ok should be True." if want_ok else "Missed it: there IS a negative cycle, ok should be False.")
    if want_ok and list(dist) != want_dist:
        raise AssertionError(f"Distances should be {short(want_dist)}, got {short(dist)}.")

def t_loop(ns): check(ns, 4, LOOP, 3)
def t_ward(ns): check(ns, 5, WARD, 0)
def t_walkway(ns): check(ns, 4, WALKWAY, 0)
def t_zero(ns): check(ns, 3, [(0, 1, 0), (1, 2, 0), (0, 2, 0)], 0)
def t_single(ns): check(ns, 1, [], 0)
def t_random(ns):
    rng = random.Random(51)
    for k in range(30):
        n = rng.randint(3, 9)
        edges = rand_dag(rng, n, rng.randint(2, n * 2))
        if k % 3 == 0:
            a, b = sorted(rng.sample(range(n), 2))
            edges.append((b, a, -50))
        check(ns, n, edges, 0)

TESTS = [
    ("the ordinary ward map is not a cycle", "basic", t_ward),
    ("the walkway map is not a cycle", "basic", t_walkway),
    ("zero-weight corridors are not a cycle", "edge", t_zero),
    ("a single place", "edge", t_single),
    ("the pharmacy loop is still found", "edge", t_loop),
    ("30 random maps, a third with a loop planted", "edge", t_random),
]
`,
    },
  ],
};
