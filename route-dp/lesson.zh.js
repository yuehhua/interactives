window.LESSON_ZH = {
  title: '最低成本路線',
  topic: '動態規劃',
  blurb: '一張小地圖上，每步挑最便宜的路要花 12，最低成本的路線只要 7。填一張每個站只解一次的表，再還原出路線。',
  intro: `五個站、七條單向道路，每條有成本。從 <code>src</code> 到 <code>dst</code>，哪條路線成本最低？上週的直覺是<b>每一步都挑最便宜的路</b>，這裡要花 12，但最低成本的路線只要 7。貪婪選擇性質在這裡不成立。仍然成立的是<b>最佳子結構</b>：到某個站的最低成本路線，就是到前面某個站的最低成本路線，再多接一條路。請先寫出貪婪走法，再換成一張表：每個站只解一次，並把答案記下來。這張表就是動態規劃。
    <svg viewBox="0 -14 368 190" width="100%" style="max-width:420px;display:block;margin:8px 0" role="img" aria-label="Route graph: src to A cost 1, src to B 3, A to C 5, A to dst 9, B to C 2, B to dst 4, C to dst 6" fill="none" stroke="currentColor" stroke-width="1.4" font-size="12"><defs><marker id="ah" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="currentColor" stroke="none"/></marker></defs><line x1="38" y1="74" x2="124" y2="34" marker-end="url(#ah)"/><text x="81" y="50" fill="currentColor" stroke="none" text-anchor="middle">1</text><line x1="38" y1="86" x2="124" y2="126" marker-end="url(#ah)"/><text x="81" y="102" fill="currentColor" stroke="none" text-anchor="middle">3</text><line x1="153" y1="33" x2="224" y2="71" marker-end="url(#ah)"/><text x="189" y="48" fill="currentColor" stroke="none" text-anchor="middle">5</text><line x1="153" y1="127" x2="224" y2="89" marker-end="url(#ah)"/><text x="189" y="104" fill="currentColor" stroke="none" text-anchor="middle">2</text><line x1="255" y1="80" x2="326" y2="80" marker-end="url(#ah)"/><text x="290" y="76" fill="currentColor" stroke="none" text-anchor="middle">6</text><path d="M153 16 Q250 -8 331 70" marker-end="url(#ah)"/><text x="252" y="6" fill="currentColor" stroke="none" text-anchor="middle">9</text><path d="M153 144 Q250 168 331 90" marker-end="url(#ah)"/><text x="252" y="164" fill="currentColor" stroke="none" text-anchor="middle">4</text><circle cx="24" cy="80" r="15"/><text x="24" y="84" fill="currentColor" stroke="none" text-anchor="middle">src</text><circle cx="140" cy="26" r="15"/><text x="140" y="30" fill="currentColor" stroke="none" text-anchor="middle">A</text><circle cx="140" cy="134" r="15"/><text x="140" y="138" fill="currentColor" stroke="none" text-anchor="middle">B</text><circle cx="240" cy="80" r="15"/><text x="240" y="84" fill="currentColor" stroke="none" text-anchor="middle">C</text><circle cx="344" cy="80" r="15"/><text x="344" y="84" fill="currentColor" stroke="none" text-anchor="middle">dst</text></svg>`,
  levels: [
    {
      title: '先走最便宜的路',
      brief: '站點編號：<code>0</code>（src）、<code>1</code>（A）、<code>2</code>（B）、<code>3</code>（C）、<code>4</code>（dst）。<code>roads[u]</code> 以 <code>(next, cost)</code> 成對的形式列出從 <code>u</code> 出發的道路。請完成這個走法：在每個站都選<b>出發成本最低的路</b>。填入空格後逐步執行，看它以 <b>12</b> 抵達 dst，而另一條路線只要 7。',
      hints: [
        '在 <code>roads[node]</code> 裡挑成本最小的那一對：<code>min(roads[node], key=...)</code>。',
        '<code>nxt, w = min(roads[node], key=lambda road: road[1])</code>'
      ],
      reflect: '用一句話說明：為什麼成本 1 的第一條路，會通往比成本 3 的路更差的路線？兩個貪婪性質中，哪一個不成立？'
    },
    {
      title: '一站一站填表',
      brief: '<code>best[v]</code> 是從 src 到站 <code>v</code> 的最低成本。每條路都通往編號更大的站，所以輪到 <code>v</code> 時，它前面的站都已經確定。請填入迴圈主體：對每條進入 <code>v</code> 的路 <code>u -> v</code>，經過 <code>u</code> 的成本是 <code>best[u] + w</code>，保留較小的。逐步執行，看 <code>best</code> 由左到右填滿：<code>[0, 1, 3, 5, 7]</code>。',
      hints: [
        '到 <code>v</code> 的最低成本，是所有進入 <code>v</code> 的路中 <code>best[u] + w</code> 的最小值。',
        '<code>best[v] = min(best[v], best[u] + w)</code>'
      ],
      reflect: '用一句話說明：為什麼讀 best[u] 之前不用檢查它是否已經算完？如果站點用別的順序拜訪，會出什麼問題？'
    },
    {
      title: '到底走哪一條？',
      brief: '光有成本，司機不知道該在哪裡轉彎。除了 <code>best[v]</code>，再記下 <code>parent[v]</code>：到 <code>v</code> 的最低成本路線上，前一個站是哪裡。請填兩個空格：記下較好的成本<b>和</b>它的 parent，再從 dst 沿著 parent 往回走到 src。範例地圖的路線是 src、B、dst，也就是站點 <code>[0, 2, 4]</code>，成本 7。',
      hints: [
        '當 <code>best[u] + w</code> 比 <code>best[v]</code> 小，同時設定 <code>best[v]</code> 和 <code>parent[v] = u</code>。',
        '往回走：<code>node = parent[node]</code>，再把它加進路線。最後反轉。'
      ],
      reflect: '用一句話說明：表格每個站只存一個答案，但路線有很多條。為什麼每個站只記一個 parent，仍然能還原出最低成本的路線？'
    },
    {
      title: '更大的地圖，有名字的站',
      brief: '真實的地圖有站名，道路存在字典 <code>edges[(u, v)] = cost</code> 裡。<code>order</code> 依序列出各站，使每條路都往前走。請為這張地圖寫出同樣的表，共三個空格。隱藏的測試包含一張有 <b>3<sup>14</sup> 條路線</b>的圖：逐條試過去永遠跑不完，但每個站只算一次的表可以。',
      hints: [
        '先讓每個站的 <code>best[v] = INF</code>、<code>best[src] = 0</code>；對於 <code>x == v</code> 的路 <code>(u, x)</code>，比較 <code>best[u] + w</code> 和 <code>best[v]</code>。',
        '用 <code>node = parent[node]</code> 往回走，直到抵達 <code>src</code>。'
      ],
      reflect: '用一句話說明：這個遞迴式和你填表用的一樣：best[v] 是所有進入 v 的路的最小值。為什麼這就是從「全部試一遍」變成「每個站只解一次」？（下週：切鋼條。）'
    }
  ]
};
