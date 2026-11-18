const DJ_COMMON = `
import heapq, random
INF = float("inf")

# ward map: C=0 (cart station), E=1, J=2 (junction), A=3 (atrium), T=4 (ward 7)
WARD = [(0, 1, 2), (0, 2, 4), (1, 2, 1), (2, 3, 2), (2, 4, 2), (3, 4, 1)]
# covered walkway: C=0, J=1, A=2, T=3 (ward 7); A->J costs -4 (it saves four minutes)
WALKWAY = [(0, 1, 4), (0, 2, 5), (2, 1, -4), (1, 3, 2), (2, 3, 1)]

def ref_bf(n, edges, s):
    dist = [INF] * n; dist[s] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w; changed = True
        if not changed:
            break
    return dist

def rand_graph(rng, n, m, lo=1, hi=9):
    edges = set(); m = min(m, n * (n - 1))
    while len(edges) < m:
        u, v = rng.randrange(n), rng.randrange(n)
        if u != v: edges.add((u, v))
    return [(u, v, rng.randint(lo, hi)) for u, v in sorted(edges)]

def rand_dag(rng, n, m, lo=-4, hi=9):
    # edges only go from a lower to a higher index, so negative weights can never form a cycle
    edges = set(); m = min(m, n * (n - 1) // 2)
    while len(edges) < m:
        u, v = sorted(rng.sample(range(n), 2))
        edges.add((u, v))
    return [(u, v, rng.randint(lo, hi)) for u, v in sorted(edges)]

def check_dist(ns, n, edges, s, want=None):
    f = need(ns, "dijkstra")
    got = f(n, list(edges), s)
    want = ref_bf(n, edges, s) if want is None else want
    if list(got) != want:
        raise AssertionError(f"Shortest distances from {s} should be {short(want)}, but your code returned {short(got)}.")
`;
const DJ_SCALE = {
  entry: 'dijkstra',
  sizes: [100, 200, 400, 800],
  gen: `import random
def gen(n):
    rng = random.Random(5)
    edges = set()
    while len(edges) < 3 * n:
        u, v = rng.randrange(n), rng.randrange(n)
        if u != v: edges.add((u, v))
    return (n, [(u, v, rng.randint(1, 9)) for u, v in sorted(edges)], 0)`,
  note: 'The graph keeps three corridors per place, so the work grows a little faster than the size: about E log V.',
};

