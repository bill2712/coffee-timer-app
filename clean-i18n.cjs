const fs = require('fs');

const uiTsPath = 'src/i18n/ui.ts';
let code = fs.readFileSync(uiTsPath, 'utf8');

// 1. Strip HTML tags from the entire file
// This will safely remove <strong>, </strong>, <code>, </code>
code = code.replace(/<\/?(?:strong|code|span|br|p|div)[^>]*>/gi, '');

// 2. Fix the {t('...')} syntax leaks by replacing them with hardcoded translations or `{days}` placeholders.
// It's safer to just replace them with the actual localized text since this is a static string.
const replaceSyntaxLeaks = (str) => {
  // Fix tools.bean.status.days2
  str = str.replace(/\{t\('tools\.bean\.status\.days2'\)\}/g, 'days');
  // Fix tools.v60.title
  str = str.replace(/\{t\('tools\.v60\.title'\)\}/g, 'V60 Calculator');
  return str;
};

// We will do a generic replacement for the literal strings across the file:
code = code.replace(/\{t\('tools\.bean\.status\.days2'\)\}/g, 'days');
code = code.replace(/\{t\('tools\.v60\.title'\)\}/g, 'V60 Calculator');

// For zh-TW and zh-CN specifically, we need to restore the Chinese words:
code = code.replace(/'zh-TW': \{[\s\S]*?\},/g, match => match.replace(/days/g, '天').replace(/V60 Calculator/g, 'V60 參數計算機'));
code = code.replace(/'zh-CN': \{[\s\S]*?\},/g, match => match.replace(/days/g, '天').replace(/V60 Calculator/g, 'V60 参数计算机'));
// For ja:
code = code.replace(/'ja': \{[\s\S]*?\},/g, match => match.replace(/days/g, '日間').replace(/V60 Calculator/g, 'V60 電卓'));

// 3. Fix the cross-contamination in tools.bean.p4
const p4EnFixed = "'tools.bean.p4': 'Not necessarily. Oil leakage is a normal physical phenomenon of dark roasted coffee beans, because high-temperature roasting causes the cell walls to rupture and the internal lipids to escape to the surface. However, if \"light roast or medium roast\" beans suddenly produce a large amount of oil, it usually means that the storage environment temperature is too high, or the beans have been stored for too long and have begun to age.',";
const p4FrFixed = "'tools.bean.p4': 'Pas nécessairement. La fuite d\\'huile est un phénomène physique normal des grains de café torréfiés foncés, car la torréfaction à haute température provoque la rupture des parois cellulaires et la fuite des lipides internes vers la surface. Cependant, si les grains « légèrement torréfiés ou moyennement torréfiés » produisent soudainement une grande quantité d\\'huile, cela signifie généralement que la température de l\\'environnement de stockage est trop élevée, ou que les grains ont été stockés trop longtemps et qu\\'ils ont commencé à vieillir.',";
const p4JaFixed = "'tools.bean.p4': '必ずしもそうではありません。オイル漏れは、高温焙煎により細胞壁が破壊され、内部の脂質が表面に流出するため、深煎りコーヒー豆の通常の物理現象です。ただし、「浅煎り・中煎り」の豆から突然多量の油分が発生する場合は、通常、保管環境の温度が高すぎるか、豆の保管期間が長すぎて豆の老化が始まっていることが考えられます。',";

