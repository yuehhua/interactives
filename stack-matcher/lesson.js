window.LESSON = {
  id: 'stack-matcher',
  title: 'Stacks: Matching Brackets and Back Buttons',
  topic: 'Stacks and queues',
  intro: `A <b>stack</b> is last-in, first-out: the browser's Back button, the undo history, and the check that
    every <code>(</code> is closed by the right <code>)</code> in the right order. Only the top is ever touched.`,
  levels: [
    {
      id: 'match',
      title: 'Match the brackets',
      entry: 'is_balanced',
      brief: `Fill in the two blanks: <b>push</b> every opener, and for every closer <b>pop</b> the stack and compare.
        Step through <code>"([{}])"</code> and watch the stack grow, then shrink.`,
      hints: ['Opener: <code>stack.append(ch)</code>.', 'Closer: if the stack is empty or <code>stack.pop() != PAIRS[ch]</code>, return False.'],
      starter: `PAIRS = {")": "(", "]": "[", "}": "{"}

def is_balanced(text):
    """True if every bracket is closed by its partner, in the right order."""
    stack = []
    for ch in text:
        if ch in "([{":
            pass   # TODO: remember the opener
        elif ch in PAIRS:
            pass   # TODO: the top of the stack must be this closer's partner; pop it, or return False
    return len(stack) == 0
`,
      reflect: 'In one sentence: why does a counter alone not work for "([)]" but a stack does?',
      demo: 'DEMO_ARGS = ("([{}])",)',
      viz: { pointers: [], lists: ['stack'] },
      tests: `
def _c(ns, s, want):
    got = need(ns, "is_balanced")(s)
    if got is not want:
        raise AssertionError(f"is_balanced({s!r}) returned {got}, expected {want}.")
def t_ok(ns): _c(ns, "([]{})", True)
def t_wrong(ns): _c(ns, "(]", False)
def t_open(ns): _c(ns, "(()", False)
def t_close_first(ns): _c(ns, ")(", False)
def t_empty(ns): _c(ns, "", True)
def t_text(ns): _c(ns, "if (a[i] > b) { f(x); }", True)
def t_interleave(ns): _c(ns, "([)]", False)
def t_perf(ns): _c(ns, "()" * 1500, True)

TESTS = [
    ("nested brackets match", "basic", t_ok),
    ("wrong partner", "basic", t_wrong),
    ("unclosed opener", "edge", t_open),
    ("closer before opener", "edge", t_close_first),
    ("empty text", "edge", t_empty),
    ("brackets inside ordinary code", "edge", t_text),
    ("interleaved pairs", "edge", t_interleave),
    ("3,000 characters in O(n) lines", "perf", t_perf, 40000),
]
`,
    },
    {
      id: 'history',
      title: 'Bug hunt: the Forward button that lies',
      entry: 'browse',
      brief: `A browser keeps two stacks: pages behind you and pages ahead. This one works until you go back and then
        visit a new page: <b>Forward</b> still jumps to the old page. Change <b>one line</b>
        (or add one). Step through <code>a, b, back, c, forward</code>.`,
      hints: ['After a fresh visit, can you still go forward to a page from a different timeline?', 'Clear <code>forward_stack</code> in <code>visit</code>.'],
      starter: `def visit(state, page):
    back_stack = state["back"]
    back_stack.append(state["current"])
    state["current"] = page

def back(state):
    back_stack, forward_stack = state["back"], state["forward"]
    if back_stack:
        forward_stack.append(state["current"])
        state["current"] = back_stack.pop()

def forward(state):
    back_stack, forward_stack = state["back"], state["forward"]
    if forward_stack:
        back_stack.append(state["current"])
        state["current"] = forward_stack.pop()

def browse(actions):
    """Run actions like "visit:a", "back", "forward"; return the current page."""
    state = {"back": [], "forward": [], "current": "home"}
    for act in actions:
        if act == "back":
            back(state)
        elif act == "forward":
            forward(state)
        else:
            visit(state, act.split(":")[1])
    return state["current"]
`,
      reflect: 'In one sentence: why is it correct to discard the forward stack when you visit something new?',
      demo: 'DEMO_ARGS = (["visit:a", "visit:b", "back", "visit:c", "forward"],)',
      viz: { pointers: [], lists: ['back_stack', 'forward_stack'] },
      tests: `
def _c(ns, acts, want):
    got = need(ns, "browse")(acts)
    if got != want:
        raise AssertionError(f"browse({acts}) ended on {got!r}, expected {want!r}.")
def t_walk(ns): _c(ns, ["visit:a", "visit:b", "visit:c"], "c")
def t_back(ns): _c(ns, ["visit:a", "visit:b", "back"], "a")
def t_fwd(ns): _c(ns, ["visit:a", "visit:b", "back", "forward"], "b")
def t_start(ns): _c(ns, ["back", "forward"], "home")
def t_branch(ns): _c(ns, ["visit:a", "visit:b", "back", "visit:c", "forward"], "c")
def t_branch_back(ns): _c(ns, ["visit:a", "visit:b", "back", "visit:c", "back", "forward"], "c")

TESTS = [
    ("visit moves forward in time", "basic", t_walk),
    ("back returns to the previous page", "basic", t_back),
    ("forward undoes back", "basic", t_fwd),
    ("back and forward at the start do nothing", "edge", t_start),
    ("a new visit clears the forward history", "edge", t_branch),
    ("back then forward after a new branch", "edge", t_branch_back),
]
`,
    },
  ],
};
