import { ui } from './src/i18n/ui.ts';

for (const [lang, keys] of Object.entries(ui)) {
  if (lang === 'en') continue;
  
  for (const [key, val] of Object.entries(keys)) {
    if (typeof val === 'string' && val.includes('Privacy Policy') && !val.includes('隱私權政策') && !val.includes('隐私权政策')) {
      console.log(`[${lang}] ${key}: ${val}`);
    }
    if (typeof val === 'string' && val.includes('About Us') && !val.includes('關於我們') && !val.includes('关于我们')) {
      console.log(`[${lang}] ${key}: ${val}`);
    }
  }
}
