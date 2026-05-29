import { getCollection } from 'astro:content';

export async function GET({ request }: any) {
  const allEntries = await getCollection('blog');
  
  const searchIndex = allEntries.map(entry => {
    const isGlossary = entry.data.tags?.includes('Glossary');
    const prefix = isGlossary ? '/glossary/' : '/blog/';
    
    return {
      title: entry.data.title,
      description: entry.data.description,
      term: (entry.data as any).term || '',
      tags: entry.data.tags || [],
      url: `${prefix}${entry.id}/`
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
