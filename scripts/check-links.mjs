// Fails if any built page links to an internal URL that has no matching file in dist/.
// Run after `npm run build`: node scripts/check-links.mjs
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://coffeetimer.online';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

async function exists(path) {
  try { await stat(path); return true; } catch { return false; }
}

async function resolves(pathname) {
  const clean = decodeURIComponent(pathname.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return exists(join(DIST, 'index.html'));
  const target = join(DIST, clean);
  if (extname(clean)) return exists(target);
  return (await exists(join(target, 'index.html'))) || (await exists(`${target}.html`));
}

const pages = await walk(DIST);
const broken = new Map();
let checked = 0;

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let url = match[1];
    if (url.startsWith(SITE)) url = url.slice(SITE.length) || '/';
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    checked += 1;
    if (!(await resolves(url))) {
      const from = page.slice(DIST.length - 1);
      if (!broken.has(url)) broken.set(url, new Set());
      broken.get(url).add(from);
    }
  }
}

if (broken.size) {
  console.error(`Broken internal links (${broken.size}):`);
  for (const [url, from] of broken) console.error(`  ${url}\n    from: ${[...from].slice(0, 3).join(', ')}${from.size > 3 ? ` (+${from.size - 3} more)` : ''}`);
  process.exit(1);
}
console.log(`Checked ${checked} internal links across ${pages.length} pages: all resolve.`);
