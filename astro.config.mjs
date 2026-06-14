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
    locales: ["zh-TW", "en", "fr", "ja", "de", "zh-CN", "es", "pt", "ru", "hi", "bn", "ar", "ur"],
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
          'en': 'en',
          'fr': 'fr',
          'ja': 'ja',
          'de': 'de',
          'zh-CN': 'zh-CN',
          'es': 'es',
          'pt': 'pt',
          'ru': 'ru',
          'hi': 'hi',
          'bn': 'bn',
          'ar': 'ar',
          'ur': 'ur'
        }
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      drop: ['console', 'debugger'],
    }
  }
});
