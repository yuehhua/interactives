window.LESSON_ZH = {
  title: '二元搜尋樹：長出來，再走一遍',
  topic: '樹與搜尋樹',
  blurb: '一次插入一個鍵，長出一棵二元搜尋樹，再用三種順序走訪它。',
  intro: `<b>二元搜尋樹</b> (binary search tree) 讓每個節點的左邊放較小的鍵、右邊放較大的鍵，所以搜尋只需沿著一條路徑走，不必掃過全部。插入時樹一次長出一片葉子；用正確的順序走訪，就能依序讀出排好的鍵。`,
  levels: [
    {
      title: '插入鍵',
      brief: `<code>Node</code> 和插入每個鍵的迴圈已經給好。請補上兩個遞迴呼叫：鍵比較小就送往<b>左邊</b>，比較大就送往<b>右邊</b>。逐步執行，看標籤顯示每個變數指向哪個節點。`,
      hints: ['左邊：<code>root.left = insert(root.left, key)</code>。', '右邊：<code>root.right = insert(root.right, key)</code>。'],
      reflect: '用一句話回答：如果插入已經排好序的鍵，樹會變成什麼形狀？這對搜尋的代價有什麼影響？',
    },
    {
      title: '三種走訪方式',
      brief: `前序 (pre-order) 先拜訪節點，中序 (in-order) 在左右子樹<i>之間</i>拜訪節點，後序 (post-order) 最後才拜訪節點。請填三個空格：只有<b>其中一行的位置</b>不同。中序走訪應該印出排好序的鍵。`,
      hints: [
        '前序：先 <code>out.append(node.key)</code>，再走左、再走右。',
        '中序：先走左，再 <code>out.append(node.key)</code>，最後走右。',
        '後序：先走左、再走右，最後 <code>out.append(node.key)</code>。',
      ],
      reflect: '用一句話回答：為什麼二元搜尋樹的中序走訪一定會得到排好序的輸出？',
    },
  ],
};
