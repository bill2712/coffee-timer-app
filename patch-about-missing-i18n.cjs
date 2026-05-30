const fs = require('fs');
const uiTsPath = 'src/i18n/ui.ts';
let code = fs.readFileSync(uiTsPath, 'utf8');

const zhKeys = `
    'about.meta.title': '關於我們 About Us | Barista Flow',
    'about.meta.desc': '了解 Barista Flow 的創立宗旨。我們致力於將咖啡科學數據化，打造全球最專業的精品咖啡沖煮工具。',
    'about.title': '關於我們',
    'about.intro': '在精品咖啡的世界裡，細微的變數決定了最終的風味。Barista Flow 的誕生，是為了解決一個所有咖啡愛好者都會遇到的問題：「如何讓每一次的沖煮都穩定、精確，且充滿科學根據？」',
    'about.vision.title': '我們的願景',
    'about.vision.p1': '我們是一群對咖啡充滿熱忱的開發者與咖啡師。我們相信，一杯好咖啡不應該只靠「感覺」或「運氣」。水溫、粉水比、研磨度，以及至關重要的流體力學（注水節奏），都是可以用科學數據來量化與控制的。',
    'about.vision.p2': '是建立一個全球最專業且易於使用的咖啡沖煮工具平台，讓無論是剛接觸手沖的新手，還是身經百戰的職業咖啡師，都能在這裡找到提升萃取品質的解答。',
    'about.offer.title': '我們提供什麼？',
    'about.offer.l1.title': '互動式三階段計時器',
    'about.offer.l1': '根據您的豆種與水粉比，即時運算出悶蒸、主萃取與尾段的最佳注水時機與水量目標。',
    'about.offer.l2.title': '參數儲存與分享',
    'about.offer.l2': '讓您能夠儲存每一次成功的配方，並透過專屬網址與全世界的咖啡同好分享您的沖煮哲學。',
    'about.offer.l3.title': '深度科學知識庫',
    'about.offer.l3': '我們不寫空洞的文章。我們的知識庫深入探討流體力學、梅納反應與萃取率的物理限制，幫助您知其然，更知其所以然。',
    'about.promise.title': '我們的承諾',
    'about.promise.p1': 'Barista Flow 承諾始終保持核心工具的免費使用。我們致力於提供極致的無干擾使用者體驗（包含精心設計的深色模式與平滑的動畫），因為我們知道，在專注沖煮咖啡的那三分鐘裡，您不應該被任何糟糕的介面所打擾。',
    'about.quote': '精準，是萃取極致風味的唯一途徑。',
`;

const enKeys = `
    'about.meta.title': 'About Us | Barista Flow',
    'about.meta.desc': 'Discover the mission of Barista Flow. We are dedicated to digitizing coffee science and creating the world\\'s most professional specialty coffee brewing tools.',
    'about.title': 'About Us',
    'about.intro': 'In the world of specialty coffee, subtle variables determine the final flavor. Barista Flow was born to solve a problem every coffee lover faces: "How do we make every brew stable, precise, and scientifically grounded?"',
    'about.vision.title': 'Our Vision',
    'about.vision.p1': 'We are a group of developers and baristas passionate about coffee. We believe that a good cup of coffee shouldn\\'t rely solely on "feeling" or "luck". Water temperature, brew ratio, grind size, and crucial fluid dynamics (pouring rhythm) can all be quantified and controlled using scientific data.',
    'about.vision.p2': 'is to build the world\\'s most professional and easy-to-use coffee brewing tool platform, allowing everyone from pour-over beginners to seasoned baristas to find answers to elevate their extraction quality.',
    'about.offer.title': 'What We Offer',
    'about.offer.l1.title': 'Interactive 3-Stage Timer',
    'about.offer.l1': 'Instantly calculate the optimal pouring timing and water volume targets for bloom, main extraction, and the final phase based on your bean type and brew ratio.',
    'about.offer.l2.title': 'Recipe Saving & Sharing',
    'about.offer.l2': 'Allows you to save every successful recipe and share your brewing philosophy with coffee enthusiasts worldwide via a dedicated link.',
    'about.offer.l3.title': 'In-Depth Knowledge Base',
    'about.offer.l3': 'We don\\'t write empty articles. Our knowledge base dives deep into fluid dynamics, the Maillard reaction, and the physical limits of extraction yield, helping you understand the "why" behind the "how".',
    'about.promise.title': 'Our Promise',
    'about.promise.p1': 'Barista Flow promises to keep its core tools permanently free. We are committed to providing an ultimate, distraction-free user experience (including a carefully designed dark mode and smooth animations), because we know that during those three minutes of focused brewing, you shouldn\\'t be bothered by a poor interface.',
    'about.quote': 'Precision is the only path to ultimate flavor.',
`;

// Remove the old buggy keys from ui.ts first
code = code.replace(/    'about\.offer\.l2\.title': '.*?',\n/g, '');
code = code.replace(/    'about\.offer\.l3\.title': '.*?',\n/g, '');
code = code.replace(/    'about\.vision\.p2': '.*?',\n/g, '');

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
console.log('Successfully patched ui.ts with all missing about keys');
