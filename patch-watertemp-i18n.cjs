const fs = require('fs');
const uiTsPath = 'src/i18n/ui.ts';
let code = fs.readFileSync(uiTsPath, 'utf8');

const zhKeys = `
    'tools.watertemp.title': '物理水溫預測工具',
    'tools.watertemp.subtitle': '利用牛頓冷卻定律，精準計算熱水降溫所需的時間，避免反覆測量。',
    'tools.watertemp.setup.title': '參數設定',
    'tools.watertemp.setup.ambient': '室溫 (Ambient)',
    'tools.watertemp.setup.ambient.cold': '寒冷',
    'tools.watertemp.setup.ambient.hot': '炎熱',
    'tools.watertemp.setup.target': '目標水溫 (Target)',
    'tools.watertemp.setup.target.dark': '深焙 (85℃)',
    'tools.watertemp.setup.target.light': '淺焙 (95℃)',
    'tools.watertemp.setup.kettle': '手沖壺材質',
    'tools.watertemp.setup.kettle.stainless': '不鏽鋼 (一般)',
    'tools.watertemp.setup.kettle.ceramic': '陶瓷 (保溫佳)',
    'tools.watertemp.setup.kettle.glass': '玻璃 (散熱快)',
    'tools.watertemp.setup.esttime': '預計等待時間',
    'tools.watertemp.setup.startbtn': '開始降溫計時',
    'tools.watertemp.cd.cancel': '取消計時',
    'tools.watertemp.cd.target': '目標溫度',
    'tools.watertemp.cd.current': '目前水溫',
    'tools.watertemp.cd.hint': '請保持手沖壺蓋打開以利散熱。計時結束時會有提示音。',
    'tools.watertemp.cd.info': '參數資訊',
    'tools.watertemp.cd.info.ambient': '室溫',
    'tools.watertemp.cd.info.start': '起始水溫',
    'tools.watertemp.cd.info.material': '材質',
    'tools.watertemp.jsonld.name': '水溫預測器',
    'tools.watertemp.jsonld.desc': '精準預測水溫降溫時間。',
    'tools.watertemp.meta.title': '物理水溫預測器 | Barista Flow',
    'tools.watertemp.meta.desc': '利用牛頓冷卻定律，為你的手沖壺精準預測降溫時間。',
    'tools.watertemp.h2': '為什麼需要預測水溫？',
    'tools.watertemp.p1': '水溫是影響咖啡萃取的關鍵因素之一。使用沸水直接沖煮可能會導致過度萃取，產生苦澀味。',
    'tools.watertemp.p2': '使用溫度計雖然準確，但每次都要打開蓋子測量，不僅麻煩且容易打亂沖煮節奏。',
    'tools.watertemp.p3': '本工具利用物理學的牛頓冷卻定律 (Newton\\'s Law of Cooling)，根據您的室溫和手沖壺材質，計算出熱水自然降溫到理想溫度所需的精確時間。',`;

const enKeys = `
    'tools.watertemp.title': 'Physics-Based Water Temp Predictor',
    'tools.watertemp.subtitle': 'Uses Newton\\'s Law of Cooling to calculate exactly how long to wait for your boiling water to reach the perfect brewing temperature.',
    'tools.watertemp.setup.title': 'Parameters',
    'tools.watertemp.setup.ambient': 'Ambient Temp',
    'tools.watertemp.setup.ambient.cold': 'Cold',
    'tools.watertemp.setup.ambient.hot': 'Hot',
    'tools.watertemp.setup.target': 'Target Temp',
    'tools.watertemp.setup.target.dark': 'Dark (85℃)',
    'tools.watertemp.setup.target.light': 'Light (95℃)',
    'tools.watertemp.setup.kettle': 'Kettle Material',
    'tools.watertemp.setup.kettle.stainless': 'Stainless Steel',
    'tools.watertemp.setup.kettle.ceramic': 'Ceramic',
    'tools.watertemp.setup.kettle.glass': 'Glass',
    'tools.watertemp.setup.esttime': 'Estimated Wait Time',
    'tools.watertemp.setup.startbtn': 'Start Cooling Timer',
    'tools.watertemp.cd.cancel': 'Cancel Timer',
    'tools.watertemp.cd.target': 'Target Temp',
    'tools.watertemp.cd.current': 'Current Temp',
    'tools.watertemp.cd.hint': 'Keep the kettle lid open for natural cooling. A chime will play when ready.',
    'tools.watertemp.cd.info': 'Info',
    'tools.watertemp.cd.info.ambient': 'Ambient',
    'tools.watertemp.cd.info.start': 'Starting',
    'tools.watertemp.cd.info.material': 'Material',
    'tools.watertemp.jsonld.name': 'Water Temp Predictor',
    'tools.watertemp.jsonld.desc': 'Accurately predict water cooling time.',
    'tools.watertemp.meta.title': 'Water Temp Predictor | Barista Flow',
    'tools.watertemp.meta.desc': 'Use Newton\\'s Law of Cooling to predict your kettle\\'s temperature drop.',
    'tools.watertemp.h2': 'Why Predict Water Temperature?',
    'tools.watertemp.p1': 'Water temperature is critical for extraction. Boiling water can cause over-extraction and bitterness.',
    'tools.watertemp.p2': 'Using a thermometer every time disrupts workflow.',
    'tools.watertemp.p3': 'This tool uses physics to calculate the exact wait time for your water to naturally cool to the perfect target temperature.',`;

const langs = ["zh-TW", "en", "fr", "ja", "de", "zh-CN", "es", "pt", "ru", "hi", "bn", "ar", "ur"];

for (const lang of langs) {
  const keys = (lang === 'zh-TW' || lang === 'zh-CN') ? zhKeys : enKeys;
  const target1 = '"' + lang + '": {';
  const target2 = "'" + lang + "': {";
  
  if (code.includes(target1)) {
    code = code.replace(target1, target1 + '\\n' + keys);
  } else if (code.includes(target2)) {
    code = code.replace(target2, target2 + '\\n' + keys);
  }
}

fs.writeFileSync(uiTsPath, code);
console.log('Successfully patched ui.ts');
