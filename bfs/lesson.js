const BFS_COMMON = `
import random

NAMES = ["P0", "P1", "N1", "P2", "PT", "P3", "P5", "V1"]
WARD = [[1, 2], [4, 7], [3], [5], [6], [], [], []]

def ref(adj, s):
    dist = [-1] * len(adj)
    dist[s] = 0
    q = [s]
    i = 0
    while i < len(q):
        u = q[i]; i += 1
        for v in adj[u]:
            if dist[v] < 0:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def rand_graph(n, k, seed):
    rng = random.Random(seed)
    return [[rng.randrange(n) for _ in range(rng.randint(0, k))] for _ in range(n)]
`;
const BFS_DIST_TESTS = BFS_COMMON + `
def _check(ns, adj, s):
    f = need(ns, "bfs_distances")
    got = f([list(a) for a in adj], s)
    want = ref(adj, s)
    if not isinstance(got, list) or len(got) != len(adj):
        raise AssertionError(f"Return a list with one entry per vertex ({len(adj)} entries); you returned {short(got)}.")
    for v, (g, w) in enumerate(zip(got, want)):
        if g != w:
            who = NAMES[v] if adj == WARD else f"vertex {v}"
            raise AssertionError(f"{who}: expected {w} (-1 means never reached), got {g}.")

def t_ward(ns): _check(ns, WARD, 0)
def t_mid(ns): _check(ns, WARD, 1)
def t_cycle(ns): _check(ns, [[1, 2], [3], [3], [0]], 0)
def t_self(ns): _check(ns, [[0, 1], [1]], 0)
def t_disc(ns): _check(ns, [[1], [], [3], []], 0)
def t_alone(ns): _check(ns, [[]], 0)
def t_random(ns): _check(ns, rand_graph(40, 3, 5), 0)
def t_perf(ns): _check(ns, rand_graph(2000, 4, 11), 0)

TESTS = [
    ("ward: P0 reaches P1, N1 on day 1 and P3, P5 on day 3", "basic", t_ward),
    ("starting from P1 instead of P0", "basic", t_mid),
    ("random 40-person graph matches the reference", "basic", t_random),
    ("a contact loop (3 points back to 0)", "edge", t_cycle),
    ("a person who lists themself as a contact", "edge", t_self),
    ("people nobody can reach stay at -1", "edge", t_disc),
    ("a ward of one person", "edge", t_alone),
    ("2,000 people, linear work", "perf", t_perf, 90000),
]
`;
const BFS_PATH_TESTS = BFS_COMMON + `
def _check(ns, adj, s, t):
    f = need(ns, "shortest_chain")
    got = f([list(a) for a in adj], s, t)
    d = ref(adj, s)[t]
    if d == -1:
        if got is not None:
            raise AssertionError(f"{t} cannot be reached from {s}; return None, not {short(got)}.")
        return
    if not isinstance(got, list) or not got:
        raise AssertionError(f"Expected a chain from {s} to {t}; got {short(got)}.")
    if got[0] != s or got[-1] != t:
        raise AssertionError(f"The chain must start at {s} and end at {t}; got {short(got)}.")
    for a, b in zip(got, got[1:]):
        if b not in adj[a]:
            raise AssertionError(f"{a} -> {b} is not a recorded contact.")
    if len(got) - 1 != d:
        raise AssertionError(f"Your chain uses {len(got) - 1} arrows; the fewest possible is {d}.")

def t_p5(ns): _check(ns, WARD, 0, 6)
def t_p3(ns): _check(ns, WARD, 0, 5)
def t_same(ns): _check(ns, WARD, 4, 4)
def t_none(ns): _check(ns, WARD, 6, 0)
def t_two(ns): _check(ns, [[1, 2], [3], [3], []], 0, 3)
def t_random(ns):
    adj = rand_graph(60, 3, 9)
    for t in range(0, 60, 7): _check(ns, adj, 0, t)
def t_perf(ns): _check(ns, rand_graph(2000, 4, 12), 0, 1999)

TESTS = [
    ("P0 to P5 is P0, P1, PT, P5", "basic", t_p5),
    ("P0 to P3 goes through N1 and P2", "basic", t_p3),
    ("two routes of equal length: either is fine", "basic", t_two),
    ("same person: a chain of one", "edge", t_same),
    ("unreachable target returns None", "edge", t_none),
    ("random graph: always the fewest arrows", "basic", t_random),
    ("2,000 people", "perf", t_perf, 90000),
]
`;
window.LESSON = {
  id: 'bfs',
  title: 'Breadth-First Search: Who Is Exposed on Day k?',
  topic: 'Graphs',
  intro: `An outbreak on a ward. Each arrow means "may have passed it on to". Breadth-first search (BFS) answers the
    question infection control asks every morning: <b>how many arrows away from patient zero is each person?</b>
    Everyone at distance 1 is tested today, distance 2 tomorrow. People are numbered like this:
    <code>0 P0, 1 P1, 2 N1, 3 P2, 4 PT, 5 P3, 6 P5, 7 V1</code>, and <code>adj[u]</code> lists everyone <code>u</code> may have infected.`,
  levels: [
    {
      id: 'fill',
      title: 'The queue loop',
      entry: 'bfs_distances',
      brief: `Return a list <code>dist</code> where <code>dist[v]</code> is the number of arrows from <code>s</code> to <code>v</code>,
        or <code>-1</code> if <code>v</code> cannot be reached. The queue holds the frontier. Fill in the two blanks:
        <b>has this person not been reached yet</b>, and if so <b>record the distance and enqueue them</b>.
        Step through the ward: watch the rings fill in order.`,
      hints: [
        'Not reached yet means <code>dist[v] == -1</code>.',
        'A newly reached person is one arrow further than the person who reached them: <code>dist[v] = dist[u] + 1</code>, then <code>queue.append(v)</code>.',
      ],
      starter: `def bfs_distances(adj, s):
    """dist[v] = fewest arrows from s to v, or -1 if v cannot be reached."""
    dist = [-1] * len(adj)
    dist[s] = 0
    queue = [s]
    while queue:
        u = queue.pop(0)
        for v in adj[u]:
            if False:      # TODO: replace False: has v not been reached yet?
                pass       # TODO: record dist[v] and put v on the queue
    return dist
`,
      reflect: 'In one sentence: why does a first-in, first-out queue make the distances come out as whole rings, one ring after the other?',
      demo: 'DEMO_ARGS = ([[1, 2], [4, 7], [3], [5], [6], [], [], []], 0)',
      viz: { pointers: ['u', 'v'], lists: ['queue', 'dist'] },
      tests: BFS_DIST_TESTS,
      scale: {
        entry: 'bfs_distances',
        sizes: [100, 200, 400],
        gen: `def gen(n):
    return ([[(i + 1) % n, (2 * i) % n, (i * i + 1) % n] for i in range(n)], 0)`,
        note: 'Each row counts executed lines. Doubling the people (and the contacts) should about double the count: BFS does work proportional to V + E.',
      },
    },
    {
      id: 'visited',
      title: 'Bug hunt: check when you discover, not when you dequeue',
      entry: 'bfs_distances',
      brief: `This version marks a person as seen only when it <b>takes them off the queue</b>. On a tree-shaped ward it
        happens to work. Step through the demo, where a contact loop points back to patient zero: P0's own distance gets
        overwritten with a bigger number. Change the loop so that <b>a distance is written only once</b>, when the
        person is first discovered.`,
      hints: [
        'Who is allowed to get a distance? Only someone who still has <code>-1</code>.',
        'Wrap the two lines inside the <code>for</code> loop in <code>if dist[v] == -1:</code>. The <code>seen</code> list is then unnecessary.',
      ],
      starter: `def bfs_distances(adj, s):
    dist = [-1] * len(adj)
    dist[s] = 0
    queue = [s]
    seen = [False] * len(adj)
    while queue:
        u = queue.pop(0)
        if seen[u]:
            continue
        seen[u] = True
        for v in adj[u]:
            dist[v] = dist[u] + 1      # <- written every time v is met
            queue.append(v)
    return dist
`,
      reflect: 'In one sentence: why must the "have I met you before?" check happen at discovery time, when the first (shortest) arrival is the one that counts?',
      demo: 'DEMO_ARGS = ([[1, 2], [3], [3], [0]], 0)',
      viz: { pointers: ['u', 'v'], lists: ['queue', 'dist'] },
      tests: BFS_DIST_TESTS,
    },
    {
      id: 'path',
      title: 'Which chain carried it?',
      entry: 'shortest_chain',
      brief: `Besides <i>how far</i>, the team needs <i>how it travelled</i>. Each person remembers the person who first
        reached them (<code>parent</code>). Fill in the loop that <b>walks the parent pointers back from the target</b>
        to the start, then the code reverses it. Return <code>None</code> if the target cannot be reached.`,
      hints: [
        'The chain ends at <code>s</code>: keep going while <code>path[-1] != s</code>.',
        'Each step: <code>path.append(parent[path[-1]])</code>.',
      ],
      starter: `def shortest_chain(adj, s, t):
    """Fewest-arrows chain [s, ..., t], or None if t cannot be reached."""
    parent = {s: None}
    queue = [s]
    while queue:
        u = queue.pop(0)
        for v in adj[u]:
            if v not in parent:
                parent[v] = u
                queue.append(v)
    if t not in parent:
        return None
    path = [t]
    while False:       # TODO: replace False: keep going until the last person on path is s
        pass           # TODO: add the parent of the last person on path
    path.reverse()
    return path
`,
      reflect: 'In one sentence: why is the chain you recover a shortest one, even though BFS never looked at t specially?',
      demo: 'DEMO_ARGS = ([[1, 2], [4, 7], [3], [5], [6], [], [], []], 0, 6)',
      viz: { pointers: ['u', 'v'], lists: ['queue', 'path'] },
      tests: BFS_PATH_TESTS,
    },
  ],
};
