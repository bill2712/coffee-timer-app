// Brewer-specific guidance shown under each standard recipe.
// Advice follows the site's one-variable-at-a-time approach and the reviewed guides it links to.

export type Brewer = 'V60' | 'AeroPress' | 'French Press' | 'Cold Brew';

interface Copy {
  readTitle: string;
  read: string[];
  scaleDoses: number[];
  scaleNote: string;
  table: [string, string, string][]; // symptom, first change, why
  mistakes: [string, string][];
  related: [string, string][]; // path, label
}

const zh: Record<Brewer, Copy> = {
  V60: {
    readTitle: '怎樣跟這個配方',
    read: [
      '先照足原來的粉量、水量與時間沖一次，不要同時加入自己的改動。第一杯的作用是建立比較基準。',
      '把電子磅放在下壺下面歸零，每次注水都看「累積重量」，而不是每段加了多少。計時器顯示的就是累積目標。',
      '記下完成時間。完成時間比配方慢或快 30 秒以上，通常是研磨度與你的磨豆機不同，而不是手法問題。'
    ],
    scaleDoses: [12, 15, 18, 22],
    scaleNote: '加大粉量時，粉床變厚，滴濾時間通常會變長。粉量增加三成以上時，可先把研磨調粗一小格，再按時間微調。',
    table: [
      ['偏酸、尖銳、薄', '研磨調細一小格', '萃取不足時，較幼的粉增加接觸面積並減慢流速。'],
      ['偏苦、乾口、澀', '研磨調粗一小格', '萃取過高或細粉太多，令後段帶出苦澀物質。'],
      ['味道平衡但太淡', '粉水比減 1（例如 1:16.7 → 1:15.7）', '濃度問題應改比例；研磨不變，萃取率大致相同。'],
      ['味道平衡但太濃', '粉水比加 1', '多一點水會降低濃度，而不改變萃取方向。'],
      ['滴濾到最後停住', '研磨調粗，並檢查濾紙是否貼合', '細粉堵塞濾紙或濾紙折疊不貼，會令尾段明顯變慢。']
    ],
    mistakes: [
      ['一次改兩樣東西', '同時改研磨和水溫，便無法知道哪一項令味道改變。'],
      ['悶蒸時沒有完全濕透', '乾粉團令部分咖啡萃取不足，可在悶蒸時輕搖濾杯。'],
      ['直接沖向濾紙邊', '水沿濾紙流走而沒有經過粉床，杯中會變淡。']
    ],
    related: [['blog/three-stage-pour-dynamics', '三階段注水：把總水量拆成可觀察的節奏'], ['blog/filter-rinsing-and-drawdown', '濾紙預濕與尾段變慢'], ['blog/dial-in-one-variable-at-a-time', '手沖校正：每次只改一個變數']]
  },
  AeroPress: {
    readTitle: '怎樣跟這個配方',
    read: [
      '使用直立方法：先在濾蓋放濾紙並固定，再把愛樂壓放在穩固、耐熱的杯上。避免拿著裝有熱水的器具翻轉。',
      '注水後插入活塞少許形成密封，可減少浸泡期間咖啡提早滴下。',
      '下壓時保持垂直，以手臂重量慢慢壓約 20–30 秒；阻力突然增加時不要硬壓。'
    ],
    scaleDoses: [11, 14, 17],
    scaleNote: '愛樂壓容量有限，加大粉量時應保持水量在壓筒標示範圍內。想要較多份量，可沖一份較濃的咖啡，再在杯中加熱水稀釋。',
    table: [
      ['偏酸、薄', '浸泡時間加 30 秒', '浸泡法的萃取主要由時間控制，比改研磨更容易重現。'],
      ['偏苦、澀', '浸泡時間減 30 秒，或研磨調粗', '先改時間，仍苦才改研磨。'],
      ['太濃', '在杯中加 20–30 g 熱水', '愛樂壓常沖出較濃的咖啡，稀釋是正常步驟。'],
      ['太淡', '減少稀釋用水，或增加 1–2 g 粉', '濃度問題先處理比例。'],
      ['很難壓下', '研磨調粗一小格', '過幼的粉會塞住濾紙，強行下壓有翻側風險。']
    ],
    mistakes: [
      ['用沸水沖深焙豆', '愛樂壓浸泡時間短而濃，深焙豆在較低水溫通常較易控制苦味。'],
      ['下壓太快太大力', '容易令器具不穩，也會令杯中帶出更多細粉。'],
      ['倒置法時翻轉器具', '裝滿熱水的器具翻轉時有燙傷風險，本站不建議。']
    ],
    related: [['blog/pour-over-french-press-aeropress-compared', '手沖、法壓與愛樂壓比較'], ['blog/roast-level-and-temperature', '烘焙度與沖煮溫度'], ['blog/sour-or-bitter-taste-diagnosis', '偏酸還是偏苦？']]
  },
  'French Press': {
    readTitle: '怎樣跟這個配方',
    read: [
      '先用熱水溫壺並倒掉，玻璃壺會吸走大量熱力。',
      '一次注入全部熱水，確保所有咖啡粉濕透，然後蓋上蓋但先不下壓。',
      '按配方時間攪拌，到時間便以穩定力度慢慢下壓，不要用力擠壓粉渣。之後立即把全部咖啡倒出，倒到最後時留下壺底一口，杯中會乾淨得多。'
    ],
    scaleDoses: [15, 30, 45, 56],
    scaleNote: '法壓壺的粉量可以直接按比例放大，浸泡時間大致不變。注意水量不要超過壺身標示的最高水位。',
    table: [
      ['偏酸、薄', '浸泡時間加 1 分鐘', '浸泡法以時間控制萃取；先改時間比改研磨容易重現。'],
      ['偏苦、澀', '研磨調粗一小格，或提早下壓', '粉太幼或浸泡過長會令苦澀增加。'],
      ['杯底有很多泥', '研磨調粗，並在下壓前多等幾分鐘讓細粉沉澱', '金屬濾網擋不住細粉。'],
      ['太濃', '粉水比加 1–2', '法壓常用較濃比例，可按口味放寬。'],
      ['太淡', '粉水比減 1–2', '研磨與時間不變，只改比例。']
    ],
    mistakes: [
      ['只浸泡兩分鐘便下壓', '通常萃取不足，味道酸而水感重。'],
      ['大力擠壓粉渣', '會把細粉和苦澀物質擠進咖啡，應以穩定力度慢慢下壓。'],
      ['沖好後留在壺中', '咖啡會繼續與粉接觸，愈放愈苦；應一次倒出。']
    ],
    related: [['blog/pour-over-french-press-aeropress-compared', '手沖、法壓與愛樂壓比較'], ['blog/coffee-to-water-ratio-guide', '粉水比完全指南'], ['tools/french-press', '法式濾壓壺計時器']]
  },
  'Cold Brew': {
    readTitle: '怎樣跟這個配方',
    read: [
      '使用乾淨器具和可飲用水。原配方只指定冷水；本站建議浸泡期間放雪櫃，較容易控制衞生。',
      '這是濃縮液配方：完成後需要加水、冰或奶稀釋，不要直接當即飲咖啡飲用。',
      '過濾後放入有蓋容器冷藏並盡快飲用；如曾長時間離開雪櫃或狀態可疑，請棄掉。'
    ],
    scaleDoses: [71, 142, 284],
    scaleNote: '縮小份量時保持相同粉水比和浸泡時間即可。份量少時，濾紙過濾會快得多。',
    table: [
      ['偏苦、澀', '浸泡時間減 2–4 小時，或研磨調粗', '冷萃仍可能萃取過度，尤其是研磨太幼時。'],
      ['偏酸、淡', '浸泡時間加 4–6 小時', '低溫萃取較慢，需要足夠時間。'],
      ['稀釋後太淡', '減少稀釋用水（例如由 1:3 改為 1:2）', '先調整飲用時的稀釋量，再考慮改沖煮比例。'],
      ['過濾很慢', '先用粗網隔走大部分粉渣，再用濾紙', '細粉會塞住濾紙。'],
      ['放幾天後味道變差', '縮小每批份量，盡快飲用', '冷萃風味會隨時間轉變，安全亦較難靠外觀判斷。']
    ],
    mistakes: [
      ['放在室溫浸泡', '家用環境較難控制衞生，本站建議全程冷藏。'],
      ['研磨太幼', '過濾困難，杯中也容易帶苦澀。'],
      ['未稀釋便飲用濃縮液', '濃度和咖啡因都會比一般咖啡高得多。']
    ],
    related: [['tools/cold-brew', '冷萃比例計算器'], ['blog/coffee-storage-freezing-guide', '咖啡豆保存與冷凍'], ['blog/coffee-to-water-ratio-guide', '粉水比完全指南']]
  }
};

