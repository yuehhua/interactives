window.MANIFEST = [
  {
    "id": "lookup-cost",
    "path": "lookup-cost/",
    "topic": "Introduction",
    "title": "Why Structure Matters: Finding the Charger",
    "blurb": "Count the steps of searching a loose bag versus a labelled one, and watch the gap grow with size.",
    "levelIds": [
      "scan",
      "index"
    ]
  },
  {
    "id": "dynamic-array",
    "path": "dynamic-array/",
    "topic": "Arrays and memory",
    "title": "Arrays: Index Formulas and Growing",
    "blurb": "Compute a cinema seat's memory address, then fix an array that grows one slot at a time.",
    "levelIds": [
      "address",
      "growth"
    ]
  },
  {
    "id": "stack-matcher",
    "path": "stack-matcher/",
    "topic": "Stacks and queues",
    "title": "Stacks: Matching Brackets and Back Buttons",
    "blurb": "Match brackets with a stack, then fix a browser whose Forward button points at the wrong timeline.",
    "levelIds": [
      "match",
      "history"
    ]
  },
  {
    "id": "circular-queue",
    "path": "circular-queue/",
    "topic": "Stacks and queues",
    "title": "Queues: The Circular Ticket Buffer",
    "blurb": "Serve waiting-room tickets first-come, first-served from a fixed array that wraps around.",
    "levelIds": [
      "enqueue",
      "dequeue"
    ]
  },
  {
    "id": "linked-list",
    "path": "linked-list/",
    "topic": "Linked lists",
    "title": "Linked Lists: The Ward-Round List",
    "blurb": "Keep a ward-round list with nodes and pointers, then reverse it with the three-pointer dance.",
    "levelIds": [
      "edit",
      "reverse"
    ]
  },
  {
    "id": "binary-search",
    "path": "binary-search/",
    "topic": "Searching",
    "title": "Binary Search: Guess the Number",
    "blurb": "Guess the number in 7 tries: write binary search, fix its infinite loop, find the first match.",
    "levelIds": [
      "fill",
      "stuck",
      "first"
    ]
  },
  {
    "id": "bst",
    "path": "bst/",
    "topic": "Trees and search trees",
    "title": "Binary Search Trees: Grow and Walk",
    "blurb": "Grow a binary search tree one key at a time, then walk it three ways.",
    "levelIds": [
      "insert",
      "walk"
    ]
  },
  {
    "id": "trie",
    "path": "trie/",
    "topic": "Trees and search trees",
    "title": "Tries: Autocomplete for Gene Names",
    "blurb": "Autocomplete gene and drug names: store words in a trie and list everything under a prefix.",
    "levelIds": [
      "insert",
      "autocomplete"
    ]
  },
  {
    "id": "bubble-sort",
    "path": "bubble-sort/",
    "topic": "Elementary sorting",
    "title": "Bubble Sort: Swap Neighbours",
    "blurb": "Swap neighbours until sorted, then make the best case linear with an early exit.",
    "levelIds": [
      "fill",
      "early-exit"
    ]
  },
  {
    "id": "insertion-sort",
    "path": "insertion-sort/",
    "topic": "Elementary sorting",
    "title": "Insertion Sort: Sort Like Playing Cards",
    "blurb": "Insert each card into the sorted part, then fix a version that breaks ties the wrong way.",
    "levelIds": [
      "fill",
      "stable"
    ]
  },
  {
    "id": "selection-sort",
    "path": "selection-sort/",
    "topic": "Elementary sorting",
    "title": "Selection Sort: Pick the Minimum",
    "blurb": "Repeatedly select the minimum, then hunt down an off-by-one that skips the last item.",
    "levelIds": [
      "fill",
      "range"
    ]
  },
  {
    "id": "merge-sort",
    "path": "merge-sort/",
    "topic": "Divide-and-conquer sorting",
    "title": "Merge Sort: Divide, Then Merge",
    "blurb": "Write the merge step that does all the work, then fix a merge that breaks ties the wrong way.",
    "levelIds": [
      "fill",
      "stable"
    ]
  },
  {
    "id": "quicksort",
    "path": "quicksort/",
    "topic": "Divide-and-conquer sorting",
    "title": "Quicksort: Partition and Conquer",
    "blurb": "Write the in-place partition, then survive already-sorted input with a random pivot.",
    "levelIds": [
      "fill",
      "random-pivot"
    ]
  },
  {
    "id": "heaps",
    "path": "heaps/",
    "topic": "Priority queues",
    "title": "Heaps: Sift Up, Sift Down",
    "blurb": "Build the two moves that make a priority queue work, then rescue an extract-max stuck in an infinite loop.",
    "levelIds": [
      "insert",
      "extract"
    ]
  },
  {
    "id": "heap-sort",
    "path": "heap-sort/",
    "topic": "Priority queues",
    "title": "Heap Sort and the Top-k Monitor",
    "blurb": "Sort by building a max-heap and extracting it, then keep only the top k of an endless stream.",
    "levelIds": [
      "sort",
      "topk"
    ]
  },
  {
    "id": "counting-sort",
    "path": "counting-sort/",
    "topic": "Linear-time sorting",
    "title": "Counting Sort at Scale",
    "blurb": "Sort 200 sequencing quality scores without comparing them, then hunt down a stability bug.",
    "levelIds": [
      "fill",
      "stable"
    ]
  },
  {
    "id": "radix-sort",
    "path": "radix-sort/",
    "topic": "Linear-time sorting",
    "title": "Radix Sort: Digit by Digit",
    "blurb": "Sort patient chart IDs one digit at a time, then discover why every pass must be stable.",
    "levelIds": [
      "fill",
      "stable"
    ]
  },
  {
    "id": "bucket-sort",
    "path": "bucket-sort/",
    "topic": "Linear-time sorting",
    "title": "Bucket Sort: Filing into Drawers",
    "blurb": "File lab values into drawers, then fix what happens when the data is not evenly spread.",
    "levelIds": [
      "fill",
      "skew"
    ]
  },
  {
    "id": "activity-selection",
    "path": "activity-selection/",
    "topic": "Greedy algorithms",
    "title": "Activity Selection: The Greedy Choice",
    "blurb": "Schedule the most operating-room requests, then expose a tempting greedy rule that is wrong.",
    "levelIds": [
      "fill",
      "wrong-rule"
    ]
  },
  {
    "id": "huffman-coding",
    "path": "huffman-coding/",
    "topic": "Greedy algorithms",
    "title": "Huffman Coding: Merge the Two Rarest",
    "blurb": "Compress a sequencing log: build the optimal prefix code with a heap, then read codes off the tree and decode losslessly.",
    "levelIds": [
      "build",
      "codec"
    ]
  },
  {
    "id": "rod-cutting",
    "path": "rod-cutting/",
    "topic": "Dynamic programming",
    "title": "Rod Cutting: From Exponential to a Table",
    "blurb": "Cut a steel rod for maximum revenue: write the exponential recursion, fix a memo that never remembers, then fill the table smallest first.",
    "levelIds": [
      "naive",
      "memo",
      "bottom-up"
    ]
  },
  {
    "id": "knapsack-dp",
    "path": "knapsack-dp/",
    "topic": "Dynamic programming",
    "title": "0-1 Knapsack: The Relief Pallet",
    "blurb": "Load a 200 kg relief pallet: fill the take-or-leave table, trace back which crates fly, and see why greedy by ratio gets 640 instead of 880.",
    "levelIds": [
      "cell",
      "traceback",
      "greedy"
    ]
  },
  {
    "id": "lcs",
    "path": "lcs/",
    "topic": "Dynamic programming",
    "title": "Longest Common Subsequence: Fill the Table",
    "blurb": "Fill the common-subsequence table for two DNA strands, walk back to print the shared strand, then fix a mismatch rule that forgets a neighbour.",
    "levelIds": [
      "fill",
      "trace",
      "wrong-mismatch"
    ]
  },
  {
    "id": "edit-distance",
    "path": "edit-distance/",
    "topic": "Dynamic programming",
    "title": "Edit Distance: How Far Apart Are Two Strands?",
    "blurb": "Count the fewest inserts, deletes and substitutions between two isolates, fix a match that is not free, then memoise a recursion that would outlive the universe.",
    "levelIds": [
      "fill",
      "free-match",
      "memo"
    ]
  }
];
