const fracTests = `
import random

CLRS = [(10, 60), (20, 100), (30, 120)]   # (weight in kg, value): CLRS Section 15.2 knapsack example

def reference(items, capacity):
    total, room = 0.0, capacity
    for w, v in sorted(items, key=lambda it: it[1] / it[0], reverse=True):
        take = min(w, room)
        total += v * take / w
        room -= take
    return total

def _check(ns, items, capacity):
    f = need(ns, "fractional_knapsack")
    got = f(list(items), capacity)
    want = reference(items, capacity)
    if not isinstance(got, (int, float)) or abs(got - want) > 1e-6:
        raise AssertionError(f"capacity {capacity}: returned {short(got)}; the best total value is {round(want, 4)}.")

def t_clrs(ns): _check(ns, CLRS, 50)
def t_random(ns):
    rng = random.Random(3)
    for _ in range(25):
        items = [(rng.randint(1, 30), rng.randint(1, 90)) for _ in range(rng.randint(1, 8))]
        _check(ns, items, rng.randint(1, 60))
def t_zero(ns): _check(ns, CLRS, 0)
def t_none(ns): _check(ns, [], 10)
def t_all(ns): _check(ns, CLRS, 100)
def t_part(ns): _check(ns, [(8, 40)], 2)
def t_perf(ns):
    rng = random.Random(8)
    _check(ns, [(rng.randint(1, 50), rng.randint(1, 500)) for _ in range(5000)], 20000)

TESTS = [
    ("CLRS example: 10, 20, 30 kg in a 50 kg pack = 240", "basic", t_clrs),
    ("25 random packing problems", "basic", t_random),
    ("capacity 0 holds nothing", "edge", t_zero),
    ("no items", "edge", t_none),
    ("everything fits", "edge", t_all),
    ("only a slice of the only item fits", "edge", t_part),
    ("5,000 items within budget", "perf", t_perf, 80000),
]
`;
window.LESSON = {
  id: 'fractional-knapsack',
  title: 'Fractional Knapsack: Best Value per Kilogram',
  topic: 'Greedy algorithms',
  intro: `A pack holds at most <code>capacity</code> kg. Each item has a weight and a value, and you may take <b>any
    fraction</b> of an item, like scooping grain from a sack. Which items go in? CLRS Section 15.2 shows that the greedy rule
    <b>highest value per kilogram first</b> is optimal here. Write it, catch the tempting wrong rule (most valuable item
    first), then see why the very same rule fails once items can no longer be split.`,
  levels: [
    {
      id: 'fill',
      title: 'Best value per kilogram first',
      entry: 'fractional_knapsack',
      brief: `Items are <code>(weight, value)</code> pairs and they are already sorted by value per kilogram, best first.
        Fill in the two blanks: <b>how many kilograms</b> of this item to take (all of it, or only what room is left),
        and <b>the value</b> of exactly that share. Step through the CLRS example: 10, 20 and 30 kg in a 50 kg pack.`,
      hints: [
        'Take either the whole item or the room that is left: <code>take = min(w, room)</code>.',
        'A share <code>take</code> of an item of weight <code>w</code> is worth <code>v * take / w</code>.',
      ],
      starter: `def fractional_knapsack(items, capacity):
    """Largest total value in a pack of the given capacity; items may be taken in fractions."""
    total = 0.0
    room = capacity
    for w, v in sorted(items, key=lambda it: it[1] / it[0], reverse=True):   # best value per kg first
        take = 0                                   # TODO: kilograms of this item that fit: all of it, or only the room left
        total += 0                                 # TODO: value of exactly those kilograms
        room -= take
    return total
`,
      reflect: 'In one sentence: why is it safe to fill the pack with the best-ratio item first? What would you swap if a worse-ratio item were already in the pack?',
      demo: 'DEMO_ARGS = ([(10, 60), (20, 100), (30, 120)], 50)',
      viz: { pointers: ['w', 'v', 'take', 'room', 'total'], lists: ['items'] },
      tests: fracTests,
    },
    {
      id: 'wrong-rule',
      title: 'Bug hunt: most valuable item first',
      entry: 'fractional_knapsack',
      brief: `This packer always takes the <b>most valuable</b> item first. That sounds sensible, and it is wrong: a heavy
        item can use up the room while a lighter one was worth more per kilogram. Change <b>one line</b> to the rule
        that is provably optimal. Step through the CLRS example and compare the total with 240.`,
      hints: [
        'What should one kilogram of room be spent on? Compare items by what each kilogram earns.',
        'Sort by <code>it[1] / it[0]</code>, value divided by weight.',
      ],
      starter: `def fractional_knapsack(items, capacity):
    total = 0.0
    room = capacity
    for w, v in sorted(items, key=lambda it: it[1], reverse=True):      # <- is this the right order?
        take = min(w, room)
        total += v * take / w
        room -= take
    return total
`,
      reflect: 'In one sentence: give a tiny pair of items where "most valuable first" loses to "best value per kilogram first".',
      demo: 'DEMO_ARGS = ([(10, 60), (20, 100), (30, 120)], 50)',
      viz: { pointers: ['w', 'v', 'take', 'room', 'total'], lists: ['items'] },
      tests: fracTests,
    },
    {
      id: 'zero-one',
      title: 'When items cannot be split',
      entry: 'best_subset_value',
      brief: `Now every item is <b>all or nothing</b> (0/1 knapsack). The same best-ratio rule is written for you as
        <code>ratio_greedy_01</code>: on the CLRS example it packs 10 kg and 20 kg for value <b>160</b>, then the 30 kg
        item no longer fits. But taking the 20 kg and 30 kg items is worth <b>220</b>. Finish the brute force that tries every
        subset of items: fill in the test for <b>a subset that fits and beats the best so far</b>. Step through and compare
        <code>best</code> with <code>greedy</code>.`,
      hints: [
        'A subset fits when its total weight is at most the capacity: <code>w &lt;= capacity</code>.',
        'It also has to beat the best so far: <code>w &lt;= capacity and v &gt; best</code>.',
      ],
      starter: `def ratio_greedy_01(items, capacity):
    """The same best-ratio rule, but items are all or nothing."""
    total = 0
    room = capacity
    for w, v in sorted(items, key=lambda it: it[1] / it[0], reverse=True):
        if w <= room:
            total += v
            room -= w
    return total

def best_subset_value(items, capacity):
    """Try every subset of items; return the largest total value whose weight fits."""
    greedy = ratio_greedy_01(items, capacity)
    best = 0
    n = len(items)
    for mask in range(1 << n):                     # each bit of mask says whether an item is in the subset
        w = v = 0
        for i in range(n):
            if mask >> i & 1:
                w += items[i][0]
                v += items[i][1]
        if False:                                  # TODO: replace False: does this subset fit, and beat the best so far?
            best = v
    return best
`,
      reflect: 'In one sentence: why does splitting an item let the best-ratio rule fill the pack exactly, while all-or-nothing items leave unused room that the rule cannot recover?',
      demo: 'DEMO_ARGS = ([(10, 60), (20, 100), (30, 120)], 50)',
      viz: { pointers: ['mask', 'w', 'v', 'best', 'greedy'], lists: ['items'] },
      tests: `
import random

CLRS = [(10, 60), (20, 100), (30, 120)]

def optimum(items, W):
    best = [0] * (W + 1)
    for w, v in items:
        for c in range(W, w - 1, -1):
            best[c] = max(best[c], best[c - w] + v)
    return best[W]

def _check(ns, items, capacity):
    f = need(ns, "best_subset_value")
    got = f(list(items), capacity)
    want = optimum(items, capacity)
    if got != want:
        raise AssertionError(f"capacity {capacity}: returned {short(got)}; the best all-or-nothing value is {want}.")

def t_clrs(ns): _check(ns, CLRS, 50)
def t_random(ns):
    rng = random.Random(6)
    for _ in range(12):
        items = [(rng.randint(1, 20), rng.randint(1, 60)) for _ in range(rng.randint(1, 8))]
        _check(ns, items, rng.randint(1, 40))
def t_empty(ns): _check(ns, [], 10)
def t_zero(ns): _check(ns, CLRS, 0)
def t_heavy(ns): _check(ns, [(9, 90)], 5)
def t_all(ns): _check(ns, CLRS, 60)

TESTS = [
    ("CLRS example: all-or-nothing best is 220, not 160", "basic", t_clrs),
    ("12 random small problems", "basic", t_random),
    ("no items", "edge", t_empty),
    ("capacity 0 holds nothing", "edge", t_zero),
    ("the only item is too heavy", "edge", t_heavy),
    ("everything fits", "edge", t_all),
]
`,
    },
  ],
};
