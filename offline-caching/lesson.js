
const cacheTests = (entry, refKind) => `
import random

BELADY = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]

def fifo(req, k):
    cache, misses = [], 0
    for p in req:
        if p not in cache:
            misses += 1
            if len(cache) == k:
                cache.pop(0)
            cache.append(p)
    return misses

def lru(req, k):
    cache, misses = [], 0
    for p in req:
        if p in cache:
            cache.remove(p)
        else:
            misses += 1
            if len(cache) == k:
                cache.pop(0)
        cache.append(p)
    return misses

def fif(req, k):
    cache, misses = [], 0
    for i, p in enumerate(req):
        if p in cache:
            continue
        misses += 1
        if len(cache) == k:
            def nxt(q):
                for j in range(i + 1, len(req)):
                    if req[j] == q:
                        return j
                return len(req) + 1
            cache.remove(max(cache, key=nxt))
        cache.append(p)
    return misses

REF = ${refKind}

def _check(ns, req, k):
    f = need(ns, "${entry}")
    got = f(list(req), k)
    want = REF(req, k)
    if got != want:
        raise AssertionError(f"k = {k}: returned {short(got)} misses; expected {want}.")

def t_belady3(ns): _check(ns, BELADY, 3)
def t_belady4(ns): _check(ns, BELADY, 4)
def t_small(ns): _check(ns, [1, 2, 3, 1, 4, 1, 2, 5, 3, 1], 3)
def t_random(ns):
    rng = random.Random(4)
    for _ in range(15):
        req = [rng.randint(1, 7) for _ in range(rng.randint(10, 40))]
        _check(ns, req, rng.randint(2, 5))
def t_empty(ns): _check(ns, [], 3)
def t_one(ns): _check(ns, [1, 2, 1, 2, 3], 1)
def t_big(ns): _check(ns, [1, 2, 3, 2, 1], 5)
def t_perf(ns):
    rng = random.Random(12)
    _check(ns, [rng.randint(1, 12) for _ in range(500)], 5)
`;
const cacheList = (perfBudget) => `
TESTS = [
    ("k = 3 on 1 2 3 4 1 2 5 1 2 3 4 5", "basic", t_belady3),
    ("same requests with k = 4", "basic", t_belady4),
    ("ten requests, k = 3", "basic", t_small),
    ("15 random request streams", "basic", t_random),
    ("no requests", "edge", t_empty),
    ("a cache of one page", "edge", t_one),
    ("cache bigger than the working set", "edge", t_big),
    ("500 requests within budget", "perf", t_perf, ${perfBudget}),
]
`;
window.LESSON = {
  id: 'offline-caching',
  title: 'Offline Caching: Evict the Page Needed Last',
  topic: 'Greedy algorithms',
  intro: `A small fast cache holds <code>k</code> pages; every request for a page that is not in it is a
    <b>cache miss</b> and costs a slow trip to disk. When the cache is full, one page must go. Which one? Practical policies
    look <i>backward</i> (least recently used). CLRS Section 15.4 asks what an <b>offline</b> scheduler could do if it knew
    the whole request list in advance, and proves a greedy rule optimal: evict the page whose next request is
    <b>furthest in the future</b>.`,
  levels: [
    {
      id: 'lru',
      title: 'A policy that looks back: LRU',
      entry: 'lru_misses',
      brief: `Count the misses for the policy that evicts the <b>least recently used</b> page. <code>last_used[p]</code> is the
        position where page <code>p</code> was last requested. Fill in the blank: <b>which cached page was used longest
        ago</b>? Step through the 12 requests <code>1 2 3 4 1 2 5 1 2 3 4 5</code> with <code>k = 3</code>.`,
      hints: [
        'The oldest use is the smallest position in <code>last_used</code>.',
        '<code>victim = min(cache, key=lambda p: last_used[p])</code>',
      ],
      starter: `def lru_misses(requests, k):
    """Number of cache misses when the least recently used page is evicted."""
    cache = []
    last_used = {}
    misses = 0
    for i, page in enumerate(requests):
        if page not in cache:
            misses += 1
            if len(cache) == k:
                victim = cache[0]                  # TODO: the cached page whose last use is the oldest
                cache.remove(victim)
            cache.append(page)
        last_used[page] = i
    return misses
`,
      reflect: 'In one sentence: LRU bets that the past predicts the future. Name one request pattern where that bet loses.',
      demo: 'DEMO_ARGS = ([1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], 3)',
      viz: { pointers: ['i', 'page', 'misses'], lists: ['requests', 'cache'] },
      tests: cacheTests('lru_misses', 'lru') + cacheList(60000),
    },
    {
      id: 'furthest',
      title: 'A policy that looks ahead: furthest in future',
      entry: 'furthest_in_future_misses',
      brief: `Offline, the whole request list is known. <code>next_use(requests, i, page)</code> gives the position of the next
        request for <code>page</code> after <code>i</code>, or infinity if there is none. Fill in the blank: evict the cached page
        whose next use is <b>furthest away</b>. Compare the miss count with LRU's 10 on the same requests.`,
      hints: [
        'Among the cached pages, pick the one with the largest <code>next_use</code>.',
        '<code>victim = max(cache, key=lambda p: next_use(requests, i, p))</code>',
      ],
      starter: `def next_use(requests, i, page):
    """Position of the next request for page after position i, or infinity if never."""
    for j in range(i + 1, len(requests)):
        if requests[j] == page:
            return j
    return float("inf")

def furthest_in_future_misses(requests, k):
    """Number of cache misses when we always evict the page needed furthest in the future."""
    cache = []
    misses = 0
    for i, page in enumerate(requests):
        if page in cache:
            continue
        misses += 1
        if len(cache) == k:
            victim = cache[0]                      # TODO: the cached page whose next use is furthest away
            cache.remove(victim)
        cache.append(page)
    return misses
`,
      reflect: 'In one sentence: why does evicting the page needed furthest in the future never cause a miss that another choice would have avoided?',
      demo: 'DEMO_ARGS = ([1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], 3)',
      viz: { pointers: ['i', 'page', 'misses'], lists: ['requests', 'cache'] },
      tests: cacheTests('furthest_in_future_misses', 'fif') + cacheList(250000),
    },
    {
      id: 'wrong-rule',
      title: 'Bug hunt: evict the page needed soonest',
      entry: 'furthest_in_future_misses',
      brief: `This version looks ahead, yet it misses far too often. A single word is wrong: it evicts the page that will
        be requested <b>soonest</b>, which forces an immediate miss. Change <b>one word</b> so it evicts the page needed
        <b>last</b>. Step through the demo and watch the same page leave and return.`,
      hints: [
        'Which page do we want to keep: the one needed next, or the one needed latest?',
        'Replace <code>min</code> with <code>max</code>.',
      ],
      starter: `def next_use(requests, i, page):
    for j in range(i + 1, len(requests)):
        if requests[j] == page:
            return j
    return float("inf")

def furthest_in_future_misses(requests, k):
    cache = []
    misses = 0
    for i, page in enumerate(requests):
        if page in cache:
            continue
        misses += 1
        if len(cache) == k:
            victim = min(cache, key=lambda p: next_use(requests, i, p))   # <- min or max?
            cache.remove(victim)
        cache.append(page)
    return misses
`,
      reflect: 'In one sentence: a real operating system cannot read the future. Why is the offline optimum still useful to know?',
      demo: 'DEMO_ARGS = ([1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], 3)',
      viz: { pointers: ['i', 'page', 'misses'], lists: ['requests', 'cache'] },
      tests: cacheTests('furthest_in_future_misses', 'fif') + cacheList(250000),
    },
  ],
};
