// Public record of meaningful site updates. Dates match the published commits on main.
// Add an entry whenever guides, tools or editorial policies change in a way readers would notice.

export interface ChangelogEntry {
  date: string;
  zh: { title: string; items: string[] };
  en: { title: string; items: string[] };
  links?: { path: string; zh: string; en: string }[];
}

export const changelog: ChangelogEntry[] = [
  {
    date: '2026-10-31',
    zh: {
      title: '私隱選擇、電郵聯絡、舊網址轉址與網站維護',
      items: [
        '新增私隱選擇：拒絕廣告 Cookie 後不再載入 AdSense 程式碼，可隨時在頁尾「Cookie 設定」更改，私隱政策亦已同步更新。',
        '新增電郵聯絡 hello@coffeetimer.online，不需要 GitHub 帳戶也可以查詢或要求更正。',
        '2026 年 8 月下架的機器翻譯語言版本，其舊網址現會轉到相同內容的中文或英文頁面，不再顯示「找不到頁面」。',
        '番茄鐘及減少看手機兩篇一般效率指南保留在網站，但不再提交搜尋引擎索引，讓網站集中於咖啡沖煮。',
        '更換為 Barista Flow 自己的網站圖示；修正私隱模式下備份頁無法載入、部分文字對比不足等問題；計時圖表不再依賴外部 CDN，並在每次更新前自動檢查失效連結。'
      ]
    },
    en: {
      title: 'Privacy choice, email contact, old-URL redirects and maintenance',
      items: [
        'Added a privacy choice: declining ad cookies stops AdSense code from loading, and “Cookie settings” in the footer changes it at any time. The privacy policy was updated to match.',
        'Added email contact at hello@coffeetimer.online, so questions and correction requests no longer need a GitHub account.',
        'Old addresses from the machine-translated language editions removed in August 2026 now redirect to the same page in Chinese or English instead of showing “page not found”.',
        'The Pomodoro and phone-distraction guides stay on the site but are no longer submitted to search engines, keeping the site focused on coffee brewing.',
        'Replaced the default browser icon with Barista Flow’s own; fixed the backup page failing in private browsing and some low-contrast text; the timer chart no longer depends on an external CDN, and every update is checked automatically for broken links.'
      ]
    },
    links: [
      { path: 'privacy-policy', zh: '私隱政策', en: 'Privacy policy' },
      { path: 'contact', zh: '聯絡', en: 'Contact' }
    ]
  },
  {
    date: '2026-10-28',
    zh: {
      title: '新增「專注沖煮」計時器及三篇專注指南',
      items: [
        '新增「專注沖煮」：番茄鐘式專注模式及放下手機挑戰，專注時咖啡杯慢慢注滿，離開分頁會打瀉（嚴格模式）或計算中斷（寬鬆模式）。',
        '以時間戳計時，背景分頁亦準確；可選環境聲音（即時生成）、通知及提示音，並在手機上保持螢幕開啟。',
        '新增統計頁：連續日數、每週圖表、日曆熱圖、已沖煮的咖啡杯，以及 JSON 匯出／匯入。',
        '新增三篇附參考來源的指南：番茄鐘工作法、減少看手機、咖啡與專注；私隱政策加入通知及專注資料說明。'
      ]
    },
    en: {
      title: 'New Brew Focus timer and three focus guides',
      items: [
        'Added Brew Focus: Pomodoro-style focus mode and a Phone Down Challenge. A coffee cup fills while you focus and spills if you leave the tab (strict) or counts an interruption (gentle).',
        'Timestamp-based timing stays accurate in background tabs; optional generated ambient sound, notifications and chimes, and the screen stays awake on supported phones.',
        'Added a stats page with streaks, a weekly chart, a calendar heatmap, cups brewed, and JSON export/import.',
        'Added three source-backed guides: the Pomodoro Technique, reducing phone distraction, and coffee and focus. The privacy policy now covers notifications and focus data.'
      ]
    },
    links: [
      { path: 'focus', zh: '專注沖煮', en: 'Brew Focus' },
      { path: 'guides/pomodoro-technique', zh: '番茄鐘工作法', en: 'Pomodoro guide' },
      { path: 'privacy-policy', zh: '私隱政策', en: 'Privacy policy' }
    ]
  },
  {
    date: '2026-10-27',
    zh: {
      title: '新增咖啡因計算器及三篇咖啡因指南',
      items: [
        '新增「咖啡因計算器」：記錄咖啡、茶、可樂或能量飲品，估算體內現有咖啡因、睡覺時剩餘量，以及再喝一杯 95 毫克咖啡的最遲時間。',
        '計算器附 24 小時曲線圖、「如果……會怎樣？」模擬、半衰期與睡前上限設定，以及可下載的分享圖片；所有資料只儲存在你的裝置。',
        '新增三篇附參考來源的指南：咖啡因半衰期、咖啡因與睡眠、常見飲品的咖啡因含量。',
        '私隱政策加入咖啡因計算器的本機儲存說明，以及 Google AdSense Cookie 和第三方廣告的披露。'
      ]
    },
    en: {
      title: 'New caffeine calculator and three caffeine guides',
      items: [
        'Added a caffeine calculator: log coffee, tea, cola or energy drinks to estimate the caffeine in your body now, at bedtime, and the latest time for one more 95 mg cup.',
        'The calculator includes a 24-hour chart, a “What if?” simulator, half-life and sleep-threshold settings, and a downloadable share image; all data stays on your device.',
        'Added three source-backed guides: caffeine half-life, caffeine and sleep, and caffeine in common drinks.',
        'The privacy policy now covers the calculator’s local storage and discloses Google AdSense cookies and third-party advertising.'
      ]
    },
    links: [
      { path: 'caffeine-calculator', zh: '咖啡因計算器', en: 'Caffeine calculator' },
      { path: 'guides/caffeine-and-sleep', zh: '咖啡因與睡眠', en: 'Caffeine and sleep' },
      { path: 'privacy-policy', zh: '私隱政策', en: 'Privacy policy' }
    ]
  },
  {
    date: '2026-10-20',
    zh: {
      title: '新增萃取率及沖煮用水計算器，配方頁加入調整指南',
      items: [
        '新增「萃取率與濃度計算器」：輸入粉量、成品重量及 TDS，即時計算萃取率，並在沖煮控制圖上標示位置。',
        '新增「沖煮用水配方計算器」：以蒸餾水加瀉鹽及梳打粉，按目標硬度與鹼度計算所需份量。',
        '新增工具總覽頁，按「沖煮前、沖煮中、沖煮後」整理全部計算器與計時器。',
        '六個有來源配方加入器材專屬的調整表、常見錯誤及延伸閱讀。',
        '詞彙表首頁直接顯示每個詞彙的完整解釋（並修正中文版詞彙表未能列出詞彙的問題）；文章加入目錄、最後更新日期及延伸閱讀。',
        '重寫英文版工具頁的說明文字，使其與已審閱的中文內容一致，包括愛樂壓只建議直立沖法、冷萃不作保存期限保證。'
      ]
    },
    en: {
      title: 'Extraction and brew-water calculators; adjustment guides on every recipe',
      items: [
        'Added an extraction yield and strength calculator that plots your dose, beverage weight and TDS on a brewing control chart.',
        'Added a brew-water recipe calculator for mixing distilled water with Epsom salt and baking soda to a target hardness and alkalinity.',
        'Added a tools overview that groups every calculator and timer by before, during and after brewing.',
        'Each of the six source-backed recipes now includes a brewer-specific adjustment table, common mistakes and further reading.',
        'The glossary index now shows each full definition (and the Chinese glossary index lists its terms again); guides gained a table of contents, last-updated dates and related reading.',
        'Rewrote the English tool page text to match the reviewed Chinese copy, including recommending only the upright AeroPress method and making no cold brew shelf-life promise.'
      ]
    },
    links: [
      { path: 'tools/extraction-calculator', zh: '萃取率計算器', en: 'Extraction calculator' },
      { path: 'tools/water-recipe', zh: '沖煮用水計算器', en: 'Brew-water calculator' },
      { path: 'tools', zh: '工具總覽', en: 'All tools' }
    ]
  },
  {
    date: '2026-10-19',
    zh: {
      title: '十篇指南全面擴寫，新增五篇新手指南',
      items: [
        '十篇中文指南加入實際例子、診斷表、常見錯誤與常見問題，並保留原有參考來源。',
        '英文版指南按已審閱的中文內容重新撰寫，取代舊有不一致的版本。',
        '新增粉水比、偏酸偏苦診斷、品嚐與記錄、新手器材清單及沖煮器材比較五篇雙語指南。',
        '篇幅較短的詞彙詳情頁不再提交搜尋引擎索引，改為集中在詞彙表首頁。'
      ]
    },
    en: {
      title: 'Ten guides expanded and five new beginner guides',
      items: [
        'Ten Chinese guides gained worked examples, diagnosis tables, common mistakes and FAQs while keeping their sources.',
        'The English guides were rewritten from the reviewed Chinese copy, replacing older inconsistent versions.',
        'Five new bilingual guides: brew ratio, sour or bitter diagnosis, tasting and note-taking, an equipment checklist and a brewer comparison.',
        'Short glossary detail pages are no longer submitted for indexing; the glossary index collects them instead.'
      ]
    },
    links: [
      { path: 'blog/coffee-to-water-ratio-guide', zh: '粉水比完全指南', en: 'Brew ratio guide' },
      { path: 'blog/sour-or-bitter-taste-diagnosis', zh: '偏酸還是偏苦？', en: 'Sour or bitter?' }
    ]
  },
  {
    date: '2026-09-09',
    zh: {
      title: '重新設計網站入口頁',
      items: ['入口頁改為按「第一次沖煮、首五杯訓練、認識器材、理解原理」分流。', '新增 404 頁面，私人紀錄頁面不再提交索引。']
    },
    en: {
      title: 'Redesigned the site entry page',
      items: ['The entry page now routes visitors by task: first brew, the five-brew course, recognising equipment and learning the theory.', 'Added a 404 page; private record pages are no longer submitted for indexing.']
    }
  },
  {
    date: '2026-09-01',
    zh: {
      title: '器材選擇助手、咖啡豆護照與個人數據洞察',
      items: ['新增三題器材選擇助手及器材外形圖解，讓新手不用先背器材名稱。', '新增咖啡豆護照，按豆袋追蹤開封日期與沖煮評分。', '累積五杯紀錄後，可查看個人數據洞察。', 'V60 介紹改為引用 HARIO 官方設計說明。']
    },
    en: {
      title: 'Equipment chooser, bean passports and personal insights',
      items: ['Added a three-question equipment chooser and brewer illustrations so beginners can recognise gear by shape.', 'Added bean passports to track opening dates and scores per bag.', 'Personal insights unlock after five recorded brews.', 'The V60 description now cites HARIO’s official design explanation.']
    },
    links: [{ path: 'equipment', zh: '器材選擇助手', en: 'Equipment chooser' }]
  },
  {
    date: '2026-08-31',
    zh: {
      title: '「首五杯」新手訓練與磨豆機校準',
      items: ['新增五杯循序漸進的新手訓練，每杯只練習一個變數。', '新增個人磨豆機校準，把「磨幼一點」換成實際刻度。', '沖煮完成後的味道診斷會按紀錄建議下一杯。']
    },
    en: {
      title: 'First Five Brews course and grinder calibration',
      items: ['Added a five-brew beginner course that practises one variable per brew.', 'Added personal grinder calibration that turns “a little finer” into a real setting.', 'Post-brew taste diagnosis now suggests the next brew from your records.']
    },
    links: [{ path: 'training', zh: '首五杯訓練', en: 'First Five Brews' }]
  },
  {
    date: '2026-08-30',
    zh: {
      title: '有來源配方庫、內容來源覆核與英文版發佈',
      items: ['新增六個附原始來源的標準配方，並清楚標示本站未以實物獨立測試。', '移除無法證實的說法，改為引用來源的建議。', '重新設計知識庫，並在人工審閱後發佈英文版。', '新增沖煮 A/B 比較、資料備份及頁面意見回饋。']
    },
    en: {
      title: 'Source-backed recipes, claim review and English edition',
      items: ['Added six standard recipes that link their original sources and state that Barista Flow has not independently tested them.', 'Removed claims that could not be supported and replaced them with sourced guidance.', 'Redesigned the knowledge library and published the English edition after human review.', 'Added A/B brew comparison, data backup and page feedback.']
    },
    links: [{ path: 'recipes', zh: '有來源配方庫', en: 'Source-backed recipes' }]
  },
  {
    date: '2026-06-14',
    zh: { title: '網站 1.0 版發佈', items: ['發佈三階段注水計時器、粉水比計算及本機沖煮紀錄。'] },
    en: { title: 'Version 1.0 released', items: ['Released the three-stage pour timer, ratio calculator and on-device brew log.'] }
  }
];
