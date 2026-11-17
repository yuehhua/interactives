window.LESSON = {
  id: 'heaps',
  title: 'Heaps: Sift Up, Sift Down',
  topic: 'Priority queues',
  intro: `An emergency room must always treat the most urgent patient next. A <b>max-heap</b> keeps that
    patient at index 0 of a plain Python list, where the children of node <code>i</code> live at
    <code>2i+1</code> and <code>2i+2</code> (0-based). Two moves keep the shape intact:
    <b>sift up</b> after an insert and <b>sift down</b> after an extract.`,
  levels: [
    {
      id: 'insert',
      title: 'Insert and sift up',
      entry: 'heap_insert',
      brief: `Fill in the two blanks. Step through the demo and watch the new value climb the tree
        until its parent is at least as large.`,
      hints: [
        'The parent of node <code>i</code> in a 0-based list is <code>(i - 1) // 2</code>.',
        'Swap with a tuple assignment: <code>heap[i], heap[p] = heap[p], heap[i]</code>.',
      ],
      starter: `def parent(i):
    return 0   # TODO: replace with the real formula (0-based list!)

def heap_insert(heap, x):
    """Add x to a max-heap stored in a list."""
    heap.append(x)
    i = len(heap) - 1
    while i > 0 and heap[parent(i)] < heap[i]:
        pass   # TODO: swap the node with its parent
        i = parent(i)
`,
      reflect: 'In one sentence: why does one insert cost O(log n) swaps at most, not O(n)?',
      demo: 'DEMO_ARGS = ([16, 14, 10, 8, 7, 9, 3, 2, 4, 1], 15)',
      viz: { pointers: ['i'], lists: ['heap'], tree: 'heap', focus: 'i' },
      tests: `
import random

def is_heap(h):
    return all(h[(i - 1) // 2] >= h[i] for i in range(1, len(h)))

def _insert_all(ns, xs):
    f = need(ns, "heap_insert")
    h = []
    for x in xs:
        f(h, x)
    if sorted(h) != sorted(xs):
        raise AssertionError(f"Items were lost or changed: heap is {short(h)} after inserting {short(xs)}.")
    if not is_heap(h):
        raise AssertionError(f"Not a max-heap after inserting {short(xs)}: got {short(h)}.")
    if h and h[0] != max(xs):
        raise AssertionError(f"The maximum should be at index 0, found {h[0]}.")

def t_parent(ns):
    p = need(ns, "parent")
    for i, want in [(1, 0), (2, 0), (3, 1), (4, 1), (5, 2), (6, 2), (10, 4)]:
        if p(i) != want:
            raise AssertionError(f"parent({i}) returned {p(i)}; in a 0-based list it should be {want}.")
def t_clrs(ns): _insert_all(ns, [4, 1, 3, 2, 16, 9, 10, 14, 8, 7])
def t_one(ns): _insert_all(ns, [5])
def t_dups(ns): _insert_all(ns, [3, 3, 3, 1, 3])
def t_asc(ns): _insert_all(ns, list(range(30)))
def t_desc(ns): _insert_all(ns, list(range(30, 0, -1)))
def t_perf(ns):
    xs = list(range(3000))          # worst case: every insert climbs to the root
    _insert_all(ns, xs)

TESTS = [
    ("parent(i) formula", "basic", t_parent),
    ("CLRS example inserts into a valid heap", "basic", t_clrs),
    ("single insert", "edge", t_one),
    ("duplicates", "edge", t_dups),
    ("ascending input (every insert climbs)", "edge", t_asc),
    ("descending input (no insert climbs)", "edge", t_desc),
    ("3,000 worst-case inserts stay O(log n) each", "perf", t_perf, 400000),
]
`,
    },
    {
      id: 'extract',
      title: 'Bug hunt: extract-max never returns',
      entry: 'extract_max',
      brief: `Press <b>Run tests</b> first: this extract-max <b>hangs</b>. The runner stops it with a step budget
        instead of freezing your browser. Step through the demo, find what the loop forgets to do when the node is
        already in place, and fix it.`,
      hints: [
        'Look at the <code>while True</code> loop. What ends it?',
        'When <code>largest == i</code>, the node is in place and the sift is finished.',
      ],
      starter: `def sift_down(heap, i, n):
    """Push heap[i] down until neither child is larger."""
    while True:
        left, right = 2 * i + 1, 2 * i + 2
        largest = i
        if left < n and heap[left] > heap[largest]:
            largest = left
        if right < n and heap[right] > heap[largest]:
            largest = right
        if largest != i:
            heap[i], heap[largest] = heap[largest], heap[i]
            i = largest
        # BUG: what happens when largest == i?

def extract_max(heap):
    """Remove and return the largest item of a max-heap."""
    top = heap[0]
    last = heap.pop()
    if heap:
        heap[0] = last
        sift_down(heap, 0, len(heap))
    return top
`,
      reflect: 'In one sentence: why does draining the whole heap (heapsort) cost O(n log n)?',
      demo: 'DEMO_ARGS = ([16, 14, 10, 8, 7, 9, 3, 2, 4, 1],)',
      viz: { pointers: ['i', 'left', 'right', 'largest'], lists: ['heap'], tree: 'heap', focus: 'i' },
      tests: `
import heapq, random

def is_heap(h):
    return all(h[(i - 1) // 2] >= h[i] for i in range(1, len(h)))

def make_heap(xs):
    h = [-x for x in xs]
    heapq.heapify(h)                 # a valid min-heap of negatives ...
    return [-x for x in h]           # ... is a valid max-heap of the originals

def t_clrs(ns):
    f = need(ns, "extract_max")
    h = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1]
    top = f(h)
    if top != 16:
        raise AssertionError(f"extract_max returned {top}, expected 16.")
    if len(h) != 9 or not is_heap(h):
        raise AssertionError(f"The heap after extract is {short(h)}; it must be a valid max-heap of the other 9 items.")
def t_one(ns):
    f = need(ns, "extract_max")
    h = [7]
    if f(h) != 7 or h != []:
        raise AssertionError(f"A one-item heap should return 7 and become []; got heap {h}.")
def t_drain(ns, n=40, seed=5, hi=99):
    f = need(ns, "extract_max")
    rng = random.Random(seed)
    xs = [rng.randint(0, hi) for _ in range(n)]
    h = make_heap(xs)
    out = []
    while h:
        out.append(f(h))
        if not is_heap(h):
            raise AssertionError(f"Heap property broke after {len(out)} extracts: {short(h)}.")
    if out != sorted(xs, reverse=True):
        raise AssertionError("Draining the heap should give the items in descending order (heapsort).")
def t_dups(ns): t_drain(ns, n=30, seed=1, hi=4)
def t_perf(ns): t_drain(ns, n=2000, seed=9)

TESTS = [
    ("CLRS extract-max example", "basic", t_clrs, 20000),
    ("single item heap", "edge", t_one, 20000),
    ("drain 40 items in descending order", "edge", t_drain, 50000),
    ("drain with many duplicates", "edge", t_dups, 50000),
    ("drain 2,000 items stays O(n log n)", "perf", t_perf, 1500000),
]
`,
    },
  ],
};
