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
      // Exclude private, device-only views and short glossary detail pages
      // (glossary pages are noindex; the glossary index and full guides are indexed).
      filter: (page) =>
        !/\/(?:zh-TW|en)\/(?:history|beans|insights|data|focus\/stats)\/?$/.test(page) &&
        !/\/(?:zh-TW|en)\/glossary\/[^/]+\/?$/.test(page) &&
        // General productivity guides stay online but are noindex (frontmatter `noindex: true`).
        !/\/(?:zh-TW|en)\/guides\/(?:pomodoro-technique|phone-distraction)\/?$/.test(page),
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