window.LESSON = {
  id: 'dijkstra',
  title: 'Dijkstra: The Fastest Route to Ward 7',
  topic: 'Shortest paths',
  intro: `A nurse needs the quickest way to run a crash cart from the cart station to every other place in the hospital.
    Corridors have lengths in minutes, so the first place you <i>discover</i> is not always the closest one.
    <b>Dijkstra's algorithm</b> keeps a priority queue of tentative distances and always settles the closest unfinished
    place next. A graph here is <code>n</code> places (numbered <code>0..n-1</code>) and a list of directed
    <code>(u, v, w)</code> corridors.`,
  levels: [
    {
      id: 'relax',
      title: 'RELAX and extract the closest',
      entry: 'dijkstra',
      brief: `The heap loop and the <code>settled</code> list are set up. Fill in the two blanks of <b>relaxation</b>:
        test whether going through <code>u</code> beats the best known distance to <code>v</code>, and if so
        <b>record it and push the new pair</b>. Step through the ward map: watch <code>dist</code> shrink as each
        place is settled.`,
      hints: [
        'The test: <code>dist[u] + w &lt; dist[v]</code>.',
        'Record it: <code>dist[v] = dist[u] + w</code>.',
        'Push it: <code>heapq.heappush(heap, (dist[v], v))</code>. Older, worse entries for <code>v</code> stay in the heap and are skipped later by the <code>settled</code> check.',
      ],
      starter: `import heapq
INF = float("inf")

def dijkstra(n, edges, s):
    """Shortest distance from s to every place; unreachable places stay INF."""
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [INF] * n
    dist[s] = 0
    settled = [False] * n
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if settled[u]:
            continue
        settled[u] = True
        for v, w in adj[u]:
            if False:                   # TODO: does going through u beat dist[v]?
                pass                    # TODO: record the better distance and push (dist[v], v)
    return dist
`,
      reflect: 'Why is it safe to stop caring about a place the moment it is popped from the heap? What would break if a corridor could take negative minutes?',
      demo: 'DEMO_ARGS = (5, [(0, 1, 2), (0, 2, 4), (1, 2, 1), (2, 3, 2), (2, 4, 2), (3, 4, 1)], 0)',
      viz: { pointers: ['u', 'd'], lists: ['dist', 'settled'] },
      tests: DJ_COMMON + `
def t_ward(ns): check_dist(ns, 5, WARD, 0, [0, 2, 3, 5, 5])
def t_chain(ns): check_dist(ns, 4, [(0, 1, 3), (1, 2, 3), (2, 3, 3)], 0, [0, 3, 6, 9])
def t_shortcut(ns): check_dist(ns, 3, [(0, 1, 10), (0, 2, 1), (2, 1, 1)], 0, [0, 2, 1])
def t_unreachable(ns): check_dist(ns, 3, [(0, 1, 5)], 0, [0, 5, INF])
def t_single(ns): check_dist(ns, 1, [], 0, [0])
def t_random(ns):
    rng = random.Random(8)
    for _ in range(25):
        n = rng.randint(2, 12)
        check_dist(ns, n, rand_graph(rng, n, rng.randint(1, n * 2)), 0)
def t_perf(ns):
    rng = random.Random(9)
    n = 400
    check_dist(ns, n, rand_graph(rng, n, 3 * n), 0)

TESTS = [
    ("ward map from the cart station", "basic", t_ward),
    ("a long corridor", "basic", t_chain),
    ("two short hops beat one long one", "edge", t_shortcut),
    ("an unreachable place stays infinite", "edge", t_unreachable),
    ("a single place", "edge", t_single),
    ("25 random hospitals match the reference", "edge", t_random),
    ("400 places in O(E log V) lines", "perf", t_perf, 150000),
]
`,
      scale: DJ_SCALE,
    },
    {
      id: 'path',
      title: 'Remember the route, not just the time',
      entry: 'route',
      brief: `The nurse needs the <i>route</i>, not just the minutes. Fill in two blanks:
        remember <b>who we came from</b> whenever a distance improves (<code>pred</code>), and when the search is
        done <b>walk back</b> from the target through <code>pred</code> to the cart station. The route is built
        backwards, so reverse it at the end. An unreachable target returns <code>(INF, [])</code>.`,
      hints: [
        'When a shorter way to <code>v</code> is found: <code>pred[v] = u</code>.',
        'Walking back: <code>v = pred[v]</code> inside the <code>while v is not None</code> loop.',
        'The path starts empty; <code>path.append(v)</code> collects places from target to source, then <code>path.reverse()</code>.',
      ],
      starter: `import heapq
INF = float("inf")

def route(n, edges, s, t):
    """Return (distance, path) from s to t, where path lists the places from s to t."""
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [INF] * n
    pred = [None] * n
    dist[s] = 0
    settled = [False] * n
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if settled[u]:
            continue
        settled[u] = True
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                pass                    # TODO: remember that we reached v from u
                heapq.heappush(heap, (dist[v], v))
    if dist[t] == INF:
        return INF, []
    path = []
    v = t
    while v is not None:
        path.append(v)
        v = None                        # TODO: step back to the place we came from
    path.reverse()
    return dist[t], path
`,
      reflect: 'The predecessors form a tree rooted at the cart station. Why is following them backwards guaranteed to reach the source?',
      demo: 'DEMO_ARGS = (5, [(0, 1, 2), (0, 2, 4), (1, 2, 1), (2, 3, 2), (2, 4, 2), (3, 4, 1)], 0, 4)',
      viz: { pointers: ['u', 'v'], lists: ['dist', 'pred'] },
      tests: DJ_COMMON + `
def best_edge(edges, a, b):
    ws = [w for u, v, w in edges if u == a and v == b]
    if not ws:
        raise AssertionError(f"Your path uses a step {a} -> {b} that is not a corridor.")
    return min(ws)

def _check(ns, n, edges, s, t):
    f = need(ns, "route")
    d, p = f(n, list(edges), s, t)
    want = ref_bf(n, edges, s)[t]
    if d != want:
        raise AssertionError(f"The distance to {t} should be {want}, but you returned {d}.")
    if want == INF:
        if list(p) != []:
            raise AssertionError(f"Place {t} is unreachable, so the path should be [], got {short(p)}.")
        return
    if not p or p[0] != s or p[-1] != t:
        raise AssertionError(f"The path must start at {s} and end at {t}. You returned {short(p)}.")
    total = sum(best_edge(edges, a, b) for a, b in zip(p, p[1:]))
    if total != want:
        raise AssertionError(f"Your path {short(p)} takes {total} minutes, not the shortest {want}.")

def t_ward(ns):
    _check(ns, 5, WARD, 0, 4)
    got = need(ns, "route")(5, list(WARD), 0, 4)
    if list(got[1]) != [0, 1, 2, 4]:
        raise AssertionError(f"The only fastest route is C, E, J, ward 7 = [0, 1, 2, 4]; got {short(got[1])}.")
def t_same(ns):
    d, p = need(ns, "route")(3, [(0, 1, 2)], 0, 0)
    if d != 0 or list(p) != [0]:
        raise AssertionError(f"From a place to itself: (0, [0]). Got {short((d, p))}.")
def t_unreach(ns): _check(ns, 3, [(0, 1, 5)], 0, 2)
def t_fork(ns): _check(ns, 4, [(0, 1, 1), (0, 2, 1), (1, 3, 5), (2, 3, 2)], 0, 3)
def t_random(ns):
    rng = random.Random(12)
    for _ in range(25):
        n = rng.randint(2, 12)
        edges = rand_graph(rng, n, rng.randint(1, n * 2))
        _check(ns, n, edges, 0, rng.randrange(n))
def t_perf(ns):
    rng = random.Random(13)
    n = 300
    _check(ns, n, rand_graph(rng, n, 3 * n), 0, n - 1)

TESTS = [
    ("ward 7 by the quickest corridors", "basic", t_ward),
    ("a fork: take the cheaper branch", "basic", t_fork),
    ("the source to itself", "edge", t_same),
    ("an unreachable target", "edge", t_unreach),
    ("25 random hospitals: the path really costs the distance", "edge", t_random),
    ("300 places in O(E log V) lines", "perf", t_perf, 150000),
]
`,
    },
    {
      id: 'walkway',
      title: 'The covered walkway: a silent wrong answer',
      entry: 'dijkstra',
      brief: `A covered walkway saves four minutes, so its corridor weighs <code>-4</code>. This Dijkstra has
        no bug on ordinary maps, yet on the walkway map it answers <b>6</b> minutes to ward 7 when the truth is
        <b>3</b>, with no error at all. The <code>settled</code> check refuses to look at a place again, even when a
        cheaper route to it turns up later. Change <b>one line</b> so that a stale heap entry is skipped, but a place
        can be improved again.`,
      hints: [
        'Run the tests: the walkway map fails, the ordinary ward map passes. Which line stops J from being revisited?',
        'Replace the <code>settled</code> skip with a <b>stale-entry</b> skip: <code>if d &gt; dist[u]: continue</code>.',
        'You can then delete the <code>settled[u] = True</code> line. This variant is only valid when there is no negative <i>cycle</i>, and it can redo work.',
      ],
      starter: `import heapq
INF = float("inf")

def dijkstra(n, edges, s):
    """Shortest distances, also when some corridors have negative minutes (no negative cycles)."""
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [INF] * n
    dist[s] = 0
    settled = [False] * n
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if settled[u]:
            continue
        settled[u] = True
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))
    return dist
`,
      reflect: 'Why does the settled idea need every weight to be at least 0? Which later week offers a method that is designed for negative edges?',
      demo: 'DEMO_ARGS = (4, [(0, 1, 4), (0, 2, 5), (2, 1, -4), (1, 3, 2), (2, 3, 1)], 0)',
      viz: { pointers: ['u', 'd'], lists: ['dist', 'settled'] },
      tests: DJ_COMMON + `
def t_walkway(ns): check_dist(ns, 4, WALKWAY, 0, [0, 1, 5, 3])
def t_ward(ns): check_dist(ns, 5, WARD, 0, [0, 2, 3, 5, 5])
def t_neg_chain(ns): check_dist(ns, 4, [(0, 1, 5), (0, 2, 1), (2, 1, -3), (1, 3, 1)], 0, [0, -2, 1, -1])
def t_dags(ns):
    rng = random.Random(21)
    for _ in range(25):
        n = rng.randint(3, 10)
        check_dist(ns, n, rand_dag(rng, n, rng.randint(2, n * 2)), 0)
def t_perf(ns):
    rng = random.Random(22)
    n = 150
    check_dist(ns, n, rand_dag(rng, n, 3 * n), 0)

TESTS = [
    ("the walkway map: ward 7 in 3 minutes, not 6", "basic", t_walkway),
    ("the ordinary ward map still works", "basic", t_ward),
    ("a negative corridor behind a positive one", "edge", t_neg_chain),
    ("25 random maps with negative corridors but no loops", "edge", t_dags),
    ("150 places finish in reasonable time", "perf", t_perf, 400000),
]
`,
    },
  ],
};
