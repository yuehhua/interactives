window.LESSON = {
  id: 'counting-sort',
  title: 'Counting Sort at Scale',
  week: 10 + 1,
  intro: `A sequencer emits a <b>Phred quality score</b> (an integer from 0 to 60) for every base it reads.
    Millions of them, all squeezed into 61 possible values. Comparison sorts need Ω(n log n) work,
    but when the keys are small integers you can skip comparing altogether: <b>count</b> them, <b>accumulate</b>
    the counts, and <b>place</b> each key straight into its final slot.`,
  levels: [
    {
      id: 'fill',
      title: 'Count, accumulate, place',
      entry: 'counting_sort',
      brief: `Fill in the three <code>...</code> blanks. Press <b>Step through</b> to watch the demo
        (CLRS Figure 8.2) run on <i>your</i> code, then <b>Run tests</b>.
        Once it passes, open <b>Scale it up</b> and see why this is linear.`,
      hints: [
        'Phase 1: <code>count[a] += 1</code>.',
        'Phase 2: <code>count[i] += count[i - 1]</code>. Afterwards <code>count[i]</code> = how many keys are ≤ i.',
        'Phase 3 (0-based port): decrement <code>count[a]</code> <i>first</i>, then write <code>out[count[a]] = a</code>.',
      ],
      starter: `def counting_sort(keys, k):
    """Sort a list of integers in 0..k without comparing them."""
    count = [0] * (k + 1)

    # Phase 1: count how many times each key appears
    for a in keys:
        ...   # TODO

    # Phase 2: prefix sums, so count[i] = number of keys <= i
    for i in range(1, k + 1):
        ...   # TODO

    # Phase 3: place keys into out, walking back to front
    out = [None] * len(keys)
    for j in range(len(keys) - 1, -1, -1):
        a = keys[j]
        ...   # TODO: decrement first, then write
    return out
`,
      reflect: 'In one sentence: why does the step count grow about ×10 when n grows ×10, even though k = 99 stays fixed?',
      demo: 'DEMO_ARGS = ([2, 5, 3, 0, 2, 3, 0, 3], 5)',
      viz: { pointers: ['a', 'i', 'j'], lists: ['keys', 'count', 'out'] },
      tests: `
import random

def _check(ns, keys, k):
    f = need(ns, "counting_sort")
    want = sorted(keys)
    got = f(list(keys), k)
    if got != want:
        raise AssertionError(f"counting_sort({short(keys)}, {k}) returned {short(got)}, expected {short(want)}")

def t_clrs(ns): _check(ns, [2, 5, 3, 0, 2, 3, 0, 3], 5)
def t_empty(ns): _check(ns, [], 5)
def t_single(ns): _check(ns, [4], 9)
def t_equal(ns): _check(ns, [3, 3, 3, 3], 3)
def t_ends(ns): _check(ns, [0, 60, 0, 60, 30], 60)
def t_sorted(ns): _check(ns, list(range(20)), 19)
def t_phred(ns):
    rng = random.Random(42)
    _check(ns, [rng.randint(0, 60) for _ in range(200)], 60)
def t_perf(ns):
    rng = random.Random(7)
    _check(ns, [rng.randint(0, 99) for _ in range(5000)], 99)

TESTS = [
    ("CLRS Figure 8.2 example", "basic", t_clrs),
    ("200 Phred scores match sorted()", "basic", t_phred),
    ("empty list", "edge", t_empty),
    ("single element", "edge", t_single),
    ("all keys equal", "edge", t_equal),
    ("keys hit both 0 and k", "edge", t_ends),
    ("already sorted", "edge", t_sorted),
    ("5,000 keys in about 5n executed lines", "perf", t_perf, 120000),
]
`,
      scale: {
        entry: 'counting_sort',
        sizes: [100, 1000, 10000],
        gen: `import random
def gen(n):
    rng = random.Random(1)
    return ([rng.randint(0, 99) for _ in range(n)], 99)`,
        baseline: `def baseline(keys, k):
    a = list(keys)
    for i in range(1, len(a)):
        x = a[i]
        j = i - 1
        while j >= 0 and a[j] > x:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = x
    return a`,
        baselineLabel: 'insertion sort',
        note: 'Each row counts executed lines. Counting sort should grow about ×10 when n grows ×10; insertion sort grows about ×100.',
      },
    },
    {
      id: 'stable',
      title: 'Bug hunt: the unstable sort',
      entry: 'counting_sort_pairs',
      brief: `This version sorts the keys correctly, so the first tests pass, yet two reads with the same
        quality score come out in the wrong order. <b>Change one line</b> to make the sort <b>stable</b>
        (ties keep their input order). Step through the demo and watch where the <code>c</code>
        payload lands compared with <code>a</code> and <code>e</code>.`,
      hints: [
        'Stability comes from the direction of the last loop.',
        'Which end of <code>pairs</code> should phase 3 start from, given that it decrements <code>count[key]</code> before writing?',
      ],
      starter: `def counting_sort_pairs(pairs, k):
    """Sort (key, payload) pairs by key. Ties must keep their input order."""
    count = [0] * (k + 1)
    for key, _ in pairs:
        count[key] += 1
    for i in range(1, k + 1):
        count[i] += count[i - 1]
    out = [None] * len(pairs)
    for key, payload in pairs:          # <- something is off with this loop
        count[key] -= 1
        out[count[key]] = (key, payload)
    return out
`,
      reflect: 'In one sentence: why does walking the input back to front make the sort stable?',
      demo: 'DEMO_ARGS = ([(3, "a"), (1, "b"), (3, "c"), (1, "d"), (3, "e")], 4)',
      viz: { pointers: ['i', 'key'], lists: ['pairs', 'count', 'out'] },
      tests: `
import random

def _stable(f, pairs, k):
    got = f(list(pairs), k)
    want = sorted(pairs, key=lambda p: p[0])   # Python's sort is stable
    if [p[0] for p in got] != [p[0] for p in want]:
        raise AssertionError("The keys are not in sorted order.")
    if got != want:
        for key in sorted({p[0] for p in pairs}):
            g = [p[1] for p in got if p[0] == key]
            w = [p[1] for p in want if p[0] == key]
            if g != w:
                raise AssertionError(f"Ties for key {key} came out as {short(g, 60)}, expected {short(w, 60)}.")

def t_keys(ns):
    f = need(ns, "counting_sort_pairs")
    got = f([(34, "r1"), (12, "r2"), (34, "r3")], 60)
    if [p[0] for p in got] != [12, 34, 34]:
        raise AssertionError(f"Keys came out as {[p[0] for p in got]}, expected [12, 34, 34].")
def t_reads(ns):
    f = need(ns, "counting_sort_pairs")
    reads = [(34, "read-1"), (12, "read-2"), (34, "read-3"), (12, "read-4"), (34, "read-5")]
    _stable(f, reads, 60)
def t_empty(ns): _stable(need(ns, "counting_sort_pairs"), [], 5)
def t_distinct(ns): _stable(need(ns, "counting_sort_pairs"), [(2, "x"), (0, "y"), (1, "z")], 2)
def t_random(ns):
    rng = random.Random(3)
    _stable(need(ns, "counting_sort_pairs"), [(rng.randint(0, 9), i) for i in range(200)], 9)

TESTS = [
    ("keys come out sorted", "basic", t_keys),
    ("ties keep input order (reads example)", "basic", t_reads),
    ("empty list", "edge", t_empty),
    ("all keys distinct", "edge", t_distinct),
    ("200 pairs, 10 distinct keys, vs sorted()", "edge", t_random),
]
`,
    },
  ],
};
