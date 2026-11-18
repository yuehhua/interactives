window.LESSON_ZH = {
  title: '拓撲排序：團隊該依什麼順序行動？',
  topic: '圖',
  blurb: '把事件白板上的任務排成合法順序：一次拿走沒有人擋住的任務，再用「排出的數量不足」偵測出會死鎖的環。',
  intro: `事件白板其實是第二張圖：頂點是任務，箭頭 <code>u -> v</code> 表示「<b>v 必須等 u 完成才能開始</b>」。Kahn 演算法一次拿走一個沒有人擋住的任務。
    任務：<code>0 CUL 培養、1 ISO 隔離、2 CLN 深度清潔、3 RST 結果、4 ESC 升級應變、5 REO 重新開放</code>。
    計畫：CUL 到 RST 到 ESC 到 REO，以及 ISO 到 CLN 到 ESC。`,
  levels: [
    {
      title: '拿走沒有人擋住的任務',
      brief: `入分支度已算好，佇列也放入沒有人擋住的任務。請填入 Kahn 迴圈的核心：取出 <code>u</code> 之後，<b>把它指向的每個任務的入分支度減一</b>，<b>降到 0 就放進佇列</b>。逐步執行白板：上課的順序是 CUL、ISO、RST、CLN、ESC、REO。`,
      hints: [
        '從 <code>u</code> 出去的每支箭頭少了一個擋路的任務：<code>indeg[v] -= 1</code>。',
        '沒有人擋了：<code>if indeg[v] == 0:</code>，然後 <code>queue.append(v)</code>。',
      ],
      reflect: '用一句話說：為什麼好幾種順序都可以是對的？什麼情況下兩個任務可以對調？',
    },
    {
      title: '免費的環偵測器',
      brief: `有人加了一支箭頭 <code>ESC -> CUL</code>（「升級應變之後才採檢」）。現在 CUL 到 RST 到 ESC 再回到 CUL 形成環，計畫死鎖了。只有 ISO 與 CLN 排得出來，其餘的任務互相等待、永遠不會動。這個迴圈會默默回傳<b>不完整的</b>串列。請填入最後的檢查：<b>排出的任務是否比總數少</b>，如果是就<b>回傳 <code>None</code></b> 表示沒有合法順序。`,
      hints: [
        '比較 <code>len(order)</code> 與 <code>n</code>：順序太短代表有些任務永遠沒有被解開。',
        '檢查條件是 <code>len(order) &lt; n</code>，回報是 <code>return None</code>。',
      ],
      reflect: '用一句話說：為什麼剩下的任務正好是環上或被環擋住的那些？',
    },
    {
      title: '找錯：太早放進佇列',
      brief: `ESC 要等<b>兩個</b>任務（RST 與 CLN）。這個版本只要<b>第一個</b>擋路的任務完成，就把它放進佇列，而不是等<b>最後一個</b>完成。結果 ESC 在 RST 還沒完成時就執行，還被列了兩次。逐步執行示範，觀察 <code>queue</code>。請改<b>一行</b>，讓任務只在入分支度降到 0 時才放進佇列。`,
      hints: [
        '判斷「沒有人擋了」的條件是 <code>indeg[v] == 0</code>。',
        '有錯的那一行問的是 <code>indeg[v] &gt;= 0</code>，只要碰到的任務都成立。',
      ],
      reflect: '用一句話說：入分支度大於 0 代表什麼？為什麼這時候就開始這個任務是錯的？',
    },
  ],
};
