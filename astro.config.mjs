// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://coffeetimer.online',
  base: '/',
  i18n: {
    defaultLocale: "zh-TW",
    // Only publish locales that have completed a human editorial review.
    // The remaining translations stay in the repository as drafts.
    locales: ["zh-TW"],
    routing: {
      prefixDefaultLocale: true
    }
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'zh-TW',
        locales: {
          'zh-TW': 'zh-TW'
        }
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
