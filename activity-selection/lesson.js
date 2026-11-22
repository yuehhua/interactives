const ACTIVITY_TESTS = `
import random, bisect

CLRS = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]

def optimum(acts):
    a = sorted(acts, key=lambda x: (x[1], x[0]))
    fin = [x[1] for x in a]
    dp = [0] * (len(a) + 1)
    for i in range(1, len(a) + 1):
        j = min(bisect.bisect_right(fin, a[i - 1][0]), i - 1)
        dp[i] = max(dp[i - 1], 1 + dp[j])
    return dp[len(a)]

def _check(ns, acts):
    f = need(ns, "select_activities")
    got = f(list(acts))
    pool = list(acts)
    for g in got:
        if g not in pool:
            raise AssertionError(f"{g} is not one of the requested activities.")
        pool.remove(g)
    g2 = sorted(got)
    for (s1, f1), (s2, f2) in zip(g2, g2[1:]):
        if s2 < f1:
            raise AssertionError(f"{(s1, f1)} and {(s2, f2)} overlap.")
    want = optimum(acts)
    if len(got) != want:
        raise AssertionError(f"Chose {len(got)} activities; the maximum is {want}.")

def t_clrs(ns): _check(ns, CLRS)
def t_empty(ns): _check(ns, [])
def t_one(ns): _check(ns, [(2, 5)])
def t_touch(ns): _check(ns, [(0, 2), (2, 4), (4, 6)])
def t_same(ns): _check(ns, [(1, 3), (1, 3), (1, 3)])
def t_random(ns):
    rng = random.Random(7)
    acts = []
    for _ in range(60):
        s = rng.randint(0, 100); acts.append((s, s + rng.randint(1, 15)))
    _check(ns, acts)
def t_perf(ns):
    rng = random.Random(9)
    acts = []
    for _ in range(3000):
        s = rng.randint(0, 100000); acts.append((s, s + rng.randint(1, 60)))
    _check(ns, acts)

TESTS = [
    ("CLRS Figure 15.1: 4 activities", "basic", t_clrs),
    ("60 random requests match the optimum", "basic", t_random),
    ("no requests", "edge", t_empty),
    ("one request", "edge", t_one),
    ("back-to-back requests all fit", "edge", t_touch),
    ("identical requests: only one fits", "edge", t_same),
    ("3,000 requests in O(n) lines after the sort", "perf", t_perf, 100000),
]
`;
window.LESSON = {
  id: 'activity-selection',
  title: 'Activity Selection: The Greedy Choice',
  topic: 'Greedy algorithms',
  intro: `One meeting room, many requests, each with a start and a finish time. Pick the <b>largest set of requests
    that do not overlap</b>. Trying every subset is hopeless, but a single greedy rule is provably optimal: always take the
    compatible request that <b>finishes first</b>. Choosing the rule is the whole difficulty: plenty of sensible-sounding
    rules fail.`,
  levels: [
    {
      id: 'fill',
      title: 'Earliest finish first',
      entry: 'select_activities',
      brief: `Requests are <code>(start, finish)</code> pairs, half-open, so one may start exactly when another
        finishes. The sorting is done. Fill in the two blanks: <b>is this request compatible</b> with the last chosen
        one, and if so <b>choose it</b>. Step through CLRS's 11-activity example.`,
      hints: [
        'Compatible means it starts no earlier than the last chosen finish: <code>s &gt;= last_finish</code>.',
        'Choose it: <code>chosen.append((s, f))</code> and <code>last_finish = f</code>.',
      ],
      starter: `def select_activities(acts):
    """Return a largest set of pairwise non-overlapping (start, finish) activities."""
    chosen = []
    last_finish = float("-inf")
    for s, f in sorted(acts, key=lambda a: a[1]):      # earliest finish first
        if False:                                      # TODO: replace False: does it start after the last chosen one finished?
            pass                                        # TODO: choose it and remember its finish
    return chosen
`,
      reflect: 'In one sentence: why can swapping the optimal solution\'s first activity for the earliest-finishing one never hurt?',
      demo: 'DEMO_ARGS = ([(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)],)',
      viz: { pointers: [], lists: ['chosen'] },
      tests: ACTIVITY_TESTS,
          },
    {
      id: 'wrong-rule',
      title: 'Bug hunt: a plausible but wrong rule',
      entry: 'select_activities',
      brief: `This scheduler always takes the request that <b>starts</b> first. It sounds fair, and it is
        wrong: one early, very long request blocks everything. Change <b>one line</b> to the rule that is provably
        optimal. Step through the demo and count how many requests the long one displaces.`,
      hints: [
        'Which end of a request decides how soon the room is free again?',
        'Sort by the second element of each pair.',
      ],
      starter: `def select_activities(acts):
    chosen = []
    last_finish = float("-inf")
    for s, f in sorted(acts, key=lambda a: a[0]):      # <- is this the right order?
        if s >= last_finish:
            chosen.append((s, f))
            last_finish = f
    return chosen
`,
      reflect: 'In one sentence: why does "earliest start" fail while "earliest finish" does not? Give a tiny counterexample.',
      demo: 'DEMO_ARGS = ([(0, 10), (1, 3), (4, 6), (7, 9)],)',
      viz: { pointers: [], lists: ['chosen'] },
      tests: ACTIVITY_TESTS,
    },
  ],
};
