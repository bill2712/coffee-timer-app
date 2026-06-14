// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/config.js';

import cloudflare from '@astrojs/cloudflare';

const parsedUrl = new URL(SITE_URL);
const dynamicSite = parsedUrl.origin;
const dynamicBase = parsedUrl.pathname === '/' ? '' : parsedUrl.pathname;

export default defineConfig({
  site: dynamicSite,
  base: dynamicBase,

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
  },

  adapter: cloudflare()
});