const en: Record<Brewer, Copy> = {
  V60: {
    readTitle: 'How to follow this recipe',
    read: [
      'Brew it once exactly as written, with the original dose, water and time, before adding your own changes. The first cup is your baseline.',
      'Tare the scale under the server and watch the cumulative weight for every pour rather than how much each pour adds. The timer shows cumulative targets.',
      'Note the finish time. Finishing 30 seconds or more off the recipe usually means your grind differs from the author’s grinder, not that your technique is wrong.'
    ],
    scaleDoses: [12, 15, 18, 22],
    scaleNote: 'A larger dose makes a deeper bed, so drawdown usually takes longer. If you raise the dose by more than about 30%, grind one small step coarser first, then fine-tune by time.',
    table: [
      ['Sour, sharp or thin', 'Grind one small step finer', 'Finer grounds expose more surface and slow the flow when the cup is under-extracted.'],
      ['Bitter, drying or astringent', 'Grind one small step coarser', 'High extraction or too many fines pulls harsh compounds late in the brew.'],
      ['Balanced but weak', 'Lower the ratio by 1 (e.g. 1:16.7 → 1:15.7)', 'Strength is a ratio problem; with the grind unchanged, extraction stays similar.'],
      ['Balanced but strong', 'Raise the ratio by 1', 'More water lowers strength without changing the direction of extraction.'],
      ['Drawdown stalls at the end', 'Grind coarser and check the filter seats properly', 'Fines clogging the paper or a badly folded filter slow the final drain.']
    ],
    mistakes: [
      ['Changing two things at once', 'If grind and temperature both change, you cannot tell which one changed the taste.'],
      ['Leaving dry clumps in the bloom', 'Dry pockets under-extract; swirl the brewer gently during the bloom.'],
      ['Pouring onto the filter paper', 'Water runs down the paper without passing through the bed, weakening the cup.']
    ],
    related: [['blog/three-stage-pour-dynamics', 'Three-stage pouring'], ['blog/filter-rinsing-and-drawdown', 'Filter rinsing and slow drawdown'], ['blog/dial-in-one-variable-at-a-time', 'Dial in one variable at a time']]
  },
  AeroPress: {
    readTitle: 'How to follow this recipe',
    read: [
      'Use the upright method: fit the filter in the cap and lock it on, then stand the AeroPress on a stable, heat-resistant mug. Do not flip a brewer full of hot water.',
      'After pouring, insert the plunger slightly to form a seal so less coffee drips through during the steep.',
      'Press vertically and slowly for about 20–30 seconds using your arm’s weight. If resistance suddenly rises, do not force it.'
    ],
    scaleDoses: [11, 14, 17],
    scaleNote: 'The AeroPress has limited capacity, so keep the water within the chamber markings when you raise the dose. For a larger drink, brew a stronger cup and dilute with hot water.',
    table: [
      ['Sour or thin', 'Steep 30 seconds longer', 'In immersion, time is the main extraction control and easier to repeat than grind.'],
      ['Bitter or astringent', 'Steep 30 seconds shorter, or grind coarser', 'Change time first; only change grind if it stays bitter.'],
      ['Too strong', 'Add 20–30 g of hot water to the cup', 'AeroPress often brews concentrated coffee; dilution is a normal step.'],
      ['Too weak', 'Use less dilution water or 1–2 g more coffee', 'Fix strength with the ratio first.'],
      ['Very hard to press', 'Grind one small step coarser', 'Very fine grounds clog the filter, and forcing the plunger risks tipping.']
    ],
    mistakes: [
      ['Boiling water for dark roasts', 'With a short, concentrated steep, cooler water usually makes bitterness easier to control for dark roasts.'],
      ['Pressing fast and hard', 'It can unsettle the brewer and push more fines into the cup.'],
      ['Flipping an inverted brewer', 'Turning over a brewer full of hot water risks scalding; Barista Flow does not recommend it.']
    ],
    related: [['blog/pour-over-french-press-aeropress-compared', 'Pour-over, French press and AeroPress compared'], ['blog/roast-level-and-temperature', 'Roast level and brew temperature'], ['blog/sour-or-bitter-taste-diagnosis', 'Sour or bitter?']]
  },
  'French Press': {
    readTitle: 'How to follow this recipe',
    read: [
      'Warm the press with hot water and discard it first; a glass press absorbs a lot of heat.',
      'Add all the water at once, make sure every ground is wet, then put the lid on without pressing.',
      'Stir at the recipe time, then press slowly and steadily when the time is up without forcing the grounds. Pour out all the coffee straight away, leaving the last mouthful in the pot for a much cleaner cup.'
    ],
    scaleDoses: [15, 30, 45, 56],
    scaleNote: 'French press doses scale directly with the ratio, and steep time stays roughly the same. Keep the water below the press’s maximum fill line.',
    table: [
      ['Sour or thin', 'Steep 1 minute longer', 'In immersion, time controls extraction and is easier to repeat than grind.'],
      ['Bitter or astringent', 'Grind one step coarser, or press earlier', 'Fine grounds or a long steep increase harshness.'],
      ['Lots of sludge in the cup', 'Grind coarser and wait a few more minutes before pressing so fines settle', 'The metal mesh cannot stop fines.'],
      ['Too strong', 'Raise the ratio by 1–2', 'French press recipes often run strong; loosen to taste.'],
      ['Too weak', 'Lower the ratio by 1–2', 'Keep grind and time the same and change only the ratio.']
    ],
    mistakes: [
      ['Pressing after two minutes', 'Usually under-extracted, tasting sour and watery.'],
      ['Forcing the plunger', 'Squeezing the grounds pushes fines and bitter compounds into the coffee; press slowly and steadily.'],
      ['Leaving coffee in the press', 'It keeps steeping and turns more bitter; pour it all out at once.']
    ],
    related: [['blog/pour-over-french-press-aeropress-compared', 'Pour-over, French press and AeroPress compared'], ['blog/coffee-to-water-ratio-guide', 'Coffee-to-water ratio guide'], ['tools/french-press', 'French press timer']]
  },
  'Cold Brew': {
    readTitle: 'How to follow this recipe',
    read: [
      'Use clean equipment and drinking water. The original recipe only specifies cold water; Barista Flow recommends steeping in the fridge, where hygiene is easier to control.',
      'This is a concentrate recipe: dilute it with water, ice or milk before drinking rather than serving it straight.',
      'After filtering, keep it covered in the fridge and drink it soon. Discard it if it sat out of the fridge for long or anything seems wrong.'
    ],
    scaleDoses: [71, 142, 284],
    scaleNote: 'To make less, keep the same ratio and steep time. Smaller batches filter much faster through paper.',
    table: [
      ['Bitter or harsh', 'Steep 2–4 hours less, or grind coarser', 'Cold brew can still over-extract, especially with a fine grind.'],
      ['Sour or weak', 'Steep 4–6 hours longer', 'Cold extraction is slow and needs enough time.'],
      ['Too weak after diluting', 'Dilute less (for example 1:3 down to 1:2)', 'Adjust serving dilution before changing the brew ratio.'],
      ['Filtering is very slow', 'Strain most grounds through a coarse mesh first, then use paper', 'Fines clog paper filters.'],
      ['Taste declines after a few days', 'Make smaller batches and drink sooner', 'Flavour changes over time, and safety is hard to judge by appearance.']
    ],
    mistakes: [
      ['Steeping at room temperature', 'Hygiene is harder to control at home, so Barista Flow recommends refrigerating throughout.'],
      ['Grinding too fine', 'Filtering becomes difficult and the cup turns harsh.'],
      ['Drinking the concentrate undiluted', 'Strength and caffeine are far higher than a normal cup.']
    ],
    related: [['tools/cold-brew', 'Cold brew ratio calculator'], ['blog/coffee-storage-freezing-guide', 'Storing and freezing coffee beans'], ['blog/coffee-to-water-ratio-guide', 'Coffee-to-water ratio guide']]
  }
};

export function getBrewerGuide(brewer: Brewer, lang: string): Copy {
  return (lang === 'zh-TW' ? zh : en)[brewer];
}
