/**
 * Strings for the caffeine calculator and its guides.
 * Every UI string lives here (not in components) so both languages stay in sync.
 * `{name}` placeholders are filled by `fill()`.
 */

const en = {
  'nav.caffeine': 'Caffeine calculator',
  'nav.caffeineShort': 'Caffeine',

  'meta.title': 'Caffeine Calculator: Caffeine Left & Coffee Cutoff for Sleep | Barista Flow',
  'meta.desc': 'Free caffeine calculator: log coffee, tea or energy drinks to estimate the caffeine in your body now, at bedtime, and your latest cup before sleep.',
  'breadcrumb': 'Caffeine calculator',
  'hero.eyebrow': 'Free · private · no account',
  'hero.title': 'Caffeine calculator',
  'hero.subtitle': 'How much caffeine is in your body right now, and when should you stop drinking coffee to sleep well? Log what you drink and get an estimate in seconds.',
  'hero.jump': 'How the estimate works',

  'disclaimer': 'This tool gives general estimates for educational purposes and is not medical advice.',
  'disclaimer.label': 'Disclaimer',
  'estimate': 'typical estimate',

  'dash.heading': 'Your caffeine right now',
  'dash.now.label': 'In your body now',
  'dash.now.sub': 'estimated',
  'dash.unit': 'mg',
  'dash.trend.rising': 'Rising',
  'dash.trend.falling': 'Falling',
  'dash.trend.steady': 'Holding steady',
  'dash.trend.none': 'No caffeine on board',
  'dash.bedtime.label': 'At bedtime ({time})',
  'dash.bedtime.passedLabel': 'If you sleep now (bedtime {time} has passed)',
  'dash.pending': ' — about {mg} mg still being absorbed',
  'dash.status.good': '✅ Good for sleep',
  'dash.status.borderline': '⚠️ Borderline',
  'dash.status.high': '❌ Too high',
  'dash.bedtime.rising': 'Still rising after bedtime: about {mg} mg at {time}.',
  'dash.threshold.note': 'Your sleep threshold: {mg} mg',
  'dash.lastcall.label': 'Last call for a 95 mg cup',
  'dash.lastcall.passed': 'Passed at {time}',
  'dash.lastcall.over': 'Skip more today',
  'dash.lastcall.overNote': 'You are already above your threshold at bedtime.',
  'dash.lastcall.none': 'Doesn’t fit',
  'dash.lastcall.noneNote': 'With these settings, a standard cup would stay above your threshold all night.',
  'dash.lastcall.note': 'Latest time a 95 mg cup keeps you under {mg} mg at bedtime.',
  'dash.today.label': 'Today',
  'dash.today.value': '{mg} of {limit} mg',
  'dash.today.note': 'Counted from your previous bedtime.',
  'dash.progress': 'Daily total compared with your daily reference',

  'warn.daily': 'You have logged {mg} mg today — above the {limit} mg daily reference for healthy adults. Consider decaf or water for the rest of the day. Pregnant people, people sensitive to caffeine and anyone on certain medications should aim much lower.',
  'warn.single': 'One entry is over 1,000 mg — a very large amount of caffeine. If it was a typo, edit or delete it. If you really consumed this much and feel unwell (racing or irregular heartbeat, chest pain, vomiting, confusion, shaking), seek medical help now or call your local emergency number.',

  'log.heading': 'Log a drink',
  'log.quick': 'Quick add — drinking it now',
  'log.quickAria': 'Add {drink}, {mg} mg, now',
  'log.added': 'Added {drink} ({mg} mg) at {time}.',
  'log.details': 'Add with time and amount',
  'log.drink': 'Drink',
  'log.mg': 'Caffeine (mg)',
  'log.mg.hint': 'Typical estimate: {min}–{max} mg. Change it if you know your drink.',
  'log.mg.customHint': 'Use the amount on the label or from the café if you know it.',
  'log.name': 'Name (optional)',
  'log.name.placeholder': 'e.g. Oat flat white',
  'log.time': 'Time',
  'log.day': 'Day',
  'log.day.today': 'Today',
  'log.day.yesterday': 'Yesterday',
  'log.submit': 'Add drink',
  'log.save': 'Save changes',
  'log.cancel': 'Cancel',
  'log.saved': 'Saved {drink}.',
  'log.err.nan': 'Enter the caffeine in milligrams.',
  'log.err.positive': 'Enter an amount above 0 mg.',
  'log.err.large': 'That is more than 3,000 mg — please check the number.',
  'log.err.time': 'Enter a valid time.',
  'log.err.future': 'That time is in the future. Use the “What if?” simulator to plan a drink.',
  'log.list.heading': 'Your drinks',
  'log.list.today': 'Today',
  'log.list.earlier': 'Earlier (still counted in the curve)',
  'log.empty.title': 'Nothing logged yet',
  'log.empty.body': 'Tap a drink above when you have one, or add this morning’s coffee with its time. Your curve and last-call time appear straight away.',
  'log.edit': 'Edit',
  'log.editAria': 'Edit {drink} at {time}',
  'log.delete': 'Delete',
  'log.deleteAria': 'Delete {drink} at {time}',
  'log.deleted': 'Deleted {drink}.',
  'log.undo': 'Undo',
  'log.editing': 'Editing: {drink}',

  'chart.heading': '24-hour caffeine curve',
  'chart.desc': 'Estimated caffeine in your body. Hover, tap or use the arrow keys to read values.',
  'chart.legend.curve': 'Your caffeine',
  'chart.legend.ghost': 'What if',
  'chart.legend.threshold': 'Sleep threshold',
  'chart.legend.bedtime': 'Bedtime',
  'chart.legend.now': 'Now',
  'chart.legend.dose': 'Drink',
  'chart.label': 'Chart of estimated caffeine in your body over 24 hours',
  'chart.summary': 'From {start} to {end}. Now about {now} mg. Highest about {peak} mg at {peakTime}. At bedtime ({bedtime}) about {bed} mg, compared with a threshold of {threshold} mg.',
  'chart.summary.empty': 'No drinks in this period, so the estimate stays at 0 mg.',
  'chart.tooltip.ghost': 'what if {mg} mg',

  'whatif.heading': 'What if?',
  'whatif.intro': 'Try a drink before you have it. Nothing is saved.',
  'whatif.drink': 'Drink',
  'whatif.time': 'At',
  'whatif.mg': 'Caffeine (mg)',
  'whatif.idle': 'Pick a drink and a time to see a dashed “what if” curve on the chart.',
  'whatif.result': 'If you have {drink} ({mg} mg) at {time}, your bedtime level would be about {after} mg — {status} — instead of {before} mg.',
  'whatif.resultRising': 'It would still be rising after bedtime, peaking near {peak} mg.',
  'whatif.clear': 'Clear',
  'whatif.err': 'Enter a valid amount and time.',

  'settings.heading': 'Your settings',
  'settings.bedtime': 'Bedtime',
  'settings.halflife': 'Caffeine half-life',
  'settings.halflife.value': '{h} h',
  'settings.halflife.help': 'How long your body takes to clear half of the caffeine. Healthy adults are often between about 3 and 7 hours. Unsure? Keep 5 hours.',
  'settings.preset.fast': 'Fast metabolizer (~3 h)',
  'settings.preset.avg': 'Average (~5 h)',
  'settings.preset.slow': 'Slow metabolizer (~7 h)',
  'settings.threshold': 'Sleep threshold at bedtime (mg)',
  'settings.threshold.help': '50 mg is a general guideline, not a medical limit. Lower it if caffeine easily keeps you awake.',
  'settings.limit': 'Daily reference (mg)',
  'settings.limit.help': '400 mg a day is the amount the FDA and EFSA cite for healthy adults. Pregnancy and some health conditions call for much less — ask your doctor.',
  'settings.timeformat': 'Time format',
  'settings.timeformat.auto': 'Auto',
  'settings.timeformat.12': '12-hour',
  'settings.timeformat.24': '24-hour',
  'settings.err.range': 'Enter a number between {min} and {max}.',

  'privacy.heading': 'Your data stays on this device',
  'privacy.body': 'Drinks and settings are saved only in this browser (localStorage). There are no accounts, nothing is sent to a server, and no health data is tracked.',
  'privacy.storageOff': 'Your browser is blocking storage, so entries will disappear when you close this page.',
  'privacy.clear': 'Clear my data',
  'privacy.confirm.title': 'Clear all caffeine data?',
  'privacy.confirm.body': 'This deletes every logged drink and your settings from this browser. It can’t be undone.',
  'privacy.confirm.yes': 'Yes, clear everything',
  'privacy.confirm.no': 'Keep my data',
  'privacy.cleared': 'All caffeine data cleared.',

  'share.heading': 'Share your day',
  'share.intro': 'Make an image for stories or chats. It shows only your totals and last-call time.',
  'share.story': 'Story 1080×1920',
  'share.square': 'Square 1080×1080',
  'share.download': 'Download image',
  'share.share': 'Share…',
  'share.alt': 'Preview of your caffeine share card',
  'share.card.title': 'My caffeine today',
  'share.card.now': 'In my body now: ~{mg} mg',
  'share.card.bedtime': 'At bedtime: ~{mg} mg',
  'share.card.lastcall': 'Last call: {time}',
  'share.card.lastcallPassed': 'Last call was {time}',
  'share.card.lastcallOver': 'Last call: done for today',
  'share.card.note': 'Estimate only · not medical advice',
  'share.error': 'Sorry — this browser could not create the image.',
  'share.filename': 'my-caffeine-today',

  'support.text': 'Find this useful? Buy me a coffee ☕ (decaf is fine 😄)',
  'support.cta': 'Buy me a coffee',
  'support.dismiss': 'Dismiss',

  'guides.heading': 'Learn more',
  'guides.halfLife': 'Caffeine half-life: why it differs from person to person',
  'guides.sleep': 'Caffeine and sleep: when to have your last coffee',
  'guides.drinks': 'How much caffeine is in coffee, tea and other drinks?',
  'faq.heading': 'Frequently asked questions',
  'toc.heading': 'On this page',
  'article.published': 'Published',
  'article.updated': 'Updated',
  'article.reviewed': 'Written by the Barista Flow editorial team. Sources are linked at the end.',
  'article.sources': 'Sources',
  'article.toolCta': 'Try it with your own drinks',
  'article.toolCtaBody': 'The caffeine calculator turns these ideas into a personal estimate: log your drinks, set your bedtime and half-life, and see your last-call time.',
  'article.toolCtaButton': 'Open the caffeine calculator',
  'article.related': 'Related guides',

  'drink.espresso': 'Espresso (single)',
  'drink.espresso.size': '~30 ml shot',
  'drink.double-espresso': 'Double espresso',
  'drink.double-espresso.size': '~60 ml',
  'drink.drip': 'Drip / filter coffee',
  'drink.drip.size': '240 ml cup',
  'drink.americano': 'Americano',
  'drink.americano.size': '2 shots + water',
  'drink.latte-single': 'Latte / cappuccino (1 shot)',
  'drink.latte-single.size': '1 espresso shot',
  'drink.latte-double': 'Latte / cappuccino (2 shots)',
  'drink.latte-double.size': '2 espresso shots',
  'drink.cold-brew': 'Cold brew',
  'drink.cold-brew.size': '350 ml',
  'drink.instant': 'Instant coffee',
  'drink.instant.size': '1–2 tsp, 240 ml',
  'drink.black-tea': 'Black tea',
  'drink.black-tea.size': '240 ml',
  'drink.green-tea': 'Green tea',
  'drink.green-tea.size': '240 ml',
  'drink.cola': 'Cola',
  'drink.cola.size': '355 ml can',
  'drink.energy': 'Energy drink',
  'drink.energy.size': '250 ml can',
  'drink.decaf': 'Decaf coffee',
  'drink.decaf.size': '240 ml',
  'drink.custom': 'Custom drink',
  'drink.custom.size': 'enter your own amount'
};

