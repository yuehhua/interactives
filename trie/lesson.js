window.LESSON = {
  id: 'trie',
  title: 'Tries: Autocomplete for Gene Names',
  topic: 'Trees and search trees',
  intro: `Type "BRC" and a search box suggests <code>BRCA1</code> and <code>BRCA2</code> instantly. A <b>trie</b> stores
    words letter by letter along tree paths, so all words sharing a prefix share a path, and finding everything under a
    prefix means walking to one node and listing its subtree. Time depends on the word length, not on how many words are stored.`,
  levels: [
    {
      id: 'insert',
      title: 'Insert and look up words',
      entry: 'build_trie',
      brief: `Each node keeps a dict of children and a flag <code>is_end</code> that says "a word finishes here".
        Fill in two blanks: <b>create the missing child</b> when inserting, and make <code>contains</code> check the
        <b>end flag</b> (a prefix of a word is not a word).`,
      hints: ['Create: <code>node.children[ch] = TrieNode()</code>.', 'Lookup result: <code>return node.is_end</code>.'],
      starter: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def insert(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            pass   # TODO: create a child node for ch
        node = node.children[ch]
    node.is_end = True

def contains(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            return False
        node = node.children[ch]
    return False   # TODO: a word is present only if a word ends here

def build_trie(words):
    root = TrieNode()
    for w in words:
        insert(root, w)
    return root
`,
      reflect: 'In one sentence: how many steps does looking up a 6-letter word take with 1 word stored, and with 1,000,000?',
      demo: 'DEMO_ARGS = (["tai", "taipei", "tea"],)',
      viz: { pointers: [], lists: [] },
      tests: `
WORDS = ["tai", "taipei", "taiwan", "tea", "ten"]
def _t(ns, words=WORDS):
    return need(ns, "build_trie")(list(words))
def t_words(ns):
    r = _t(ns); c = need(ns, "contains")
    for w in WORDS:
        if not c(r, w):
            raise AssertionError(f"contains(..., {w!r}) returned False after inserting it.")
def t_prefix(ns):
    if need(ns, "contains")(_t(ns), "ta"):
        raise AssertionError("'ta' is only a prefix, not an inserted word.")
def t_missing(ns):
    if need(ns, "contains")(_t(ns), "taiwanese"):
        raise AssertionError("'taiwanese' was never inserted.")
def t_empty(ns):
    if need(ns, "contains")(_t(ns, []), "a"):
        raise AssertionError("An empty trie contains nothing.")
def t_genes(ns):
    g = ["BRCA1", "BRCA2", "TP53", "BRAF"]; r = _t(ns, g); c = need(ns, "contains")
    if not all(c(r, x) for x in g) or c(r, "BRC") or c(r, "BRCA3"):
        raise AssertionError("Gene-name lookups are wrong.")

TESTS = [
    ("every inserted word is found", "basic", t_words),
    ("a prefix is not a word", "basic", t_prefix),
    ("an uninserted longer word", "edge", t_missing),
    ("empty trie", "edge", t_empty),
    ("gene names", "edge", t_genes),
]
`,
    },
    {
      id: 'autocomplete',
      title: 'Autocomplete everything under a prefix',
      entry: 'complete_demo',
      brief: `The trie from level 1 is given. Fill in the one blank: <b>recurse into each child</b>, extending the path
        by its letter. Children are visited in sorted order, so suggestions come out alphabetically.`,
      hints: ['<code>collect(node.children[ch], path + ch, out)</code>.'],
      starter: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def insert(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_end = True

def collect(node, path, out):
    """Append every word at or below node to out (alphabetical)."""
    if node.is_end:
        out.append(path)
    for ch in sorted(node.children):
        pass   # TODO: recurse into the child, extending the path by ch

def complete(root, prefix):
    node = root
    for ch in prefix:
        if ch not in node.children:
            return []
        node = node.children[ch]
    out = []
    collect(node, prefix, out)
    return out

def complete_demo(words, prefix):
    root = TrieNode()
    for w in words:
        insert(root, w)
    return complete(root, prefix)
`,
      reflect: 'In one sentence: what dominates the cost of autocomplete: the prefix length or the number of suggestions?',
      demo: 'DEMO_ARGS = (["tai", "taipei", "taiwan", "tea", "ten"], "tai")',
      viz: { pointers: [], lists: ['out'] },
      tests: `
WORDS = ["tai", "taipei", "taiwan", "tain", "tea", "ten"]
def _c(ns, words, prefix, want):
    got = need(ns, "complete_demo")(list(words), prefix)
    if got != want:
        raise AssertionError(f"complete({prefix!r}) returned {got}, expected {want}.")
def t_tai(ns): _c(ns, WORDS, "tai", ["tai", "tain", "taipei", "taiwan"])
def t_te(ns): _c(ns, WORDS, "te", ["tea", "ten"])
def t_all(ns): _c(ns, WORDS, "", ["tai", "tain", "taipei", "taiwan", "tea", "ten"])
def t_none(ns): _c(ns, WORDS, "x", [])
def t_exact(ns): _c(ns, WORDS, "taiwan", ["taiwan"])
def t_genes(ns): _c(ns, ["BRCA1", "BRCA2", "TP53", "BRAF"], "BR", ["BRAF", "BRCA1", "BRCA2"])
def t_perf(ns):
    words = ["w%04d" % i for i in range(500)]
    _c(ns, words, "w00", ["w%04d" % i for i in range(100)])

TESTS = [
    ("suggestions for 'tai'", "basic", t_tai),
    ("suggestions for 'te'", "basic", t_te),
    ("empty prefix lists everything", "edge", t_all),
    ("no word starts with 'x'", "edge", t_none),
    ("prefix equal to a whole word", "edge", t_exact),
    ("gene names", "edge", t_genes),
    ("500 words stored, 100 suggested", "perf", t_perf, 100000),
]
`,
    },
  ],
};
