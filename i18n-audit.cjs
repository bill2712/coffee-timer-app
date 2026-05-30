const fs = require('fs');
const path = require('path');


// Hack to read ui.ts if it uses ESM syntax
const uiPath = path.resolve('./src/i18n/ui.ts');
let code = fs.readFileSync(uiPath, 'utf8');

// We can extract the 'ui' object using a regex or simple eval if we transform exports
const transformedCode = code.replace(/export const/g, 'const').replace(/} as const;/g, '}');
const script = transformedCode + '\nmodule.exports = { ui, defaultLang };';
const tempPath = path.resolve('./temp_ui.cjs');
fs.writeFileSync(tempPath, script);

const { ui, defaultLang } = require('./temp_ui.cjs');

console.log("=== CHECKPOINT 1: HTML & Syntax Leakage ===");
const htmlRegex = /<\/?[a-z][\s\S]*>/i;
const tSyntaxRegex = /t\(['"][^'"]+['"]\)/g;
const braceSyntaxRegex = /{{[^}]+}}|\\$\\{[^}]+\\}/g;

let leakIssues = [];
for (const lang of Object.keys(ui)) {
  for (const [key, value] of Object.entries(ui[lang])) {
    if (typeof value !== 'string') continue;
    if (htmlRegex.test(value)) leakIssues.push(`[${lang}] HTML Tag found in key: ${key}`);
    if (tSyntaxRegex.test(value)) leakIssues.push(`[${lang}] t() syntax found in key: ${key}`);
    if (braceSyntaxRegex.test(value)) leakIssues.push(`[${lang}] Template syntax found in key: ${key}`);
  }
}
if (leakIssues.length > 0) {
  leakIssues.forEach(m => console.log(m));
} else {
  console.log("-> No HTML or syntax leaks found in dictionary.");
}

console.log("\n=== CHECKPOINT 2: Cross-Language Contamination ===");
const chineseRegex = /[\u4E00-\u9FFF]/;
const japaneseKanaRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
const euLangs = ['en', 'es', 'fr', 'de', 'pt', 'ru'];
const asianMeLangs = ['ja', 'hi', 'bn', 'ar', 'ur'];

let contaminationIssues = [];

for (const lang of euLangs) {
  if (!ui[lang]) continue;
  for (const [key, value] of Object.entries(ui[lang])) {
    if (chineseRegex.test(value)) {
      contaminationIssues.push(`[${lang}] Chinese char leak in key: ${key}`);
    }
    if (japaneseKanaRegex.test(value)) {
      contaminationIssues.push(`[${lang}] Japanese Kana leak in key: ${key}`);
    }
  }
}

for (const lang of asianMeLangs) {
  if (!ui[lang]) continue;
  if (lang === 'ja') {
    // Japanese will naturally have Chinese characters (Kanji), so maybe ignore chineseRegex for ja?
    // User requested: "Asian & Middle Eastern Hubs (ja, hi, bn, ar, ur): Ensure that non-English core instructional terms are properly localized and do not contain accidental chunks of unresolved Chinese placeholders."
    // Let's just check hi, bn, ar, ur for Chinese chars.
  }
}

for (const lang of ['hi', 'bn', 'ar', 'ur']) {
  if (!ui[lang]) continue;
  for (const [key, value] of Object.entries(ui[lang])) {
    if (chineseRegex.test(value)) {
      contaminationIssues.push(`[${lang}] Chinese char leak in key: ${key}`);
    }
  }
}

if (contaminationIssues.length > 0) {
  contaminationIssues.forEach(m => console.log(m));
} else {
  console.log("-> No contamination found.");
}

console.log("\n=== CHECKPOINT 3: Check Fallback Mechanism ===");
const utilsPath = path.resolve('./src/i18n/utils.ts');
let utilsCode = fs.readFileSync(utilsPath, 'utf8');
if (utilsCode.includes('return ui[lang][key] || ui[defaultLang][key];')) {
  console.log("-> Fallback mechanism properly configured in utils.ts (falls back to defaultLang).");
  console.log("-> defaultLang is:", defaultLang);
} else {
  console.log("-> Fallback mechanism not purely defaultLang, investigating utils.ts:");
  console.log(utilsCode);
}

fs.unlinkSync(tempPath);
