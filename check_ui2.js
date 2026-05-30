import { ui } from './src/i18n/ui.ts';

const keysToCheck = ['privacy.title', 'privacy.s1.p1', 'about.title', 'about.intro', 'terms.title'];

for (const [lang, keys] of Object.entries(ui)) {
  console.log(`\n--- ${lang} ---`);
  for (const k of keysToCheck) {
    console.log(`${k}: ${keys[k]?.substring(0, 50)}...`);
  }
}
