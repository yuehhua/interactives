window.LESSON = {
  id: 'merge-sort',
  title: 'Merge Sort: Divide, Then Merge',
  topic: 'Divide-and-conquer sorting',
  intro: `Two lab technicians each hand you a stack of samples already sorted by ID. Merging them into one sorted
    stack takes a single pass: always take the smaller top card. <b>Merge sort</b> splits the list in halves until
    every piece is trivially sorted, then merges back up. The whole algorithm is the <code>merge</code> step.`,
  levels: [
    {
      id: 'fill',
      title: 'Write the merge step',
      entry: 'merge_sort',
      brief: `The recursion is given. Fill in the two blanks of <code>merge</code>: <b>take the smaller front item</b>
        from either side. Step through the demo (CLRS Figure 2.4) and watch the recursion bottom out and the merges
        rebuild the sorted list.`,
      hints: [
        'Two pointers <code>i</code> and <code>j</code> walk the two sorted lists; the pointer increments are given.',
        'Take from the left: <code>out.append(left[i])</code>. Take from the right: <code>out.append(right[j])</code>.',
      ],
      starter: `def merge(left, right):
    """Merge two sorted lists into one sorted list."""
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            pass   # TODO: take left[i]
            i += 1
        else:
            pass   # TODO: take right[j]
            j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out

def merge_sort(a):
    """Return a sorted copy of a."""
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    return merge(merge_sort(a[:mid]), merge_sort(a[mid:]))
`,
      reflect: 'In one sentence: why is the total work n per level of recursion, with log n levels?',
      demo: 'DEMO_ARGS = ([5, 2, 4, 7, 1, 3, 2, 6],)',
      viz: { pointers: ['i', 'j', 'mid'], lists: ['left', 'right', 'out', 'a'] },
      tests: `
import random

def _check(ns, xs):
    f = need(ns, "merge_sort")
    want = sorted(xs)
    got = f(list(xs))
    if got != want:
        raise AssertionError(f"merge_sort({short(xs)}) returned {short(got)}, expected {short(want)}")

def t_merge(ns):
    m = need(ns, "merge")
    got = m([1, 4, 9], [2, 3, 10, 11])
    if got != [1, 2, 3, 4, 9, 10, 11]:
        raise AssertionError(f"merge([1, 4, 9], [2, 3, 10, 11]) returned {short(got)}.")
def t_clrs(ns): _check(ns, [5, 2, 4, 7, 1, 3, 2, 6])
def t_empty(ns): _check(ns, [])
def t_single(ns): _check(ns, [9])
def t_dups(ns): _check(ns, [3, 1, 3, 1, 3])
def t_sorted(ns): _check(ns, list(range(30)))
def t_reverse(ns): _check(ns, list(range(30, 0, -1)))
def t_random(ns):
    rng = random.Random(1)
    _check(ns, [rng.randint(0, 999) for _ in range(200)])
def t_perf(ns):
    rng = random.Random(2)
    _check(ns, [rng.randint(0, 99999) for _ in range(2000)])

TESTS = [
    ("merge two sorted lists", "basic", t_merge),
    ("CLRS Figure 2.4 example", "basic", t_clrs),
    ("empty list", "edge", t_empty),
    ("single element", "edge", t_single),
    ("duplicates", "edge", t_dups),
    ("already sorted", "edge", t_sorted),
    ("reverse sorted", "edge", t_reverse),
    ("200 random values match sorted()", "edge", t_random),
    ("2,000 values in O(n log n) lines", "perf", t_perf, 300000),
]
`,
      scale: {
        entry: 'merge_sort',
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
        note: 'n log n grows a little more than ×10 when n grows ×10 (about ×13); insertion sort grows about ×100.',
      },
    },
    {
      id: 'stable',
      title: 'Bug hunt: the unstable merge',
      entry: 'merge_sort_pairs',
      brief: `This sorts patient records by priority, yet two patients with the <b>same priority</b> swap places.
        <b>Change one character</b> to make the merge stable. Step through the demo and watch which side
        <code>(1, "b")</code> and <code>(1, "d")</code> come from.`,
      hints: [
        'On a tie, which side must be taken first to keep the original order?',
        'Compare <code>&lt;</code> with <code>&lt;=</code> in the merge condition.',
      ],
      starter: `def merge_pairs(left, right):
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i][0] < right[j][0]:        # <- something is off here
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out

def merge_sort_pairs(a):
    """Sort (priority, name) pairs by priority; ties keep their input order."""
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    return merge_pairs(merge_sort_pairs(a[:mid]), merge_sort_pairs(a[mid:]))
`,
      reflect: 'In one sentence: why does stability matter when you sort by one column after sorting by another?',
      demo: 'DEMO_ARGS = ([(1, "a"), (2, "b"), (1, "c"), (2, "d")],)',
      viz: { pointers: ['i', 'j', 'mid'], lists: ['left', 'right', 'out', 'a'] },
      tests: `
import random

def _stable(f, pairs):
    got = f(list(pairs))
    want = sorted(pairs, key=lambda p: p[0])
    if [p[0] for p in got] != [p[0] for p in want]:
        raise AssertionError("The priorities are not in sorted order.")
    if got != want:
        raise AssertionError(f"Ties are out of order: got {short(got, 70)}, expected {short(want, 70)}.")

def t_keys(ns):
    f = need(ns, "merge_sort_pairs")
    got = f([(3, "x"), (1, "y"), (2, "z")])
    if got != [(1, "y"), (2, "z"), (3, "x")]:
        raise AssertionError(f"Got {short(got)}.")
def t_ties(ns): _stable(need(ns, "merge_sort_pairs"), [(1, "a"), (2, "b"), (1, "c"), (2, "d"), (1, "e")])
def t_empty(ns): _stable(need(ns, "merge_sort_pairs"), [])
def t_random(ns):
    rng = random.Random(3)
    _stable(need(ns, "merge_sort_pairs"), [(rng.randint(0, 5), i) for i in range(200)])

TESTS = [
    ("distinct priorities sort correctly", "basic", t_keys),
    ("ties keep input order", "basic", t_ties),
    ("empty list", "edge", t_empty),
    ("200 records, 6 priorities, vs sorted()", "edge", t_random),
]
`,
    },
  ],
};
