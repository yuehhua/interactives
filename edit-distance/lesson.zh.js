window.LESSON_ZH = {
  title: "編輯距離（Edit Distance）：兩段序列相差多遠？",
  topic: "動態規劃",
  blurb: "計算兩個分離株之間最少的插入、刪除與替換，修好一個不算免費的相符，再替一個壽命比宇宙還長的遞迴加上記憶化。",
  intro: "一月的分離株是 <code>GATTACA</code>，今天的是 <code>GACTTGCA</code>。是同一菌株復發，還是新的菌株？<b>編輯距離 edit distance</b> 計算把一段序列變成另一段，最少需要幾次單一字母的<b>插入、刪除與替換</b>。編輯方案的數量多得天文數字，而<i>前綴配對</i>的數量只有 <i>m</i>&times;<i>n</i>。",
  levels: [
    {
      title: "基底情況與遞迴式",
      brief: "<code>d[i][j]</code> 是 <code>a</code> 的前 <code>i</code> 個字母與 <code>b</code> 的前 <code>j</code> 個字母之間的編輯距離。請填入<b>基底欄</b>（把一個前綴變成空序列）、<b>基底列</b>，以及<b>遞迴式</b>：刪除、插入，或替換（字母相符時免費）。逐步執行 <code>KITTEN</code> &rarr; <code>SITTING</code>。",
      hints: [
        "把 <code>a[:i]</code> 變成空字串需要 <code>i</code> 次刪除：<code>d[i][0] = i</code>。",
        "把空字串變成 <code>b[:j]</code> 需要 <code>j</code> 次插入：<code>d[0][j] = j</code>。",
        "抵達格子 (i, j) 有三種方式：<code>d[i-1][j] + 1</code>（刪除）、<code>d[i][j-1] + 1</code>（插入）、<code>d[i-1][j-1] + sub</code>（替換，其中相符時 <code>sub</code> 為 0）。"
      ],
      reflect: "用一句話說明：為什麼免費的相符等同於成本為 0 的替換？為什麼表格不需要這三個鄰格以外的格子？"
    },
    {
      title: "找錯誤：不算免費的相符",
      brief: "這個表格對處處不同的序列給出合理的答案，其他情況卻多收費。請<b>改一行</b>。逐步執行 <code>GATTACA</code> &rarr; <code>GACTTGCA</code>，然後找出第一個明明兩個字母相同卻仍被收費的格子。",
      hints: [
        "當 <code>a[i-1] == b[j-1]</code> 時，對角線這一步要花幾次編輯？",
        "對角線那一項永遠加 1。相符時應該加 0。"
      ],
      reflect: "用一句話說明：有錯的版本改為計算了什麼？（提示：試試兩段完全相同的序列。）"
    },
    {
      title: "單純遞迴與表格的比較",
      brief: "下面的遞迴是正確的，但它會一再重算相同的前綴配對，所以兩段 150 個鹼基的分離株所花的時間會比宇宙的壽命還長。請加上<b>記憶化 memoization</b>：計算之前先查這一對，計算之後記住答案。然後按<b>量測</b>，和單純遞迴比較。",
      hints: [
        "鍵是這一對 <code>(i, j)</code>。用一個從配對對應到答案的字典就夠了。",
        "先檢查：<code>if (i, j) in memo: return memo[(i, j)]</code>。最後儲存：<code>memo[(i, j)] = res</code>。"
      ],
      reflect: "用一句話說明：solve() 最多會看到幾個不同的 (i, j) 配對？這對總工作量代表什麼？",
      scaleNote: "有記憶化的版本隨 n×n 成長（n 加倍時約變成 ×4）。單純遞迴每多一個字母大約變成三倍：到 n = 60 時已經超出預算。",
      baselineLabel: "單純遞迴，沒有記憶化"
    }
  ]
};
