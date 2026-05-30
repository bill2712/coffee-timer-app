const fs = require('fs');

const filesToFix = [
  'src/pages/[lang]/blog/index.astro',
  'src/pages/[lang]/history/index.astro',
  'src/pages/[lang]/glossary/index.astro',
  'src/pages/[lang]/blog/[slug].astro'
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  let original = text;
  
  // Replace import.meta.env.BASE_URL + '/ with BASE_URL + '/' + lang + '/'
  text = text.replace(/href=\{`\$\{import\.meta\.env\.BASE_URL\}\//g, "href={`\${import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL}/\${lang}/");
  
  // For [slug].astro where it has href={import.meta.env.BASE_URL}
  text = text.replace(/href=\{import\.meta\.env\.BASE_URL\}/g, "href={`\${import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL}/\${lang}/`}");
  
  if (text !== original) {
    fs.writeFileSync(file, text);
    console.log('Fixed', file);
  }
});
