window.LESSON = {
  id: 'bubble-sort',
  title: 'Bubble Sort: Swap Neighbours',
  topic: 'Elementary sorting',
  intro: `Walk down the list comparing neighbours; whenever a pair is out of order, swap it. After one pass the largest
    item has <b>bubbled</b> to the end. Repeat on the shorter list. It is the simplest sort to write and a classic
    example of how much the <i>best case</i> depends on a single flag.`,
  levels: [
    {
      id: 'fill',
      title: 'Swap out-of-order neighbours',
      entry: 'bubble_sort',
      brief: `Fill in the one blank: <b>swap</b> <code>a[j]</code> and <code>a[j + 1]</code>. Step through and watch the
        biggest value bubble to the right on each pass.`,
      hints: ['<code>a[j], a[j + 1] = a[j + 1], a[j]</code>.'],
      starter: `def bubble_sort(a):
    """Return a sorted copy of a."""
    a = list(a)
    n = len(a)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                pass   # TODO: swap the neighbours
    return a
`,
      reflect: 'In one sentence: after pass i, which i items are already in their final places?',
      demo: 'DEMO_ARGS = ([5, 1, 4, 2, 8],)',
      viz: { pointers: ['i', 'j'], lists: ['a'] },
      tests: `
import random
def _c(ns, xs):
    got = need(ns, "bubble_sort")(list(xs))
    if got != sorted(xs):
        raise AssertionError(f"bubble_sort({short(xs)}) returned {short(got)}, expected {short(sorted(xs))}")
def t_small(ns): _c(ns, [5, 1, 4, 2, 8])
def t_empty(ns): _c(ns, [])
def t_one(ns): _c(ns, [3])
def t_dups(ns): _c(ns, [2, 1, 2, 1, 2])
def t_rev(ns): _c(ns, list(range(20, 0, -1)))
def t_random(ns):
    rng = random.Random(1); _c(ns, [rng.randint(0, 99) for _ in range(100)])

TESTS = [
    ("a small list", "basic", t_small),
    ("empty list", "edge", t_empty),
    ("single element", "edge", t_one),
    ("duplicates", "edge", t_dups),
    ("reverse sorted", "edge", t_rev),
    ("100 random values", "edge", t_random, 200000),
]
`,
      scale: {
        entry: 'bubble_sort', sizes: [50, 100, 200, 400],
        gen: `import random
def gen(n):
    rng = random.Random(1)
    return ([rng.randint(0, 9999) for _ in range(n)],)`,
        note: 'n doubles each row: about ×4 per row is the signature of O(n²).',
      },
    },
    {
      id: 'early-exit',
      title: 'Make the best case linear',
      entry: 'bubble_sort',
      brief: `Hospital records often arrive <b>already sorted</b>. This version still does every pass. Add a flag: if a
        whole pass makes <b>no swap</b>, the list is sorted, so stop. The test feeds it 2,000 sorted items.`,
      hints: ['Set <code>swapped = False</code> before each pass and <code>True</code> on a swap.', 'After the inner loop, <code>if not swapped: break</code>.'],
      starter: `def bubble_sort(a):
    a = list(a)
    n = len(a)
    for i in range(n - 1):
        # TODO: remember whether this pass swaps anything
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
        # TODO: if there was no swap, stop early
    return a
`,
      reflect: 'In one sentence: what are the best-case and worst-case costs of bubble sort with the flag?',
      demo: 'DEMO_ARGS = ([1, 2, 3, 4, 5],)',
      viz: { pointers: ['i', 'j'], lists: ['a'] },
      tests: `
import random
def _c(ns, xs):
    got = need(ns, "bubble_sort")(list(xs))
    if got != sorted(xs):
        raise AssertionError(f"bubble_sort({short(xs)}) returned {short(got)}, expected {short(sorted(xs))}")
def t_rand(ns):
    rng = random.Random(2); _c(ns, [rng.randint(0, 99) for _ in range(60)])
def t_rev(ns): _c(ns, list(range(30, 0, -1)))
def t_empty(ns): _c(ns, [])
def t_sorted(ns): _c(ns, list(range(2000)))
def t_near(ns):
    xs = list(range(2000)); xs[0], xs[1] = xs[1], xs[0]; _c(ns, xs)

TESTS = [
    ("still sorts random data", "basic", t_rand, 200000),
    ("still sorts reverse data", "basic", t_rev, 200000),
    ("empty list", "edge", t_empty),
    ("2,000 already-sorted items in one pass", "perf", t_sorted, 30000),
    ("2,000 items with one swapped pair", "perf", t_near, 30000),
]
`,
      scale: {
        entry: 'bubble_sort', sizes: [100, 1000, 5000],
        gen: `def gen(n):
    return (list(range(n)),)`,
        note: 'Already-sorted input. With the early exit the count grows ×10 per ×10; without it, ×100.',
      },
    },
  ],
};
