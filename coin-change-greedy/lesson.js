const coinTests = (perf_budget) => `
import random

CANON = [50, 10, 5, 1]

def reference(coins, amount):
    used, remaining = [], amount
    for c in sorted(coins, reverse=True):
        while c <= remaining:
            used.append(c)
            remaining -= c
    return used if remaining == 0 else None

def _check(ns, coins, amount):
    f = need(ns, "greedy_coins")
    got = f(list(coins), amount)
    want = reference(coins, amount)
    if want is None:
        if got is not None:
            raise AssertionError(f"{amount} cannot be made from {coins}: expected None, got {short(got)}.")
        return
    if got is None:
        raise AssertionError(f"Returned None, but biggest-first can pay {amount} with {short(want)}.")
    for c in got:
        if c not in coins:
            raise AssertionError(f"{c} is not one of the coins {coins}.")
    if sum(got) != amount:
        raise AssertionError(f"The coins {short(got)} add up to {sum(got)}, not {amount}.")
    if sorted(got, reverse=True) != want:
        raise AssertionError(f"Got {len(got)} coins {short(sorted(got, reverse=True))}; biggest-first gives {len(want)} coins {short(want)}.")

def t_68(ns): _check(ns, CANON, 68)
def t_us(ns): _check(ns, [25, 10, 5, 1], 63)
def t_every(ns):
    for a in range(0, 201):
        _check(ns, CANON, a)
def t_unsorted(ns): _check(ns, [1, 10, 5, 50], 68)
def t_zero(ns): _check(ns, CANON, 0)
def t_exact(ns): _check(ns, CANON, 50)
def t_none(ns): _check(ns, [5, 10], 3)
def t_not_best(ns): _check(ns, [1, 3, 4], 6)
def t_perf(ns): _check(ns, CANON, 100000)

TESTS = [
    ("$68 = 50 + 10 + 5 + 1 + 1 + 1", "basic", t_68),
    ("quarters, dimes, nickels: 63", "basic", t_us),
    ("every amount from 0 to 200", "basic", t_every),
    ("coins given in any order", "basic", t_unsorted),
    ("amount 0 needs no coins", "edge", t_zero),
    ("one coin is enough", "edge", t_exact),
    ("no way to pay: return None", "edge", t_none),
    ("coins 1, 3, 4 for 6: biggest-first still takes 4 + 1 + 1", "edge", t_not_best),
    ("amount 100,000 within budget", "perf", t_perf, ${perf_budget}),
]
`;
window.LESSON = {
  id: 'coin-change-greedy',
  title: 'Coin Change: Take the Biggest Coin',
  topic: 'Greedy algorithms',
  intro: `Pay an amount with as few coins as possible. Your hands already know a rule: keep taking the <b>biggest coin
    that still fits</b>. That is a <b>greedy algorithm</b>: at every step take what looks best right now, never go back.
    For \$1, \$5, \$10 and \$50 coins it is always optimal. Is it always optimal for <i>every</i> coin system? Write the rule,
    break it with a wrong order, then hunt for a coin system where it fails.`,
  levels: [
    {
      id: 'fill',
      title: 'Biggest coin first',
      entry: 'greedy_coins',
      brief: `The coins are tried from the biggest down. Fill in the two blanks: <b>does coin <code>c</code> still fit</b>
        in what remains to pay, and if so <b>take it</b>. If the amount cannot be paid exactly, the function returns
        <code>None</code>. Step through paying 68 and watch the coins pile up.`,
      hints: [
        'It fits when <code>c &lt;= remaining</code>. Use <code>while</code>, not <code>if</code>: the same coin can be taken many times.',
        'Take it: <code>used.append(c)</code> and <code>remaining -= c</code>.',
      ],
      starter: `def greedy_coins(coins, amount):
    """Pay amount with biggest-first coins. Return the list of coins used, or None if impossible."""
    used = []
    remaining = amount
    for c in sorted(coins, reverse=True):          # biggest coin first
        while False:                               # TODO: replace False: does coin c still fit in what remains?
            pass                                   # TODO: take the coin and reduce what remains
    return used if remaining == 0 else None
`,
      reflect: 'In one sentence: after taking a coin, what is left is one smaller coin-change problem. Why does that make the greedy step easy to repeat?',
      demo: 'DEMO_ARGS = ([50, 10, 5, 1], 68)',
      viz: { pointers: ['c', 'remaining'], lists: ['used'] },
      tests: coinTests(20000),
    },
    {
      id: 'wrong-order',
      title: 'Bug hunt: smallest coin first',
      entry: 'greedy_coins',
      brief: `This version tries the coins from the <b>smallest</b> up. Every answer it gives is a valid way to pay,
        yet it fails the tests: it hands out sixty-eight $1 coins. Change <b>one line</b> so the coins are tried in the
        order that makes the greedy rule work. Step through the demo and watch <code>used</code> fill with ones.`,
      hints: [
        'Which coin should be considered first if we want to use as few coins as possible?',
        'Sort in descending order: <code>sorted(coins, reverse=True)</code>.',
      ],
      starter: `def greedy_coins(coins, amount):
    used = []
    remaining = amount
    for c in sorted(coins):                        # <- is this the right order?
        while c <= remaining:
            used.append(c)
            remaining -= c
    return used if remaining == 0 else None
`,
      reflect: 'In one sentence: what does "greedy" promise at each step, and why does smallest-first break that promise?',
      demo: 'DEMO_ARGS = ([50, 10, 5, 1], 68)',
      viz: { pointers: ['c', 'remaining'], lists: ['used'] },
      tests: coinTests(20000),
    },
    {
      id: 'counterexample',
      title: 'When is biggest-first not safe?',
      entry: 'first_counterexample',
      brief: `Take a coin system with coins 1, 3 and 4 and pay 6. Biggest-first gives 4 + 1 + 1 (three coins), but 3 + 3 uses
        only two. So greedy is <b>not</b> always safe. The two counting helpers are written for you:
        <code>greedy_count</code> (coins used by biggest-first) and <code>best_count</code> (the true minimum).
        Fill in the test inside the loop to return the <b>smallest amount</b> where greedy uses more coins than the best.
        Return <code>None</code> if no amount up to <code>limit</code> breaks it.`,
      hints: [
        'Greedy loses when it uses <i>more</i> coins than the best possible.',
        '<code>greedy_count(coins, amount) &gt; best_count(coins, amount)</code>',
      ],
      starter: `def greedy_count(coins, amount):
    """Number of coins biggest-first uses (infinity if it cannot pay)."""
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else float("inf")

def best_count(coins, amount):
    """Fewest coins that pay amount, found by trying everything small first."""
    best = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                best[a] = min(best[a], best[a - c] + 1)
    return best[amount]

def first_counterexample(coins, limit):
    """Smallest amount in 1..limit where biggest-first is worse than the best, else None."""
    for amount in range(1, limit + 1):
        if False:                                  # TODO: replace False: does greedy use more coins than the best?
            return amount
    return None
`,
      reflect: 'In one sentence: why can a coin system like 1, 5, 10, 50 never be beaten, while 1, 3, 4 can? What do the bigger coins have to do with the smaller ones?',
      demo: 'DEMO_ARGS = ([1, 3, 4], 8)',
      viz: { pointers: ['amount', 'limit'], lists: ['coins'] },
      tests: `
def best(coins, a):
    t = [0] + [float("inf")] * a
    for x in range(1, a + 1):
        for c in coins:
            if c <= x:
                t[x] = min(t[x], t[x - c] + 1)
    return t[a]

def greedy(coins, a):
    n = 0
    for c in sorted(coins, reverse=True):
        n += a // c
        a %= c
    return n if a == 0 else float("inf")

def reference(coins, limit):
    for a in range(1, limit + 1):
        if greedy(coins, a) > best(coins, a):
            return a
    return None

def _check(ns, coins, limit):
    f = need(ns, "first_counterexample")
    got = f(list(coins), limit)
    want = reference(coins, limit)
    if got != want:
        raise AssertionError(f"coins {coins}, up to {limit}: returned {short(got)}; the first amount where greedy loses is {short(want)}.")

def t_134(ns): _check(ns, [1, 3, 4], 10)
def t_short(ns): _check(ns, [1, 3, 4], 5)
def t_safe(ns): _check(ns, [50, 10, 5, 1], 200)
def t_us(ns): _check(ns, [25, 10, 5, 1], 100)
def t_twenty(ns): _check(ns, [1, 5, 10, 20, 25], 60)
def t_16(ns): _check(ns, [1, 6, 10], 20)
def t_zero(ns): _check(ns, [1, 3, 4], 0)

TESTS = [
    ("coins 1, 3, 4: greedy first loses at 6", "basic", t_134),
    ("coins 1, 5, 10, 25: never loses up to 100", "basic", t_us),
    ("coins 1, 5, 10, 20, 25: loses at 40", "basic", t_twenty),
    ("coins 1, 6, 10", "basic", t_16),
    ("coins 1, 5, 10, 50: never loses up to 200", "edge", t_safe),
    ("limit too small to find the failure", "edge", t_short),
    ("limit 0: nothing to check", "edge", t_zero),
]
`,
    },
  ],
};
