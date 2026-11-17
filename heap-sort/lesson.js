window.LESSON = {
  id: 'heap-sort',
  title: 'Heap Sort and the Top-k Monitor',
  topic: 'Priority queues',
  intro: `A max-heap keeps the largest item at index 0. <b>Heap sort</b> builds a heap in place, then repeatedly swaps the
    maximum to the end of the array and repairs the smaller heap: n log n time, no extra memory. The same idea powers a
    bedside monitor that must keep only the <i>k</i> most extreme readings of an endless stream.`,
  levels: [
    {
      id: 'sort',
      title: 'Build the heap, then drain it',
      entry: 'heap_sort',
      brief: `<code>sift_down</code> is given. Fill in the three blanks: <b>build the heap</b> by sifting down every
        non-leaf from the last one to the root, then repeatedly <b>swap the maximum to the end</b> and <b>repair</b> the
        remaining heap. Step through and watch the sorted region grow from the right.`,
      hints: [
        'Build: <code>sift_down(a, i, n)</code>.',
        'Move the maximum: <code>a[0], a[end] = a[end], a[0]</code>.',
        'Repair the heap of size <code>end</code>: <code>sift_down(a, 0, end)</code>.',
      ],
      starter: `def sift_down(a, i, n):
    """Push a[i] down until neither child (within a[0..n-1]) is larger."""
    while True:
        left, right = 2 * i + 1, 2 * i + 2
        largest = i
        if left < n and a[left] > a[largest]:
            largest = left
        if right < n and a[right] > a[largest]:
            largest = right
        if largest == i:
            break
        a[i], a[largest] = a[largest], a[i]
        i = largest

def heap_sort(a):
    """Return a sorted copy of a."""
    a = list(a)
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):
        pass   # TODO: build the max-heap: sift down every non-leaf, last one first
    for end in range(n - 1, 0, -1):
        pass   # TODO: swap the maximum a[0] with a[end]
        pass   # TODO: repair the heap a[0..end-1]
    return a
`,
      reflect: 'In one sentence: why does building the heap cost O(n) while draining it costs O(n log n)?',
      demo: 'DEMO_ARGS = ([4, 10, 3, 5, 1, 8],)',
      viz: { pointers: ['i', 'end', 'largest'], lists: ['a'], tree: 'a', focus: 'i' },
      tests: `
import random
def _c(ns, xs):
    got = need(ns, "heap_sort")(list(xs))
    if got != sorted(xs):
        raise AssertionError(f"heap_sort({short(xs)}) returned {short(got)}, expected {short(sorted(xs))}")
def t_small(ns): _c(ns, [4, 10, 3, 5, 1, 8])
def t_empty(ns): _c(ns, [])
def t_one(ns): _c(ns, [7])
def t_dups(ns): _c(ns, [3, 1, 3, 1, 3])
def t_rev(ns): _c(ns, list(range(40, 0, -1)))
def t_random(ns):
    rng = random.Random(7); _c(ns, [rng.randint(0, 999) for _ in range(200)])
def t_perf(ns):
    rng = random.Random(8); _c(ns, [rng.randint(0, 99999) for _ in range(2000)])

TESTS = [
    ("a small list", "basic", t_small),
    ("empty list", "edge", t_empty),
    ("single element", "edge", t_one),
    ("duplicates", "edge", t_dups),
    ("reverse sorted", "edge", t_rev),
    ("200 random values", "edge", t_random, 200000),
    ("2,000 values in O(n log n) lines", "perf", t_perf, 400000),
]
`,
      scale: {
        entry: 'heap_sort', sizes: [100, 1000, 10000],
        gen: `import random
def gen(n):
    rng = random.Random(1)
    return ([rng.randint(0, 99999) for _ in range(n)],)`,
        note: 'n log n: a little more than ×10 per ×10 in n.',
      },
    },
    {
      id: 'topk',
      title: 'Top-k of an endless stream',
      entry: 'top_k',
      brief: `A monitor sees millions of readings but can only remember <i>k</i>. Keep a <b>min-heap of size k</b>: its
        root is the smallest of the k largest so far. Fill in the two blanks: <b>push</b> while there is room, otherwise
        <b>replace the root</b> if the new reading is larger.`,
      hints: ['Push: <code>heapq.heappush(heap, x)</code>.', 'Replace: <code>heapq.heapreplace(heap, x)</code>.'],
      starter: `import heapq

def top_k(stream, k):
    """Return the k largest values of stream, largest first, remembering at most k."""
    if k <= 0:
        return []
    heap = []   # a min-heap holding the k largest values seen so far
    for x in stream:
        if len(heap) < k:
            pass   # TODO: there is room: push x
        elif x > heap[0]:
            pass   # TODO: x beats the smallest of the k: replace it
    return sorted(heap, reverse=True)
`,
      reflect: 'In one sentence: what is the cost per reading, and why does it depend on k but not on the stream length?',
      demo: 'DEMO_ARGS = ([5, 1, 9, 3, 7, 8, 2], 3)',
      viz: { pointers: [], lists: ['heap'] },
      tests: `
import random
def _c(ns, xs, k):
    got = need(ns, "top_k")(iter(xs), k)
    want = sorted(xs, reverse=True)[:k]
    if got != want:
        raise AssertionError(f"top_k(..., {k}) returned {short(got)}, expected {short(want)}")
def t_basic(ns): _c(ns, [5, 1, 9, 3, 7, 8, 2], 3)
def t_k1(ns): _c(ns, [4, 8, 2], 1)
def t_big_k(ns): _c(ns, [3, 1, 2], 10)
def t_zero(ns): _c(ns, [3, 1, 2], 0)
def t_dups(ns): _c(ns, [5, 5, 5, 1], 2)
def t_perf(ns):
    rng = random.Random(9); _c(ns, [rng.randint(0, 10**6) for _ in range(20000)], 10)

TESTS = [
    ("top 3 of 7 readings", "basic", t_basic),
    ("k = 1", "edge", t_k1),
    ("k larger than the stream", "edge", t_big_k),
    ("k = 0", "edge", t_zero),
    ("duplicates", "edge", t_dups),
    ("20,000 readings, k = 10, in O(n) lines", "perf", t_perf, 150000),
]
`,
    },
  ],
};
