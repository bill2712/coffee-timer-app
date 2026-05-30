import { ui } from './src/i18n/ui.ts';

for (const [lang, keys] of Object.entries(ui)) {
  if (lang === 'en') continue;
  
  for (const [key, val] of Object.entries(keys)) {
    // We check if the translation contains pure English words that are longer than 5 chars
    // But coffee terms might be English. Let's look for "Privacy Policy" or "About Us" specifically
    if (typeof val === 'string' && val.includes('Privacy Policy') && !val.includes('隱私') && !val.includes('隐私')) {
      console.log(`[${lang}] ${key}: ${val.substring(0, 50)}`);
    }
  }
}
