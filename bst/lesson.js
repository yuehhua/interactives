window.LESSON = {
  id: 'bst',
  title: 'Binary Search Trees: Grow and Walk',
  topic: 'Trees and search trees',
  intro: `A <b>binary search tree</b> keeps smaller keys to the left and larger keys to the right of every node, so a
    search follows one path instead of scanning everything. Inserting grows the tree one leaf at a time; walking it in
    the right order reads the keys back sorted.`,
  levels: [
    {
      id: 'insert',
      title: 'Insert keys',
      entry: 'build_bst',
      brief: `<code>Node</code> and the loop that inserts every key are given. Fill in the two recursive calls: send the key
        <b>left</b> if it is smaller and <b>right</b> if it is larger. Step through and watch the labels show which node
        each variable points at.`,
      hints: ['Left: <code>root.left = insert(root.left, key)</code>.', 'Right: <code>root.right = insert(root.right, key)</code>.'],
      starter: `class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None

def insert(root, key):
    """Insert key into the BST; return the (possibly new) root."""
    if root is None:
        return Node(key)
    if key < root.key:
        pass   # TODO: insert into the left subtree
    elif key > root.key:
        pass   # TODO: insert into the right subtree
    return root

def build_bst(keys):
    root = None
    for k in keys:
        root = insert(root, k)
    return root
`,
      reflect: 'In one sentence: what shape does the tree take if you insert already-sorted keys, and what does that cost a search?',
      demo: 'DEMO_ARGS = ([8, 3, 10, 1, 6, 14, 4],)',
      viz: { pointers: [], lists: [] },
      tests: `
def inorder(n):
    return [] if n is None else inorder(n.left) + [n.key] + inorder(n.right)
def height(n):
    return 0 if n is None else 1 + max(height(n.left), height(n.right))
def _build(ns, keys):
    return need(ns, "build_bst")(list(keys))
def t_order(ns):
    got = inorder(_build(ns, [8, 3, 10, 1, 6, 14, 4, 7, 13]))
    if got != [1, 3, 4, 6, 7, 8, 10, 13, 14]:
        raise AssertionError(f"In-order keys are {got}; a BST should read back sorted.")
def t_shape(ns):
    r = _build(ns, [8, 3, 10, 1, 6])
    if r.key != 8 or r.left.key != 3 or r.right.key != 10 or r.left.left.key != 1 or r.left.right.key != 6:
        raise AssertionError("Wrong shape: 8 should have children 3 and 10; 3 should have children 1 and 6.")
def t_empty(ns):
    if _build(ns, []) is not None:
        raise AssertionError("An empty key list gives an empty tree (None).")
def t_dups(ns):
    got = inorder(_build(ns, [5, 3, 5, 3, 8]))
    if got != [3, 5, 8]:
        raise AssertionError(f"Duplicates should be ignored; in-order keys are {got}.")
def t_chain(ns):
    r = _build(ns, [1, 2, 3, 4, 5])
    if height(r) != 5:
        raise AssertionError(f"Sorted input should make a chain of height 5; height is {height(r)}.")
def t_random(ns):
    import random
    rng = random.Random(1); ks = rng.sample(range(1000), 200)
    if inorder(_build(ns, ks)) != sorted(ks):
        raise AssertionError("200 random keys do not read back sorted.")

TESTS = [
    ("in-order keys come back sorted", "basic", t_order),
    ("tree shape for 8, 3, 10, 1, 6", "basic", t_shape),
    ("empty input", "edge", t_empty),
    ("duplicates are ignored", "edge", t_dups),
    ("sorted input makes a chain", "edge", t_chain),
    ("200 random keys", "edge", t_random, 100000),
]
`,
    },
    {
      id: 'walk',
      title: 'Walk it three ways',
      entry: 'traversals',
      brief: `Pre-order visits the node <i>first</i>, in-order visits it <i>between</i> its subtrees, post-order visits it
        <i>last</i>. Fill in the three blanks: only the <b>position of one line</b> changes. The in-order walk should
        print the keys sorted.`,
      hints: [
        'Pre-order: <code>out.append(node.key)</code>, then left, then right.',
        'In-order: left, <code>out.append(node.key)</code>, then right.',
        'Post-order: left, right, then <code>out.append(node.key)</code>.',
      ],
      starter: `class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None

def insert(root, key):
    if root is None:
        return Node(key)
    if key < root.key:
        root.left = insert(root.left, key)
    elif key > root.key:
        root.right = insert(root.right, key)
    return root

def build_bst(keys):
    root = None
    for k in keys:
        root = insert(root, k)
    return root

def preorder(node, out):
    if node is None:
        return
    pass   # TODO: visit the node, then the left subtree, then the right

def inorder(node, out):
    if node is None:
        return
    pass   # TODO: left subtree, then visit the node, then the right

def postorder(node, out):
    if node is None:
        return
    pass   # TODO: left subtree, then right subtree, then visit the node

def traversals(keys):
    root = build_bst(keys)
    pre, ino, post = [], [], []
    preorder(root, pre)
    inorder(root, ino)
    postorder(root, post)
    return pre, ino, post
`,
      reflect: 'In one sentence: why does the in-order walk of a BST always give sorted output?',
      demo: 'DEMO_ARGS = ([4, 2, 6, 1, 3],)',
      viz: { pointers: [], lists: ['out'] },
      tests: `
KEYS = [8, 3, 10, 1, 6, 14, 4, 7, 13]
def _c(ns, which, want):
    pre, ino, post = need(ns, "traversals")(list(KEYS))
    got = {"pre": pre, "in": ino, "post": post}[which]
    if got != want:
        raise AssertionError(f"The {which}-order walk is {got}, expected {want}.")
def t_in(ns): _c(ns, "in", [1, 3, 4, 6, 7, 8, 10, 13, 14])
def t_pre(ns): _c(ns, "pre", [8, 3, 1, 6, 4, 7, 10, 14, 13])
def t_post(ns): _c(ns, "post", [1, 4, 7, 6, 3, 13, 14, 10, 8])
def t_empty(ns):
    if need(ns, "traversals")([]) != ([], [], []):
        raise AssertionError("An empty tree has empty walks.")
def t_perf(ns):
    pre, ino, post = need(ns, "traversals")(list(range(1, 201)) )
    if ino != list(range(1, 201)):
        raise AssertionError("In-order of a chain should be 1..200.")

TESTS = [
    ("in-order is sorted", "basic", t_in),
    ("pre-order", "basic", t_pre),
    ("post-order", "basic", t_post),
    ("empty tree", "edge", t_empty),
    ("a 200-node chain (deep recursion)", "perf", t_perf, 200000),
]
`,
    },
  ],
};
