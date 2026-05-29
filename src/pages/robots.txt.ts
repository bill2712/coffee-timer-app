import type { APIRoute } from 'astro';
import { SITE_URL } from '../config.js';

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const siteParsed = new URL(SITE_URL);
  const siteOrigin = siteParsed.origin;
  const basePath = siteParsed.pathname === '/' ? '' : siteParsed.pathname;
  
  // Construct the absolute sitemap URL
  let sitemapPath = `${basePath}/sitemap-index.xml`;
  if (!sitemapPath.startsWith('/')) sitemapPath = `/${sitemapPath}`;
  
  const sitemapURL = new URL(sitemapPath, siteOrigin);

  return new Response(getRobotsTxt(sitemapURL).trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
