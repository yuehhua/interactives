window.LESSON = {
  id: 'huffman-coding',
  title: 'Huffman Coding: Merge the Two Rarest',
  topic: 'Greedy algorithms',
  intro: `A disk array of sequencing logs is filling up. Letters that appear often should get short codewords, rare
    ones long codewords, and no codeword may be the prefix of another. <b>Huffman's greedy rule</b> builds the best
    such code: repeatedly merge the two rarest items. Here a <b>leaf</b> is a character (a string) and an
    <b>internal node</b> is a <code>(left, right)</code> pair.`,
  levels: [
    {
      id: 'build',
      title: 'Build the tree',
      entry: 'build_tree',
      brief: `The min-priority queue (<code>heapq</code>) is set up for you. Fill in the two blanks of the greedy
        loop: <b>pop the second-rarest</b> item, then <b>push the merged node</b> back. Step through the demo and
        watch the four letters collapse into one tree.`,
      hints: [
        'Heap items are <code>(frequency, tie, node)</code>. The tie counter keeps Python from ever comparing two nodes.',
        'Pop: <code>y = heapq.heappop(heap)</code>.',
        'Push: <code>heapq.heappush(heap, (x[0] + y[0], tie, (x[2], y[2])))</code>.',
      ],
      starter: `import heapq

def build_tree(freqs):
    """Return the root of the Huffman tree for a {char: frequency} dict."""
    heap = [(f, i, ch) for i, (ch, f) in enumerate(sorted(freqs.items()))]
    heapq.heapify(heap)
    tie = len(heap)                     # breaks ties between equal frequencies
    while len(heap) > 1:
        x = heapq.heappop(heap)         # the rarest item
        y = None                        # TODO: pop the next rarest
        pass                             # TODO: push the merged node back
        tie += 1
    return heap[0][2]
`,
      reflect: 'In one sentence: why does merging the two rarest first put the rare letters deepest in the tree?',
      demo: 'DEMO_ARGS = ({"A": 45, "T": 35, "C": 12, "G": 8},)',
      viz: { pointers: ['tie'], lists: ['heap'] },
      tests: `
import heapq, random

def leaves(node, depth=0):
    if isinstance(node, str):
        yield node, depth
    else:
        yield from leaves(node[0], depth + 1)
        yield from leaves(node[1], depth + 1)

def ref_cost(freqs):
    h = list(freqs.values()); heapq.heapify(h); total = 0
    while len(h) > 1:
        a = heapq.heappop(h); b = heapq.heappop(h); total += a + b; heapq.heappush(h, a + b)
    return total

def _check(ns, freqs):
    f = need(ns, "build_tree")
    tree = f(dict(freqs))
    ls = list(leaves(tree))
    if sorted(c for c, _ in ls) != sorted(freqs):
        raise AssertionError(f"Every character must be exactly one leaf. Leaves found: {short(sorted(c for c, _ in ls))}.")
    cost = sum(freqs[c] * d for c, d in ls)
    want = ref_cost(freqs)
    if cost != want:
        raise AssertionError(f"The tree costs {cost} bits in total; the optimal Huffman tree costs {want}.")

def t_lecture(ns): _check(ns, {"A": 45, "T": 35, "C": 12, "G": 8})
def t_two(ns): _check(ns, {"a": 1, "b": 1})
def t_one(ns):
    tree = need(ns, "build_tree")({"a": 5})
    if tree != "a":
        raise AssertionError(f"One letter: the tree is just that leaf, 'a'. Got {short(tree)}.")
def t_flat(ns): _check(ns, {c: 10 for c in "abcdefgh"})
def t_clrs(ns): _check(ns, {"a": 45, "b": 13, "c": 12, "d": 16, "e": 9, "f": 5})
def t_random(ns):
    rng = random.Random(3)
    _check(ns, {chr(97 + i): rng.randint(1, 50) for i in range(20)})
def t_perf(ns):
    rng = random.Random(4)
    _check(ns, {"c%d" % i: rng.randint(1, 1000) for i in range(300)})

TESTS = [
    ("lecture example (A, T, C, G)", "basic", t_lecture),
    ("CLRS Figure 16.3 frequencies", "basic", t_clrs),
    ("two letters", "edge", t_two),
    ("one letter is just a leaf", "edge", t_one),
    ("equal frequencies: a balanced tree", "edge", t_flat),
    ("20 random frequencies match the optimum", "edge", t_random),
    ("300 symbols in O(n log n) lines", "perf", t_perf, 100000),
]
`,
    },
    {
      id: 'codec',
      title: 'Read codes off the tree, decode the bits',
      entry: 'huffman_round_trip',
      brief: `Tree building is given. Fill in the two blanks: <b>walk the tree</b> to record each letter's codeword
        (left is <code>"0"</code>, right is <code>"1"</code>), and <b>decode</b> a bit string by walking from the root
        and restarting at every leaf. The test is brutal and fair: <b>lossless or it does not count</b>.`,
      hints: [
        'In <code>walk</code>: <code>walk(node[0], prefix + "0")</code> then <code>walk(node[1], prefix + "1")</code>.',
        'In <code>decode</code>: <code>node = node[0] if bit == "0" else node[1]</code>.',
      ],
      starter: `import heapq

def build_tree(freqs):
    heap = [(f, i, ch) for i, (ch, f) in enumerate(sorted(freqs.items()))]
    heapq.heapify(heap)
    tie = len(heap)
    while len(heap) > 1:
        x = heapq.heappop(heap)
        y = heapq.heappop(heap)
        heapq.heappush(heap, (x[0] + y[0], tie, (x[2], y[2])))
        tie += 1
    return heap[0][2]

def make_codes(root):
    """Return {char: codeword string}."""
    table = {}
    def walk(node, prefix):
        if isinstance(node, str):
            table[node] = prefix or "0"     # a lone letter still needs one bit
        else:
            pass   # TODO: walk left with prefix + "0", right with prefix + "1"
    walk(root, "")
    return table

def encode(text, codes):
    return "".join(codes[ch] for ch in text)

def decode(bits, root):
    """Walk from the root; at each leaf emit its character and restart."""
    out, node = [], root
    for bit in bits:
        node = root   # TODO: step left on "0", right on "1"
        if isinstance(node, str):
            out.append(node)
            node = root
    return "".join(out)

def huffman_round_trip(text):
    freqs = {}
    for ch in text:
        freqs[ch] = freqs.get(ch, 0) + 1
    root = build_tree(freqs)
    codes = make_codes(root)
    bits = encode(text, codes)
    return decode(bits, root), len(bits)
`,
      reflect: 'In one sentence: why can the decoder restart at the root after every leaf without any separator between codewords?',
      demo: 'DEMO_ARGS = ("abracadabra",)',
      viz: { pointers: [], lists: ['out'] },
      tests: `
import random

LECTURE = {"A": 45, "T": 35, "C": 12, "G": 8}
TEXT = ("these codes are no accident. a letter that is used a lot earns a "
        "short path. a rare letter sits deep in the tree. this trade is the "
        "idea in the tool that reduces the data. the used ones ride near "
        "the top.")

def t_codes(ns):
    codes = need(ns, "make_codes")(need(ns, "build_tree")(dict(LECTURE)))
    lens = {c: len(w) for c, w in codes.items()}
    if lens != {"A": 1, "T": 2, "C": 3, "G": 3}:
        raise AssertionError(f"Codeword lengths are {lens}; expected A:1, T:2, C:3, G:3.")
    ws = list(codes.values())
    if any(a != b and b.startswith(a) for a in ws for b in ws):
        raise AssertionError(f"Not prefix-free: {codes}.")
def t_lone(ns):
    codes = need(ns, "make_codes")(need(ns, "build_tree")({"a": 5}))
    if codes != {"a": "0"}:
        raise AssertionError(f"A single letter should get the code '0'; got {codes}.")
def _rt(ns, text, bits=None):
    got, n = need(ns, "huffman_round_trip")(text)
    if got != text:
        raise AssertionError(f"Decoded {short(got)} but the original was {short(text)}.")
    if bits is not None and n != bits:
        raise AssertionError(f"Encoded length is {n} bits; the optimal Huffman code needs {bits}.")
def t_abra(ns): _rt(ns, "abracadabra", 23)
def t_lab(ns): _rt(ns, TEXT, 733)
def t_lone_text(ns): _rt(ns, "aaaa", 4)
def t_perf(ns):
    rng = random.Random(1)
    _rt(ns, "".join(rng.choice("etaoin shrdlu") for _ in range(2000)))

TESTS = [
    ("codeword lengths for the lecture example", "basic", t_codes),
    ("round trip: abracadabra", "basic", t_abra),
    ("a single letter gets '0'", "edge", t_lone),
    ("one repeated letter round-trips", "edge", t_lone_text),
    ("204-character lab text: 733 bits, lossless", "edge", t_lab, 200000),
    ("2,000 characters in O(n) lines", "perf", t_perf, 300000),
]
`,
    },
  ],
};
