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
    // Publish only the two editorially reviewed locales.
    // The remaining translation files stay in the repository as drafts.
    locales: ["zh-TW", "en"],
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
          'zh-TW': 'zh-TW',
          en: 'en'
        }
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
