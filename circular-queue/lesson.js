window.LESSON = {
  id: 'circular-queue',
  title: 'Queues: The Circular Ticket Buffer',
  topic: 'Stacks and queues',
  intro: `A hospital hands out waiting-room tickets first-come, first-served. A fixed array can hold the queue if
    <code>head</code> and <code>tail</code> are allowed to <b>wrap around</b> the end like a clock: when the array
    is not full, there is always a free slot somewhere.`,
  levels: [
    {
      id: 'enqueue',
      title: 'Wrap the tail around',
      entry: 'ticket_demo',
      brief: `<code>dequeue</code> is given. Fill in the one blank in <code>enqueue</code>: the <b>tail slot</b>
        wraps around the array with a modulo. Step through the demo <code>eeedeeddd</code> (e = take a ticket, d = serve one).`,
      hints: ['Tail slot = <code>(head + size) % len(data)</code>.'],
      starter: `def make_queue(cap):
    return {"data": [None] * cap, "head": 0, "size": 0}

def enqueue(q, x):
    """Add x at the tail. Return False if the queue is full."""
    data, head = q["data"], q["head"]
    if q["size"] == len(data):
        return False
    tail = head + q["size"]     # TODO: wrap around the end of the array
    data[tail] = x
    q["size"] += 1
    return True

def dequeue(q):
    """Remove and return the front item, or None if empty."""
    data = q["data"]
    if q["size"] == 0:
        return None
    x = data[q["head"]]
    q["head"] = (q["head"] + 1) % len(data)
    q["size"] -= 1
    return x

def ticket_demo(cap, ops):
    """e = take the next ticket number, d = serve one. Return what was served."""
    q, nxt, served = make_queue(cap), 1, []
    for op in ops:
        if op == "e":
            if enqueue(q, nxt):
                nxt += 1
        else:
            served.append(dequeue(q))
    return served
`,
      reflect: 'In one sentence: why can the queue be "full" even though slots at the start of the array are free, unless you wrap around?',
      demo: 'DEMO_ARGS = (3, "eeedeeddd")',
      viz: { pointers: ['head', 'tail'], lists: ['data'] },
      tests: `
def t_fifo(ns):
    q = need(ns, "make_queue")(4); e = need(ns, "enqueue"); d = need(ns, "dequeue")
    for x in (1, 2, 3):
        e(q, x)
    got = [d(q), d(q), d(q)]
    if got != [1, 2, 3]:
        raise AssertionError(f"Dequeued {got}, expected [1, 2, 3].")
def t_full(ns):
    q = need(ns, "make_queue")(2); e = need(ns, "enqueue")
    r = [e(q, 1), e(q, 2), e(q, 3)]
    if r != [True, True, False]:
        raise AssertionError(f"enqueue results were {r}, expected [True, True, False].")
def t_empty(ns):
    if need(ns, "dequeue")(need(ns, "make_queue")(3)) is not None:
        raise AssertionError("Dequeue on an empty queue should return None.")
def t_wrap(ns):
    got = need(ns, "ticket_demo")(3, "eeedeeddd")
    if got != [1, 2, 3, 4]:
        raise AssertionError(f"ticket_demo(3, 'eeedeeddd') returned {got}, expected [1, 2, 3, 4].")
def t_long(ns):
    got = need(ns, "ticket_demo")(3, "ed" * 50)
    if got != list(range(1, 51)):
        raise AssertionError("Serving one ticket at a time forever should give 1, 2, 3, ...")

TESTS = [
    ("first in, first out", "basic", t_fifo),
    ("full queue refuses a ticket", "basic", t_full),
    ("empty queue returns None", "edge", t_empty),
    ("wrap-around keeps order (eeedeeddd)", "edge", t_wrap),
    ("100 operations on 3 slots", "edge", t_long, 20000),
]
`,
    },
    {
      id: 'dequeue',
      title: 'Bug hunt: the head that runs off the end',
      entry: 'ticket_demo',
      brief: `The queue works for a while and then crashes with an <b>IndexError</b>: <code>enqueue</code> wraps, but
        <code>dequeue</code> advances the head without wrapping. Change <b>one line</b>.`,
      hints: ['Compare how the two functions move their index.', 'Head advance: <code>(head + 1) % len(data)</code>.'],
      starter: `def make_queue(cap):
    return {"data": [None] * cap, "head": 0, "size": 0}

def enqueue(q, x):
    data, head = q["data"], q["head"]
    if q["size"] == len(data):
        return False
    tail = (head + q["size"]) % len(data)
    data[tail] = x
    q["size"] += 1
    return True

def dequeue(q):
    data = q["data"]
    if q["size"] == 0:
        return None
    x = data[q["head"]]
    q["head"] += 1                       # <- something is off here
    q["size"] -= 1
    return x

def ticket_demo(cap, ops):
    q, nxt, served = make_queue(cap), 1, []
    for op in ops:
        if op == "e":
            if enqueue(q, nxt):
                nxt += 1
        else:
            served.append(dequeue(q))
    return served
`,
      reflect: 'In one sentence: which two indices must wrap, and why does the size count make full vs. empty unambiguous?',
      demo: 'DEMO_ARGS = (3, "eeedeeddd")',
      viz: { pointers: ['head', 'tail'], lists: ['data'] },
      tests: `
def _c(ns, cap, ops, want):
    got = need(ns, "ticket_demo")(cap, ops)
    if got != want:
        raise AssertionError(f"ticket_demo({cap}, {ops!r}) returned {got}, expected {want}.")
def t_short(ns): _c(ns, 4, "eeedd", [1, 2])
def t_wrap(ns): _c(ns, 3, "eeedeeddd", [1, 2, 3, 4])
def t_long(ns): _c(ns, 3, "ed" * 50, list(range(1, 51)))
def t_empty(ns): _c(ns, 2, "dd", [None, None])

TESTS = [
    ("a short run without wrapping", "basic", t_short),
    ("the empty queue serves nobody", "basic", t_empty),
    ("wrap-around (eeedeeddd)", "edge", t_wrap),
    ("100 operations on 3 slots", "edge", t_long, 20000),
]
`,
    },
  ],
};
