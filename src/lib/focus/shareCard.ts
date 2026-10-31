/**
 * Draws the Brew Focus share image on a canvas (loaded on demand).
 */

export type ShareFormat = 'story' | 'square';

export interface FocusShareData {
  format: ShareFormat;
  headline: string;
  lines: string[];
  site: string;
  /** Minutes per day for a mini bar chart (oldest first). */
  bars: number[];
}

const SIZES: Record<ShareFormat, [number, number]> = { story: [1080, 1920], square: [1080, 1080] };
const SANS = '"Outfit", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif';
const SERIF = '"Playfair Display", "Noto Serif TC", Georgia, serif';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = /\s/.test(text) ? text.split(' ') : Array.from(text);
  const joiner = /\s/.test(text) ? ' ' : '';
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + joiner + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderFocusCard(data: FocusShareData): Promise<HTMLCanvasElement> {
  const [w, h] = SIZES[data.format];
  const story = data.format === 'story';
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  try {
    await document.fonts?.ready;
  } catch {
    /* system fonts */
  }

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#221812');
  bg.addColorStop(1, '#0c0907');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, w);
  glow.addColorStop(0, 'rgba(212,175,55,0.26)');
  glow.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const pad = 96;
  let y = story ? 250 : 150;
  ctx.fillStyle = '#D4AF37';
  ctx.font = `600 44px ${SANS}`;
  ctx.fillText('☕ BREW FOCUS', pad, y);

  y += story ? 170 : 120;
  ctx.fillStyle = '#F5F2EB';
  ctx.font = `700 ${story ? 96 : 76}px ${SERIF}`;
  for (const line of wrap(ctx, data.headline, w - pad * 2)) {
    ctx.fillText(line, pad, y);
    y += story ? 116 : 92;
  }

  y += story ? 40 : 10;
  ctx.font = `500 ${story ? 54 : 44}px ${SANS}`;
  for (const line of data.lines) {
    ctx.fillStyle = '#E8DCCB';
    ctx.fillText(line, pad, y, w - pad * 2);
    y += story ? 84 : 66;
  }

  // Mini bar chart (last 7 days)
  const top = story ? y + 120 : y + 30;
  const bottom = story ? h - 380 : h - 180;
  if (bottom - top > 80 && data.bars.length) {
    const max = Math.max(30, ...data.bars);
    const gap = 24;
    const bw = (w - pad * 2 - gap * (data.bars.length - 1)) / data.bars.length;
    data.bars.forEach((v, i) => {
      const bh = Math.max(8, (v / max) * (bottom - top));
      const x = pad + i * (bw + gap);
      const grad = ctx.createLinearGradient(0, bottom - bh, 0, bottom);
      grad.addColorStop(0, '#E6C250');
      grad.addColorStop(1, '#8B5A2B');
      ctx.fillStyle = v > 0 ? grad : 'rgba(197,168,128,0.18)';
      const r = Math.min(18, bw / 2);
      ctx.beginPath();
      ctx.moveTo(x, bottom);
      ctx.lineTo(x, bottom - bh + r);
      ctx.quadraticCurveTo(x, bottom - bh, x + r, bottom - bh);
      ctx.lineTo(x + bw - r, bottom - bh);
      ctx.quadraticCurveTo(x + bw, bottom - bh, x + bw, bottom - bh + r);
      ctx.lineTo(x + bw, bottom);
      ctx.closePath();
      ctx.fill();
    });
  }

  ctx.fillStyle = '#F5F2EB';
  ctx.font = `600 ${story ? 56 : 46}px ${SANS}`;
  ctx.fillText(data.site, pad, h - (story ? 200 : 90));
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
