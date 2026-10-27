/**
 * Draws the shareable "my caffeine today" image on a canvas.
 * Loaded on demand (dynamic import) so it never slows the first page load.
 */

import type { CurvePoint } from './caffeineModel';

export type ShareFormat = 'story' | 'square';

export interface ShareCardData {
  format: ShareFormat;
  title: string;
  totalMg: number;
  unit: string;
  lines: string[];
  note: string;
  site: string;
  curve: CurvePoint[];
  threshold: number;
  lang: string;
}

const SIZES: Record<ShareFormat, [number, number]> = { story: [1080, 1920], square: [1080, 1080] };

const SANS = '"Outfit", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif';
const SERIF = '"Playfair Display", "Noto Serif TC", Georgia, serif';

export async function renderShareCard(data: ShareCardData): Promise<HTMLCanvasElement> {
  const [w, h] = SIZES[data.format];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Make sure web fonts are ready (they are already loaded by the page if available).
  try {
    await document.fonts?.ready;
  } catch {
    /* fall back to system fonts */
  }

  // Background: warm espresso gradient with a soft glow.
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1f1712');
  bg.addColorStop(1, '#0c0907');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.8, h * 0.15, 0, w * 0.8, h * 0.15, w * 0.9);
  glow.addColorStop(0, 'rgba(212,175,55,0.28)');
  glow.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const pad = 96;
  const isStory = data.format === 'story';
  let y = isStory ? 260 : 150;

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#D4AF37';
  ctx.font = `600 44px ${SANS}`;
  ctx.fillText('☕ BARISTA FLOW', pad, y);

  y += isStory ? 150 : 110;
  ctx.fillStyle = '#F5F2EB';
  ctx.font = `700 ${isStory ? 76 : 64}px ${SERIF}`;
  ctx.fillText(data.title, pad, y);

  // Big number
  y += isStory ? 260 : 200;
  ctx.fillStyle = '#F5F2EB';
  ctx.font = `700 ${isStory ? 260 : 210}px ${SANS}`;
  const big = String(Math.round(data.totalMg));
  ctx.fillText(big, pad - 8, y);
  const bigWidth = ctx.measureText(big).width;
  ctx.fillStyle = '#C5A880';
  ctx.font = `500 ${isStory ? 80 : 64}px ${SANS}`;
  ctx.fillText(data.unit, pad + bigWidth + 20, y);

  // Detail lines
  y += isStory ? 120 : 90;
  ctx.font = `500 ${isStory ? 50 : 42}px ${SANS}`;
  for (const line of data.lines) {
    ctx.fillStyle = line.startsWith('⏰') ? '#D4AF37' : '#E8DCCB';
    ctx.fillText(line, pad, y, w - pad * 2);
    y += isStory ? 78 : 62;
  }

  // Mini curve
  const chartTop = isStory ? y + 80 : y + 10;
  const chartBottom = isStory ? h - 380 : h - 170;
  if (data.curve.length > 1 && chartBottom - chartTop > 80) {
    const maxMg = Math.max(data.threshold * 1.5, ...data.curve.map((p) => p.mg), 1);
    const t0 = data.curve[0].t;
    const t1 = data.curve[data.curve.length - 1].t;
    const px = (t: number) => pad + ((t - t0) / (t1 - t0)) * (w - pad * 2);
    const py = (mg: number) => chartBottom - (mg / maxMg) * (chartBottom - chartTop);

    ctx.beginPath();
    data.curve.forEach((p, i) => (i ? ctx.lineTo(px(p.t), py(p.mg)) : ctx.moveTo(px(p.t), py(p.mg))));
    ctx.lineTo(px(t1), chartBottom);
    ctx.lineTo(px(t0), chartBottom);
    ctx.closePath();
    const fill = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
    fill.addColorStop(0, 'rgba(212,175,55,0.45)');
    fill.addColorStop(1, 'rgba(212,175,55,0.02)');
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.beginPath();
    data.curve.forEach((p, i) => (i ? ctx.lineTo(px(p.t), py(p.mg)) : ctx.moveTo(px(p.t), py(p.mg))));
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.setLineDash([18, 14]);
    ctx.strokeStyle = 'rgba(239,138,128,0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pad, py(data.threshold));
    ctx.lineTo(w - pad, py(data.threshold));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Footer
  ctx.fillStyle = '#F5F2EB';
  ctx.font = `600 ${isStory ? 56 : 46}px ${SANS}`;
  ctx.fillText(data.site, pad, h - (isStory ? 200 : 96));
  ctx.fillStyle = '#8E8279';
  ctx.font = `400 ${isStory ? 34 : 28}px ${SANS}`;
  ctx.fillText(data.note, pad, h - (isStory ? 140 : 52), w - pad * 2);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
