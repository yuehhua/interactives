window.LESSON_ZH = {
  title: `堆積：上浮與下沉`,
  topic: `優先佇列`,
  blurb: `寫出讓優先佇列運作的兩個動作，再救回一個卡在無窮迴圈的 extract-max。`,
  intro: `急診室永遠要先處理最緊急的病人。<b>最大堆積 (max-heap)</b> 把那位病人放在一般 Python 串列的索引 0，
    節點 <code>i</code> 的子節點位於 <code>2i+1</code> 與 <code>2i+2</code>（從 0 起算）。
    兩個動作維持堆積的形狀：插入後<b>上浮 (sift up)</b>，取出後<b>下沉 (sift down)</b>。`,
  levels: [
    {
      title: `插入與上浮`,
      brief: `補完兩個空白。請逐步執行示範，觀察新的值沿著樹往上爬，直到它的父節點不比它小為止。`,
      hints: [
        `在從 0 起算的串列中，節點 <code>i</code> 的父節點是 <code>(i - 1) // 2</code>。`,
        `用元組賦值來交換：<code>heap[i], heap[p] = heap[p], heap[i]</code>。`,
      ],
      reflect: `用一句話說明：為什麼一次插入最多只需要 O(log n) 次交換，而不是 O(n)？`,
    },
    {
      title: `找錯：extract-max 永遠不會結束`,
      brief: `請先按<b>執行測試</b>：這個 extract-max <b>卡住了</b>。執行器會用步數預算中止它，而不是讓你的瀏覽器當掉。
        請逐步執行示範，找出當節點已經在正確位置時，迴圈忘了做什麼，然後修好它。`,
      hints: [
        `看看 <code>while True</code> 迴圈。是什麼讓它結束？`,
        `當 <code>largest == i</code> 時，節點已在正確位置，下沉就完成了。`,
      ],
      reflect: `用一句話說明：為什麼把整個堆積取空（堆積排序）要花 O(n log n)？`,
    },
  ],
};
