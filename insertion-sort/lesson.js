window.LESSON = {
  id: 'insertion-sort',
  title: 'Insertion Sort: Sort Like Playing Cards',
  topic: 'Elementary sorting',
  intro: `Pick up cards one at a time and slide each into its place among the cards already in your hand. The left part
    of the list is always sorted; each new item is shifted left past larger ones. It is fast on nearly-sorted data and
    stable: equal items never pass each other.`,
  levels: [
    {
      id: 'fill',
      title: 'Shift larger items right',
      entry: 'insertion_sort',
      brief: `Fill in the one blank: <b>shift</b> <code>a[j]</code> one slot to the right to make room for
        <code>key</code>. Step through and watch the hole travel left.`,
      hints: ['<code>a[j + 1] = a[j]</code>.'],
      starter: `def insertion_sort(a):
    """Return a sorted copy of a."""
    a = list(a)
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            pass   # TODO: shift a[j] one slot to the right
            j -= 1
        a[j + 1] = key
    return a
`,
      reflect: 'In one sentence: why does insertion sort cost almost n steps on an already-sorted list?',
      demo: 'DEMO_ARGS = ([5, 2, 4, 6, 1, 3],)',
      viz: { pointers: ['i', 'j'], lists: ['a'] },
      tests: `
import random
def _c(ns, xs):
    got = need(ns, "insertion_sort")(list(xs))
    if got != sorted(xs):
        raise AssertionError(f"insertion_sort({short(xs)}) returned {short(got)}, expected {short(sorted(xs))}")
def t_clrs(ns): _c(ns, [5, 2, 4, 6, 1, 3])
def t_empty(ns): _c(ns, [])
def t_one(ns): _c(ns, [3])
def t_dups(ns): _c(ns, [3, 1, 3, 1, 2])
def t_rev(ns): _c(ns, list(range(30, 0, -1)))
def t_random(ns):
    rng = random.Random(3); _c(ns, [rng.randint(0, 99) for _ in range(100)])
def t_sorted(ns): _c(ns, list(range(2000)))

TESTS = [
    ("CLRS Figure 2.2 example", "basic", t_clrs),
    ("empty list", "edge", t_empty),
    ("single element", "edge", t_one),
    ("duplicates", "edge", t_dups),
    ("reverse sorted", "edge", t_rev),
    ("100 random values", "edge", t_random, 100000),
    ("2,000 sorted items in about n lines", "perf", t_sorted, 30000),
]
`,
      scale: {
        entry: 'insertion_sort', sizes: [100, 1000, 3000],
        gen: `import random
def gen(n):
    rng = random.Random(1)
    return ([rng.randint(0, 99999) for _ in range(n)],)`,
        note: 'Random input: about ×100 per ×10 (quadratic). Level 1 on sorted input would be ×10.',
      },
    },
    {
      id: 'stable',
      title: 'Bug hunt: ties in the wrong order',
      entry: 'insertion_sort_pairs',
      brief: `Sorting patient records by priority: two patients with the <b>same priority</b> must stay in arrival order.
        This version reverses them. Change <b>one character</b> in the loop condition.`,
      hints: ['When keys are equal, should the earlier item move past the later one?', 'Use <code>&gt;</code>, not <code>&gt;=</code>.'],
      starter: `def insertion_sort_pairs(a):
    """Sort (priority, name) pairs by priority; ties keep arrival order."""
    a = list(a)
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j][0] >= key[0]:     # <- something is off here
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a
`,
      reflect: 'In one sentence: why does stability let you sort by one column after sorting by another?',
      demo: 'DEMO_ARGS = ([(2, "a"), (1, "b"), (2, "c"), (1, "d")],)',
      viz: { pointers: ['i', 'j'], lists: ['a'] },
      tests: `
import random
def _s(ns, pairs):
    got = need(ns, "insertion_sort_pairs")(list(pairs))
    want = sorted(pairs, key=lambda p: p[0])
    if got != want:
        raise AssertionError(f"Got {short(got, 70)}, expected {short(want, 70)}.")
def t_keys(ns): _s(ns, [(3, "x"), (1, "y"), (2, "z")])
def t_ties(ns): _s(ns, [(2, "a"), (1, "b"), (2, "c"), (1, "d")])
def t_empty(ns): _s(ns, [])
def t_random(ns):
    rng = random.Random(4); _s(ns, [(rng.randint(0, 4), i) for i in range(100)])

TESTS = [
    ("distinct priorities", "basic", t_keys),
    ("ties keep arrival order", "basic", t_ties),
    ("empty list", "edge", t_empty),
    ("100 records, 5 priorities", "edge", t_random, 100000),
]
`,
    },
  ],
};
