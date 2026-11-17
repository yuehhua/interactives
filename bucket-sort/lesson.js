window.LESSON = {
  id: 'bucket-sort',
  title: 'Bucket Sort: Filing into Drawers',
  topic: 'Linear-time sorting',
  intro: `Normalized lab values (CRP, gene expression, waiting-time fractions) are real numbers in
    <code>[0, 1)</code>. Counting sort cannot index them, but if they are spread <b>evenly</b>, you can file each
    value into one of <i>n</i> equal drawers, sort each tiny drawer, and read the drawers in order. Average time is
    O(n), but only because of an assumption about the data.`,
  levels: [
    {
      id: 'fill',
      title: 'File into drawers, then read them out',
      entry: 'bucket_sort',
      brief: `Insertion sort for a drawer is given. Fill in the two blanks: <b>which drawer</b> a value belongs in, and
        <b>concatenating</b> the sorted drawers. Step through the demo (CLRS Figure 8.4).`,
      hints: [
        'Value <code>x</code> goes to drawer <code>int(n * x)</code> (floor of n·x).',
        'Append the value to its drawer: <code>buckets[int(n * x)].append(x)</code>.',
        'Read the drawers in order: <code>out.extend(b)</code>.',
      ],
      starter: `def insertion_sort(b):
    """Sort one drawer in place (given)."""
    for j in range(1, len(b)):
        key = b[j]
        i = j - 1
        while i >= 0 and b[i] > key:
            b[i + 1] = b[i]
            i -= 1
        b[i + 1] = key

def bucket_sort(values):
    """Sort floats in [0, 1)."""
    n = len(values)
    buckets = [[] for _ in range(n)]
    for x in values:
        ...   # TODO: append x to drawer number floor(n * x)
    for b in buckets:
        insertion_sort(b)
    out = []
    for b in buckets:
        ...   # TODO: put the sorted drawers back in order
    return out
`,
      reflect: 'In one sentence: why is each drawer expected to hold only about one value when the data is uniform?',
      demo: 'DEMO_ARGS = ([0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68],)',
      viz: { pointers: ['i', 'j'], lists: ['values', 'buckets', 'out'] },
      tests: `
import random

def _check(ns, vals):
    f = need(ns, "bucket_sort")
    want = sorted(vals)
    got = f(list(vals))
    if got != want:
        raise AssertionError(f"bucket_sort({short(vals)}) returned {short(got)}, expected {short(want)}")

def t_clrs(ns): _check(ns, [.78, .17, .39, .26, .72, .94, .21, .12, .23, .68])
def t_empty(ns): _check(ns, [])
def t_single(ns): _check(ns, [0.5])
def t_dups(ns): _check(ns, [0.3, 0.3, 0.1, 0.3, 0.9])
def t_zero(ns): _check(ns, [0.0, 0.999, 0.0, 0.5])
def t_random(ns):
    rng = random.Random(4)
    _check(ns, [rng.random() for _ in range(200)])
def t_perf(ns):
    rng = random.Random(8)
    _check(ns, [rng.random() for _ in range(5000)])

TESTS = [
    ("CLRS Figure 8.4 example", "basic", t_clrs),
    ("200 uniform values match sorted()", "basic", t_random),
    ("empty list", "edge", t_empty),
    ("single value", "edge", t_single),
    ("duplicates", "edge", t_dups),
    ("values at both ends (0.0 and 0.999)", "edge", t_zero),
    ("5,000 uniform values in O(n) lines", "perf", t_perf, 250000),
]
`,
      scale: {
        entry: 'bucket_sort',
        sizes: [100, 1000, 10000],
        gen: `import random
def gen(n):
    rng = random.Random(1)
    return ([rng.random() for _ in range(n)],)`,
        baseline: `def baseline(values):
    a = list(values)
    for i in range(1, len(a)):
        x = a[i]
        j = i - 1
        while j >= 0 and a[j] > x:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = x
    return a`,
        baselineLabel: 'insertion sort',
        note: 'On uniform data bucket sort grows about ×10 when n grows ×10. Next level: what if the data is not uniform?',
      },
    },
    {
      id: 'skew',
      title: 'When the data is not uniform',
      entry: 'bucket_sort',
      brief: `Hospital arrivals <b>cluster</b>: all 2,000 values below fall inside <code>[0.300, 0.302)</code>, so the
        plain version stuffs everything into a few drawers and degrades to one big insertion sort. Run the tests, see
        the budget blow, then <b>rescale</b> each value by the data's own minimum and maximum before choosing a drawer.
        Mind the edge case where all values are equal.`,
      hints: [
        'Drawer = <code>int((x - lo) / (hi - lo) * n)</code>, with <code>lo, hi = min(values), max(values)</code>.',
        'The largest value gives exactly <code>n</code>: clamp with <code>min(..., n - 1)</code>.',
        'If <code>hi == lo</code> there is nothing to spread: every value can go in drawer 0.',
      ],
      starter: `def insertion_sort(b):
    for j in range(1, len(b)):
        key = b[j]
        i = j - 1
        while i >= 0 and b[i] > key:
            b[i + 1] = b[i]
            i -= 1
        b[i + 1] = key

def bucket_sort(values):
    """Sort floats, spread evenly or not."""
    n = len(values)
    if n == 0:
        return []
    lo, hi = min(values), max(values)
    buckets = [[] for _ in range(n)]
    for x in values:
        idx = int(n * x)          # TODO: spread by [lo, hi], not by [0, 1)
        buckets[idx].append(x)
    for b in buckets:
        insertion_sort(b)
    out = []
    for b in buckets:
        out.extend(b)
    return out
`,
      reflect: 'In one sentence: why is "the assumption is the algorithm" true for bucket sort?',
      demo: 'DEMO_ARGS = ([0.31, 0.33, 0.30, 0.34, 0.32, 0.345, 0.305, 0.335],)',
      viz: { pointers: ['i', 'idx'], lists: ['values', 'buckets', 'out'] },
      tests: `
import random

def _check(ns, vals):
    f = need(ns, "bucket_sort")
    want = sorted(vals)
    got = f(list(vals))
    if got != want:
        raise AssertionError(f"bucket_sort({short(vals)}) returned {short(got)}, expected {short(want)}")

def t_uniform(ns):
    rng = random.Random(2)
    _check(ns, [rng.random() for _ in range(200)])
def t_clrs(ns): _check(ns, [.78, .17, .39, .26, .72, .94, .21, .12, .23, .68])
def t_equal(ns): _check(ns, [0.4, 0.4, 0.4, 0.4])
def t_single(ns): _check(ns, [0.7])
def t_max(ns): _check(ns, [0.1, 0.9, 0.5, 0.9])
def t_cluster(ns):
    rng = random.Random(6)
    _check(ns, [0.300 + 0.002 * rng.random() for _ in range(2000)])

TESTS = [
    ("200 uniform values", "basic", t_uniform),
    ("CLRS example", "basic", t_clrs),
    ("all values equal (hi == lo)", "edge", t_equal),
    ("single value", "edge", t_single),
    ("largest value lands in the last drawer", "edge", t_max),
    ("2,000 clustered values in [0.300, 0.302)", "perf", t_cluster, 250000),
]
`,
      scale: {
        entry: 'bucket_sort',
        sizes: [100, 1000, 5000],
        gen: `import random
def gen(n):
    rng = random.Random(1)
    return ([0.300 + 0.002 * rng.random() for _ in range(n)],)`,
        note: 'Clustered data. If your count grows about ×10 per ×10 in n, the drawers are balanced again; ×100 means they are not.',
      },
    },
  ],
};
