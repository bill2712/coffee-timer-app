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

  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Allow browsers to cache this index to keep things fast
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
