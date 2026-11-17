const LCS_COMMON = `
import random

PAIRS = [("ABCBDAB", "BDCABA"), ("GATTACA", "GACTTGCA"), ("AGGTAB", "GXTXAYB"), ("ACGT", "TGCA"),
         ("", "ABC"), ("ABC", ""), ("AAAA", "AA"), ("ABC", "XYZ"), ("ABCDEF", "ABCDEF")]

def ref_len(x, y):
    m, n = len(x), len(y)
    c = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            c[i][j] = c[i-1][j-1] + 1 if x[i-1] == y[j-1] else max(c[i-1][j], c[i][j-1])
    return c[m][n]

def is_subseq(s, t):
    it = iter(t)
    return all(ch in it for ch in s)

def dna(rng, n):
    return "".join(rng.choice("ACGT") for _ in range(n))

LONG = [(dna(random.Random(1), 150), dna(random.Random(2), 150))]
`;
const LCS_LEN_TESTS = LCS_COMMON + `
def _len(ns, x, y):
    got = need(ns, "lcs_length")(x, y)
    want = ref_len(x, y)
    if got != want:
        raise AssertionError(f"lcs_length({x!r}, {y!r}) = {got}; the table's corner should be {want}.")

def t_clrs(ns): _len(ns, "ABCBDAB", "BDCABA")
def t_dna(ns): _len(ns, "GATTACA", "GACTTGCA")
def t_all(ns):
    for x, y in PAIRS: _len(ns, x, y)
def t_empty(ns):
    _len(ns, "", "ABC"); _len(ns, "ABC", "")
def t_none(ns): _len(ns, "ABC", "XYZ")
def t_same(ns): _len(ns, "ABCDEF", "ABCDEF")
def t_perf(ns): _len(ns, *LONG[0])

TESTS = [
    ("CLRS Figure 14.8: ABCBDAB vs BDCABA = 4", "basic", t_clrs),
    ("ward strands GATTACA vs GACTTGCA", "basic", t_dna),
    ("nine mixed pairs", "basic", t_all),
    ("an empty strand has nothing in common", "edge", t_empty),
    ("no shared letter gives 0", "edge", t_none),
    ("identical strands give their length", "edge", t_same),
    ("two 150-base strands fill a 151 x 151 table", "perf", t_perf, 600000),
]
`;
const LCS_STR_TESTS = LCS_COMMON + `
def _str(ns, x, y):
    got = need(ns, "lcs")(x, y)
    if not isinstance(got, str):
        raise AssertionError(f"lcs should return a string, got {type(got).__name__}.")
    if not is_subseq(got, x) or not is_subseq(got, y):
        raise AssertionError(f"{got!r} is not a subsequence of both {x!r} and {y!r}.")
    want = ref_len(x, y)
    if len(got) != want:
        raise AssertionError(f"lcs({x!r}, {y!r}) = {got!r} has length {len(got)}; a longest one has {want}.")

def t_clrs(ns): _str(ns, "ABCBDAB", "BDCABA")
def t_dna(ns): _str(ns, "GATTACA", "GACTTGCA")
def t_all(ns):
    for x, y in PAIRS: _str(ns, x, y)
def t_empty(ns):
    _str(ns, "", "ABC"); _str(ns, "ABC", "")
def t_none(ns): _str(ns, "ABC", "XYZ")
def t_same(ns): _str(ns, "ABCDEF", "ABCDEF")
def t_perf(ns): _str(ns, *LONG[0])

TESTS = [
    ("CLRS Figure 14.8: any LCS of length 4", "basic", t_clrs),
    ("ward strands GATTACA vs GACTTGCA", "basic", t_dna),
    ("nine mixed pairs", "basic", t_all),
    ("an empty strand: empty answer", "edge", t_empty),
    ("no shared letter: empty answer", "edge", t_none),
    ("identical strands: the strand itself", "edge", t_same),
    ("two 150-base strands", "perf", t_perf, 800000),
]
`;
const LCS_SCALE = {
  entry: 'lcs_length',
  sizes: [4, 8, 12],
  gen: `import random
def gen(n):
    rng = random.Random(3)
    return ("".join(rng.choice("ACGT") for _ in range(n)), "".join(rng.choice("ACGT") for _ in range(n)))`,
  baseline: `def baseline(x, y):
    def rec(i, j):
        if i == 0 or j == 0:
            return 0
        if x[i - 1] == y[j - 1]:
            return rec(i - 1, j - 1) + 1
        return max(rec(i - 1, j), rec(i, j - 1))
    return rec(len(x), len(y))`,
  baselineLabel: 'plain recursion, no table',
  note: 'The table does about n×n work, so doubling n multiplies lines by 4. The table-free recursion re-solves the same prefixes again and again: its line count explodes (or hits the budget) long before n = 12.',
};
window.LESSON = {
  id: 'lcs',
  title: 'Longest Common Subsequence: Fill the Table',
  topic: 'Dynamic programming',
  intro: `Two patients carry strands of DNA. How much do they <b>share</b>, in order, allowing gaps? A
    <b>common subsequence</b> keeps letters in order but may skip some. Trying every subsequence of one strand is
    exponential. Instead we ask one small question for every pair of prefixes, write each answer in a table, and read
    the final answer from the corner.`,
  levels: [
    {
      id: 'fill',
      title: 'Fill the table',
      entry: 'lcs_length',
      brief: `<code>c[i][j]</code> is the LCS length of the first <code>i</code> letters of <code>x</code> and the first
        <code>j</code> letters of <code>y</code>. Row 0 and column 0 are already 0. Fill in the two rules:
        what to do when the two letters <b>match</b>, and what to do when they <b>do not</b>. Step through CLRS's
        example and watch the table fill row by row.`,
      hints: [
        'Letters at positions i and j are <code>x[i - 1]</code> and <code>y[j - 1]</code>: the table is one longer than the strings.',
        'A match extends the best answer of both shorter prefixes: <code>c[i - 1][j - 1] + 1</code>.',
        'A mismatch cannot use both letters. Keep the better of dropping one letter of x (above) or one of y (left).',
      ],
      starter: `def lcs_length(x, y):
    m, n = len(x), len(y)
    c = [[0] * (n + 1) for _ in range(m + 1)]        # row 0 and column 0 stay 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if False:                                  # TODO: replace False: do x[i-1] and y[j-1] match?
                pass                                   # TODO: match: extend the diagonal answer by one
            else:
                pass                                   # TODO: mismatch: keep the better of the cell above and the cell to the left
    return c[m][n]
`,
      reflect: 'In one sentence: why does a match always take the diagonal and never need to look left or up?',
      demo: 'DEMO_ARGS = ("ABCBDAB", "BDCABA")',
      viz: { pointers: ['i', 'j'], lists: ['c'] },
      tests: LCS_LEN_TESTS,
      scale: LCS_SCALE,
    },
    {
      id: 'trace',
      title: 'Walk back to print the strand',
      entry: 'lcs',
      brief: `The table is built for you. The length is in the corner, but which letters? Start at the corner and walk
        back: on a <b>match</b>, the letter belongs to the answer and you step diagonally; otherwise step toward the
        <b>larger neighbour</b>. Letters come out last-to-first. Any longest answer is accepted.`,
      hints: [
        'Match: <code>out.append(x[i - 1])</code>, then <code>i -= 1</code> and <code>j -= 1</code>.',
        'No match: if the cell above is at least the cell to the left, move up (<code>i -= 1</code>), otherwise left (<code>j -= 1</code>).',
        'The walk stops when either index reaches 0. The letters were collected backwards, so reverse them at the end.',
      ],
      starter: `def lcs(x, y):
    m, n = len(x), len(y)
    c = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if x[i - 1] == y[j - 1]:
                c[i][j] = c[i - 1][j - 1] + 1
            else:
                c[i][j] = max(c[i - 1][j], c[i][j - 1])
    i, j = m, n
    out = []
    for _ in range(m + n):                             # at most m + n steps
        if i == 0 or j == 0:
            break
        if False:                                      # TODO: replace False: do x[i-1] and y[j-1] match?
            pass                                       # TODO: keep the letter, step diagonally
        elif False:                                    # TODO: replace False: is the cell above at least the cell to the left?
            pass                                       # TODO: step up
        else:
            pass                                       # TODO: step left
    return "".join(reversed(out))
`,
      reflect: 'In one sentence: why does the walk-back choose a neighbour whose value equals the current cell, and why can there be several correct answers?',
      demo: 'DEMO_ARGS = ("ABCBDAB", "BDCABA")',
      viz: { pointers: ['i', 'j'], lists: ['c', 'out'] },
      tests: LCS_STR_TESTS,
    },
    {
      id: 'wrong-mismatch',
      title: 'Bug hunt: a mismatch that forgets a neighbour',
      entry: 'lcs_length',
      brief: `This table passes the tiny examples, and then quietly undercounts. The <b>match</b> rule is right; the
        <b>mismatch</b> rule is not. Change <b>one line</b>. Step through CLRS's example and find the first cell whose
        value is smaller than it should be.`,
      hints: [
        'On a mismatch the answer is either "drop the last letter of x" or "drop the last letter of y".',
        'This code only considers one of the two. Which neighbour is missing from the <code>max</code>?',
      ],
      starter: `def lcs_length(x, y):
    m, n = len(x), len(y)
    c = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if x[i - 1] == y[j - 1]:
                c[i][j] = c[i - 1][j - 1] + 1
            else:
                c[i][j] = c[i - 1][j]                   # <- is this the whole mismatch rule?
    return c[m][n]
`,
      reflect: 'In one sentence: give two short strands where ignoring the left neighbour gives the wrong length.',
      demo: 'DEMO_ARGS = ("ABCBDAB", "BDCABA")',
      viz: { pointers: ['i', 'j'], lists: ['c'] },
      tests: LCS_LEN_TESTS,
    },
  ],
};
