const { parse } = require('path');
const fs = require('fs');

const dir = fs.readdirSync('src/content/blog/zh-TW');
console.log(dir);

// This script can't access Astro's `getCollection` directly, so we'll run a minimal Astro test instead.
