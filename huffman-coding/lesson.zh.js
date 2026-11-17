window.LESSON_ZH = {
  title: "霍夫曼編碼（Huffman Coding）：合併最稀有的兩個",
  topic: "貪婪演算法",
  blurb: "壓縮定序紀錄：用堆積建出最佳前綴碼，再從樹上讀出編碼並無失真地解碼。",
  intro: "存放定序紀錄的磁碟陣列快滿了。常出現的字母應該得到短碼字，罕見的字母得到長碼字，而且任何碼字都不能是另一個碼字的前綴。<b>霍夫曼的貪婪規則</b>能建出最佳的這種編碼：反覆合併最稀有的兩個項目。這裡的<b>葉節點</b>是一個字元（字串），<b>內部節點</b>是一對 <code>(left, right)</code>。",
  levels: [
    {
      title: "建立編碼樹",
      brief: "最小優先佇列（<code>heapq</code>）已經幫你設定好了。請填入貪婪迴圈的兩個空格：<b>取出第二稀有的項目</b>，再把<b>合併後的節點放回去</b>。逐步執行示範，看四個字母如何合併成一棵樹。",
      hints: [
        "堆積中的項目是 <code>(frequency, tie, node)</code>。tie 計數器讓 Python 永遠不必比較兩個節點。",
        "取出：<code>y = heapq.heappop(heap)</code>。",
        "放回：<code>heapq.heappush(heap, (x[0] + y[0], tie, (x[2], y[2])))</code>。"
      ],
      reflect: "用一句話說明：為什麼先合併最稀有的兩個，會讓罕見的字母落在樹的最深處？"
    },
    {
      title: "從樹上讀出編碼，並解碼位元",
      brief: "建樹的部分已經給你了。請填入兩個空格：<b>走訪這棵樹</b>記錄每個字母的碼字（左邊是 <code>\"0\"</code>，右邊是 <code>\"1\"</code>），以及<b>解碼</b>位元字串：從根節點開始走，每到一片葉子就重新從根開始。這個測試嚴格但公平：<b>必須無失真，否則不算數</b>。",
      hints: [
        "在 <code>walk</code> 中：先 <code>walk(node[0], prefix + \"0\")</code>，再 <code>walk(node[1], prefix + \"1\")</code>。",
        "在 <code>decode</code> 中：<code>node = node[0] if bit == \"0\" else node[1]</code>。"
      ],
      reflect: "用一句話說明：為什麼解碼器每讀完一片葉子就能回到根節點重新開始，而碼字之間不需要任何分隔符號？"
    }
  ]
};
