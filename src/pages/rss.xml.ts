import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_URL } from '../config.js';

export async function GET(context: any) {
  // Fetch all posts and glossary entries
  const allEntries = await getCollection('blog');
  
  // Sort by pubDate descending
  const sortedEntries = allEntries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    // `<title>` field in output xml
    title: 'Barista Flow | 知識庫與百科',
    // `<description>` field in output xml
    description: '最專業的精品咖啡沖煮知識、原理與詞彙百科。',
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site || SITE_URL,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: sortedEntries.map((entry) => {
      // Determine base path depending on tags
      const isGlossary = entry.data.tags?.includes('Glossary');
      const prefix = isGlossary ? '/glossary/' : '/blog/';
      
      return {
        title: entry.data.title,
        pubDate: entry.data.pubDate,
        description: entry.data.description,
        // Compute RSS link from post `id`
        link: `${prefix}${entry.id}/`,
      };
    }),
    // (optional) inject custom xml
    customData: `<language>zh-tw</language>`,
  });
}
