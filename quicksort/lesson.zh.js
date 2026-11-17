window.LESSON_ZH = {
  title: `快速排序：分割後各個擊破`,
  topic: `分治法排序`,
  blurb: `寫出原地分割 (partition)，再用隨機樞紐 (pivot) 撐過已排序的輸入。`,
  intro: `選一個<b>樞紐 (pivot)</b>，把比它小的都移到左邊、比它大的都移到右邊，然後對兩邊重複同樣的步驟。
    所有的巧思都在 <code>partition</code>：它只掃一遍，就把串列<i>原地</i>重新排好。快速排序通常是實務上最快的排序法，
    但也有一個著名的失敗情況。`,
  levels: [
    {
      title: `寫出分割步驟`,
      brief: `遞迴的部分已經寫好。請補完 CLRS 的 <b>Lomuto 分割法</b>中的兩個空白：擴大「小的」區域並交換，
        再把樞紐放到兩個區域之間。請逐步執行示範（CLRS 圖 7.1），觀察 <code>i</code> 與 <code>j</code> 如何掃過。`,
      hints: [
        `不變式：<code>a[lo..i]</code> 全部 ≤ 樞紐，<code>a[i+1..j-1]</code> 全部 &gt; 樞紐。`,
        `當 <code>a[j] &lt;= pivot</code> 時：<code>i += 1</code>，然後交換 <code>a[i]</code> 與 <code>a[j]</code>。`,
        `迴圈結束後，把 <code>a[i + 1]</code> 與樞紐 <code>a[hi]</code> 交換。`,
      ],
      reflect: `用一句話說明：為什麼分割需要 n 步？樞紐選得好時，遞迴深度為什麼約是 log n？`,
      scaleNote: `在隨機輸入下，n 放大 ×10，快速排序的步數約成長 ×12。下一關：如果輸入已經排好序呢？`,
      baselineLabel: `插入排序`,
    },
    {
      title: `最壞情況：已排序的輸入`,
      brief: `檢驗結果常常<b>已經排好序</b>。若以最後一個元素當樞紐，每次分割都只剝掉一個元素：
        遞迴會<i>n</i> 層深，工作量變成平方級。請先執行測試，看步數預算如何爆掉，再改成<b>隨機選樞紐</b>。
        （即使如此，全部元素都相同的串列對這個分割法仍是陷阱；這正是三路分割 (3-way partitioning) 的用途。）`,
      hints: [
        `隨機挑一個索引 <code>r = random.randint(lo, hi)</code>。`,
        `先把它交換到樞紐的位置：<code>a[r], a[hi] = a[hi], a[r]</code>，然後照原本的方式分割。`,
      ],
      reflect: `用一句話說明：為什麼隨機樞紐只是讓壞情況「不太可能發生」，而不是「不可能發生」？`,
      scaleNote: `輸入已排序，每一列 n 加倍。每列約 ×4 代表平方級；約 ×2.2 代表 n log n。`,
    },
  ],
};
