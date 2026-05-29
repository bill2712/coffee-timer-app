// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkGlossary } from './src/plugins/remark-glossary.mjs';

import { SITE_URL } from './src/config.js';

// Parse the central config to dynamically set Astro's site and base paths
const parsedUrl = new URL(SITE_URL);
const dynamicSite = parsedUrl.origin;
const dynamicBase = parsedUrl.pathname === '/' ? '' : parsedUrl.pathname;

// https://astro.build/config
export default defineConfig({
  site: dynamicSite,
  base: dynamicBase,
  integrations: [
    mdx(),
    sitemap()
  ],
  markdown: {},
  vite: {
    plugins: [tailwindcss()]
  }
});