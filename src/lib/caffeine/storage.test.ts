import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, sanitizeState } from './storage';

const NOW = new Date(2026, 9, 27, 12, 0).getTime();
const HOUR = 3_600_000;

describe('sanitizeState', () => {
  it('returns defaults for missing or corrupt data', () => {
    expect(sanitizeState(null, NOW)).toEqual({ entries: [], settings: DEFAULT_SETTINGS });
    expect(sanitizeState('garbage', NOW)).toEqual({ entries: [], settings: DEFAULT_SETTINGS });
    expect(sanitizeState({ settings: { halfLife: 'x', bedtime: 99999, threshold: -1 } }, NOW).settings).toEqual(DEFAULT_SETTINGS);
  });

  it('clamps the half-life and keeps valid settings', () => {
    const s = sanitizeState({ settings: { halfLife: 7, bedtime: 30, threshold: 25, dailyLimit: 300, timeFormat: '24' } }, NOW).settings;
    expect(s).toEqual({ halfLife: 7, bedtime: 30, threshold: 25, dailyLimit: 300, timeFormat: '24' });
  });

  it('drops invalid, ancient and far-future entries and sorts the rest', () => {
    const entries = [
      { id: 'b', drinkId: 'drip', mg: 95, time: NOW - 1 * HOUR },
      { id: 'a', drinkId: 'espresso', mg: 63, time: NOW - 5 * HOUR },
      { id: 'neg', drinkId: 'drip', mg: -5, time: NOW },
      { id: 'nan', drinkId: 'drip', mg: Number.NaN, time: NOW },
      { id: 'huge', drinkId: 'drip', mg: 99999, time: NOW },
      { id: 'old', drinkId: 'drip', mg: 95, time: NOW - 100 * HOUR },
      { id: 'future', drinkId: 'drip', mg: 95, time: NOW + 48 * HOUR },
      { drinkId: 'drip', mg: 95, time: NOW }
    ];
    const out = sanitizeState({ entries }, NOW).entries;
    expect(out.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('trims long custom labels', () => {
    const out = sanitizeState({ entries: [{ id: 'x', drinkId: 'custom', label: 'y'.repeat(200), mg: 50, time: NOW }] }, NOW);
    expect(out.entries[0].label).toHaveLength(60);
  });
});
