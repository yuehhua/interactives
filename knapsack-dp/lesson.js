const ksTests = (entry, kind) => `
import random

PALLET = [(80, 400), (120, 480), (40, 240), (100, 300)]   # (kg, lives-points): ventilator, IV crates, antibiotics, generator

def optimum(items, W):
    best = [0] * (W + 1)
    for w, v in items:
        for c in range(W, w - 1, -1):
            best[c] = max(best[c], best[c - w] + v)
    return best[W]

def _value(items, picked, W):
    if len(set(picked)) != len(picked):
        raise AssertionError("An item was packed twice; it is 0-1, so each item flies at most once.")
    for i in picked:
        if not (isinstance(i, int) and 0 <= i < len(items)):
            raise AssertionError(f"{i!r} is not an item index (0 to {len(items) - 1}).")
    kg = sum(items[i][0] for i in picked)
    if kg > W:
        raise AssertionError(f"The pack weighs {kg} kg but the limit is {W} kg.")
    return sum(items[i][1] for i in picked)

def _check(ns, items, W):
    f = need(ns, "${entry}")
    got = f(list(items), W)
    want = optimum(items, W)
    if "${kind}" == "value":
        if got != want:
            raise AssertionError(f"W = {W}: returned {short(got)}; the best value is {want}.")
    else:
        val = _value(items, list(got), W)
        if val != want:
            raise AssertionError(f"W = {W}: your pack is worth {val}; the best is {want}.")

def t_pallet(ns): _check(ns, PALLET, 200)
def t_small(ns): _check(ns, [(4, 400), (6, 480), (2, 240), (5, 300)], 10)
def t_none(ns): _check(ns, [], 50)
def t_zero(ns): _check(ns, PALLET, 0)
def t_heavy(ns): _check(ns, [(30, 5), (40, 9)], 20)
def t_exact(ns): _check(ns, [(5, 10), (5, 10), (5, 10)], 15)
def t_greedy_ok(ns): _check(ns, [(10, 60), (20, 100), (30, 120)], 30)
def t_random(ns):
    rng = random.Random(3)
    for _ in range(8):
        items = [(rng.randint(1, 15), rng.randint(1, 60)) for _ in range(rng.randint(3, 9))]
        _check(ns, items, rng.randint(5, 40))
def t_perf(ns):
    rng = random.Random(17)
    _check(ns, [(rng.randint(5, 40), rng.randint(1, 99)) for _ in range(40)], 400)

TESTS = [
    ("disaster-relief pallet: 200 kg limit, best is 880", "basic", t_pallet),
    ("small scaled pallet (units of 20 kg)", "basic", t_small),
    ("8 random pallets match the optimum", "basic", t_random),
    ("no items", "edge", t_none),
    ("capacity 0", "edge", t_zero),
    ("every item is too heavy", "edge", t_heavy),
    ("three identical items fill the limit exactly", "edge", t_exact),
    ("a case where greedy by ratio happens to work", "edge", t_greedy_ok),
    ("40 items, limit 400 in about n x W cell updates", "perf", t_perf, 400000),
]
`;
window.LESSON = {
  id: 'knapsack-dp',
  title: '0-1 Knapsack: The Relief Pallet',
  topic: 'Dynamic programming',
  intro: `A disaster-relief pallet carries at most <b>200 kg</b>. Each crate flies whole or stays behind:
    a ventilator (80 kg, 400 points), IV crates (120 kg, 480), antibiotics (40 kg, 240) and a generator
    (100 kg, 300), where points are lives served. Grabbing the best <i>points per kg</i> looks smart, and it is
    wrong. A table with one row per item and one column per capacity compares "take it" with "leave it" for
    <b>every</b> subproblem.`,
  levels: [
    {
      id: 'cell',
      title: 'Fill one cell: take it or leave it',
      entry: 'knapsack',
      brief: `<code>dp[i][c]</code> is the best value using only the <b>first i items</b> with capacity
        <code>c</code>. The "leave item <code>i</code>" case is already written. Fill in the two blanks: does the item
        <b>fit</b> in capacity <code>c</code>, and if so is <b>taking it</b> (its value plus the best for the
        remaining capacity, one row up) better than leaving it? Step through the scaled pallet (units of 20 kg) and
        watch the table fill row by row.`,
      hints: [
        'It fits when its weight is at most the capacity: <code>w &lt;= c</code>.',
        'Taking it leaves capacity <code>c - w</code> for the earlier items: <code>dp[i - 1][c - w] + v</code>.',
        '<code>dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)</code>',
      ],
      starter: `def knapsack(items, W):
    """items = [(weight, value), ...]. Return the best total value within capacity W."""
    n = len(items)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        w, v = items[i - 1]
        for c in range(W + 1):
            dp[i][c] = dp[i - 1][c]              # leave item i
            if False:                             # TODO: replace False: does item i fit in capacity c?
                pass                               # TODO: take item i if that beats leaving it
    return dp[n][W]
`,
      reflect: 'In one sentence: why does the "take it" case look in row i - 1 and not in row i?',
      demo: 'DEMO_ARGS = ([(4, 400), (6, 480), (2, 240), (5, 300)], 10)',
      viz: { pointers: ['i', 'c', 'w', 'v'], lists: ['dp'] },
      tests: ksTests('knapsack', 'value'),
    },
    {
      id: 'traceback',
      title: 'Which crates fly? Trace back',
      entry: 'pack_items',
      brief: `The table is built for you, and its bottom-right cell holds the best value, but the loading crew needs
        a <b>list of crates</b>. Walk back from the corner. At row <code>i</code>, if
        <code>dp[i][c]</code> differs from the cell above <code>dp[i - 1][c]</code>, item <code>i</code> was
        <b>taken</b>: record it (as a 0-based index) and move left by its weight. Return the indices sorted.`,
      hints: [
        'If the value did not change from the row above, item <code>i</code> was left behind: do nothing.',
        'Taken: <code>chosen.append(i - 1)</code> and <code>c -= items[i - 1][0]</code>.',
      ],
      starter: `def pack_items(items, W):
    """Return the sorted 0-based indices of the items in an optimal pack."""
    n = len(items)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        w, v = items[i - 1]
        for c in range(W + 1):
            dp[i][c] = dp[i - 1][c]
            if w <= c:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)
    chosen = []
    c = W
    for i in range(n, 0, -1):
        pass  # TODO: if dp[i][c] != dp[i - 1][c], item i was taken: record it and shrink c by its weight
    return sorted(chosen)
`,
      reflect: 'In one sentence: why can the traceback find the chosen items without storing any extra information?',
      demo: 'DEMO_ARGS = ([(4, 400), (6, 480), (2, 240), (5, 300)], 10)',
      viz: { pointers: ['i', 'c'], lists: ['chosen', 'dp'] },
      tests: ksTests('pack_items', 'items'),
    },
    {
      id: 'greedy',
      title: 'Where greedy by ratio fails',
      entry: 'best_value',
      brief: `This packer takes crates in order of <b>points per kg</b>, skipping any that no longer fit. On the
        pallet it returns <b>640</b>, but the best is <b>880</b> (ventilator plus IV crates, exactly 200 kg). The
        dead space greedy never budgets for is the problem. Replace the greedy loop with a <b>one-row table</b>
        <code>best[c]</code> (best value within capacity <code>c</code>), updating each item with capacity
        <b>counting down</b> so an item is used at most once.`,
      hints: [
        'Start with <code>best = [0] * (W + 1)</code> and loop over each <code>(w, v)</code> in <code>items</code>.',
        'Inner loop: <code>for c in range(W, w - 1, -1)</code>; then <code>best[c] = max(best[c], best[c - w] + v)</code>.',
        'Counting down matters: counting up would let the same item be taken again.',
      ],
      starter: `def best_value(items, W):
    """Best total value within capacity W. Right now this is the greedy-by-ratio rule."""
    left = W
    total = 0
    for w, v in sorted(items, key=lambda it: it[1] / it[0], reverse=True):
        if w <= left:
            left -= w
            total += v
    return total
`,
      reflect: 'In one sentence: why does the fractional knapsack allow greedy but the 0-1 knapsack does not?',
      demo: 'DEMO_ARGS = ([(80, 400), (120, 480), (40, 240), (100, 300)], 200)',
      viz: { pointers: ['left', 'total', 'w', 'v'], lists: [] },
      tests: ksTests('best_value', 'value'),
      scale: {
        entry: 'best_value',
        sizes: [6, 10, 14, 16],
        gen: `import random
def gen(n):
    rng = random.Random(2)
    return ([(rng.randint(1, 20), rng.randint(1, 50)) for _ in range(n)], 50)`,
        baseline: `def baseline(items, W):
    def go(i, left):
        if i == len(items):
            return 0
        best = go(i + 1, left)
        if items[i][0] <= left:
            best = max(best, items[i][1] + go(i + 1, left - items[i][0]))
        return best
    return go(0, W)`,
        baselineLabel: 'try every subset',
        note: 'Each row counts executed lines. Trying every subset doubles with each extra item; the table grows with n x W, about 3 lines per cell.',
      },
    },
  ],
};
