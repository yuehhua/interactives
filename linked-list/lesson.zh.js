window.LESSON_ZH = {
  title: `鏈結串列：查房名單`,
  topic: `鏈結串列`,
  blurb: `用節點與指標維護查房名單，再用三指標的舞步把它反轉。`,
  intro: `查房名單一整天都在變：病人入院，病人出院。用陣列時，每次變動都要移動相鄰元素；
    用<b>鏈結串列 (linked list)</b> 時，每個節點只存下一個節點的指標，所以只要改接兩個指標就完成了。
    代價是：要找到某個節點，必須從頭開始沿著指標一路走過去。`,
  levels: [
    {
      title: `新增與刪除`,
      brief: `<code>Node</code> 與示範程式已經寫好。請填入兩個空格：在 <code>append</code> 中，
        把新節點<b>接在</b>最後一個節點後面；在 <code>delete</code> 中，<b>跳過</b>目標節點。
        在視覺化畫面中，方框下方的標籤會顯示哪個變數指向哪個節點。`,
      hints: [`新增：<code>cur.next = node</code>。`, `刪除：如果 <code>cur.next</code> 存在，<code>cur.next = cur.next.next</code>。`],
      reflect: `用一句話回答：為什麼刪除一個已知節點在鏈結串列中是 O(1)，在陣列中卻是 O(n)？`,
    },
    {
      title: `反轉：三指標的舞步`,
      brief: `把每個指標翻轉成指向後方，就能<b>原地</b>反轉整個串列。請填入兩個空格。
        逐步執行，觀察 <code>prev</code>、<code>cur</code> 與 <code>nxt</code> 沿著串列往下走：
        <code>nxt</code> 的用途只是在你翻轉 <code>cur.next</code> 時，不要弄丟後面的部分。`,
      hints: [`讓 cur 指向後方：<code>cur.next = prev</code>。`, `接著往前滑動：<code>prev = cur</code>（<code>cur = nxt</code> 已經寫好）。`],
      reflect: `用一句話回答：如果在存下 nxt 之前就設定 cur.next = prev，會失去什麼？`,
    },
  ],
};
