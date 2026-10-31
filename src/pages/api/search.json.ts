import { getCollection } from 'astro:content';
import { languages } from '../../i18n/ui';

export async function GET() {
  const allEntries = await getCollection('blog');
  const publishedLocales = Object.keys(languages);
  
  const searchIndex = allEntries.filter(entry => publishedLocales.some(locale => entry.id.toLowerCase().startsWith(`${locale.toLowerCase()}/`))).map(entry => {
    const [rawLang, ...slugParts] = entry.id.split('/');
    const lang = publishedLocales.find(locale => locale.toLowerCase() === rawLang.toLowerCase()) || rawLang;
    const slug = slugParts.join('/');
    const isGlossary = entry.data.tags?.includes('Glossary');
    const section = isGlossary ? 'glossary' : 'blog';
    
    return {
      lang,
      title: entry.data.title,
      description: entry.data.description,
      term: (entry.data as any).term || '',
      tags: entry.data.tags || [],
      url: `/${lang}/${section}/${slug}/`
    };
  });

  const guides = (await getCollection('guides'))
    .map((entry) => {
      const [rawLang, ...slugParts] = entry.id.split('/');
      const lang = publishedLocales.find((locale) => locale.toLowerCase() === rawLang.toLowerCase());
      return lang ? { lang, title: entry.data.title, description: entry.data.description, term: '', tags: ['Caffeine'], url: `/${lang}/guides/${slugParts.join('/')}/` } : null;
    })
    .filter(Boolean);
  const tools = publishedLocales.map((lang) => ({
    lang,
    title: lang === 'zh-TW' ? '咖啡因計算器' : 'Caffeine calculator',
    description: lang === 'zh-TW' ? '估算體內咖啡因、睡前剩餘量及最後一杯咖啡的時間。' : 'Estimate caffeine in your body, at bedtime, and your last-call time for coffee.',
    term: '',
    tags: ['Caffeine', 'Tool'],
    url: `/${lang}/caffeine-calculator/`
  })).concat(publishedLocales.map((lang) => ({
    lang,
    title: lang === 'zh-TW' ? '專注沖煮（番茄鐘計時器）' : 'Brew Focus (Pomodoro timer)',
    description: lang === 'zh-TW' ? '番茄鐘及放下手機挑戰：專注時咖啡杯注滿，離開分頁就打瀉。' : 'Pomodoro and Phone Down Challenge: a cup fills while you focus and spills if you leave.',
    term: '',
    tags: ['Focus', 'Tool'],
    url: `/${lang}/focus/`
  })));
  searchIndex.push(...(guides as typeof searchIndex), ...tools);

  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Allow browsers to cache this index to keep things fast
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
