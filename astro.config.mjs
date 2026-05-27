// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://bill2712.github.io',
  base: '/coffee-timer-app',
  vite: {
    plugins: [tailwindcss()]
  }
});