window.LESSON = {
  id: 'selection-sort',
  title: 'Selection Sort: Pick the Minimum',
  topic: 'Elementary sorting',
  intro: `Scan the unsorted part for its smallest item, swap it to the front, and shrink the unsorted part by one.
    It makes at most n swaps (handy when writing is expensive) but always scans the whole remainder: the cost
    does not care whether the data is already sorted.`,
  levels: [
    {
      id: 'fill',
      title: 'Find the minimum, swap it forward',
      entry: 'selection_sort',
      brief: `Fill in two blanks: the <b>test</b> that updates the index of the smallest item so far, and the final
        <b>swap</b>. Step through and watch <code>m</code> follow the minimum.`,
      hints: ['Test: <code>a[j] &lt; a[m]</code>.', 'Swap: <code>a[i], a[m] = a[m], a[i]</code>.'],
      starter: `def selection_sort(a):
    """Return a sorted copy of a."""
    a = list(a)
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if False:   # TODO: replace False: is a[j] smaller than the smallest seen so far?
                m = j
        pass   # TODO: swap a[i] and a[m]
    return a
`,
      reflect: 'In one sentence: how many comparisons does selection sort make on an already-sorted list?',
      demo: 'DEMO_ARGS = ([64, 25, 12, 22, 11],)',
      viz: { pointers: ['i', 'j', 'm'], lists: ['a'] },
      tests: `
import random
def _c(ns, xs):
    got = need(ns, "selection_sort")(list(xs))
    if got != sorted(xs):
        raise AssertionError(f"selection_sort({short(xs)}) returned {short(got)}, expected {short(sorted(xs))}")
def t_small(ns): _c(ns, [64, 25, 12, 22, 11])
def t_empty(ns): _c(ns, [])
def t_one(ns): _c(ns, [3])
def t_dups(ns): _c(ns, [3, 1, 3, 1, 2])
def t_sorted(ns): _c(ns, list(range(20)))
def t_random(ns):
    rng = random.Random(5); _c(ns, [rng.randint(0, 99) for _ in range(100)])

TESTS = [
    ("a small list", "basic", t_small),
    ("empty list", "edge", t_empty),
    ("single element", "edge", t_one),
    ("duplicates", "edge", t_dups),
    ("already sorted", "edge", t_sorted),
    ("100 random values", "edge", t_random, 100000),
]
`,
      scale: {
        entry: 'selection_sort', sizes: [50, 100, 200, 400],
        gen: `def gen(n):
    return (list(range(n)),)`,
        note: 'Sorted input, n doubles each row: still about ×4 per row. Selection sort cannot take a shortcut.',
      },
    },
    {
      id: 'range',
      title: 'Bug hunt: the last item is never examined',
      entry: 'selection_sort',
      brief: `This looks right and sorts most lists, yet fails on some: the scan stops one item early. Find the
        <b>off-by-one</b> in a loop bound.`,
      hints: ['Python\'s <code>range(a, b)</code> excludes <code>b</code>.', 'The scan must reach index <code>n - 1</code>.'],
      starter: `def selection_sort(a):
    a = list(a)
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n - 1):        # <- something is off here
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
    return a
`,
      reflect: 'In one sentence: which inputs hide this bug, and why does a single passing test prove so little?',
      demo: 'DEMO_ARGS = ([3, 4, 2, 1],)',
      viz: { pointers: ['i', 'j', 'm'], lists: ['a'] },
      tests: `
import random
def _c(ns, xs):
    got = need(ns, "selection_sort")(list(xs))
    if got != sorted(xs):
        raise AssertionError(f"selection_sort({short(xs)}) returned {short(got)}, expected {short(sorted(xs))}")
def t_ok(ns): _c(ns, [1, 2, 3])
def t_last_min(ns): _c(ns, [3, 2, 1])
def t_four(ns): _c(ns, [3, 4, 2, 1])
def t_two(ns): _c(ns, [2, 1])
def t_random(ns):
    rng = random.Random(6); _c(ns, [rng.randint(0, 99) for _ in range(60)])

TESTS = [
    ("an already sorted list passes", "basic", t_ok),
    ("two items", "basic", t_two),
    ("the minimum sits at the end", "edge", t_last_min),
    ("four items", "edge", t_four),
    ("60 random values", "edge", t_random, 100000),
]
`,
    },
  ],
};
