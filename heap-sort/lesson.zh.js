window.LESSON_ZH = {
  title: `堆積排序與前 k 名監測`,
  topic: `優先佇列`,
  blurb: `先建立最大堆積再逐一取出來排序，接著在無止境的資料流中只保留前 k 大。`,
  intro: `最大堆積把最大的項目放在索引 0。<b>堆積排序 (heap sort)</b> 先原地建好堆積，再反覆把最大值交換到陣列尾端，
    並修復剩下較小的堆積：時間 n log n，不需要額外記憶體。同樣的想法也用在床邊監視器上：
    面對無止境的數據流，它只需保留 <i>k</i> 個最極端的讀數。`,
  levels: [
    {
      title: `建堆積，再逐一取出`,
      brief: `<code>sift_down</code> 已經寫好。請補完三個空白：<b>建堆積</b>——從最後一個非葉節點到根，逐一下沉；
        然後反覆<b>把最大值交換到尾端</b>，並<b>修復</b>剩下的堆積。請逐步執行，觀察排好序的區域從右邊長出來。`,
      hints: [
        `建堆積：<code>sift_down(a, i, n)</code>。`,
        `移動最大值：<code>a[0], a[end] = a[end], a[0]</code>。`,
        `修復大小為 <code>end</code> 的堆積：<code>sift_down(a, 0, end)</code>。`,
      ],
      reflect: `用一句話說明：為什麼建堆積只要 O(n)，而取空堆積卻要 O(n log n)？`,
      scaleNote: `n log n：n 放大 ×10，步數成長略多於 ×10。`,
    },
    {
      title: `無止境資料流的前 k 名`,
      brief: `監視器看到數百萬筆讀數，卻只能記住 <i>k</i> 筆。請維護一個<b>大小為 k 的最小堆積 (min-heap)</b>：
        它的根是目前前 k 大之中最小的。請補完兩個空白：還有空位時<b>推入</b>，否則在新讀數較大時<b>取代根節點</b>。`,
      hints: [
        `推入：<code>heapq.heappush(heap, x)</code>。`,
        `取代：<code>heapq.heapreplace(heap, x)</code>。`,
      ],
      reflect: `用一句話說明：每筆讀數的成本是多少？為什麼它取決於 k，卻與資料流的長度無關？`,
    },
  ],
};
