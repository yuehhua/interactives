window.LESSON = {
  id: 'radix-sort',
  title: 'Radix Sort: Digit by Digit',
  topic: 'Linear-time sorting',
  intro: `Hospital chart IDs are fixed-width numbers. <b>Radix sort</b> sorts them one digit at a time, starting
    from the <i>least</i> significant digit, using a stable counting sort for every pass. It sounds backwards
    (the least important digit first?) and it works only because each pass <b>preserves the order</b> the
    previous pass created.`,
  levels: [
    {
      id: 'fill',
      title: 'Extract digits, run the passes',
      entry: 'radix_sort',
      brief: `The stable per-digit counting sort is given. Fill in the two blanks: the <b>digit</b> formula and the
        <b>loop over the digits</b>. Step through the demo (CLRS Figure 8.3) and watch the list get sorted by
        ones, then tens, then hundreds.`,
      hints: [
        'Digit number <code>i</code> of <code>x</code> (ones place is 0): <code>(x // 10 ** i) % 10</code>.',
        'One pass per digit, from the ones place up: <code>for i in range(d): a = counting_sort_by_digit(a, i)</code>.',
      ],
      starter: `def digit(x, i):
    """Digit number i of x (i = 0 is the ones place)."""
    return 0   # TODO: replace with the real formula

def counting_sort_by_digit(a, i):
    """Stable counting sort of a on digit i (given)."""
    count = [0] * 10
    for x in a:
        count[digit(x, i)] += 1
    for k in range(1, 10):
        count[k] += count[k - 1]
    out = [None] * len(a)
    for j in range(len(a) - 1, -1, -1):
        k = digit(a[j], i)
        count[k] -= 1
        out[count[k]] = a[j]
    return out

def radix_sort(nums, d):
    """Sort non-negative integers of at most d digits, least significant digit first."""
    a = list(nums)
    ...   # TODO: one stable pass per digit, from the ones place up
    return a
`,
      reflect: 'In one sentence: why does the total cost grow as d × (n + 10) instead of n log n?',
      demo: 'DEMO_ARGS = ([329, 457, 657, 839, 436, 720, 355], 3)',
      viz: { pointers: ['i', 'j', 'k'], lists: ['a', 'out', 'count'] },
      tests: `
import random

def _check(ns, nums, d):
    f = need(ns, "radix_sort")
    want = sorted(nums)
    got = f(list(nums), d)
    if got != want:
        raise AssertionError(f"radix_sort({short(nums)}, {d}) returned {short(got)}, expected {short(want)}")

def t_digit(ns):
    g = need(ns, "digit")
    for x, i, want in [(329, 0, 9), (329, 1, 2), (329, 2, 3), (5, 3, 0), (1000, 3, 1)]:
        if g(x, i) != want:
            raise AssertionError(f"digit({x}, {i}) returned {g(x, i)}, expected {want}.")
def t_clrs(ns): _check(ns, [329, 457, 657, 839, 436, 720, 355], 3)
def t_empty(ns): _check(ns, [], 3)
def t_single(ns): _check(ns, [42], 2)
def t_dups(ns): _check(ns, [55, 12, 55, 12, 7], 2)
def t_widths(ns): _check(ns, [5, 120, 33, 1000, 0, 99], 4)
def t_random(ns):
    rng = random.Random(11)
    _check(ns, [rng.randint(0, 9999) for _ in range(200)], 4)
def t_perf(ns):
    rng = random.Random(5)
    _check(ns, [rng.randint(0, 999999) for _ in range(2000)], 6)

TESTS = [
    ("digit(x, i) formula", "basic", t_digit),
    ("CLRS Figure 8.3 example", "basic", t_clrs),
    ("empty list", "edge", t_empty),
    ("single number", "edge", t_single),
    ("duplicates", "edge", t_dups),
    ("numbers with different widths", "edge", t_widths),
    ("200 four-digit IDs match sorted()", "edge", t_random),
    ("2,000 six-digit IDs in about d(n + 10) lines", "perf", t_perf, 200000),
]
`,
      scale: {
        entry: 'radix_sort',
        sizes: [100, 1000, 10000],
        gen: `import random
def gen(n):
    rng = random.Random(1)
    return ([rng.randint(0, 999999) for _ in range(n)], 6)`,
        baseline: `def baseline(nums, d):
    a = list(nums)
    for i in range(1, len(a)):
        x = a[i]
        j = i - 1
        while j >= 0 and a[j] > x:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = x
    return a`,
        baselineLabel: 'insertion sort',
        note: 'Six passes over n numbers: radix sort grows about ×10 when n grows ×10; insertion sort grows about ×100.',
      },
    },
    {
      id: 'stable',
      title: 'Bug hunt: one unstable pass',
      entry: 'radix_sort',
      brief: `Everything looks right, yet the result is not sorted. <b>Change one line</b>. Step through the demo and
        compare what pass 2 does to <code>457</code> and <code>657</code> (both have a 5 in the tens place).`,
      hints: [
        'Ties on the current digit must keep the order the previous pass produced.',
        'Look at the direction of the last loop in <code>counting_sort_by_digit</code>.',
      ],
      starter: `def digit(x, i):
    return (x // 10 ** i) % 10

def counting_sort_by_digit(a, i):
    count = [0] * 10
    for x in a:
        count[digit(x, i)] += 1
    for k in range(1, 10):
        count[k] += count[k - 1]
    out = [None] * len(a)
    for j in range(len(a)):             # <- something is off with this loop
        k = digit(a[j], i)
        count[k] -= 1
        out[count[k]] = a[j]
    return out

def radix_sort(nums, d):
    a = list(nums)
    for i in range(d):
        a = counting_sort_by_digit(a, i)
    return a
`,
      reflect: 'In one sentence: why does an unstable pass destroy the work of all earlier passes?',
      demo: 'DEMO_ARGS = ([329, 457, 657, 839, 436, 720, 355], 3)',
      viz: { pointers: ['i', 'j', 'k'], lists: ['a', 'out', 'count'] },
      tests: `
import random

def _check(ns, nums, d):
    f = need(ns, "radix_sort")
    want = sorted(nums)
    got = f(list(nums), d)
    if got != want:
        raise AssertionError(f"radix_sort({short(nums)}, {d}) returned {short(got)}, expected {short(want)}")

def t_clrs(ns): _check(ns, [329, 457, 657, 839, 436, 720, 355], 3)
def t_one_digit(ns): _check(ns, [4, 1, 3, 9, 0, 2], 1)
def t_empty(ns): _check(ns, [], 3)
def t_random(ns):
    rng = random.Random(21)
    _check(ns, [rng.randint(0, 999) for _ in range(200)], 3)

TESTS = [
    ("CLRS Figure 8.3 example", "basic", t_clrs),
    ("single-digit numbers (one pass)", "basic", t_one_digit),
    ("empty list", "edge", t_empty),
    ("200 three-digit numbers match sorted()", "edge", t_random),
]
`,
    },
  ],
};
