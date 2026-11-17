window.LESSON = {
  id: 'dynamic-array',
  title: 'Arrays: Index Formulas and Growing',
  topic: 'Arrays and memory',
  intro: `A cinema's seats are one long strip of memory, row after row. Given where the strip starts, the
    address of any seat is <i>computed</i>, not searched for. And when the strip is full, a dynamic array
    allocates a bigger one and copies. How much bigger is the whole game.`,
  levels: [
    {
      id: 'address',
      title: 'Compute a seat address',
      entry: 'seat_address',
      brief: `Memory is a line. A 2D seating chart is stored <b>row by row</b>. Fill in the two blanks: the flat index
        of seat <code>(row, col)</code>, and the byte address of that element.`,
      hints: ['Row-major: <code>row * cols + col</code>.', 'Address = <code>base + index * size</code>.'],
      starter: `def index_2d(row, col, cols):
    """Flat index of (row, col) in a row-major array with cols columns."""
    return 0   # TODO: replace with the real formula

def seat_address(base, row, col, cols, size):
    """Byte address of seat (row, col): base + flat index * size."""
    return base   # TODO: use index_2d
`,
      reflect: 'In one sentence: why is reading element i of an array O(1) no matter how long the array is?',
      demo: 'DEMO_ARGS = (1000, 2, 3, 10, 4)',
      viz: { pointers: [], lists: [] },
      tests: `
def t_idx(ns):
    f = need(ns, "index_2d")
    for r, c, cols, want in [(0, 0, 5, 0), (2, 3, 10, 23), (1, 0, 8, 8), (4, 4, 5, 24)]:
        if f(r, c, cols) != want:
            raise AssertionError(f"index_2d({r}, {c}, {cols}) returned {f(r, c, cols)}, expected {want}.")
def t_addr(ns):
    f = need(ns, "seat_address")
    for args, want in [((1000, 2, 3, 10, 4), 1092), ((256, 1, 0, 8, 8), 320), ((0, 0, 0, 5, 4), 0)]:
        if f(*args) != want:
            raise AssertionError(f"seat_address{args} returned {f(*args)}, expected {want}.")

TESTS = [
    ("row-major flat index", "basic", t_idx),
    ("byte address of a seat", "basic", t_addr),
]
`,
    },
    {
      id: 'growth',
      title: 'Bug hunt: growing one slot at a time',
      entry: 'fill_array',
      brief: `Appending works, but filling the array gets absurdly slow. The array grows by <b>one</b> slot each time it
        is full, so every append copies everything. Change <b>one line</b> to grow geometrically. Run the tests, then
        open <b>Scale it up</b> to see quadratic turn into linear.`,
      hints: ['How many copies happen when capacity grows by 1 each time?', 'Double the capacity instead: <code>arr["cap"] * 2</code>.'],
      starter: `def resize(arr, new_cap):
    old = arr["data"]
    new = [None] * new_cap
    for i in range(arr["size"]):
        new[i] = old[i]
    arr["data"] = new
    arr["cap"] = new_cap

def append(arr, x):
    if arr["size"] == arr["cap"]:
        resize(arr, arr["cap"] + 1)          # <- grows by one slot at a time
    arr["data"][arr["size"]] = x
    arr["size"] += 1

def fill_array(n):
    arr = {"data": [None], "size": 0, "cap": 1}
    for x in range(n):
        append(arr, x)
    return arr["size"], arr["cap"]
`,
      reflect: 'In one sentence: why is doubling O(1) per append on average even though one resize copies the whole array?',
      demo: 'DEMO_ARGS = (6,)',
      viz: { pointers: ['i'], lists: ['old', 'new'] },
      tests: `
def _arr():
    return {"data": [None], "size": 0, "cap": 1}
def t_values(ns):
    ap = need(ns, "append"); a = _arr()
    for x in range(20):
        ap(a, x)
    if a["data"][:20] != list(range(20)) or a["size"] != 20:
        raise AssertionError(f"After 20 appends the data is {short(a['data'][:20])}, size {a['size']}.")
def t_fill(ns):
    size, cap = need(ns, "fill_array")(10)
    if size != 10 or cap < 10:
        raise AssertionError(f"fill_array(10) returned size={size}, cap={cap}.")
def t_slack(ns):
    size, cap = need(ns, "fill_array")(1000)
    if cap > 2 * size:
        raise AssertionError(f"Capacity {cap} for {size} items wastes more than half the memory.")
def t_perf(ns):
    need(ns, "fill_array")(3000)

TESTS = [
    ("append keeps every value", "basic", t_values),
    ("fill_array(10)", "basic", t_fill),
    ("capacity stays within 2x of the size", "edge", t_slack),
    ("3,000 appends in O(n) lines", "perf", t_perf, 80000),
]
`,
      scale: {
        entry: 'fill_array', sizes: [100, 1000, 10000], gen: `def gen(n):
    return (n,)`,
        note: 'Growing by one: about ×100 per ×10 in n (quadratic). Doubling: about ×10 (linear).',
      },
    },
  ],
};
