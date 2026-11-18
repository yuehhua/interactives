window.LESSON_ZH = {
  title: 'Bellman-Ford：當捷徑會省時間',
  topic: '最短路徑',
  blurb: '遮蔽走廊省下四分鐘：做 |V|-1 輪鬆弛，偵測永遠省時間的負權重環，並修好會誤報的偵測器。',
  intro: `遮蔽走廊省下四分鐘，所以它的權重是 <code>-4</code>。Dijkstra 遇到負權重就不可靠，但 <b>Bellman-Ford</b> 可以：
    對<i>每一條</i>走廊做鬆弛，並重複 <code>|V| - 1</code> 輪。最短路徑不會重複經過同一個地點，所以最多有
    <code>|V| - 1</code> 條走廊，每一輪就多確定一步。這裡的圖是 <code>n</code> 個編號 <code>0..n-1</code> 的地點，
    加上一串有向的 <code>(u, v, w)</code> 走廊。`,
  levels: [
    {
      title: '對每條走廊鬆弛，做 |V| - 1 輪',
      brief: `輪數的迴圈已寫好。請填入<b>鬆弛 (relaxation)</b> 的兩個空格：判斷經過 <code>u</code> 是否比
        <code>dist[v]</code> 更短，若是就<b>更新它</b>。逐步執行走廊地圖（走廊順序與上課相同），
        觀察 7 號病房依序變成 <code>inf</code>、<code>6</code>、<code>3</code>，也就是省下的時間沿著走廊傳過去。`,
      hints: [
        '判斷式：<code>dist[u] + w &lt; dist[v]</code>。在 Python 中 <code>inf + w</code> 仍是 <code>inf</code>，所以尚未到達的地點不會出事。',
        '更新：<code>dist[v] = dist[u] + w</code>。',
        '只要沒有負權重環，做完 <code>n - 1</code> 輪之後就不會再有改善。',
      ],
      reflect: '為什麼 n - 1 輪就夠？第 k 輪保證了用 k 條走廊的路徑什麼事？',
      scaleNote: '地點加倍時，V 與 E 都加倍，所以工作量約變成四倍：O(V E)。',
    },
    {
      title: '偵測永遠省時間的環',
      brief: `藥局、病房儲藏室與檢驗室形成一個迴圈，走廊相加為 <code>-2 - 3 + 1 = -4</code>：
        每多繞一圈就省四分鐘，所以「最快」失去意義。輪數已寫好，請加上<b>額外的一輪</b>：
        如果做完 <code>|V| - 1</code> 輪後，任何一條走廊<i>仍然</i>可以鬆弛，就表示有可到達的負權重環，
        函式必須回傳 <code>(dist, False)</code>；否則回傳 <code>(dist, True)</code>。`,
      hints: [
        '判斷式與鬆弛相同：<code>dist[u] + w &lt; dist[v]</code>。',
        '若判斷為真，就 <code>return dist, False</code>。',
        '起點到不了的迴圈永遠不會讓 <code>dist[u]</code> 變成有限值，所以 <code>inf + w &lt; inf</code> 為假，不用在意。',
      ],
      reflect: '為什麼多做一輪就能證明負權重環存在？迴圈內的距離會是什麼樣子？',
    },
    {
      title: '亂喊狼來了的偵測器',
      brief: `這個版本找得到藥局的迴圈，但在完全正常的病房地圖和走廊地圖上也大喊「有負權重環！」。
        執行測試，看看哪些失敗。一張做完的最短路徑圖裡到處都是<b>緊繃 (tight)</b> 的走廊：
        <code>dist[u] + w == dist[v]</code>。請在額外的一輪中改<b>一個字元</b>。`,
      hints: [
        '哪一個比較運算把緊繃（相等）的走廊也當成可以改善？',
        '把額外一輪中的 <code>&lt;=</code> 改成 <code>&lt;</code>。只有<b>嚴格</b>改善才代表有環。',
        '權重為零的走廊也是緊繃的，所以含零權重走廊的地圖正好用來測試你的修正。',
      ],
      reflect: '在正確的答案中，哪些走廊是緊繃的？把它們畫在病房地圖上：會形成什麼形狀？',
    },
  ],
};
