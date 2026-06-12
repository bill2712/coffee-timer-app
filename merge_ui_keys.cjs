const fs = require('fs');
const ts = require('typescript');

function extractKeysFromObjectLiteral(node) {
  const keys = {};
  node.properties.forEach(prop => {
    if (prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))) {
      let keyText = prop.name.text || prop.name.escapedText;
      let valText = '';
      if (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
         valText = prop.initializer.text;
      }
      keys[keyText] = valText;
    }
  });
  return keys;
}

function parseUiTs(filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
  let uiObject = {};

  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.text === 'ui') {
      if (node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
        node.initializer.properties.forEach(prop => {
          if (ts.isPropertyAssignment(prop) && ts.isObjectLiteralExpression(prop.initializer)) {
             let langKey = prop.name.text || prop.name.escapedText;
             uiObject[langKey] = extractKeysFromObjectLiteral(prop.initializer);
          }
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return { code, uiObject };
}

const oldUi = parseUiTs('src/i18n/ui.ts.bak').uiObject;
const newUi = parseUiTs('src/i18n/ui.ts');

let finalCode = newUi.code;

let allMissingKeys = {};

// We will construct the missing keys for each language and inject them at the top of the language block
for (const lang in oldUi) {
  const oldKeys = oldUi[lang];
  const newKeys = newUi.uiObject[lang] || {};
  let injectionStr = '';
  
  for (const k in oldKeys) {
    if (!(k in newKeys) && oldKeys[k]) {
       // Escape quotes in the value
       let val = oldKeys[k].replace(/"/g, '\\"').replace(/\n/g, '\\n');
       injectionStr += `    "${k}": "${val}",\n`;
    }
  }
  
  if (injectionStr) {
     const regex = new RegExp(`("${lang}": \\{)`);
     if (finalCode.match(regex)) {
        finalCode = finalCode.replace(regex, `$1\n${injectionStr}`);
     }
  }
}

fs.writeFileSync('src/i18n/ui.ts', finalCode);
console.log('Restored all missing keys safely!');