type Dict = typeof en;

const zh: Dict = {
  'nav.caffeine': '咖啡因計算器',
  'nav.caffeineShort': '咖啡因',

  'meta.title': '咖啡因計算器：估算體內咖啡因與最後一杯咖啡時間 | Barista Flow',
  'meta.desc': '免費咖啡因計算器：記錄咖啡、茶、可樂或能量飲品，估算你現在體內有多少咖啡因、睡前剩多少，以及今天最遲幾點還可以再喝一杯。',
  'breadcrumb': '咖啡因計算器',
  'hero.eyebrow': '免費・私隱・毋須註冊',
  'hero.title': '咖啡因計算器',
  'hero.subtitle': '我現在體內有多少咖啡因？今天最遲幾點要停喝咖啡，晚上才睡得好？記錄你飲過甚麼，幾秒就有估算。',
  'hero.jump': '估算原理',

  'disclaimer': '本工具只提供一般性估算，作教育用途，並非醫療建議。',
  'disclaimer.label': '免責聲明',
  'estimate': '一般估算',

  'dash.heading': '你此刻的咖啡因',
  'dash.now.label': '現在體內約有',
  'dash.now.sub': '估算',
  'dash.unit': '毫克',
  'dash.trend.rising': '上升中',
  'dash.trend.falling': '正在下降',
  'dash.trend.steady': '大致持平',
  'dash.trend.none': '體內沒有咖啡因',
  'dash.bedtime.label': '睡覺時（{time}）',
  'dash.bedtime.passedLabel': '如果現在睡（已過 {time} 睡覺時間）',
  'dash.pending': '——約 {mg} 毫克仍在吸收中',
  'dash.status.good': '✅ 適合入睡',
  'dash.status.borderline': '⚠️ 接近上限',
  'dash.status.high': '❌ 偏高',
  'dash.bedtime.rising': '睡後仍會上升：約 {time} 達 {mg} 毫克。',
  'dash.threshold.note': '你的睡前上限：{mg} 毫克',
  'dash.lastcall.label': '95 毫克一杯的最後時間',
  'dash.lastcall.passed': '已在 {time} 過了',
  'dash.lastcall.over': '今天別再喝了',
  'dash.lastcall.overNote': '不再喝任何咖啡因，睡覺時也已高於你的上限。',
  'dash.lastcall.none': '放不下',
  'dash.lastcall.noneNote': '以目前設定，任何時間喝一杯標準咖啡，整晚都會高於上限。',
  'dash.lastcall.note': '這是喝一杯 95 毫克咖啡、睡覺時仍低於 {mg} 毫克的最遲時間。',
  'dash.today.label': '今天',
  'dash.today.value': '{mg}／{limit} 毫克',
  'dash.today.note': '由上一次睡覺時間起計。',
  'dash.progress': '今天總量與每日參考量的比較',

  'warn.daily': '你今天已記錄 {mg} 毫克，超過健康成年人每日 {limit} 毫克的參考量。今天餘下時間可考慮改喝低因咖啡或清水。懷孕、對咖啡因敏感或正服用某些藥物的人，應把攝取量控制得更低。',
  'warn.single': '有一項紀錄超過 1,000 毫克，這是非常大量的咖啡因。如果是輸入錯誤，請修改或刪除。如果你真的攝取了這麼多並感到不適（心跳過快或不規則、胸痛、嘔吐、神志混亂、顫抖），請立即求醫或致電 999。',

  'log.heading': '記錄一杯飲品',
  'log.quick': '快速加入（現在正喝）',
  'log.quickAria': '加入 {drink}，{mg} 毫克，時間為現在',
  'log.added': '已加入 {drink}（{mg} 毫克），時間 {time}。',
  'log.details': '自訂時間與份量',
  'log.drink': '飲品',
  'log.mg': '咖啡因（毫克）',
  'log.mg.hint': '一般估算：{min}–{max} 毫克。如你知道實際份量，可直接修改。',
  'log.mg.customHint': '如包裝或咖啡店有標示，請輸入該數值。',
  'log.name': '名稱（可選）',
  'log.name.placeholder': '例如：燕麥奶 Flat White',
  'log.time': '時間',
  'log.day': '日子',
  'log.day.today': '今天',
  'log.day.yesterday': '昨天',
  'log.submit': '加入飲品',
  'log.save': '儲存修改',
  'log.cancel': '取消',
  'log.saved': '已更新 {drink}。',
  'log.err.nan': '請輸入咖啡因毫克數。',
  'log.err.positive': '請輸入大於 0 的份量。',
  'log.err.large': '超過 3,000 毫克，請檢查數字是否正確。',
  'log.err.time': '請輸入有效時間。',
  'log.err.future': '這個時間還未到。想預先計劃，請使用下方的「如果……會怎樣？」模擬。',
  'log.list.heading': '你的飲品紀錄',
  'log.list.today': '今天',
  'log.list.earlier': '較早（仍計入曲線）',
  'log.empty.title': '還未有紀錄',
  'log.empty.body': '喝的時候按上面的飲品即可，或者補記今早那杯咖啡和時間。加入後，曲線和最後一杯時間會立即顯示。',
  'log.edit': '修改',
  'log.editAria': '修改 {time} 的 {drink}',
  'log.delete': '刪除',
  'log.deleteAria': '刪除 {time} 的 {drink}',
  'log.deleted': '已刪除 {drink}。',
  'log.undo': '復原',
  'log.editing': '正在修改：{drink}',

  'chart.heading': '24 小時咖啡因曲線',
  'chart.desc': '體內咖啡因的估算。可懸停、輕觸或用方向鍵查看數值。',
  'chart.legend.curve': '你的咖啡因',
  'chart.legend.ghost': '如果……',
  'chart.legend.threshold': '睡前上限',
  'chart.legend.bedtime': '睡覺時間',
  'chart.legend.now': '現在',
  'chart.legend.dose': '飲品',
  'chart.label': '24 小時體內咖啡因估算圖表',
  'chart.summary': '時間範圍 {start} 至 {end}。現在約 {now} 毫克；最高約 {peak} 毫克（{peakTime}）。睡覺時（{bedtime}）約 {bed} 毫克，上限為 {threshold} 毫克。',
  'chart.summary.empty': '這段時間沒有飲品紀錄，估算維持 0 毫克。',
  'chart.tooltip.ghost': '模擬 {mg} 毫克',

  'whatif.heading': '如果……會怎樣？',
  'whatif.intro': '喝之前先試算，不會儲存任何紀錄。',
  'whatif.drink': '飲品',
  'whatif.time': '時間',
  'whatif.mg': '咖啡因（毫克）',
  'whatif.idle': '選擇飲品和時間，圖表會以虛線顯示模擬曲線。',
  'whatif.result': '如果你在{time}喝{drink}（{mg} 毫克），睡覺時約有 {after} 毫克（{status}），原本約 {before} 毫克。',
  'whatif.resultRising': '睡後仍會上升，最高約 {peak} 毫克。',
  'whatif.clear': '清除',
  'whatif.err': '請輸入有效的份量和時間。',

  'settings.heading': '你的設定',
  'settings.bedtime': '睡覺時間',
  'settings.halflife': '咖啡因半衰期',
  'settings.halflife.value': '{h} 小時',
  'settings.halflife.help': '身體清除一半咖啡因所需的時間。健康成年人通常約 3 至 7 小時；不確定的話，保持 5 小時即可。',
  'settings.preset.fast': '代謝較快（約 3 小時）',
  'settings.preset.avg': '一般（約 5 小時）',
  'settings.preset.slow': '代謝較慢（約 7 小時）',
  'settings.threshold': '睡覺時的上限（毫克）',
  'settings.threshold.help': '50 毫克只是一般參考，並非醫學標準。如果咖啡因容易令你睡不着，可調低。',
  'settings.limit': '每日參考量（毫克）',
  'settings.limit.help': '每日 400 毫克是美國 FDA 及歐洲 EFSA 對健康成年人引用的數值。懷孕及部分健康狀況需要更低，請諮詢醫生。',
  'settings.timeformat': '時間格式',
  'settings.timeformat.auto': '自動',
  'settings.timeformat.12': '12 小時制',
  'settings.timeformat.24': '24 小時制',
  'settings.err.range': '請輸入 {min} 至 {max} 之間的數字。',

  'privacy.heading': '資料只留在這部裝置',
  'privacy.body': '飲品紀錄和設定只儲存在這個瀏覽器的 localStorage。不設帳戶、不會傳送到伺服器，也不追蹤任何健康資料。',
  'privacy.storageOff': '你的瀏覽器封鎖了儲存功能，關閉頁面後紀錄會消失。',
  'privacy.clear': '清除我的資料',
  'privacy.confirm.title': '清除所有咖啡因資料？',
  'privacy.confirm.body': '這會在此瀏覽器刪除所有飲品紀錄和設定，無法復原。',
  'privacy.confirm.yes': '確定全部清除',
  'privacy.confirm.no': '保留資料',
  'privacy.cleared': '已清除所有咖啡因資料。',

  'share.heading': '分享你的一天',
  'share.intro': '製作一張適合限時動態或聊天的圖片，只包含總量和最後一杯時間。',
  'share.story': '限時動態 1080×1920',
  'share.square': '正方形 1080×1080',
  'share.download': '下載圖片',
  'share.share': '分享…',
  'share.alt': '咖啡因分享圖片預覽',
  'share.card.title': '我今天的咖啡因',
  'share.card.now': '現在體內：約 {mg} 毫克',
  'share.card.bedtime': '睡覺時：約 {mg} 毫克',
  'share.card.lastcall': '最後一杯：{time}',
  'share.card.lastcallPassed': '最後一杯已在 {time}',
  'share.card.lastcallOver': '最後一杯：今天已夠',
  'share.card.note': '僅為估算・並非醫療建議',
  'share.error': '抱歉，這個瀏覽器未能製作圖片。',
  'share.filename': 'my-caffeine-today',

  'support.text': '覺得有用？請我飲杯咖啡 ☕（低因都得 😄）',
  'support.cta': '請我飲杯咖啡',
  'support.dismiss': '關閉',

  'guides.heading': '延伸閱讀',
  'guides.halfLife': '咖啡因半衰期：為何每個人代謝速度不同',
  'guides.sleep': '咖啡因與睡眠：最後一杯咖啡應在幾點前喝',
  'guides.drinks': '咖啡、茶和其他飲品含多少咖啡因？',
  'faq.heading': '常見問題',
  'toc.heading': '本頁內容',
  'article.published': '發佈',
  'article.updated': '更新',
  'article.reviewed': '由 Barista Flow 編輯團隊撰寫，參考來源列於文末。',
  'article.sources': '參考來源',
  'article.toolCta': '用你自己的飲品試算',
  'article.toolCtaBody': '咖啡因計算器把這些原理變成個人化估算：記錄飲品、設定睡覺時間和半衰期，就能看到最後一杯的時間。',
  'article.toolCtaButton': '打開咖啡因計算器',
  'article.related': '相關指南',

  'drink.espresso': '濃縮咖啡（單份）',
  'drink.espresso.size': '約 30 毫升',
  'drink.double-espresso': '雙份濃縮咖啡',
  'drink.double-espresso.size': '約 60 毫升',
  'drink.drip': '滴濾／手沖咖啡',
  'drink.drip.size': '240 毫升一杯',
  'drink.americano': '美式咖啡',
  'drink.americano.size': '兩份濃縮加水',
  'drink.latte-single': '拿鐵／卡布奇諾（單份）',
  'drink.latte-single.size': '一份濃縮',
  'drink.latte-double': '拿鐵／卡布奇諾（雙份）',
  'drink.latte-double.size': '兩份濃縮',
  'drink.cold-brew': '冷萃咖啡',
  'drink.cold-brew.size': '350 毫升',
  'drink.instant': '即溶咖啡',
  'drink.instant.size': '1–2 茶匙，240 毫升',
  'drink.black-tea': '紅茶',
  'drink.black-tea.size': '240 毫升',
  'drink.green-tea': '綠茶',
  'drink.green-tea.size': '240 毫升',
  'drink.cola': '可樂',
  'drink.cola.size': '355 毫升一罐',
  'drink.energy': '能量飲品',
  'drink.energy.size': '250 毫升一罐',
  'drink.decaf': '低因咖啡',
  'drink.decaf.size': '240 毫升',
  'drink.custom': '自訂飲品',
  'drink.custom.size': '自行輸入份量'
};

