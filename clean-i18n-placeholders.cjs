const fs = require('fs');

const uiTsPath = 'src/i18n/ui.ts';
let code = fs.readFileSync(uiTsPath, 'utf8');

// Match exactly {t(\\'tools.bean.status.days2\\')} or {t('tools.bean.status.days2')}
code = code.replace(/\{t\(\\'tools\.bean\.status\.days2\\'\)\}/g, '{daysLabel}');
code = code.replace(/\{t\('tools\.bean\.status\.days2'\)\}/g, '{daysLabel}');

code = code.replace(/\{t\(\\'tools\.v60\.title\\'\)\}/g, '{v60Title}');
code = code.replace(/\{t\('tools\.v60\.title'\)\}/g, '{v60Title}');

code = code.replace(/\{t\(\\'tools\.bean\.setup\.date\\'\)\}/g, '{dateLabel}');
code = code.replace(/\{t\('tools\.bean\.setup\.date'\)\}/g, '{dateLabel}');

fs.writeFileSync(uiTsPath, code);
console.log('Fixed escaped t() leaks');
