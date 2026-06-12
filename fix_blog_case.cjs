const fs = require('fs');

const indexFile = 'src/pages/[lang]/blog/index.astro';
let content = fs.readFileSync(indexFile, 'utf8');
content = content.replace(
  /entry\.id\.startsWith\(`\$\{lang\}\/`\)/g,
  'entry.id.toLowerCase().startsWith(`${lang.toLowerCase()}/`)'
);
fs.writeFileSync(indexFile, content);

const slugFile = 'src/pages/[lang]/blog/[...slug].astro';
let content2 = fs.readFileSync(slugFile, 'utf8');
content2 = content2.replace(
  /entry\.id\.startsWith\(`\$\{lang\}\/`\)/g,
  'entry.id.toLowerCase().startsWith(`${lang.toLowerCase()}/`)'
);
fs.writeFileSync(slugFile, content2);
console.log('Blog case sensitivity fixed!');
