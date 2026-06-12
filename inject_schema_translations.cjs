const fs = require('fs');
const newTrans = JSON.parse(fs.readFileSync('schema_translations.json', 'utf8'));

let content = fs.readFileSync('src/i18n/ui.ts', 'utf8');

for (const lang in newTrans) {
  const keys = newTrans[lang];
  let injectionStr = '';
  for (const k in keys) {
    injectionStr += `    "${k}": "${keys[k]}",\n`;
  }
  
  const regex = new RegExp(`("${lang}": \\{)`);
  if (content.match(regex)) {
    content = content.replace(regex, `$1\n${injectionStr}`);
  } else {
    console.error(`Could not find language block for ${lang}`);
  }
}

fs.writeFileSync('src/i18n/ui.ts', content);
console.log('SEO Schema Translations injected successfully!');
