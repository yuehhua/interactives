window.LESSON_ZH = {
  title: '離線快取（Offline Caching）：淘汰最晚才會用到的頁面',
  topic: '貪婪演算法',
  blurb: '先算 LRU 的未命中次數，再淘汰最晚才被需要的頁面，並修掉 min 與 max 的錯誤。',
  intro: '一個小而快的快取放得下 <code>k</code> 個頁面；每次請求不在快取裡的頁面都是一次<b>快取未命中（cache miss）</b>，要多花一趟很慢的磁碟讀取。快取滿了，就得趕走一個頁面。該趕誰？實務上的策略都是<i>往回看</i>（最近最少使用）。CLRS 第 15.4 節問：如果<b>離線</b>排程器事先知道整串請求，能做到多好？並證明一條貪婪規則是最佳的：淘汰<b>下次請求離現在最遠</b>的頁面。',
  levels: [
    {
      title: '往回看的策略：LRU',
      brief: '計算「淘汰<b>最近最少使用</b>頁面」這個策略的未命中次數。<code>last_used[p]</code> 是頁面 <code>p</code> 上一次被請求的位置。請填入空格：<b>快取裡哪個頁面最久沒被使用</b>？逐步執行 12 個請求 <code>1 2 3 4 1 2 5 1 2 3 4 5</code>，<code>k = 3</code>。',
      hints: [
        '最久以前被使用，就是 <code>last_used</code> 裡位置最小的那個。',
        '<code>victim = min(cache, key=lambda p: last_used[p])</code>'
      ],
      reflect: '用一句話說明：LRU 賭的是「過去能預測未來」。舉出一種讓這個賭注輸掉的請求模式。'
    },
    {
      title: '往前看的策略：最晚才用到',
      brief: '離線時，整串請求都已知。<code>next_use(requests, i, page)</code> 回傳位置 <code>i</code> 之後下一次請求 <code>page</code> 的位置，如果之後都不會用到就回傳無限大。請填入空格：淘汰下次使用<b>離現在最遠</b>的快取頁面。把未命中次數和 LRU 在同一串請求上的 10 次比一比。',
      hints: [
        '在快取的頁面中，挑 <code>next_use</code> 最大的那個。',
        '<code>victim = max(cache, key=lambda p: next_use(requests, i, p))</code>'
      ],
      reflect: '用一句話說明：為什麼淘汰最晚才會用到的頁面，絕不會造成其他選擇本來可以避免的未命中？'
    },
    {
      title: '找錯誤：淘汰最快就要用的頁面',
      brief: '這個版本會往前看，卻未命中太多次。只有一個字是錯的：它淘汰的是<b>最快</b>就會被請求的頁面，馬上就會造成一次未命中。請只改<b>一個字</b>，讓它淘汰<b>最晚</b>才需要的頁面。逐步執行示範，看同一個頁面離開又回來。',
      hints: [
        '我們想留下哪一個：下一個就要用的，還是最晚才要用的？',
        '把 <code>min</code> 換成 <code>max</code>。'
      ],
      reflect: '用一句話說明：真實的作業系統看不到未來。為什麼知道離線最佳解仍然有用？'
    }
  ]
};
