export interface StandardRecipe {
  id: string;
  slug: string;
  title: string;
  brewer: 'V60' | 'AeroPress' | 'French Press' | 'Cold Brew';
  brewerLabel: string;
  summary: string;
  duration: string;
  sourceName: string;
  sourceUrl: string;
  reviewedAt: string;
  applicability: string;
  limitations: string;
  equipment: string[];
  steps: string[];
  notes: string[];
  toolPath: string;
  recipe: {
    beanName: string;
    roastLevel: 'light' | 'medium' | 'dark';
    grindSize: string;
    waterTemp: number;
    coffeeWeight: number;
    waterRatio: number;
  };
}

export const standardRecipes: StandardRecipe[] = [
  {
    id: 'hario-hoffmann-one-cup',
    slug: 'hario-hoffmann-one-cup',
    title: 'James Hoffmann 一杯份 V60',
    brewer: 'V60',
    brewerLabel: 'V60 手沖',
    summary: '15 g 咖啡配 250 g 水，以五段等量注水建立容易重現的一杯份手沖基準。',
    duration: '約 3:00',
    sourceName: 'HARIO USA — James Hoffmann 1 Cup V60 Technique',
    sourceUrl: 'https://www.hario-usa.com/blogs/recipes-and-more-from-friends/james-hoffmann-1-cup-v60-technique',
    reviewedAt: '2026-08-30',
    applicability: '適合 V60 01／02、一杯份淺至中焙咖啡，以及想以固定節奏比較研磨度的人。',
    limitations: '原方法強調剛煮沸的軟身過濾水；本站套用 96°C 作可調起點，實際仍應按烘焙度與味道微調。',
    equipment: ['V60 濾杯與濾紙', '電子磅與計時器', '細口壺', '軟身過濾水'],
    steps: [
      '以 15 g 中細研磨咖啡粉，準備 250 g 水。',
      '注入 50 g 水並輕搖濾杯，悶蒸至 0:45。',
      '每次相隔約 10 秒，依次注水至 100、150、200、250 g。',
      '最後輕輕搖勻，目標約 3:00 完成滴濾；若時間偏離，先調整研磨度。'
    ],
    notes: ['96°C 是本站便於套用的起點；原來源以剛煮沸水為準。', '來源指出不同 V60 尺寸、濾紙與研磨機會令時間有差異，味道比秒數更重要。'],
    toolPath: '/tools/v60-pour-over',
    recipe: { beanName: 'Hoffmann V60 基準', roastLevel: 'light', grindSize: '中細研磨', waterTemp: 96, coffeeWeight: 15, waterRatio: 16.7 }
  },
  {
    id: 'hario-rojewska-two-pour',
    slug: 'hario-rojewska-two-pour',
    title: 'Agnieszka Rojewska 兩段式 V60',
    brewer: 'V60',
    brewerLabel: 'V60 手沖',
    summary: '15 g 咖啡配 250 ml 水，先快速預浸，再以兩段注水完成的簡潔比賽級方法。',
    duration: '約 2:15',
    sourceName: 'HARIO Europe — V60 Ambassador Agnieszka Rojewska',
    sourceUrl: 'https://www.hario-europe.com/blogs/hario-community/v60-ambassadors-agnieszka-rojewska',
    reviewedAt: '2026-08-30',
    applicability: '適合希望減少注水段數、以較快流速呈現明亮風味的 V60 使用者。',
    limitations: '原來源沒有指定水溫；本站以 92°C 作可調起點，並非把這個數值歸因於原作者。',
    equipment: ['V60 濾杯與濾紙', '電子磅與計時器', '細口壺'],
    steps: [
      '使用 15 g 中度研磨咖啡粉與 250 ml 水。',
      '快速注水預浸，等待 15 秒。',
      '第一次注水至 150 ml，再把餘下 100 ml 注向中央。',
      '約 1:00 停止注水，目標總時間約 2:15。'
    ],
    notes: ['92°C 是本站的可調套用值；原來源沒有列出水溫。', '若流速太快或味道偏薄，先稍微調細；若澀苦而滴濾過慢，稍微調粗。'],
    toolPath: '/tools/v60-pour-over',
    recipe: { beanName: 'Rojewska V60 基準', roastLevel: 'medium', grindSize: '中度研磨', waterTemp: 92, coffeeWeight: 15, waterRatio: 16.7 }
  },
  {
    id: 'aeropress-signature',
    slug: 'aeropress-signature',
    title: 'AeroPress 官方招牌配方',
    brewer: 'AeroPress',
    brewerLabel: 'AeroPress',
    summary: '官方日常方法：16–18 g 中細研磨咖啡、85°C 水、短時間攪拌與溫和壓濾。',
    duration: '約 1:00–1:30',
    sourceName: 'AeroPress — How to Use an AeroPress',
    sourceUrl: 'https://aeropress.com/pages/how-to-use',
    reviewedAt: '2026-08-30',
    applicability: '適合標準 AeroPress 的快速日常沖煮，以及想建立低溫、短浸泡基準的人。',
    limitations: '官方以沖煮筒 #4 刻度表示水量而非克數；本站 1:14 只作計算器的近似起點，實作請優先依 #4 刻度。',
    equipment: ['AeroPress 與濾紙', '穩固杯具', '攪拌棒', '電子磅（可選）'],
    steps: [
      '裝好濾紙並把 AeroPress 放在穩固杯具上。',
      '加入 16–18 g 中細研磨咖啡粉，水溫設為 85°C。',
      '注水至沖煮筒 #4 刻度，攪拌約 3 秒。',
      '插入活塞形成真空；現磨咖啡等待約 30 秒，預磨咖啡約 60 秒。',
      '以溫和、穩定的力度下壓；拆下濾蓋前留意熱水與壓力。'
    ],
    notes: ['本站以 17 g 顯示官方 16–18 g 範圍的中點。', '1:14 是方便帶入計算器的近似值；原方法的水量標示為 #4 刻度。'],
    toolPath: '/tools/aeropress',
    recipe: { beanName: 'AeroPress 官方基準', roastLevel: 'medium', grindSize: '中細研磨', waterTemp: 85, coffeeWeight: 17, waterRatio: 14 }
  },
  {
    id: 'stumptown-french-press',
    slug: 'stumptown-french-press',
    title: 'Stumptown French Press',
    brewer: 'French Press',
    brewerLabel: '法式濾壓壺',
    summary: '56 g 粗研磨咖啡配 850 g 水，四分鐘浸泡後立即分杯，適合多人份穩定重現。',
    duration: '4:00 浸泡＋下壓',
    sourceName: 'Stumptown Coffee Roasters — French Press Brew Guide',
    sourceUrl: 'https://www.stumptowncoffee.com/pages/brew-guide-french-press',
    reviewedAt: '2026-08-30',
    applicability: '適合約 1 公升 French Press、多杯分享與偏好厚實口感的人。',
    limitations: '不同壺容量與濾網阻力會改變操作；沖煮完成後應立即倒出，避免咖啡繼續浸泡。',
    equipment: ['約 1 L French Press', '電子磅與計時器', '攪拌工具', '可盛載全部咖啡的杯或分享壺'],
    steps: [
      '使用 56 g 粗研磨咖啡，水溫約 96°C（來源標示約 205°F）。',
      '先注入約 450 g 水，1:00 時攪拌粉層。',
      '繼續注水至總量 850 g，蓋上壺蓋但暫不下壓。',
      '4:00 緩慢下壓，完成後立即倒出全部咖啡。'
    ],
    notes: ['大份量配方可按相同比例縮放，但浸泡與下壓手感仍需實際調整。'],
    toolPath: '/tools/french-press',
    recipe: { beanName: 'Stumptown French Press', roastLevel: 'medium', grindSize: '粗研磨', waterTemp: 96, coffeeWeight: 56, waterRatio: 15.2 }
  },
  {
    id: 'blue-bottle-french-press',
    slug: 'blue-bottle-french-press',
    title: 'Blue Bottle 小份 French Press',
    brewer: 'French Press',
    brewerLabel: '法式濾壓壺',
    summary: '30 g 咖啡配 350 g 水的小份量四分鐘配方，適合容量較小的濾壓壺。',
    duration: '約 4:20',
    sourceName: 'Blue Bottle Coffee — French Press Brew Guide',
    sourceUrl: 'https://bluebottlecoffee.com/brew-guides/french-press',
    reviewedAt: '2026-08-30',
    applicability: '適合小型 French Press 與一至兩人份，尤其想比較低粉水比厚實口感的人。',
    limitations: '1:11.7 比常見手沖濃；如成品過濃，先按口味加水或逐步提高比例。',
    equipment: ['小型 French Press', '電子磅與計時器', '攪拌工具'],
    steps: [
      '使用 30 g 粗研磨咖啡與 350 g、約 96–99°C 的水。',
      '均勻注水，確保咖啡粉完全濕潤。',
      '浸泡至 4:00，再用約 20 秒緩慢下壓。',
      '立即把咖啡倒出，停止萃取。'
    ],
    notes: ['本站套用 97°C，取自來源 205–210°F 範圍的中間值。'],
    toolPath: '/tools/french-press',
    recipe: { beanName: 'Blue Bottle French Press', roastLevel: 'medium', grindSize: '粗研磨', waterTemp: 97, coffeeWeight: 30, waterRatio: 11.7 }
  },
  {
    id: 'oxo-cold-brew-concentrate',
    slug: 'oxo-cold-brew-concentrate',
    title: 'OXO 冷萃濃縮液',
    brewer: 'Cold Brew',
    brewerLabel: '冷萃咖啡',
    summary: '284 g 粗研磨咖啡配 1,200 ml 水的 1:4.2 濃縮配方，飲用前再按口味稀釋。',
    duration: '12–24 小時',
    sourceName: 'OXO Good Grips Cold Brew Coffee Maker Instructions',
    sourceUrl: 'https://www.oxo.com/media/wysiwyg/PDF_Files/1403_gg_1272880%20Cold%20Brew%20Coffee%20Maker%20instructions.pdf',
    reviewedAt: '2026-08-30',
    applicability: '適合 OXO Cold Brew Coffee Maker 或容量、濾水結構相近的濃縮式冷萃器具。',
    limitations: '這是器材專用大份量濃縮配方，不等同直接飲用冷萃；其他器具應先縮量試做。本站不提供保存期限保證。',
    equipment: ['OXO Cold Brew Coffee Maker 或相近器具', '電子磅', '可冷藏有蓋容器'],
    steps: [
      '加入 284 g 粗研磨咖啡粉，均勻淋上 1,200 ml 冷水。',
      '讓咖啡浸泡 12–24 小時。',
      '依器具說明排出並收集濃縮液。',
      '飲用時以 1 份濃縮液加入 2–3 份水或奶，再按味道調整。',
      '以清潔有蓋容器冷藏；依本站所列食品安全指引處理，不把來源的最長保存時間當作保證。'
    ],
    notes: ['4°C 是本站的冷藏安全起點；原配方只指定冷水。', '此配方粉量很大，套用前先確認器具容量。'],
    toolPath: '/tools/cold-brew',
    recipe: { beanName: 'OXO 冷萃濃縮基準', roastLevel: 'dark', grindSize: '粗研磨', waterTemp: 4, coffeeWeight: 284, waterRatio: 4.225 }
  }
];

export function getRecipeBySlug(slug: string) {
  return standardRecipes.find((recipe) => recipe.slug === slug);
}
