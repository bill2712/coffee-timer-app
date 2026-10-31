/**
 * Lightweight SVG chart for the caffeine curve. Pure string building (no DOM),
 * colours come from CSS classes so light and dark themes both work.
 */

import type { CurvePoint } from './caffeineModel';
import { HOUR_MS } from './caffeineModel';

export interface ChartDose {
  time: number;
  mg: number;
  label: string;
}

export interface ChartInput {
  width: number;
  height: number;
  start: number;
  end: number;
  curve: CurvePoint[];
  ghost?: CurvePoint[] | null;
  threshold: number;
  bedtime: number;
  now: number;
  doses: ChartDose[];
  formatTick: (t: number) => string;
  labels: { threshold: string; bedtime: string; now: string; unit: string };
}

export interface ChartGeometry {
  left: number;
  right: number;
  top: number;
  bottom: number;
  yMax: number;
  x: (t: number) => number;
  y: (mg: number) => number;
}

const escapeXml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** Rounds an axis maximum up to a friendly number. */
export function niceMax(value: number): number {
  const v = Math.max(value, 1);
  const steps = [25, 50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000];
  return steps.find((s) => s >= v) ?? Math.ceil(v / 1000) * 1000;
}

/** Grid step giving 3–5 lines on round numbers. */
export function niceStep(yMax: number): number {
  const steps = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000];
  return steps.find((step) => yMax / step <= 5) ?? Math.ceil(yMax / 5);
}

export function geometry(input: ChartInput): ChartGeometry {
  const { width, height, start, end, curve, ghost, threshold } = input;
  const left = 44;
  const right = width - 12;
  const top = 26;
  const bottom = height - 28;
  const peak = Math.max(0, ...curve.map((p) => p.mg), ...(ghost ?? []).map((p) => p.mg));
  const yMax = niceMax(Math.max(peak * 1.15, threshold * 1.6, 60));
  const x = (t: number) => left + ((t - start) / (end - start)) * (right - left);
  const y = (mg: number) => bottom - (Math.max(0, mg) / yMax) * (bottom - top);
  return { left, right, top, bottom, yMax, x, y };
}

function pathFor(points: CurvePoint[], g: ChartGeometry): string {
  return points.map((p, i) => `${i ? 'L' : 'M'}${g.x(p.t).toFixed(1)},${g.y(p.mg).toFixed(1)}`).join('');
}

export function renderChart(input: ChartInput): string {
  const g = geometry(input);
  const { width, height, start, end, curve, ghost, threshold, bedtime, now, doses, labels } = input;
  const parts: string[] = [];

  // Horizontal grid + y labels on round numbers
  const yStep = niceStep(g.yMax);
  for (let i = 0; i * yStep <= g.yMax + 1e-9; i++) {
    const v = yStep * i;
    const yy = g.y(v).toFixed(1);
    parts.push(`<line class="cc-grid" x1="${g.left}" x2="${g.right}" y1="${yy}" y2="${yy}"/>`);
    parts.push(`<text class="cc-axis" x="${g.left - 6}" y="${yy}" text-anchor="end" dominant-baseline="middle">${Math.round(v)}</text>`);
  }
  parts.push(`<text class="cc-axis" x="${g.left - 6}" y="${g.top - 14}" text-anchor="end">${escapeXml(labels.unit)}</text>`);

  // X ticks every 3 local hours (fewer on narrow charts)
  const tickEvery = width < 420 ? 6 : 3;
  const first = new Date(start);
  first.setMinutes(0, 0, 0);
  for (let t = first.getTime(); t <= end; t += HOUR_MS) {
    if (t < start) continue;
    const hour = new Date(t).getHours();
    if (hour % tickEvery !== 0) continue;
    const xx = g.x(t).toFixed(1);
    parts.push(`<line class="cc-grid cc-grid-v" x1="${xx}" x2="${xx}" y1="${g.top}" y2="${g.bottom}"/>`);
    parts.push(`<text class="cc-axis" x="${xx}" y="${g.bottom + 18}" text-anchor="middle">${escapeXml(input.formatTick(t))}</text>`);
  }

  // Threshold line
  if (threshold <= g.yMax) {
    const ty = g.y(threshold).toFixed(1);
    parts.push(`<line class="cc-threshold" x1="${g.left}" x2="${g.right}" y1="${ty}" y2="${ty}"/>`);
    parts.push(`<text class="cc-threshold-label" x="${g.left + 4}" y="${(g.y(threshold) - 5).toFixed(1)}">${escapeXml(labels.threshold)} ${Math.round(threshold)}</text>`);
  }

  // Area + curve
  if (curve.length > 1) {
    const line = pathFor(curve, g);
    const area = `${line}L${g.x(curve[curve.length - 1].t).toFixed(1)},${g.bottom}L${g.x(curve[0].t).toFixed(1)},${g.bottom}Z`;
    parts.push(`<path class="cc-area" d="${area}"/>`);
    if (ghost && ghost.length > 1) parts.push(`<path class="cc-ghost" d="${pathFor(ghost, g)}"/>`);
    parts.push(`<path class="cc-curve" d="${line}"/>`);
  }

  // Bedtime marker
  if (bedtime >= start && bedtime <= end) {
    const bx = g.x(bedtime).toFixed(1);
    parts.push(`<line class="cc-bedtime" x1="${bx}" x2="${bx}" y1="${g.top}" y2="${g.bottom}"/>`);
    parts.push(`<text class="cc-marker-label cc-bedtime-label" x="${bx}" y="${g.top - 4}" text-anchor="middle">🌙 ${escapeXml(labels.bedtime)}</text>`);
  }

  // Now marker
  if (now >= start && now <= end) {
    const nx = g.x(now).toFixed(1);
    parts.push(`<line class="cc-now" x1="${nx}" x2="${nx}" y1="${g.top}" y2="${g.bottom}"/>`);
    const anchor = Math.abs(now - bedtime) < 1.5 * HOUR_MS ? (now < bedtime ? 'end' : 'start') : 'middle';
    parts.push(`<text class="cc-marker-label" x="${nx}" y="${g.top - 4}" text-anchor="${anchor}">${escapeXml(labels.now)}</text>`);
  }

  // Dose markers along the baseline
  for (const dose of doses) {
    if (dose.time < start || dose.time > end) continue;
    const dx = g.x(dose.time).toFixed(1);
    parts.push(`<g class="cc-dose"><title>${escapeXml(dose.label)}</title><circle cx="${dx}" cy="${g.bottom}" r="5"/></g>`);
  }

  // Interactive cursor (positioned by the app)
  parts.push(`<g class="cc-cursor" visibility="hidden"><line x1="0" x2="0" y1="${g.top}" y2="${g.bottom}"/><circle r="5" cx="0" cy="0"/></g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">${parts.join('')}</svg>`;
}
