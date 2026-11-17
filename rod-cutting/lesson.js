const rodTests = (entry, n_perf, budget) => `
import random

CLRS_P = [0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30]

def optimum(p, n):
    r = [0] * (n + 1)
    for j in range(1, n + 1):
        r[j] = max(p[i] + r[j - i] for i in range(1, j + 1))
    return r[n]

def _check(ns, p, n):
    f = need(ns, "${entry}")
    got = f(list(p), n)
    want = optimum(p, n)
    if got != want:
        raise AssertionError(f"n = {n}: returned {short(got)}; the best revenue is {want}.")

def t_clrs(ns):
    for n in range(1, 11):
        _check(ns, CLRS_P, n)
def t_four(ns): _check(ns, CLRS_P, 4)
def t_zero(ns): _check(ns, CLRS_P, 0)
def t_one(ns): _check(ns, CLRS_P, 1)
def t_whole(ns): _check(ns, [0, 1, 3, 6, 10, 15], 5)
def t_random(ns):
    rng = random.Random(5)
    for _ in range(6):
        n = rng.randint(5, 12)
        _check(ns, [0] + [rng.randint(1, 30) for _ in range(n)], n)
def t_perf(ns):
    rng = random.Random(11)
    n = ${n_perf}
    _check(ns, [0] + [rng.randint(1, 50) for _ in range(n)], n)

TESTS = [
    ("CLRS Figure 14.1: every length 1 to 10", "basic", t_clrs),
    ("a 4-inch rod sells best as 2 + 2", "basic", t_four),
    ("random price lists", "basic", t_random),
    ("length 0 earns nothing", "edge", t_zero),
    ("length 1 is just the first price", "edge", t_one),
    ("cutting never helps: keep the rod whole", "edge", t_whole),
    ("length ${n_perf} finishes within budget", "perf", t_perf, ${budget}),
]
`;
window.LESSON = {
  id: 'rod-cutting',
  title: 'Rod Cutting: From Exponential to a Table',
  topic: 'Dynamic programming',
  intro: `A lab sells steel rods cut to length. A price list says what each length earns (CLRS Figure 14.1);
    cut the rod to <b>maximize revenue</b>. Trying every way to cut is exponential, but the same few
    subproblems keep repeating. Write the naive recursion, watch it blow up, then fix it two ways: remember answers
    (<b>memoization</b>) and fill a table smallest first (<b>tabulation</b>).`,
  levels: [
    {
      id: 'naive',
      title: 'The naive recursion',
      entry: 'cut_rod',
      brief: `<code>p[i]</code> is the price of a piece of length <code>i</code> (<code>p[0] = 0</code>). The best
        revenue for length <code>n</code> is the best over every <b>first cut</b> <code>i</code>: sell the piece
        <code>p[i]</code>, then solve the <b>remaining</b> rod the same way. Fill in the loop body, run the tests,
        then press <i>Step through</i> and count how often the same length is solved again. Open the scale table
        below the tests: the naive count doubles with every extra inch.`,
      hints: [
        'The remaining rod after cutting off a piece of length <code>i</code> has length <code>n - i</code>.',
        'Keep the best so far: <code>q = max(q, p[i] + cut_rod(p, n - i))</code>.',
      ],
      starter: `def cut_rod(p, n):
    """Best revenue for a rod of length n, given prices p[0..n] with p[0] = 0."""
    if n == 0:
        return 0
    q = float("-inf")
    for i in range(1, n + 1):
        pass  # TODO: try a first piece of length i: its price p[i] plus the best revenue of the remaining n - i
    return q
`,
      reflect: 'In one sentence: why does the recursion for n = 4 solve length 2 more than once? How many times would length 1 be solved?',
      demo: 'DEMO_ARGS = ([0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30], 4)',
      viz: { pointers: ['n', 'i', 'q'], lists: ['p'] },
      tests: rodTests('cut_rod', 14, 400000),
      scale: {
        entry: 'cut_rod',
        sizes: [4, 8, 12, 16],
        gen: `def gen(n):
    return ([0] + [int(2.5 * i) + (i % 3) for i in range(1, n + 1)], n)`,
        baseline: `def baseline(p, n):
    r = [0] * (n + 1)
    for j in range(1, n + 1):
        q = float("-inf")
        for i in range(1, j + 1):
            q = max(q, p[i] + r[j - i])
        r[j] = q
    return r[n]`,
        baselineLabel: 'bottom-up table',
        note: 'Each row counts executed lines. The naive recursion roughly doubles for every extra inch (about 2^n); the table grows about n^2.',
      },
    },
    {
      id: 'memo',
      title: 'Bug hunt: a memo that never remembers',
      entry: 'memoized_cut_rod',
      brief: `This version has a memo dictionary and looks up answers, and every answer it returns is correct, yet
        the performance test fails: it is still exponential. <b>Add one line</b> so a solved length is saved
        before it is returned. Step through the demo and watch <code>memo</code> stay empty.`,
      hints: [
        'A cache only helps if something is written into it.',
        'Before <code>return q</code> inside <code>solve</code>, store the result: <code>memo[m] = q</code>.',
      ],
      starter: `def memoized_cut_rod(p, n):
    memo = {}

    def solve(m):
        if m == 0:
            return 0
        if m in memo:
            return memo[m]
        q = float("-inf")
        for i in range(1, m + 1):
            q = max(q, p[i] + solve(m - i))
        return q                      # <- is something missing before this line?

    return solve(n)
`,
      reflect: 'In one sentence: how many distinct subproblems does the memoized version solve for length n, and how much work does each one do?',
      demo: 'DEMO_ARGS = ([0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30], 5)',
      viz: { pointers: ['m', 'i', 'q'], lists: ['p'] },
      tests: rodTests('memoized_cut_rod', 100, 100000),
    },
    {
      id: 'bottom-up',
      title: 'Fill the table smallest first',
      entry: 'bottom_up_cut_rod',
      brief: `No recursion this time: <code>r[j]</code> is the best revenue for length <code>j</code>, filled from
        <code>j = 1</code> upward, so everything a cell needs is already in the table. Fill in the loop body:
        try every first piece <code>i</code> and combine its price with the already-solved <code>r[j - i]</code>.
        Step through and watch the table fill left to right.`,
      hints: [
        'It is the same formula as the naive version, but the remaining rod is read from the table instead of recursed into.',
        '<code>q = max(q, p[i] + r[j - i])</code>',
      ],
      starter: `def bottom_up_cut_rod(p, n):
    """Best revenue for a rod of length n, filled from small lengths to large."""
    r = [0] * (n + 1)
    for j in range(1, n + 1):
        q = float("-inf")
        for i in range(1, j + 1):
            pass  # TODO: first piece of length i: p[i] plus the already-solved r[j - i]
        r[j] = q
    return r[n]
`,
      reflect: 'In one sentence: why is it safe to read r[j - i] without checking whether it has been computed?',
      demo: 'DEMO_ARGS = ([0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30], 7)',
      viz: { pointers: ['j', 'i', 'q'], lists: ['r'] },
      tests: rodTests('bottom_up_cut_rod', 300, 500000),
      scale: {
        entry: 'bottom_up_cut_rod',
        sizes: [50, 100, 200],
        gen: `def gen(n):
    return ([0] + [int(2.5 * i) + (i % 3) for i in range(1, n + 1)], n)`,
        note: 'Each row counts executed lines. Doubling n should multiply the count by about 4: the table does about n^2 / 2 cell updates.',
      },
    },
  ],
};
