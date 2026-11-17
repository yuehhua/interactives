window.LESSON_ZH = {
  title: '字典樹：基因名稱的自動完成',
  topic: '樹與搜尋樹',
  blurb: '替基因與藥物名稱做自動完成：把單字存進字典樹，再列出某個前綴底下的所有單字。',
  intro: `輸入 "BRC"，搜尋框立刻建議 <code>BRCA1</code> 和 <code>BRCA2</code>。<b>字典樹</b> (trie) 沿著樹的路徑，一個字母一個字母地儲存單字，所以有相同前綴的單字共用同一段路徑；要找出某個前綴底下的所有單字，只要走到一個節點，再列出它的子樹。所花時間取決於單字長度，與儲存了多少單字無關。`,
  levels: [
    {
      title: '插入與查詢單字',
      brief: `每個節點存一個放子節點的 dict，以及一個旗標 <code>is_end</code>，表示「有單字在這裡結束」。請填兩個空格：插入時<b>建立缺少的子節點</b>，並讓 <code>contains</code> 檢查<b>結尾旗標</b>（單字的前綴不一定是單字）。`,
      hints: ['建立：<code>node.children[ch] = TrieNode()</code>。', '查詢結果：<code>return node.is_end</code>。'],
      reflect: '用一句話回答：查詢一個 6 個字母的單字，儲存 1 個單字時需要幾步？儲存 1,000,000 個單字時呢？',
    },
    {
      title: '列出某個前綴底下的所有單字',
      brief: `第 1 關的字典樹已經給好。請填一個空格：<b>對每個子節點遞迴</b>，並用它的字母延伸路徑。子節點依排序順序拜訪，所以建議的單字會依字母順序出現。`,
      hints: ['<code>collect(node.children[ch], path + ch, out)</code>。'],
      reflect: '用一句話回答：自動完成的成本主要由什麼決定？是前綴長度，還是建議單字的數量？',
    },
  ],
};
