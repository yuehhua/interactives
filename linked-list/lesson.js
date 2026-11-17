window.LESSON = {
  id: 'linked-list',
  title: 'Linked Lists: The Ward-Round List',
  topic: 'Linked lists',
  intro: `A ward-round list changes all day: patients arrive, patients are discharged. In an array every change shifts
    its neighbours; in a <b>linked list</b> each node just holds a pointer to the next one, so you re-wire two
    pointers and you are done. The price: to reach a node you must follow the pointers from the head.`,
  levels: [
    {
      id: 'edit',
      title: 'Append and delete',
      entry: 'rounds_demo',
      brief: `<code>Node</code> and the demo harness are given. Fill in the two blanks: <b>link the new node</b> after
        the last one in <code>append</code>, and <b>skip over</b> the target in <code>delete</code>. In the visualizer,
        the labels under the boxes show which variable points at which node.`,
      hints: ['Append: <code>cur.next = node</code>.', 'Delete: if <code>cur.next</code> exists, <code>cur.next = cur.next.next</code>.'],
      starter: `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def append(head, val):
    """Add val at the tail; return the (possibly new) head."""
    node = Node(val)
    if head is None:
        return node
    cur = head
    while cur.next is not None:
        cur = cur.next
    pass   # TODO: link the new node after cur
    return head

def delete(head, val):
    """Remove the first node holding val; return the (possibly new) head."""
    if head is None:
        return None
    if head.val == val:
        return head.next
    cur = head
    while cur.next is not None and cur.next.val != val:
        cur = cur.next
    pass   # TODO: if cur.next exists, skip over it
    return head

def to_list(head):
    out = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out

def rounds_demo(values, discharged):
    head = None
    for v in values:
        head = append(head, v)
    head = delete(head, discharged)
    return to_list(head)
`,
      reflect: 'In one sentence: why is deleting a known node O(1) in a linked list but O(n) in an array?',
      demo: 'DEMO_ARGS = (["Amy", "Ben", "Cho", "Dee"], "Cho")',
      viz: { pointers: [], lists: [] },
      tests: `
def _build(ns, vals):
    ap = need(ns, "append"); head = None
    for v in vals:
        head = ap(head, v)
    return head
def _delete(ns, vals, v, want):
    head = _build(ns, vals)
    got = need(ns, "to_list")(need(ns, "delete")(head, v))
    if got != want:
        raise AssertionError(f"After deleting {v!r} from {vals} the list is {got}, expected {want}.")

def t_append(ns):
    got = need(ns, "to_list")(_build(ns, [1, 2, 3, 4]))
    if got != [1, 2, 3, 4]:
        raise AssertionError(f"Appending 1, 2, 3, 4 gave {got}.")
def t_mid(ns): _delete(ns, [1, 2, 3, 4], 3, [1, 2, 4])
def t_head(ns): _delete(ns, [1, 2, 3], 1, [2, 3])
def t_tail(ns): _delete(ns, [1, 2, 3], 3, [1, 2])
def t_missing(ns): _delete(ns, [1, 2, 3], 9, [1, 2, 3])
def t_only(ns): _delete(ns, [7], 7, [])
def t_dups(ns): _delete(ns, [5, 2, 5], 5, [2, 5])
def t_demo(ns):
    got = need(ns, "rounds_demo")(["Amy", "Ben", "Cho"], "Ben")
    if got != ["Amy", "Cho"]:
        raise AssertionError(f"rounds_demo returned {got}.")

TESTS = [
    ("append builds the list in order", "basic", t_append),
    ("delete a middle node", "basic", t_mid),
    ("delete the head", "edge", t_head),
    ("delete the tail", "edge", t_tail),
    ("delete a missing value changes nothing", "edge", t_missing),
    ("delete the only node", "edge", t_only),
    ("only the first duplicate is removed", "edge", t_dups),
    ("ward-round demo", "edge", t_demo),
]
`,
    },
    {
      id: 'reverse',
      title: 'Reverse it: the three-pointer dance',
      entry: 'reverse_demo',
      brief: `Reverse the list <b>in place</b> by flipping each pointer to look backwards. Fill in the two blanks.
        Step through and watch <code>prev</code>, <code>cur</code> and <code>nxt</code> walk down the list: <code>nxt</code>
        exists only so you do not lose the rest when you flip <code>cur.next</code>.`,
      hints: ['Point cur backwards: <code>cur.next = prev</code>.', 'Then slide: <code>prev = cur</code> (and <code>cur = nxt</code> is given).'],
      starter: `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def reverse(head):
    """Reverse the list in place; return the new head."""
    prev = None
    cur = head
    while cur is not None:
        nxt = cur.next
        pass   # TODO: point cur backwards, at prev
        pass   # TODO: move prev forward to cur
        cur = nxt
    return prev

def from_list(vals):
    head = None
    for v in reversed(vals):
        head = Node(v, head)
    return head

def to_list(head):
    out = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out

def reverse_demo(values):
    return to_list(reverse(from_list(values)))
`,
      reflect: 'In one sentence: what would be lost if you set cur.next = prev before saving nxt?',
      demo: 'DEMO_ARGS = ([1, 2, 3, 4],)',
      viz: { pointers: [], lists: [] },
      tests: `
def _c(ns, vals):
    head = need(ns, "from_list")(list(vals))
    got = need(ns, "to_list")(need(ns, "reverse")(head))
    if got != list(reversed(vals)):
        raise AssertionError(f"Reversing {vals} gave {got}.")
def t_four(ns): _c(ns, [1, 2, 3, 4])
def t_two(ns): _c(ns, [1, 2])
def t_one(ns): _c(ns, [9])
def t_empty(ns): _c(ns, [])
def t_long(ns): _c(ns, list(range(500)))

TESTS = [
    ("reverse four nodes", "basic", t_four),
    ("two nodes", "edge", t_two),
    ("one node", "edge", t_one),
    ("empty list", "edge", t_empty),
    ("500 nodes in one pass", "perf", t_long, 20000),
]
`,
    },
  ],
};
