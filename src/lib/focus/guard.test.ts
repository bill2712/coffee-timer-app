import { describe, expect, it } from 'vitest';
import { GRACE_MS, createGuard, defaultStrictness, onHidden, onRestore, onVisible } from './guard';

const T = 1_000_000;

describe('strict mode', () => {
  it('fails as soon as the page is hidden during focus', () => {
    const [g, e] = onHidden(createGuard('strict'), T, true);
    expect(e.kind).toBe('failed');
    expect(g.failed).toBe(true);
    expect(g.failedAt).toBe(T);
  });

  it('does not enforce during breaks or pauses', () => {
    const [g, e] = onHidden(createGuard('strict'), T, false);
    expect(e.kind).toBe('none');
    expect(g.failed).toBe(false);
  });

  it('stays failed once failed', () => {
    const [g] = onHidden(createGuard('strict'), T, true);
    const [g2, e2] = onVisible(g, T + 1000);
    expect(g2.failed).toBe(true);
    expect(e2.kind).toBe('none');
  });
});

describe('gentle mode', () => {
  it('only warns when you return within the 10-second grace period', () => {
    const [hidden] = onHidden(createGuard('gentle'), T, true);
    const [g, e] = onVisible(hidden, T + 9_000);
    expect(e).toEqual({ kind: 'warned', awayMs: 9_000 });
    expect(g.interruptions).toBe(0);
    expect(g.awayMs).toBe(9_000);
    expect(g.failed).toBe(false);
  });

  it('treats exactly the grace period as within it', () => {
    const [hidden] = onHidden(createGuard('gentle'), T, true);
    expect(onVisible(hidden, T + GRACE_MS)[1].kind).toBe('warned');
  });

  it('counts an interruption after the grace period but never fails', () => {
    let [g] = onHidden(createGuard('gentle'), T, true);
    let e;
    [g, e] = onVisible(g, T + 60_000);
    expect(e).toEqual({ kind: 'interrupted', awayMs: 60_000, interruptions: 1 });
    [g] = onHidden(g, T + 70_000, true);
    [g, e] = onVisible(g, T + 100_000);
    expect(g.interruptions).toBe(2);
    expect(g.awayMs).toBe(90_000);
    expect(g.failed).toBe(false);
  });

  it('ignores a visible event without a matching hide', () => {
    const [g, e] = onVisible(createGuard('gentle'), T);
    expect(e.kind).toBe('none');
    expect(g.interruptions).toBe(0);
  });

  it('supports a custom grace period', () => {
    const [hidden] = onHidden(createGuard('gentle', 2_000), T, true);
    expect(onVisible(hidden, T + 3_000)[1].kind).toBe('interrupted');
  });
});

describe('restoring after a reload or closed tab', () => {
  it('fails strict sessions', () => {
    expect(onRestore(createGuard('strict'), T, T + 5_000, true)[1].kind).toBe('failed');
  });

  it('counts a long absence as an interruption in gentle mode', () => {
    const [g, e] = onRestore(createGuard('gentle'), T, T + 120_000, true);
    expect(e.kind).toBe('interrupted');
    expect(g.interruptions).toBe(1);
  });

  it('forgives a quick reload in gentle mode', () => {
    expect(onRestore(createGuard('gentle'), T, T + 3_000, true)[1].kind).toBe('warned');
  });

  it('does nothing when the session was not enforced (break or pause)', () => {
    const [g, e] = onRestore(createGuard('strict'), T, T + 999_000, false);
    expect(e.kind).toBe('none');
    expect(g.failed).toBe(false);
  });
});

describe('defaultStrictness', () => {
  it('defaults to gentle on touch screens, strict otherwise', () => {
    expect(defaultStrictness(true)).toBe('gentle');
    expect(defaultStrictness(false)).toBe('strict');
  });
});
