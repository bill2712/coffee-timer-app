import { describe, expect, it } from 'vitest';
import { focusFaq, focusStrings, translate } from './focus';

describe('focus translations', () => {
  it('uses the singular form for n = 1 in English', () => {
    const en = focusStrings.en as Record<string, string>;
    expect(translate(en, 'stats.days', { n: 1 })).toBe('1 day');
    expect(translate(en, 'stats.days', { n: 3 })).toBe('3 days');
    expect(translate(en, 'result.interruptions', { n: 2 })).toBe('2 interruptions counted.');
  });

  it('keeps Chinese wording and falls back to the key for unknown strings', () => {
    const zh = focusStrings['zh-TW'] as Record<string, string>;
    expect(translate(zh, 'stats.days', { n: 1 })).toBe('1 日');
    expect(translate(zh, 'no.such.key')).toBe('no.such.key');
  });

  it('has the same keys and FAQ length in both languages', () => {
    expect(Object.keys(focusStrings['zh-TW']).sort()).toEqual(Object.keys(focusStrings.en).sort());
    expect(focusFaq.en).toHaveLength(10);
    expect(focusFaq['zh-TW']).toHaveLength(focusFaq.en.length);
  });
});
