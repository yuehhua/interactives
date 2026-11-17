window.LESSON_ZH = {
  title: `堆疊：括號配對與瀏覽器返回鍵`,
  topic: `堆疊與佇列`,
  blurb: `用堆疊 (stack) 檢查括號配對，再修正一個「下一頁」按鈕指向錯誤時間線的瀏覽器。`,
  intro: `<b>堆疊 (stack)</b> 是後進先出：瀏覽器的「上一頁」按鈕、復原歷史紀錄，以及檢查每個 <code>(</code>
    是否依正確順序被對應的 <code>)</code> 關閉。只會動到最上面那一個元素。`,
  levels: [
    {
      title: `括號配對`,
      brief: `填入兩個空格：每個左括號都要<b>推入 (push)</b>，每個右括號則要<b>彈出 (pop)</b> 堆疊並比較。
        逐步執行 <code>"([{}])"</code>，觀察堆疊先變高、再變矮。`,
      hints: [
        `左括號：<code>stack.append(ch)</code>。`,
        `右括號：如果堆疊是空的，或 <code>stack.pop() != PAIRS[ch]</code>，就回傳 False。`,
      ],
      reflect: `用一句話回答：為什麼只用計數器無法處理 "([)]"，但堆疊可以？`,
    },
    {
      title: `找錯誤：說謊的「下一頁」按鈕`,
      brief: `瀏覽器用兩個堆疊：一個放你身後的頁面，一個放前方的頁面。這個版本一開始正常，
        但當你先返回、再造訪新頁面後，<b>下一頁</b>仍然會跳到舊頁面。請修改<b>一行</b>
        （或新增一行）。逐步執行 <code>a, b, back, c, forward</code>。`,
      hints: [
        `造訪全新頁面之後，還能前往另一條時間線上的頁面嗎？`,
        `在 <code>visit</code> 中清空 <code>forward_stack</code>。`,
      ],
      reflect: `用一句話回答：為什麼造訪新頁面時丟掉往前的堆疊是正確的？`,
    },
  ],
};