// For each language, find the line for tools.bean.p4 and replace it.
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("'tools.bean.p4':")) {
    if (code.substring(code.indexOf("'en': {"), code.indexOf("'fr': {")).includes(lines[i])) {
      lines[i] = "    " + p4EnFixed;
    }
    else if (code.substring(code.indexOf("'fr': {"), code.indexOf("'ja': {")).includes(lines[i])) {
      lines[i] = "    " + p4FrFixed;
    }
    else if (code.substring(code.indexOf("'ja': {"), code.indexOf("'de': {")).includes(lines[i])) {
      lines[i] = "    " + p4JaFixed;
    }
    else if (code.substring(code.indexOf("'de': {"), code.indexOf("'zh-CN': {")).includes(lines[i])) {
      // Clean up German if needed
      lines[i] = lines[i].replace(/但如果是「浅焙或中焙」的豆子突然大量出油，那通常意味着保存环境温度过高，或是存放时间过久，豆子已经开始老化。/g, "Wenn jedoch \"hell geröstete oder mittel geröstete\" Bohnen plötzlich eine große Menge Öl produzieren, bedeutet dies normalerweise, dass die Temperatur der Lagerumgebung zu hoch ist oder die Bohnen zu lange gelagert wurden und zu altern begonnen haben.");
    }
    else if (code.substring(code.indexOf("'es': {"), code.indexOf("'pt': {")).includes(lines[i])) {
      lines[i] = lines[i].replace(/但如果是「浅焙或中焙」的豆子突然大量出油，那通常意味着保存环境温度过高，或是存放时间过久，豆子已经开始老化。/g, "Sin embargo, si los granos de tueste claro o medio de repente producen una gran cantidad de aceite, por lo general significa que la temperatura del entorno de almacenamiento es demasiado alta o que los granos se han almacenado durante demasiado tiempo y han comenzado a envejecer.");
    }
    else if (code.substring(code.indexOf("'pt': {"), code.indexOf("'ru': {")).includes(lines[i])) {
      lines[i] = lines[i].replace(/但如果是「浅焙或中焙」的豆子突然大量出油，那通常意味着保存环境温度过高，或是存放时间过久，豆子已经开始老化。/g, "No entanto, se os grãos de torra clara ou média produzirem repentinamente uma grande quantidade de óleo, isso geralmente significa que a temperatura do ambiente de armazenamento é muito alta ou que os grãos foram armazenados por muito tempo e começaram a envelhecer.");
    }
    else if (code.substring(code.indexOf("'ru': {"), code.indexOf("'hi': {")).includes(lines[i])) {
      lines[i] = lines[i].replace(/但如果是「浅焙或中焙」的豆子突然大量出油，那通常意味着保存环境温度过高，或是存放时间过久，豆子已经开始老化。/g, "Однако, если зерна светлой или средней обжарки внезапно выделяют большое количество масла, это обычно означает, что температура хранения слишком высокая или зерна хранились слишком долго и начали стареть.");
    }
    else if (code.substring(code.indexOf("'hi': {"), code.indexOf("'bn': {")).includes(lines[i])) {
      lines[i] = lines[i].replace(/但如果是「浅焙或中焙」的豆子突然大量出油，那通常意味着保存环境温度过高，或是存放时间过久，豆子已经开始老化。/g, "हालांकि, अगर हल्के या मध्यम भुने हुए बीन्स अचानक बड़ी मात्रा में तेल छोड़ते हैं, तो इसका आमतौर पर मतलब है कि भंडारण का तापमान बहुत अधिक है, या बीन्स बहुत लंबे समय तक रखे गए हैं।");
    }
    else if (code.substring(code.indexOf("'bn': {"), code.indexOf("'ar': {")).includes(lines[i])) {
      lines[i] = lines[i].replace(/但如果是「浅焙或中焙」的豆子突然大量出油，那通常意味着保存环境温度过高，或是存放时间过久，豆子已经开始老化。/g, "যাইহোক, যদি হালকা বা মাঝারি রোস্ট করা বিনগুলি হঠাৎ প্রচুর পরিমাণে তেল তৈরি করে, তবে এর অর্থ সাধারণত সংরক্ষণের তাপমাত্রা খুব বেশি বা বিনগুলি অনেক দিন ধরে রাখা হয়েছে।");
    }
    else if (code.substring(code.indexOf("'ar': {"), code.indexOf("'ur': {")).includes(lines[i])) {
      lines[i] = lines[i].replace(/但如果是「浅焙或中焙」的豆子突然大量出油，那通常意味着保存环境温度过高，或是存放时间过久，豆子已经开始老化。/g, "ومع ذلك، إذا أنتجت حبوب التحميص الخفيف أو المتوسط كمية كبيرة من الزيت فجأة، فهذا يعني عادةً أن درجة حرارة بيئة التخزين مرتفعة جدًا، أو أن الحبوب قد تم تخزينها لفترة طويلة جدًا وبدأت في التلف.");
    }
    else if (code.substring(code.indexOf("'ur': {")).includes(lines[i])) {
      lines[i] = lines[i].replace(/但如果是「浅焙或中焙」的豆子突然大量出油，那通常意味着保存环境温度过高，或是存放时间过久，豆子已经开始老化。/g, "تاہم، اگر ہلکے یا درمیانے بھنے ہوئے بیج اچانک بڑی مقدار میں تیل پیدا کرتے ہیں، تو اس کا عام طور پر مطلب یہ ہے کہ ذخیرہ کرنے کے ماحول کا درجہ حرارت بہت زیادہ ہے، یا بیجوں کو بہت طویل عرصے تک ذخیرہ کیا گیا ہے۔");
    }
  }
}

code = lines.join('\n');

fs.writeFileSync(uiTsPath, code);
console.log('Successfully cleaned ui.ts');
