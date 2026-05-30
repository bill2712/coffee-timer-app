const fs = require('fs');
let code = fs.readFileSync('src/i18n/ui.ts', 'utf-8');
code = code.replace(/, Coffee.*Chan": ,/g, ',');
code = code.replace(/,s Law of Cooling.*temperature\.',/g, ',');
code = code.replace(/,s Law of Cooling.*drop\.',/g, ',');
code = code.replace(/,s Law of Cooling.*drop\\.',/g, ',');
fs.writeFileSync('src/i18n/ui.ts', code);
