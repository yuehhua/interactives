window.LESSON = {
  id: 'lookup-cost',
  title: 'Why Structure Matters: Finding the Charger',
  topic: 'Introduction',
  intro: `You pack 30 items for a trip. Thrown loose into a plastic bag, finding the one charger means checking
    items one by one. Sorted into labelled pouches, you go straight to it. Same items, same question: the
    <b>structure</b> changes how many steps the answer costs. You will count those steps for real.`,
  levels: [
    {
      id: 'scan',
      title: 'The loose bag: scan every item',
      entry: 'find_item',
      brief: `Fill in the one blank: <b>is this the item we want?</b> Step through the demo, then open
        <b>Scale it up</b>: the number of executed lines grows in proportion to the size of the bag.`,
      hints: ['Compare <code>bag[i]</code> with <code>name</code>.'],
      starter: `def find_item(bag, name):
    """Return the position of name in the unsorted list bag, or -1."""
    for i in range(len(bag)):
        if False:   # TODO: replace False with the test "is bag[i] the item we want?"
            return i
    return -1
`,
      reflect: 'In one sentence: if the bag doubles, what happens to the number of steps in the worst case?',
      demo: 'DEMO_ARGS = (["passport", "socks", "toothbrush", "charger", "camera", "hat"], "charger")',
      viz: { pointers: ['i'], lists: ['bag'] },
      tests: `
def _chk(ns, bag, name, want):
    got = need(ns, "find_item")(list(bag), name)
    if got != want:
        raise AssertionError(f"find_item({short(bag)}, {name!r}) returned {got}, expected {want}.")

BAG = ["passport", "socks", "toothbrush", "charger", "camera", "hat"]
def t_mid(ns): _chk(ns, BAG, "charger", 3)
def t_first(ns): _chk(ns, BAG, "passport", 0)
def t_last(ns): _chk(ns, BAG, "hat", 5)
def t_missing(ns): _chk(ns, BAG, "umbrella", -1)
def t_empty(ns): _chk(ns, [], "charger", -1)
def t_perf(ns): _chk(ns, ["item%d" % i for i in range(2000)], "item1999", 1999)

TESTS = [
    ("finds the charger in the middle", "basic", t_mid),
    ("finds the first item", "basic", t_first),
    ("finds the last item", "edge", t_last),
    ("missing item gives -1", "edge", t_missing),
    ("empty bag", "edge", t_empty),
    ("2,000 items: one pass, about n lines", "perf", t_perf, 10000),
]
`,
      scale: {
        entry: 'find_item', sizes: [30, 300, 3000],
        gen: `def gen(n):
    return (["item%d" % i for i in range(n)], "item%d" % (n - 1))`,
        note: 'Searching for the last item. About ×10 more lines for ×10 more items: the cost is linear.',
      },
    },
    {
      id: 'index',
      title: 'Labelled pouches: build an index',
      entry: 'find_indexed',
      brief: `Pay a little once, save a lot every time: build a <b>dictionary</b> from item name to position, then look
        items up with no loop at all. Fill in both blanks, then open <b>Scale it up</b> and compare with level 1.`,
      hints: ['In the loop: <code>index[bag[i]] = i</code>.', 'Lookup: <code>return index.get(name, -1)</code>.'],
      starter: `def build_index(bag):
    """Return a dict mapping each item name to its position."""
    index = {}
    for i in range(len(bag)):
        pass   # TODO: record where bag[i] lives
    return index

def find_indexed(index, name):
    """Return the position of name, or -1. No loop allowed."""
    return -1   # TODO: one dictionary lookup
`,
      reflect: 'In one sentence: what did you pay up front to make every later lookup cost one step?',
      demo: 'DEMO_ARGS = ({"passport": 0, "socks": 1, "charger": 2}, "charger")',
      viz: { pointers: [], lists: [] },
      tests: `
BAG = ["passport", "socks", "toothbrush", "charger", "camera", "hat"]
def t_build(ns):
    idx = need(ns, "build_index")(list(BAG))
    if idx != {n: i for i, n in enumerate(BAG)}:
        raise AssertionError(f"build_index returned {short(idx)}.")
def t_find(ns):
    idx = need(ns, "build_index")(list(BAG))
    got = need(ns, "find_indexed")(idx, "charger")
    if got != 3:
        raise AssertionError(f"find_indexed(..., 'charger') returned {got}, expected 3.")
def t_missing(ns):
    idx = need(ns, "build_index")(list(BAG))
    if need(ns, "find_indexed")(idx, "umbrella") != -1:
        raise AssertionError("A missing item should give -1.")
def t_perf(ns):
    idx = {"item%d" % i: i for i in range(5000)}
    need(ns, "find_indexed")(idx, "item4999")
def t_build_perf(ns):
    need(ns, "build_index")(["item%d" % i for i in range(3000)])

TESTS = [
    ("build_index maps names to positions", "basic", t_build),
    ("find_indexed finds the charger", "basic", t_find),
    ("missing item gives -1", "edge", t_missing),
    ("a lookup among 5,000 items takes under 5 lines", "perf", t_perf, 5),
    ("building the index is one pass", "perf", t_build_perf, 20000),
]
`,
      scale: {
        entry: 'find_indexed', sizes: [30, 300, 3000],
        gen: `def gen(n):
    return ({"item%d" % i: i for i in range(n)}, "item%d" % (n - 1))`,
        note: 'The count does not move as the bag grows: constant cost per lookup.',
      },
    },
  ],
};
