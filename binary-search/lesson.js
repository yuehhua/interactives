window.LESSON = {
  id: 'binary-search',
  title: 'Binary Search: Guess the Number',
  topic: 'Searching',
  intro: `Think of a number from 1 to 100. A clever guesser asks "is it 50?" and halves the possibilities with every
    answer: seven questions are enough. <b>Binary search</b> does exactly that on a <i>sorted</i> list: look at the
    middle, throw away the half that cannot contain the target. It is famously easy to get almost right.`,
  levels: [
    {
      id: 'fill',
      title: 'Halve the range',
      entry: 'binary_search',
      brief: `Fill in the three blanks: the <b>middle index</b>, and which half to <b>discard</b> in each case. Step through
        the demo and watch <code>lo</code>, <code>mid</code>, <code>hi</code> close in. <i>Unfinished blanks can loop forever:
        the runner will stop them.</i>`,
      hints: ['Middle: <code>(lo + hi) // 2</code>.', 'Too small: <code>lo = mid + 1</code>. Too big: <code>hi = mid - 1</code>.'],
      starter: `def binary_search(a, target):
    """Return the index of target in the sorted list a, or -1."""
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo   # TODO: the middle index of a[lo..hi]
        if a[mid] == target:
            return mid
        elif a[mid] < target:
            pass   # TODO: target is to the right: discard the left half
        else:
            pass   # TODO: target is to the left: discard the right half
    return -1
`,
      reflect: 'In one sentence: why does the number of steps grow by only 1 each time the list doubles?',
      demo: 'DEMO_ARGS = ([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23)',
      viz: { pointers: ['lo', 'mid', 'hi'], lists: ['a'] },
      tests: `
A = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
def _c(ns, a, t, want):
    got = need(ns, "binary_search")(list(a), t)
    if got != want:
        raise AssertionError(f"binary_search({short(a)}, {t}) returned {got}, expected {want}.")
def t_mid(ns): _c(ns, A, 23, 5)
def t_first(ns): _c(ns, A, 2, 0)
def t_last(ns): _c(ns, A, 91, 9)
def t_miss_low(ns): _c(ns, A, 1, -1)
def t_miss_high(ns): _c(ns, A, 100, -1)
def t_miss_gap(ns): _c(ns, A, 24, -1)
def t_empty(ns): _c(ns, [], 5, -1)
def t_one(ns): _c(ns, [5], 5, 0)
def t_perf(ns): _c(ns, list(range(0, 200000, 2)), 77776, 38888)

TESTS = [
    ("finds an item in the middle", "basic", t_mid),
    ("finds the first item", "basic", t_first),
    ("finds the last item", "edge", t_last),
    ("target below the range", "edge", t_miss_low),
    ("target above the range", "edge", t_miss_high),
    ("target between two items", "edge", t_miss_gap),
    ("empty list", "edge", t_empty),
    ("single element", "edge", t_one),
    ("100,000 items in about 17 rounds", "perf", t_perf, 300),
]
`,
      scale: {
        entry: 'binary_search', sizes: [100, 1000, 10000, 100000],
        gen: `def gen(n):
    return (list(range(n)), -1)`,
        baseline: `def baseline(a, target):
    for i in range(len(a)):
        if a[i] == target:
            return i
    return -1`,
        baselineLabel: 'linear scan',
        note: 'Searching for a missing value. Binary search adds a constant number of lines per ×10; the scan grows ×10.',
      },
    },
    {
      id: 'stuck',
      title: 'Bug hunt: the search that never ends',
      entry: 'binary_search',
      brief: `This version finds present items, but searching for a value larger than everything makes it <b>spin
        forever</b>. The step budget stops it. Find the one line that fails to shrink the range.`,
      hints: ['If a[mid] is not the target, can mid itself still be in the range?', 'Discard mid too: <code>lo = mid + 1</code>.'],
      starter: `def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        elif a[mid] < target:
            lo = mid               # <- something is off here
        else:
            hi = mid - 1
    return -1
`,
      reflect: 'In one sentence: why must every iteration strictly shrink the range?',
      demo: 'DEMO_ARGS = ([2, 5, 8, 12], 99)',
      viz: { pointers: ['lo', 'mid', 'hi'], lists: ['a'] },
      tests: `
A = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
def _c(ns, a, t, want):
    got = need(ns, "binary_search")(list(a), t)
    if got != want:
        raise AssertionError(f"binary_search({short(a)}, {t}) returned {got}, expected {want}.")
def t_found(ns): _c(ns, A, 56, 7)
def t_all(ns):
    for i, x in enumerate(A):
        _c(ns, A, x, i)
def t_high(ns): _c(ns, A, 100, -1)
def t_gap(ns): _c(ns, A, 24, -1)
def t_low(ns): _c(ns, A, 1, -1)

TESTS = [
    ("finds an item", "basic", t_found, 2000),
    ("finds every item", "basic", t_all, 5000),
    ("target above the range", "edge", t_high, 2000),
    ("target between items", "edge", t_gap, 2000),
    ("target below the range", "edge", t_low, 2000),
]
`,
    },
    {
      id: 'first',
      title: 'First match among duplicates',
      entry: 'first_occurrence',
      brief: `A lab table lists the same patient ID many times. Find the <b>first</b> position of a target, or -1.
        When you find a match, do not stop: <b>remember it and keep searching the left half</b>.`,
      hints: ['On a match: <code>ans = mid</code>, then <code>hi = mid - 1</code>.'],
      starter: `def first_occurrence(a, target):
    """Index of the first element equal to target in the sorted list a, or -1."""
    lo, hi, ans = 0, len(a) - 1, -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] < target:
            lo = mid + 1
        elif a[mid] > target:
            hi = mid - 1
        else:
            pass   # TODO: remember mid as an answer, then keep looking to its left
    return ans
`,
      reflect: 'In one sentence: why is this still O(log n) even when the whole list is the same value?',
      demo: 'DEMO_ARGS = ([1, 2, 2, 2, 2, 3, 5], 2)',
      viz: { pointers: ['lo', 'mid', 'hi', 'ans'], lists: ['a'] },
      tests: `
def _c(ns, a, t):
    want = a.index(t) if t in a else -1
    got = need(ns, "first_occurrence")(list(a), t)
    if got != want:
        raise AssertionError(f"first_occurrence({short(a)}, {t}) returned {got}, expected {want}.")
def t_dups(ns): _c(ns, [1, 2, 2, 2, 2, 3, 5], 2)
def t_distinct(ns): _c(ns, [1, 3, 5, 7], 5)
def t_missing(ns): _c(ns, [1, 3, 5, 7], 4)
def t_allsame(ns): _c(ns, [4] * 50, 4)
def t_edge(ns): _c(ns, [7, 7, 8], 7)
def t_empty(ns): _c(ns, [], 1)
def t_perf(ns): _c(ns, [1] * 100000 + [2] * 100000, 2)

TESTS = [
    ("first of several equal values", "basic", t_dups),
    ("distinct values", "basic", t_distinct),
    ("missing value", "edge", t_missing),
    ("all values equal", "edge", t_allsame),
    ("match at the very start", "edge", t_edge),
    ("empty list", "edge", t_empty),
    ("200,000 items still takes about 18 rounds", "perf", t_perf, 400),
]
`,
    },
  ],
};
