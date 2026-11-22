const SVG = `<svg viewBox="0 -14 368 190" width="100%" style="max-width:420px;display:block;margin:8px 0" role="img" aria-label="Route graph: src to A cost 1, src to B 3, A to C 5, A to dst 9, B to C 2, B to dst 4, C to dst 6" fill="none" stroke="currentColor" stroke-width="1.4" font-size="12"><defs><marker id="ah" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="currentColor" stroke="none"/></marker></defs><line x1="38" y1="74" x2="124" y2="34" marker-end="url(#ah)"/><text x="81" y="50" fill="currentColor" stroke="none" text-anchor="middle">1</text><line x1="38" y1="86" x2="124" y2="126" marker-end="url(#ah)"/><text x="81" y="102" fill="currentColor" stroke="none" text-anchor="middle">3</text><line x1="153" y1="33" x2="224" y2="71" marker-end="url(#ah)"/><text x="189" y="48" fill="currentColor" stroke="none" text-anchor="middle">5</text><line x1="153" y1="127" x2="224" y2="89" marker-end="url(#ah)"/><text x="189" y="104" fill="currentColor" stroke="none" text-anchor="middle">2</text><line x1="255" y1="80" x2="326" y2="80" marker-end="url(#ah)"/><text x="290" y="76" fill="currentColor" stroke="none" text-anchor="middle">6</text><path d="M153 16 Q250 -8 331 70" marker-end="url(#ah)"/><text x="252" y="6" fill="currentColor" stroke="none" text-anchor="middle">9</text><path d="M153 144 Q250 168 331 90" marker-end="url(#ah)"/><text x="252" y="164" fill="currentColor" stroke="none" text-anchor="middle">4</text><circle cx="24" cy="80" r="15"/><text x="24" y="84" fill="currentColor" stroke="none" text-anchor="middle">src</text><circle cx="140" cy="26" r="15"/><text x="140" y="30" fill="currentColor" stroke="none" text-anchor="middle">A</text><circle cx="140" cy="134" r="15"/><text x="140" y="138" fill="currentColor" stroke="none" text-anchor="middle">B</text><circle cx="240" cy="80" r="15"/><text x="240" y="84" fill="currentColor" stroke="none" text-anchor="middle">C</text><circle cx="344" cy="80" r="15"/><text x="344" y="84" fill="currentColor" stroke="none" text-anchor="middle">dst</text></svg>`;
const routeCommon = `
import random
INF = float("inf")

# 0 = src, 1 = A, 2 = B, 3 = C, 4 = dst. Every road goes to a larger number.
ROADS = {0: [(1, 1), (2, 3)], 1: [(3, 5), (4, 9)], 2: [(3, 2), (4, 4)], 3: [(4, 6)], 4: []}

def rand_layers(rng, layers, width):
    """src, then 'layers' layers of 'width' nodes, then dst. Every node has a road to every node of the next layer."""
    n = 2 + layers * width
    roads = {u: [] for u in range(n)}
    layer = lambda k: [1 + k * width + j for j in range(width)]
    for k in range(layers + 1):
        here = [0] if k == 0 else layer(k - 1)
        there = layer(k) if k < layers else [n - 1]
        for u in here:
            costs = rng.sample(range(1, 60), len(there))      # distinct costs out of each node: no ties
            for v, c in zip(there, costs):
                roads[u].append((v, c))
    return n, roads

def ref_best(n, roads):
    best = [INF] * n
    best[0] = 0
    for u in range(n):
        for v, w in roads[u]:
            best[v] = min(best[v], best[u] + w)
    return best

def ref_greedy(roads, src, dst):
    node, cost, route = src, 0, [src]
    while node != dst:
        v, w = min(roads[node], key=lambda r: r[1])
        cost += w; node = v; route.append(v)
    return cost, route

def check_route(roads, route, cost, n, label):
    if not (isinstance(route, list) and route and route[0] == 0 and route[-1] == n - 1):
        raise AssertionError(f"{label}: the route {short(route)} should start at 0 (src) and end at {n - 1} (dst).")
    total = 0
    for a, b in zip(route, route[1:]):
        w = dict(roads[a]).get(b)
        if w is None:
            raise AssertionError(f"{label}: your route {short(route)} uses a road {a} -> {b} that does not exist.")
        total += w
    if total != cost:
        raise AssertionError(f"{label}: the roads of your route add up to {total}, but you returned cost {short(cost)}.")
`;
const greedyTests = `
def _check(ns, roads, src, dst):
    f = need(ns, "greedy_route")
    got = f(roads, src, dst)
    want = ref_greedy(roads, src, dst)
    if tuple(got) != want:
        raise AssertionError(f"Taking the cheapest road at every node should give {short(want)}, but your code returned {short(got)}.")

def t_lecture(ns): _check(ns, ROADS, 0, 4)
def t_random(ns):
    rng = random.Random(4)
    for _ in range(12):
        n, roads = rand_layers(rng, rng.randint(1, 4), rng.randint(2, 4))
        _check(ns, roads, 0, n - 1)
def t_single(ns): _check(ns, {0: [(1, 5)], 1: []}, 0, 1)
def t_chain(ns): _check(ns, {0: [(1, 2)], 1: [(2, 7)], 2: [(3, 1)], 3: []}, 0, 3)
def t_right(ns): _check(ns, {0: [(1, 1), (2, 6)], 1: [(3, 1), (2, 5)], 2: [(3, 4)], 3: []}, 0, 3)
def t_worse(ns):
    got = need(ns, "greedy_route")(ROADS, 0, 4)
    if got[0] <= ref_best(5, ROADS)[4]:
        raise AssertionError("On this graph the cheapest-road-first walk should cost MORE than the cheapest route (12 against 7).")

TESTS = [
    ("lecture graph: the cheapest-road walk is src, A, C, dst = 12", "basic", t_lecture),
    ("12 random layered graphs", "basic", t_random),
    ("the walk costs more than the best route (12 against 7)", "basic", t_worse),
    ("a single road", "edge", t_single),
    ("a chain has only one route", "edge", t_chain),
    ("a graph where cheapest-first happens to be right", "edge", t_right),
]
`;
const fillTests = `
def _check(ns, n, roads, label):
    f = need(ns, "cheapest_costs")
    got = f(n, roads)
    want = ref_best(n, roads)
    if list(got) != want:
        raise AssertionError(f"{label}: best should be {short(want)}, but your code returned {short(got)}.")

def t_lecture(ns): _check(ns, 5, ROADS, "lecture graph")
def t_random(ns):
    rng = random.Random(7)
    for _ in range(10):
        n, roads = rand_layers(rng, rng.randint(1, 4), rng.randint(2, 4))
        _check(ns, n, roads, f"layered graph with {n} nodes")
def t_one(ns): _check(ns, 1, {0: []}, "one node")
def t_unreach(ns): _check(ns, 3, {0: [(2, 4)], 1: [(2, 1)], 2: []}, "node 1 has no road into it")
def t_right(ns): _check(ns, 4, {0: [(1, 1), (2, 6)], 1: [(3, 1), (2, 5)], 2: [(3, 4)], 3: []}, "greedy-friendly graph")
def t_perf(ns):
    n, roads = rand_layers(random.Random(2), 40, 5)
    _check(ns, n, roads, "40 layers of 5")

TESTS = [
    ("lecture graph: best = [0, 1, 3, 5, 7]", "basic", t_lecture),
    ("10 random layered graphs", "basic", t_random),
    ("a single node costs 0", "edge", t_one),
    ("a node nobody can reach stays at infinity", "edge", t_unreach),
    ("a graph where cheapest-first happens to be right", "edge", t_right),
    ("40 layers of 5 nodes within budget", "perf", t_perf, 400000),
]
`;
const routeTests = `
def _check(ns, n, roads, label):
    f = need(ns, "cheapest_route")
    got = f(n, roads)
    if not (isinstance(got, tuple) or isinstance(got, list)) or len(got) != 2:
        raise AssertionError(f"{label}: return a pair (cost, route), not {short(got)}.")
    cost, route = got
    want = ref_best(n, roads)[n - 1]
    if cost != want:
        raise AssertionError(f"{label}: the cheapest cost is {want}, but your code returned {short(cost)}.")
    check_route(roads, route, cost, n, label)

def t_lecture(ns):
    got = need(ns, "cheapest_route")(5, ROADS)
    if tuple(got[:1]) != (7,) or list(got[1]) != [0, 2, 4]:
        raise AssertionError(f"The cheapest route is src, B, dst = [0, 2, 4] for cost 7, but your code returned {short(got)}.")
def t_random(ns):
    rng = random.Random(9)
    for _ in range(10):
        n, roads = rand_layers(rng, rng.randint(1, 4), rng.randint(2, 4))
        _check(ns, n, roads, f"layered graph with {n} nodes")
def t_single(ns): _check(ns, 2, {0: [(1, 5)], 1: []}, "a single road")
def t_chain(ns): _check(ns, 4, {0: [(1, 2)], 1: [(2, 7)], 2: [(3, 1)], 3: []}, "a chain")
def t_right(ns): _check(ns, 4, {0: [(1, 1), (2, 6)], 1: [(3, 1), (2, 5)], 2: [(3, 4)], 3: []}, "greedy-friendly graph")
def t_perf(ns):
    n, roads = rand_layers(random.Random(3), 40, 5)
    _check(ns, n, roads, "40 layers of 5")

TESTS = [
    ("lecture graph: src, B, dst = 7", "basic", t_lecture),
    ("10 random layered graphs: cost and route agree", "basic", t_random),
    ("a single road", "edge", t_single),
    ("a chain has only one route", "edge", t_chain),
    ("a graph where cheapest-first happens to be right", "edge", t_right),
    ("40 layers of 5 nodes within budget", "perf", t_perf, 400000),
]
`;
const generalTests = `
LECTURE = {("src", "A"): 1, ("src", "B"): 3, ("A", "C"): 5, ("A", "dst"): 9, ("B", "C"): 2, ("B", "dst"): 4, ("C", "dst"): 6}
LECTURE_ORDER = ["src", "A", "B", "C", "dst"]

def named(n, roads):
    nm = lambda i: "src" if i == 0 else "dst" if i == n - 1 else "n" + str(i)
    return [nm(i) for i in range(n)], {(nm(u), nm(v)): w for u in roads for v, w in roads[u]}

def _check(ns, edges, order, src, dst, label):
    f = need(ns, "cheapest_route")
    got = f(dict(edges), list(order), src, dst)
    if not (isinstance(got, (tuple, list)) and len(got) == 2):
        raise AssertionError(f"{label}: return a pair (cost, route), not {short(got)}.")
    cost, route = got
    best = {v: INF for v in order}; best[src] = 0
    for v in order:
        for (a, b), w in edges.items():
            if b == v:
                best[v] = min(best[v], best[a] + w)
    if cost != best[dst]:
        raise AssertionError(f"{label}: the cheapest cost is {best[dst]}, but your code returned {short(cost)}.")
    if not (isinstance(route, list) and route and route[0] == src and route[-1] == dst):
        raise AssertionError(f"{label}: the route {short(route)} should start at {src} and end at {dst}.")
    total = 0
    for a, b in zip(route, route[1:]):
        if (a, b) not in edges:
            raise AssertionError(f"{label}: your route {short(route)} uses a road {a} -> {b} that does not exist.")
        total += edges[(a, b)]
    if total != cost:
        raise AssertionError(f"{label}: the roads of your route add up to {total}, but you returned cost {short(cost)}.")

def t_lecture(ns): _check(ns, LECTURE, LECTURE_ORDER, "src", "dst", "lecture graph")
def t_random(ns):
    rng = random.Random(12)
    for _ in range(8):
        n, roads = rand_layers(rng, rng.randint(1, 4), rng.randint(2, 4))
        order, edges = named(n, roads)
        _check(ns, edges, order, "src", "dst", f"layered graph with {n} nodes")
def t_right(ns):
    edges = {("s", "a"): 1, ("s", "b"): 6, ("a", "t"): 1, ("a", "b"): 5, ("b", "t"): 4}
    _check(ns, edges, ["s", "a", "b", "t"], "s", "t", "greedy-friendly graph")
def t_inner(ns):
    _check(ns, LECTURE, LECTURE_ORDER, "A", "dst", "start at A instead of src")
def t_same(ns): _check(ns, LECTURE, LECTURE_ORDER, "src", "src", "src to src")
def t_perf(ns):
    n, roads = rand_layers(random.Random(5), 14, 3)
    order, edges = named(n, roads)
    _check(ns, edges, order, "src", "dst", "14 layers of 3 (3^14 routes)")

TESTS = [
    ("lecture graph with names: src, B, dst = 7", "basic", t_lecture),
    ("8 random layered graphs", "basic", t_random),
    ("start from A instead of src", "edge", t_inner),
    ("src to src costs 0", "edge", t_same),
    ("a graph where cheapest-first happens to be right", "edge", t_right),
    ("14 layers of 3 nodes (millions of routes) within budget", "perf", t_perf, 200000),
]
`;
window.LESSON = {
  id: 'route-dp',
  title: 'Cheapest Route',
  topic: 'Dynamic programming',
  intro: `Five stops, seven one-way roads, each with a cost. Which route from <code>src</code> to <code>dst</code> is the
    cheapest? Last week's reflex, <b>take the cheapest road at every step</b>, costs 12 here, but the cheapest route costs 7.
    The greedy-choice property fails. What still holds is <b>optimal substructure</b>: the cheapest route to a stop is one
    more road after the cheapest route to some earlier stop. Write the greedy walk, then replace it by a table that solves
    each stop once and remembers the answer. That table is dynamic programming.
    ${SVG}`,
  levels: [
    {
      id: 'greedy',
      title: 'Cheapest road first',
      entry: 'greedy_route',
      brief: `Stops are numbered <code>0</code> (src), <code>1</code> (A), <code>2</code> (B), <code>3</code> (C),
        <code>4</code> (dst). <code>roads[u]</code> lists the roads out of <code>u</code> as <code>(next, cost)</code>
        pairs. Finish the walk: at every stop take the <b>cheapest road out</b>. Fill in the blank, step through, and
        watch the walk reach dst for <b>12</b>, while a cheaper route costs 7.`,
      hints: [
        'Among <code>roads[node]</code>, pick the pair with the smallest cost: <code>min(roads[node], key=...)</code>.',
        '<code>nxt, w = min(roads[node], key=lambda road: road[1])</code>',
      ],
      starter: `def greedy_route(roads, src, dst):
    """Walk from src; at every stop take the cheapest road out. Return (total cost, route)."""
    node, cost, route = src, 0, [src]
    while node != dst:
        nxt, w = dst, 0
        pass  # TODO: the cheapest road out of node: nxt is where it leads, w is its cost
        cost += w
        node = nxt
        route.append(node)
    return cost, route
`,
      reflect: 'In one sentence: why did the cheapest first road (cost 1) lead to a worse route than the dearer one (cost 3)? Which of the two greedy properties failed?',
      demo: 'DEMO_ARGS = ({0: [(1, 1), (2, 3)], 1: [(3, 5), (4, 9)], 2: [(3, 2), (4, 4)], 3: [(4, 6)], 4: []}, 0, 4)',
      viz: { pointers: [], lists: ['route'] },
      tests: routeCommon + greedyTests,
    },
    {
      id: 'fill',
      title: 'Fill the table, one stop at a time',
      entry: 'cheapest_costs',
      brief: `<code>best[v]</code> is the cheapest cost from src to stop <code>v</code>. Every road goes to a larger number,
        so by the time we reach <code>v</code> every stop before it is already final. Fill in the body: for each road
        <code>u -> v</code> into <code>v</code>, going through <code>u</code> costs <code>best[u] + w</code>. Keep the smaller.
        Step through and watch <code>best</code> fill left to right: <code>[0, 1, 3, 5, 7]</code>.`,
      hints: [
        'The cheapest cost to <code>v</code> is the minimum over its incoming roads of <code>best[u] + w</code>.',
        '<code>best[v] = min(best[v], best[u] + w)</code>',
      ],
      starter: `def cheapest_costs(n, roads):
    """best[v] = cheapest total cost from stop 0 (src) to stop v. Every road goes to a larger number."""
    INF = float("inf")
    into = [[] for _ in range(n)]              # into[v] lists (u, w): a road u -> v of cost w
    for u in range(n):
        for v, w in roads[u]:
            into[v].append((u, w))
    best = [INF] * n
    best[0] = 0
    for v in range(1, n):
        for u, w in into[v]:
            pass  # TODO: going through u costs best[u] + w: keep it if it is cheaper
    return best
`,
      reflect: 'In one sentence: why is it safe to read best[u] without checking whether it is finished? What would go wrong if the stops were visited in a different order?',
      demo: 'DEMO_ARGS = (5, {0: [(1, 1), (2, 3)], 1: [(3, 5), (4, 9)], 2: [(3, 2), (4, 4)], 3: [(4, 6)], 4: []})',
      viz: { pointers: ['v', 'u'], lists: ['best'] },
      tests: routeCommon + fillTests,
    },
    {
      id: 'route',
      title: 'Which route is it?',
      entry: 'cheapest_route',
      brief: `A cost alone does not tell the driver where to turn. Besides <code>best[v]</code>, remember
        <code>parent[v]</code>: the stop we came from on the cheapest way to <code>v</code>. Fill in two blanks:
        record the better cost <b>and</b> its parent, then walk back from dst along the parents until src. The route for the
        lecture graph is src, B, dst, which is stops <code>[0, 2, 4]</code>, cost 7.`,
      hints: [
        'When <code>best[u] + w</code> beats <code>best[v]</code>, set both <code>best[v]</code> and <code>parent[v] = u</code>.',
        'Walking back: <code>node = parent[node]</code>, then add it to the route. Reverse at the end.',
      ],
      starter: `def cheapest_route(n, roads):
    """Return (cost, route) for the cheapest route from stop 0 (src) to stop n - 1 (dst)."""
    INF = float("inf")
    into = [[] for _ in range(n)]
    for u in range(n):
        for v, w in roads[u]:
            into[v].append((u, w))
    best = [INF] * n
    parent = [None] * n
    best[0] = 0
    for v in range(1, n):
        for u, w in into[v]:
            if best[u] + w < best[v]:
                pass  # TODO: keep the better cost best[v] and remember parent[v] = u
    node = n - 1
    route = [node]
    while node != 0:
        node = 0  # TODO: step back to the parent of node
        route.append(node)
    route.reverse()
    return best[n - 1], route
`,
      reflect: 'In one sentence: the table holds one answer per stop, but there are many routes. Why does remembering one parent per stop still recover a cheapest route?',
      demo: 'DEMO_ARGS = (5, {0: [(1, 1), (2, 3)], 1: [(3, 5), (4, 9)], 2: [(3, 2), (4, 4)], 3: [(4, 6)], 4: []})',
      viz: { pointers: ['v', 'u', 'node'], lists: ['best', 'parent', 'route'] },
      tests: routeCommon + routeTests,
    },
    {
      id: 'general',
      title: 'Bigger map, named stops',
      entry: 'cheapest_route',
      brief: `The real map has named stops and a dictionary <code>edges[(u, v)] = cost</code>. <code>order</code> lists the
        stops so that every road goes forward. Write the same table for this map, in three blanks. The hidden tests include a
        graph with <b>3<sup>14</sup> routes</b>: trying every route would never finish, but one table entry per stop does.`,
      hints: [
        'Start with <code>best[v] = INF</code> for every stop and <code>best[src] = 0</code>; then for a road <code>(u, x)</code> with <code>x == v</code> compare <code>best[u] + w</code> with <code>best[v]</code>.',
        'Walk back with <code>node = parent[node]</code> until you reach <code>src</code>.',
      ],
      starter: `def cheapest_route(edges, order, src, dst):
    """edges maps (u, v) -> cost; order lists the stops so every road goes forward. Return (cost, route)."""
    INF = float("inf")
    best = {v: INF for v in order}
    parent = {v: None for v in order}
    best[src] = 0
    for v in order:
        for (u, x), w in edges.items():
            if x == v and best[u] + w < best[v]:
                pass  # TODO: keep the better cost best[v] and remember parent[v] = u
    node = dst
    route = [node]
    while node != src:
        node = src  # TODO: step back to the parent of node
        route.append(node)
    route.reverse()
    return best[dst], route
`,
      reflect: 'In one sentence: the recurrence is the same one you used in the table: best[v] is the minimum over roads into v. Why is this the move from "try everything" to "solve each stop once"? (Next week: rod cutting.)',
      demo: `DEMO_ARGS = ({('src', 'A'): 1, ('src', 'B'): 3, ('A', 'C'): 5, ('A', 'dst'): 9, ('B', 'C'): 2, ('B', 'dst'): 4, ('C', 'dst'): 6}, ['src', 'A', 'B', 'C', 'dst'], 'src', 'dst')`,
      viz: { pointers: [], lists: [] },
      tests: routeCommon + generalTests,
    },
  ],
};
