const fs = require('fs');
const uiTsPath = 'src/i18n/ui.ts';
let code = fs.readFileSync(uiTsPath, 'utf8');

const zhKeys = `
    'about.offer.l2.title': '知識庫',
    'about.offer.l3.title': '全球社群',
    'about.vision.p2': '是建立一個全球最專業且易於使用的咖啡沖煮工具平台，讓無論是剛接觸手沖的新手，還是身經百戰的職業咖啡師，都能在這裡找到提升萃取品質的解答。',
    'terms.meta.title': '服務條款 | Barista Flow',
    'terms.meta.desc': 'Barista Flow 的服務條款。規範本網站的使用條例、智慧財產權與免責聲明。',
    'terms.intro': '歡迎您使用 Barista Flow（以下簡稱「本網站」）。當您瀏覽、存取或使用本網站提供的任何工具與內容時，即表示您完全同意並接受以下服務條款。如果您不同意本條款的任何部分，請勿使用本網站。',
    'terms.s1.p1': 'Barista Flow 提供免費的線上咖啡沖煮計時器、參數計算工具，以及咖啡科學相關的知識文章。本網站旨在提供個人、非商業用途的參考與協助。',
    'terms.s2.title': '智慧財產權聲明',
    'terms.s2.p1': '本網站的所有內容，包含但不限於文字、標誌、圖片、圖表、應用程式碼、UI 設計及架構，其著作權、商標權及其他智慧財產權皆屬於 Barista Flow 團隊所有，或已取得合法授權。',
    'terms.s2.l1': '未經我們事先的書面許可，您不得對本網站內容進行複製、修改、散佈、出版、展示或用於任何商業行為。',
    'terms.s2.l2': '您可以為了個人學習目的分享本網站的連結（例如使用我們的「分享此配方」功能）。',
    'terms.s3.p1': '本網站提供的所有咖啡參數、教學文章與計時工具皆「按原樣」提供。雖然我們力求資訊的科學性與準確性，但咖啡沖煮受到諸多實體變數（如水質、豆種、氣溫等）影響。',
    'terms.s3.l1': '我們對本網站內容的絕對準確性、完整性或適用性不作任何明示或暗示的保證。',
    'terms.s3.l2': '對於因使用本網站工具或依賴本網站資訊而造成的任何直接、間接或附帶損失（包括但不限於咖啡豆的損耗或設備的損壞），Barista Flow 概不負責。',
    'terms.s4.title': '使用者行為規範',
    'terms.s4.p1': '在使用本網站時，您同意遵守所有適用的法律法規，並且不得：',
    'terms.s4.l1': '以任何可能導致本網站伺服器或網路負載過重、受損或中斷的方式使用本網站（例如進行 DDoS 攻擊或惡意爬蟲擷取）。',
    'terms.s4.l2': '試圖未經授權存取本網站的後台系統或原始碼。',
    'terms.s4.l3': '利用本網站從事任何違法或欺詐行為。',
    'terms.s5.title': '第三方服務與廣告',
    'terms.s5.p1': '本網站可能包含第三方網站的連結或展示第三方廣告（如 Google AdSense）。我們無法控制這些第三方網站的內容與隱私政策。點擊廣告或外部連結產生的任何風險，由使用者自行承擔。',
    'terms.s6.title': '條款的修改與終止',
    'terms.s6.p1': '我們保留隨時修改、暫停或終止本網站服務及本服務條款的權利，恕不另行通知。您繼續使用本網站即表示您接受任何修改後的條款。',
`;

const enKeys = `
    'about.offer.l2.title': 'Knowledge Base',
    'about.offer.l3.title': 'Global Community',
    'about.vision.p2': 'is to build the world\\'s most professional and easy-to-use coffee brewing tool platform, allowing everyone from pour-over beginners to seasoned baristas to find answers to elevate their extraction quality.',
    'terms.meta.title': 'Terms of Service | Barista Flow',
    'terms.meta.desc': 'Barista Flow Terms of Service. Regulations on website usage, intellectual property, and disclaimers.',
    'terms.intro': 'Welcome to Barista Flow ("the Website"). By browsing, accessing, or using any tools and content provided by this Website, you fully agree to and accept the following terms of service. If you do not agree with any part of these terms, please do not use this Website.',
    'terms.s1.p1': 'Barista Flow provides free online coffee brewing timers, parameter calculation tools, and knowledge articles related to coffee science. This website is intended for personal, non-commercial reference and assistance.',
    'terms.s2.title': 'Intellectual Property',
    'terms.s2.p1': 'All content on this Website, including but not limited to text, logos, images, charts, application code, UI design, and architecture, is the property of the Barista Flow team or has been legally authorized for use.',
    'terms.s2.l1': 'Without our prior written permission, you may not copy, modify, distribute, publish, display, or use the content of this Website for any commercial purposes.',
    'terms.s2.l2': 'You may share links to this Website for personal learning purposes (for example, using our "Share this recipe" feature).',
    'terms.s3.p1': 'All coffee parameters, instructional articles, and timing tools provided by this Website are provided "as is." While we strive for scientific accuracy, coffee brewing is affected by many physical variables (such as water quality, bean type, temperature, etc.).',
    'terms.s3.l1': 'We make no express or implied warranties regarding the absolute accuracy, completeness, or applicability of the content on this Website.',
    'terms.s3.l2': 'Barista Flow is not responsible for any direct, indirect, or incidental losses (including but not limited to the loss of coffee beans or damage to equipment) caused by using the tools on this Website or relying on the information on this Website.',
    'terms.s4.title': 'User Conduct',
    'terms.s4.p1': 'When using this Website, you agree to comply with all applicable laws and regulations, and you must not:',
    'terms.s4.l1': 'Use this Website in any way that could cause the Website\\'s server or network to be overloaded, damaged, or interrupted (e.g., DDoS attacks or malicious scraping).',
    'terms.s4.l2': 'Attempt to gain unauthorized access to the Website\\'s backend system or source code.',
    'terms.s4.l3': 'Use this Website to engage in any illegal or fraudulent activities.',
    'terms.s5.title': 'Third-Party Services and Ads',
    'terms.s5.p1': 'This Website may contain links to third-party websites or display third-party advertisements (such as Google AdSense). We have no control over the content and privacy policies of these third-party websites. Any risks arising from clicking on ads or external links are the sole responsibility of the user.',
    'terms.s6.title': 'Modification and Termination',
    'terms.s6.p1': 'We reserve the right to modify, suspend, or terminate the services of this Website and these Terms of Service at any time without prior notice. Your continued use of this Website constitutes your acceptance of any modified terms.',
`;

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
console.log('Successfully patched ui.ts with terms and about keys');
