/**
 * Small SVG illustrations for the "cups brewed" shelf (purely cosmetic).
 * Returned as strings so they can be used both server-side and in the browser.
 */

import type { CupStyle } from './stats';

const COFFEE = '#4a2c1a';
const CREMA = '#c98a45';
const MILK = '#efe2cc';
const FOAM = '#f7efe2';
const GLASS = 'rgba(214,232,240,.55)';
const CERAMIC = '#f4ede3';
const OUTLINE = 'currentColor';

const shapes: Record<CupStyle, string> = {
  espresso: `
    <path d="M14 30h28l-3 14a6 6 0 0 1-6 5H23a6 6 0 0 1-6-5Z" fill="${CERAMIC}" stroke="${OUTLINE}" stroke-width="2"/>
    <path d="M16 33h24" stroke="${CREMA}" stroke-width="4"/>
    <path d="M42 34a5 5 0 0 1 0 9" fill="none" stroke="${OUTLINE}" stroke-width="2"/>
    <ellipse cx="28" cy="52" rx="17" ry="3" fill="${CERAMIC}" stroke="${OUTLINE}" stroke-width="1.5"/>`,
  cortado: `
    <path d="M15 22h26l-2 28H17Z" fill="${GLASS}" stroke="${OUTLINE}" stroke-width="2"/>
    <path d="M16.5 36h23l-1 13h-21Z" fill="${COFFEE}"/>
    <path d="M16 27h24l-.6 9H16.6Z" fill="${MILK}"/>`,
  cappuccino: `
    <path d="M8 26h40l-4 18a8 8 0 0 1-8 6H20a8 8 0 0 1-8-6Z" fill="${CERAMIC}" stroke="${OUTLINE}" stroke-width="2"/>
    <ellipse cx="28" cy="27" rx="19" ry="3.5" fill="${FOAM}" stroke="${OUTLINE}" stroke-width="1.5"/>
    <path d="M24 27c2-2 6-2 8 0-2 1.5-6 1.5-8 0Z" fill="${CREMA}"/>
    <path d="M48 30a6 6 0 0 1 0 11" fill="none" stroke="${OUTLINE}" stroke-width="2"/>
    <ellipse cx="28" cy="53" rx="22" ry="3" fill="${CERAMIC}" stroke="${OUTLINE}" stroke-width="1.5"/>`,
  latte: `
    <path d="M17 10h22l-2 42H19Z" fill="${GLASS}" stroke="${OUTLINE}" stroke-width="2"/>
    <path d="M18.6 34h18.8l-.8 17H19.4Z" fill="${MILK}"/>
    <path d="M18 22h20l-.5 12h-19Z" fill="${CREMA}"/>
    <path d="M17.6 14h20.8l-.3 8H18Z" fill="${FOAM}"/>`,
  'pour-over': `
    <path d="M18 8h20l-7 19 9 24a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3l9-24Z" fill="${GLASS}" stroke="${OUTLINE}" stroke-width="2"/>
    <path d="M20 38h16l3.6 13H16.4Z" fill="${COFFEE}" opacity=".9"/>
    <path d="M24 24h8l-1 3h-6Z" fill="#a0784c"/>`,
  'cold-brew': `
    <path d="M15 6h26l-3 46H18Z" fill="${GLASS}" stroke="${OUTLINE}" stroke-width="2"/>
    <path d="M16.3 16h23.4l-2.4 35H18.7Z" fill="${COFFEE}"/>
    <rect x="20" y="19" width="7" height="7" rx="1.5" fill="rgba(255,255,255,.55)"/>
    <rect x="29" y="27" width="7" height="7" rx="1.5" fill="rgba(255,255,255,.45)"/>
    <path d="M33 2l-2 20" stroke="#2f7a54" stroke-width="2.5" stroke-linecap="round"/>`
};

/** A shelf cup. `title` becomes an accessible label when provided. */
export function cupSvg(style: CupStyle, size = 56, title?: string): string {
  const label = title ? `role="img" aria-label="${title.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 58" width="${size}" height="${Math.round(size * 58 / 56)}" ${label} class="bf-cup bf-cup-${style}">${shapes[style]}</svg>`;
}

export const CUP_STYLES = Object.keys(shapes) as CupStyle[];
