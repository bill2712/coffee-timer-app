import { describe, expect, it } from 'vitest';
import { niceMax, niceStep, renderChart } from './chart';

describe('chart helpers', () => {
  it('rounds the axis maximum up to a friendly value', () => {
    expect(niceMax(0)).toBe(25);
    expect(niceMax(80)).toBe(100);
    expect(niceMax(210)).toBe(250);
    expect(niceMax(4200)).toBe(5000);
  });

  it('picks round grid steps with at most five intervals', () => {
    for (const max of [25, 50, 100, 150, 250, 400, 600, 1000, 3000]) {
      const step = niceStep(max);
      expect(max / step).toBeLessThanOrEqual(5);
      expect([5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].includes(step)).toBe(true);
    }
  });

  it('escapes labels in the SVG output', () => {
    const svg = renderChart({
      width: 600, height: 260, start: 0, end: 24 * 3600e3,
      curve: [{ t: 0, mg: 0 }, { t: 24 * 3600e3, mg: 10 }],
      threshold: 50, bedtime: 18 * 3600e3, now: 12 * 3600e3,
      doses: [{ time: 3600e3, mg: 95, label: '<script>x</script>' }],
      formatTick: () => '6',
      labels: { threshold: 'T', bedtime: 'B', now: 'N', unit: 'mg' }
    });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });
});
