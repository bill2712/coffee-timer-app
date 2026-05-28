// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkGlossary } from './src/plugins/remark-glossary.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://bill2712.github.io',
  base: '/coffee-timer-app',
  integrations: [
    mdx(),
    sitemap()
  ],
  markdown: {},
  vite: {
    plugins: [tailwindcss()]
  }
});