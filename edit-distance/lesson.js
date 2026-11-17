const ED_COMMON = `
import random

PAIRS = [("KITTEN", "SITTING", 3), ("GATTACA", "GACTTGCA", None), ("", "ABC", 3), ("ABC", "", 3),
         ("ABC", "ABC", 0), ("FLAW", "LAWN", 2), ("INTENTION", "EXECUTION", 5), ("A", "B", 1), ("AAAA", "A", 3)]

def ref(a, b):
    m, n = len(a), len(b)
    d = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): d[i][0] = i
    for j in range(n + 1): d[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            d[i][j] = min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] != b[j-1]))
    return d[m][n]

def dna(seed, n):
    rng = random.Random(seed)
    return "".join(rng.choice("ACGT") for _ in range(n))

def _ed(ns, a, b, known=None):
    got = need(ns, "edit_distance")(a, b)
    want = ref(a, b)
    if known is not None and want != known:
        raise AssertionError("test data error")
    if got != want:
        raise AssertionError(f"edit_distance({a!r}, {b!r}) = {got}; the cheapest edit script costs {want}.")

def t_kitten(ns): _ed(ns, "KITTEN", "SITTING", 3)
def t_ward(ns): _ed(ns, "GATTACA", "GACTTGCA", 2)
def t_all(ns):
    for a, b, k in PAIRS: _ed(ns, a, b, k)
def t_empty(ns):
    _ed(ns, "", "ABC", 3); _ed(ns, "ABC", "", 3)
def t_same(ns): _ed(ns, "ABC", "ABC", 0)
def t_sym(ns):
    for a, b, k in PAIRS:
        if _ed_sym(ns, a, b): raise AssertionError(f"edit_distance({a!r}, {b!r}) differs from edit_distance({b!r}, {a!r}).")
def _ed_sym(ns, a, b):
    f = need(ns, "edit_distance")
    return f(a, b) != f(b, a)
def t_perf(ns): _ed(ns, dna(1, 150), dna(2, 150))
`;
const ED_BASIC = ED_COMMON + `
TESTS = [
    ("KITTEN to SITTING costs 3", "basic", t_kitten),
    ("ward isolates GATTACA to GACTTGCA costs 2", "basic", t_ward),
    ("nine mixed pairs", "basic", t_all),
    ("empty strand: only inserts or deletes", "edge", t_empty),
    ("identical strands cost 0", "edge", t_same),
    ("the distance is symmetric", "edge", t_sym),
    ("two 150-base isolates fill a 151 x 151 table", "perf", t_perf, 700000),
]
`;
const ED_MEMO = ED_COMMON + `
TESTS = [
    ("KITTEN to SITTING costs 3", "basic", t_kitten),
    ("ward isolates GATTACA to GACTTGCA costs 2", "basic", t_ward),
    ("nine mixed pairs", "basic", t_all),
    ("empty strand: only inserts or deletes", "edge", t_empty),
    ("two 150-base isolates in under a million lines", "perf", t_perf, 1500000),
]
`;
window.LESSON = {
  id: 'edit-distance',
  title: 'Edit Distance: How Far Apart Are Two Strands?',
  topic: 'Dynamic programming',
  intro: `January's isolate was <code>GATTACA</code>; today's is <code>GACTTGCA</code>. Relapse of the same strain, or a new
    one? <b>Edit distance</b> counts the fewest single-letter <b>inserts, deletes and substitutions</b> that turn one
    strand into the other. The number of edit scripts is astronomical; the number of <i>prefix pairs</i> is only
    <i>m</i>&times;<i>n</i>.`,
  levels: [
    {
      id: 'fill',
      title: 'Base cases and the recurrence',
      entry: 'edit_distance',
      brief: `<code>d[i][j]</code> is the edit distance between the first <code>i</code> letters of <code>a</code> and the
        first <code>j</code> letters of <code>b</code>. Fill in the <b>base column</b> (turning a prefix into the empty
        strand), the <b>base row</b>, and the <b>recurrence</b>: delete, insert, or substitute (free when the letters
        match). Step through <code>KITTEN</code> &rarr; <code>SITTING</code>.`,
      hints: [
        'Turning <code>a[:i]</code> into the empty string takes <code>i</code> deletions: <code>d[i][0] = i</code>.',
        'Turning the empty string into <code>b[:j]</code> takes <code>j</code> insertions: <code>d[0][j] = j</code>.',
        'Three ways to reach cell (i, j): <code>d[i-1][j] + 1</code> (delete), <code>d[i][j-1] + 1</code> (insert), <code>d[i-1][j-1] + sub</code> (substitute, where <code>sub</code> is 0 on a match).',
      ],
      starter: `def edit_distance(a, b):
    m, n = len(a), len(b)
    d = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        pass                                           # TODO: base column: d[i][0] is the cost of deleting i letters
    for j in range(n + 1):
        pass                                           # TODO: base row: d[0][j] is the cost of inserting j letters
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            sub = 1                                    # TODO: sub is 0 when a[i-1] == b[j-1], otherwise 1
            d[i][j] = 0                                # TODO: the cheapest of delete, insert, substitute
    return d[m][n]
`,
      reflect: 'In one sentence: why is a free match the same as a substitution that costs 0, and why does the table never need cells outside the three neighbours?',
      demo: 'DEMO_ARGS = ("KITTEN", "SITTING")',
      viz: { pointers: ['i', 'j'], lists: ['d'] },
      tests: ED_BASIC,
    },
    {
      id: 'free-match',
      title: 'Bug hunt: a match that is not free',
      entry: 'edit_distance',
      brief: `This table gives sensible answers for strands that differ everywhere and overcharges for everything else.
        <b>Change one line</b>. Step through <code>GATTACA</code> &rarr; <code>GACTTGCA</code>, then find the first cell
        where two equal letters were still charged.`,
      hints: [
        'When <code>a[i-1] == b[j-1]</code>, how many edits does the diagonal step cost?',
        'The diagonal term always adds 1. It should add 0 on a match.',
      ],
      starter: `def edit_distance(a, b):
    m, n = len(a), len(b)
    d = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        d[i][0] = i
    for j in range(n + 1):
        d[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            d[i][j] = min(d[i - 1][j] + 1,
                          d[i][j - 1] + 1,
                          d[i - 1][j - 1] + 1)         # <- what does a matching pair cost?
    return d[m][n]
`,
      reflect: 'In one sentence: what does the buggy version compute instead? (Hint: try two identical strands.)',
      demo: 'DEMO_ARGS = ("GATTACA", "GACTTGCA")',
      viz: { pointers: ['i', 'j'], lists: ['d'] },
      tests: ED_BASIC,
    },
    {
      id: 'memo',
      title: 'Naive recursion versus the table',
      entry: 'edit_distance',
      brief: `The recursion below is correct, and it recomputes the same prefix pairs over and over, so two 150-base
        isolates would take longer than the universe. Add <b>memoization</b>: look the pair up before computing, and
        remember the answer after. Then press <b>Measure</b> and compare with the plain recursion.`,
      hints: [
        'The key is the pair <code>(i, j)</code>. A dict from pairs to answers is enough.',
        'Check first: <code>if (i, j) in memo: return memo[(i, j)]</code>. Store last: <code>memo[(i, j)] = res</code>.',
      ],
      starter: `def edit_distance(a, b):
    memo = {}
    def solve(i, j):
        if False:                                      # TODO: replace False: is (i, j) already in memo?
            return memo[(i, j)]
        if i == 0:
            res = j
        elif j == 0:
            res = i
        else:
            sub = 0 if a[i - 1] == b[j - 1] else 1
            res = min(solve(i - 1, j) + 1, solve(i, j - 1) + 1, solve(i - 1, j - 1) + sub)
        pass                                           # TODO: remember res in memo[(i, j)]
        return res
    return solve(len(a), len(b))
`,
      reflect: 'In one sentence: how many distinct (i, j) pairs can solve() ever see, and what does that say about the total work?',
      demo: 'DEMO_ARGS = ("KITTEN", "SITTING")',
      viz: { pointers: ['i', 'j'], lists: [] },
      tests: ED_MEMO,
      scale: {
        entry: 'edit_distance',
        sizes: [4, 8, 12, 60],
        gen: `import random
def gen(n):
    rng = random.Random(5)
    return ("".join(rng.choice("ACGT") for _ in range(n)), "".join(rng.choice("ACGT") for _ in range(n)))`,
        baseline: `def baseline(a, b):
    def rec(i, j):
        if i == 0:
            return j
        if j == 0:
            return i
        sub = 0 if a[i - 1] == b[j - 1] else 1
        return min(rec(i - 1, j) + 1, rec(i, j - 1) + 1, rec(i - 1, j - 1) + sub)
    return rec(len(a), len(b))`,
        baselineLabel: 'plain recursion, no memo',
        note: 'The memoised version grows with n×n (about ×4 when n doubles). Plain recursion roughly triples with every extra letter: it is already out of budget by n = 60.',
      },
    },
  ],
};
