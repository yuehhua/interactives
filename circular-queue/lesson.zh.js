window.LESSON_ZH = {
  title: `佇列：環狀候診號碼牌緩衝區`,
  topic: `堆疊與佇列`,
  blurb: `用會「繞回來」的固定陣列，依先到先服務的順序叫候診號碼。`,
  intro: `醫院依先到先服務的方式發放候診號碼牌。只要讓 <code>head</code> 與 <code>tail</code>
    像時鐘一樣<b>繞過</b>陣列尾端，固定大小的陣列就能裝下整個佇列 (queue)：
    只要陣列沒有滿，某處就一定有空位。`,
  levels: [
    {
      title: `讓尾端繞回來`,
      brief: `<code>dequeue</code> 已經寫好。請填入 <code>enqueue</code> 中唯一的空格：
        <b>尾端的位置</b>要用取餘數繞過陣列。逐步執行示範 <code>eeedeeddd</code>（e = 領一張號碼牌，d = 叫一個號）。`,
      hints: [`尾端位置 = <code>(head + size) % len(data)</code>。`],
      reflect: `用一句話回答：如果不繞回來，為什麼陣列開頭明明還有空位，佇列卻會被當成「滿了」？`,
    },
    {
      title: `找錯誤：跑出陣列尾端的 head`,
      brief: `佇列一開始正常，過一會兒就因 <b>IndexError</b> 當掉：<code>enqueue</code> 有繞回來，
        但 <code>dequeue</code> 把 head 往前移卻沒有繞回來。請修改<b>一行</b>。`,
      hints: [`比較兩個函式移動索引的方式。`, `head 前進：<code>(head + 1) % len(data)</code>。`],
      reflect: `用一句話回答：哪兩個索引必須繞回來？為什麼有 size 計數就能明確區分「滿」與「空」？`,
    },
  ],
};
