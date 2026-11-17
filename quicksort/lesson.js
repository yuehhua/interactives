window.LESSON = {
  id: 'quicksort',
  title: 'Quicksort: Partition and Conquer',
  topic: 'Divide-and-conquer sorting',
  intro: `Pick a <b>pivot</b>, move everything smaller to its left and everything larger to its right, then do the same
    on each side. All the cleverness is in <code>partition</code>, which rearranges the list <i>in place</i> in one
    pass. Quicksort is usually the fastest sort in practice and has a famous way to go wrong.`,
  levels: [
    {
      id: 'fill',
      title: 'Write the partition step',
      entry: 'quicksort',
      brief: `The recursion is given. Fill in the two blanks of CLRS's <b>Lomuto partition</b>: grow the
        "small" region and swap, then drop the pivot between the two regions. Step through the demo
        (CLRS Figure 7.1) and watch <code>i</code> and <code>j</code> sweep.`,
      hints: [
        'Invariant: <code>a[lo..i]</code> are all ≤ pivot, <code>a[i+1..j-1]</code> are all &gt; pivot.',
        'When <code>a[j] &lt;= pivot</code>: <code>i += 1</code>, then swap <code>a[i]</code> and <code>a[j]</code>.',
        'After the loop, swap <code>a[i + 1]</code> with the pivot <code>a[hi]</code>.',
      ],
      starter: `def partition(a, lo, hi):
    """Partition a[lo..hi] around the pivot a[hi]. Return the pivot's final index."""
    pivot = a[hi]
    i = lo - 1
    for j in range(lo, hi):
        if a[j] <= pivot:
            ...   # TODO: grow the small region, then swap a[j] into it
    ...   # TODO: put the pivot between the two regions
    return i + 1

def quicksort(a, lo=0, hi=None):
    """Sort the list a in place and return it."""
    if hi is None:
        hi = len(a) - 1
    if lo < hi:
        p = partition(a, lo, hi)
        quicksort(a, lo, p - 1)
        quicksort(a, p + 1, hi)
    return a
`,
      reflect: 'In one sentence: why does partition cost n steps, and what makes the recursion depth about log n for a good pivot?',
      demo: 'DEMO_ARGS = ([2, 8, 7, 1, 3, 5, 6, 4],)',
      viz: { pointers: ['i', 'j', 'lo', 'hi', 'p'], lists: ['a'] },
      tests: `
import random

def _check(ns, xs):
    f = need(ns, "quicksort")
    want = sorted(xs)
    got = f(list(xs))
    if got != want:
        raise AssertionError(f"quicksort({short(xs)}) returned {short(got)}, expected {short(want)}")

def t_partition(ns):
    p = need(ns, "partition")
    a = [2, 8, 7, 1, 3, 5, 6, 4]
    idx = p(a, 0, 7)
    if idx != 3 or a[3] != 4 or any(x > 4 for x in a[:3]) or any(x <= 4 for x in a[4:]):
        raise AssertionError(f"partition on the CLRS array returned {idx} and left {a}; expected pivot 4 at index 3 with smaller items on the left.")
def t_clrs(ns): _check(ns, [2, 8, 7, 1, 3, 5, 6, 4])
def t_empty(ns): _check(ns, [])
def t_single(ns): _check(ns, [3])
def t_dups(ns): _check(ns, [4, 2, 4, 2, 4, 1])
def t_reverse(ns): _check(ns, list(range(40, 0, -1)))
def t_random(ns):
    rng = random.Random(1)
    _check(ns, [rng.randint(0, 999) for _ in range(200)])
def t_perf(ns):
    rng = random.Random(2)
    _check(ns, [rng.randint(0, 99999) for _ in range(2000)])

TESTS = [
    ("partition on the CLRS array", "basic", t_partition),
    ("CLRS Figure 7.1 example", "basic", t_clrs),
    ("empty list", "edge", t_empty),
    ("single element", "edge", t_single),
    ("duplicates", "edge", t_dups),
    ("reverse sorted (small)", "edge", t_reverse),
    ("200 random values match sorted()", "edge", t_random),
    ("2,000 random values in O(n log n) lines", "perf", t_perf, 400000),
]
`,
      scale: {
        entry: 'quicksort',
        sizes: [100, 1000, 10000],
        gen: `import random
def gen(n):
    rng = random.Random(1)
    return ([rng.randint(0, 99999) for _ in range(n)],)`,
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
        note: 'On random input quicksort grows about ×12 when n grows ×10. Next level: what if the input is already sorted?',
      },
    },
    {
      id: 'random-pivot',
      title: 'Worst case: already sorted input',
      entry: 'quicksort',
      brief: `Lab results often arrive <b>already sorted</b>. With the last item as pivot, every partition peels off one
        element: the recursion goes <i>n</i> deep and the work becomes quadratic. Run the tests to watch the
        budget blow, then <b>pick the pivot at random</b>. (Even then, a list of all-equal items stays a trap for this
        partition; that is what 3-way partitioning is for.)`,
      hints: [
        'Pick a random index <code>r = random.randint(lo, hi)</code>.',
        'Swap it into the pivot slot first: <code>a[r], a[hi] = a[hi], a[r]</code>, then partition as before.',
      ],
      starter: `import random

def partition(a, lo, hi):
    pivot = a[hi]
    i = lo - 1
    for j in range(lo, hi):
        if a[j] <= pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[hi] = a[hi], a[i + 1]
    return i + 1

def quicksort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo < hi:
        # TODO: choose a random pivot and move it to a[hi] before partitioning
        p = partition(a, lo, hi)
        quicksort(a, lo, p - 1)
        quicksort(a, p + 1, hi)
    return a
`,
      reflect: 'In one sentence: why does a random pivot make the bad case unlikely instead of impossible?',
      demo: 'DEMO_ARGS = ([1, 2, 3, 4, 5, 6, 7, 8],)',
      viz: { pointers: ['i', 'j', 'lo', 'hi', 'p'], lists: ['a'] },
      tests: `
import random

def _check(ns, xs):
    f = need(ns, "quicksort")
    want = sorted(xs)
    got = f(list(xs))
    if got != want:
        raise AssertionError(f"quicksort({short(xs)}) returned {short(got)}, expected {short(want)}")

def t_random(ns):
    rng = random.Random(5)
    _check(ns, [rng.randint(0, 999) for _ in range(200)])
def t_small_equal(ns): _check(ns, [7] * 20)
def t_empty(ns): _check(ns, [])
def t_sorted(ns): _check(ns, list(range(2000)))
def t_reverse(ns): _check(ns, list(range(2000, 0, -1)))

TESTS = [
    ("200 random values", "basic", t_random),
    ("empty list", "edge", t_empty),
    ("20 equal values (small)", "edge", t_small_equal),
    ("2,000 sorted values in O(n log n) lines", "perf", t_sorted, 400000),
    ("2,000 reverse-sorted values", "perf", t_reverse, 400000),
]
`,
      scale: {
        entry: 'quicksort',
        sizes: [50, 100, 200, 400],
        gen: `def gen(n):
    return (list(range(n)),)`,
        note: 'Sorted input, n doubles each row. About ×4 per row means quadratic; about ×2.2 means n log n.',
      },
    },
  ],
};