export type CaffeineKey = keyof Dict;
export type CaffeineLang = 'en' | 'zh-TW';
export type CaffeineDict = Dict;

export const caffeineStrings: Record<CaffeineLang, Dict> = { en, 'zh-TW': zh };

/** Replaces `{name}` placeholders. */
export function fill(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

export function caffeineLang(lang: string): CaffeineLang {
  return lang === 'zh-TW' ? 'zh-TW' : 'en';
}

/** Server-side translator for Astro components. */
export function useCaffeineT(lang: string) {
  const dict = caffeineStrings[caffeineLang(lang)];
  return (key: CaffeineKey, params?: Record<string, string | number>) => fill(dict[key] ?? en[key] ?? key, params);
}

/** Locale used for Intl date/time formatting. */
export function intlLocale(lang: string): string {
  return lang === 'zh-TW' ? 'zh-HK' : 'en-US';
}

/* ------------------------------------------------------------------ */
/* FAQ (rendered on the tool page and emitted as FAQPage JSON-LD)       */
/* ------------------------------------------------------------------ */

export interface FaqItem {
  q: string;
  a: string;
}

export const caffeineFaq: Record<CaffeineLang, FaqItem[]> = {
  en: [
    {
      q: 'How accurate is this caffeine calculator?',
      a: 'It is an educational estimate, not a measurement. It applies a standard one-compartment model with an assumed absorption peak at about 45 minutes and the half-life you choose. Real values depend on the actual caffeine in your drink, which can vary widely, and on your own metabolism. Treat the numbers as a sensible guide for planning, not as a blood test.'
    },
    {
      q: 'How long does caffeine stay in your body?',
      a: 'With a 5-hour half-life, about half of a dose is still present 5 hours later and about a quarter after 10 hours. It takes roughly five half-lives (around a day at 5 hours) for nearly all of it to be cleared. People with a longer half-life — for example during pregnancy or while taking certain medications — keep caffeine for much longer.'
    },
    {
      q: 'What half-life should I choose?',
      a: 'If you are unsure, keep the average of 5 hours. Choose about 3 hours if you smoke or know you clear caffeine quickly, and about 7 hours if a mid-afternoon coffee usually keeps you awake. Pregnancy, oral contraceptives, liver disease and some medications can lengthen the half-life well beyond this range; ask your doctor rather than guessing.'
    },
    {
      q: 'Why is the sleep threshold 50 mg?',
      a: 'There is no official “safe for sleep” level. We use 50 mg — roughly half a standard cup of filter coffee — as a practical, conservative default, because studies show that even caffeine taken six hours before bed can reduce sleep. Many people sleep fine with more and some sensitive people notice less, so you can change it in Settings.'
    },
    {
      q: 'How is the “last call” time calculated?',
      a: 'The calculator tests a standard 95 mg cup at five-minute steps before your bedtime and finds the latest time at which your total estimated caffeine — everything you have already logged plus that cup — stays at or below your threshold at bedtime and during the first hours of sleep. If you are already above the threshold, it tells you to skip more caffeine today.'
    },
    {
      q: 'How much caffeine is too much in a day?',
      a: 'The U.S. FDA and the European Food Safety Authority both cite up to 400 mg a day as an amount not generally associated with harmful effects in healthy adults. EFSA advises up to 200 mg a day during pregnancy and breastfeeding. Children, teenagers and people with heart conditions, anxiety or sensitivity to caffeine should be more cautious. The calculator warns you if your daily total passes the limit you set.'
    },
    {
      q: 'Does decaf coffee have caffeine?',
      a: 'Yes, a little. Decaffeinated coffee usually contains a few milligrams per cup, and laboratory tests of coffee-shop decaf have found up to about 15–18 mg in a large cup. That is small, but it is not zero, so log it if you drink several decaf cups in the evening.'
    },
    {
      q: 'Is my data stored or shared?',
      a: 'No account is needed and nothing you log is sent to us. Drinks and settings are saved only in your browser’s localStorage on this device. You can delete everything at any time with “Clear my data”. Share images are created on your device and only leave it if you choose to download or share them.'
    },
    {
      q: 'Can I use this if I am pregnant, a teenager or taking medication?',
      a: 'You can use it to understand the idea, but the default settings are designed for healthy adults. Pregnancy and several medications slow caffeine clearance a great deal, and lower daily limits apply. Please follow the advice of your doctor, midwife or pharmacist rather than the calculator.'
    }
  ],
  'zh-TW': [
    {
      q: '這個咖啡因計算器有多準確？',
      a: '這是教育用途的估算，並非實際量度。計算器使用常見的單室藥代動力學模型，假設大約 45 分鐘達到吸收高峰，並採用你所選的半衰期。實際數值取決於飲品的真實咖啡因含量（差異可以很大）和你的個人代謝，因此請把結果當作規劃參考，而不是驗血報告。'
    },
    {
      q: '咖啡因會在身體停留多久？',
      a: '以半衰期 5 小時計，5 小時後體內仍約有一半，10 小時後約剩四分之一。大約要經過五個半衰期（約一整天）才會幾乎完全清除。半衰期較長的人，例如懷孕期間或服用某些藥物時，咖啡因會停留得更久。'
    },
    {
      q: '我應該選哪個半衰期？',
      a: '不確定的話，保持一般的 5 小時。如果你吸煙或知道自己代謝咖啡因較快，可選約 3 小時；如果下午一杯咖啡通常令你晚上睡不着，可選約 7 小時。懷孕、口服避孕藥、肝病及部分藥物可令半衰期遠超這個範圍，請向醫生查詢，不要自行猜測。'
    },
    {
      q: '為甚麼睡前上限預設為 50 毫克？',
      a: '目前沒有官方的「安睡」咖啡因水平。我們以 50 毫克（約半杯標準滴濾咖啡）作為實用而保守的預設值，因為研究顯示即使在睡前六小時攝取咖啡因，仍可能縮短睡眠。有些人攝取更多也睡得好，也有敏感的人對更少份量已有感覺，所以你可以在設定中調整。'
    },
    {
      q: '「最後一杯」時間是怎樣計算的？',
      a: '計算器會在睡覺時間之前，以每五分鐘為一步，測試一杯 95 毫克的標準咖啡，找出最遲在甚麼時間喝，連同你已記錄的所有飲品，睡覺時及入睡後最初幾小時的估算總量仍不超過你的上限。如果你已經高於上限，計算器會建議你今天不要再攝取咖啡因。'
    },
    {
      q: '一天攝取多少咖啡因算太多？',
      a: '美國食品藥物管理局（FDA）及歐洲食品安全局（EFSA）均指出，健康成年人每日最多 400 毫克一般不會引致不良影響。EFSA 建議懷孕及哺乳期間每日不超過 200 毫克；香港食物安全中心亦提醒孕婦、兒童及對咖啡因敏感的人士應留意攝取量。兒童、青少年、心臟病或焦慮症患者應更加小心。當每日總量超過你設定的上限時，計算器會提示你。'
    },
    {
      q: '低因咖啡有咖啡因嗎？',
      a: '有，只是很少。低因咖啡一般每杯含數毫克，有實驗室測試發現咖啡店的大杯低因咖啡最多約含 15 至 18 毫克。份量雖小但並非零，如果你晚上會喝幾杯低因咖啡，也建議記錄。'
    },
    {
      q: '我的資料會被儲存或分享嗎？',
      a: '毋須帳戶，你記錄的內容不會傳送給我們。飲品和設定只儲存在這部裝置瀏覽器的 localStorage，你可以隨時按「清除我的資料」全部刪除。分享圖片在你的裝置上製作，只有在你選擇下載或分享時才會離開裝置。'
    },
    {
      q: '懷孕、青少年或正在服藥的人可以使用嗎？',
      a: '你可以用它了解概念，但預設設定是為健康成年人而設。懷孕和多種藥物會大幅減慢咖啡因代謝，而且適用的每日上限更低。請以醫生、助產士或藥劑師的建議為準，不要只依賴計算器。'
    }
  ]
};
