window.LESSON_ZH = {
  title: 'Dijkstra：到 7 號病房最快的路',
  topic: '最短路徑',
  blurb: '把急救車從護理站送到全院各處：寫出鬆弛與取出最近點，記下路線，再揪出遮蔽走廊造成的無聲錯誤。',
  intro: `護理師要找出把急救車從護理站推到院內每個地方的最快路線。走廊有長度（分鐘），所以最先被<i>發現</i>的地方不一定最近。
    <b>Dijkstra 演算法</b>用優先佇列維護暫定距離，並且每次都確定（settle）最近的未完成地點。這裡的圖是
    <code>n</code> 個地點（編號 <code>0..n-1</code>）加上一串有向的 <code>(u, v, w)</code> 走廊。`,
  levels: [
    {
      title: '鬆弛，並取出最近的點',
      brief: `堆積迴圈與 <code>settled</code> 清單都已寫好。請填入<b>鬆弛 (relaxation)</b> 的兩個空格：
        判斷經過 <code>u</code> 是否比目前已知到 <code>v</code> 的最佳距離更短，若是就<b>記下新距離並推入新的配對</b>。
        逐步執行病房地圖，觀察每確定一個地點，<code>dist</code> 就縮小一些。`,
      hints: [
        '判斷式：<code>dist[u] + w &lt; dist[v]</code>。',
        '記下：<code>dist[v] = dist[u] + w</code>。',
        '推入：<code>heapq.heappush(heap, (dist[v], v))</code>。<code>v</code> 較差的舊項目會留在堆積中，之後被 <code>settled</code> 檢查略過。',
      ],
      reflect: '為什麼一個地點從堆積被取出後就可以不再理會？如果有走廊的時間是負的，哪裡會出問題？',
    },
    {
      title: '記住路線，而不只是時間',
      brief: `護理師要的是<i>路線</i>，不只是幾分鐘。請填入兩個空格：
        每當距離改善時，記下<b>是從哪裡來的</b>（<code>pred</code>）；搜尋結束後，從目標沿著 <code>pred</code>
        <b>往回走</b>到護理站。路線是倒著建立的，最後要反轉。無法到達的目標回傳 <code>(INF, [])</code>。`,
      hints: [
        '找到更短的路到 <code>v</code> 時：<code>pred[v] = u</code>。',
        '往回走：在 <code>while v is not None</code> 迴圈中執行 <code>v = pred[v]</code>。',
        '路徑一開始是空的；<code>path.append(v)</code> 由目標到起點收集地點，最後用 <code>path.reverse()</code>。',
      ],
      reflect: '前驅 (predecessor) 形成一棵以護理站為根的樹。為什麼沿著它往回走一定會走到起點？',
    },
    {
      title: '遮蔽走廊：無聲的錯誤答案',
      brief: `遮蔽走廊省下四分鐘，所以它的權重是 <code>-4</code>。這個 Dijkstra 在一般地圖上沒有錯，
        但在走廊地圖上，它回答到 7 號病房要 <b>6</b> 分鐘，真正答案是 <b>3</b>，而且沒有任何錯誤訊息。
        原因是 <code>settled</code> 檢查不肯再看一次已確定的地點，即使後來出現更便宜的路線。
        請改<b>一行</b>：略過過時的堆積項目，但允許地點再被改善。`,
      hints: [
        '執行測試：走廊地圖失敗，一般病房地圖通過。哪一行讓 J 不能被重新檢視？',
        '把 <code>settled</code> 的略過改成<b>過時項目</b>的略過：<code>if d &gt; dist[u]: continue</code>。',
        '之後可以刪掉 <code>settled[u] = True</code> 這行。這個版本只在沒有負權重<i>環</i>時才正確，而且可能重複做工。',
      ],
      reflect: '為什麼「確定」的概念要求所有權重都至少為 0？哪一個方法是專為負邊設計的？',
    },
  ],
};
