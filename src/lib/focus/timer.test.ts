import { describe, expect, it } from 'vitest';
import {
  MINUTE_MS,
  buildSegments,
  clampMinutes,
  elapsedMs,
  formatClock,
  normalisePlan,
  pauseTimer,
  position,
  resumeTimer,
  segmentEndsAt,
  startTimer,
  totalDurationMs
} from './timer';

const T0 = Date.UTC(2026, 9, 27, 9, 0, 0);
const challenge = { mode: 'challenge' as const, focusMin: 25, breakMin: 5, cycles: 4 };
const pomodoro = { mode: 'focus' as const, focusMin: 25, breakMin: 5, cycles: 4 };

describe('plans and segments', () => {
  it('clamps custom durations to 5–180 minutes', () => {
    expect(clampMinutes(2)).toBe(5);
    expect(clampMinutes(500)).toBe(180);
    expect(clampMinutes(42.6)).toBe(43);
    expect(clampMinutes(Number.NaN)).toBe(25);
  });

  it('forces the Phone Down Challenge to one block without breaks', () => {
    expect(normalisePlan(challenge)).toEqual({ mode: 'challenge', focusMin: 25, breakMin: 0, cycles: 1 });
    expect(buildSegments(challenge)).toEqual([{ phase: 'focus', durationMs: 25 * MINUTE_MS, startMs: 0 }]);
  });

  it('alternates focus and break blocks with no trailing break', () => {
    const segments = buildSegments(pomodoro);
    expect(segments.map((s) => s.phase)).toEqual(['focus', 'break', 'focus', 'break', 'focus', 'break', 'focus']);
    expect(totalDurationMs(startTimer(pomodoro, T0))).toBe((4 * 25 + 3 * 5) * MINUTE_MS);
  });

  it('supports 50/10 and custom break lengths', () => {
    const s = buildSegments({ mode: 'focus', focusMin: 50, breakMin: 10, cycles: 2 });
    expect(s.map((x) => x.durationMs / MINUTE_MS)).toEqual([50, 10, 50]);
    expect(s[2].startMs).toBe(60 * MINUTE_MS);
  });
});

describe('timestamp accuracy', () => {
  it('derives elapsed time from timestamps, not ticks', () => {
    const t = startTimer(challenge, T0);
    // No ticks in between (e.g. a throttled background tab): still exact.
    expect(elapsedMs(t, T0 + 12 * MINUTE_MS + 345)).toBe(12 * MINUTE_MS + 345);
    const pos = position(t, T0 + 12 * MINUTE_MS);
    expect(pos.segmentRemainingMs).toBe(13 * MINUTE_MS);
    expect(pos.segmentProgress).toBeCloseTo(12 / 25, 10);
  });

  it('is finished exactly at the end and never overshoots', () => {
    const t = startTimer(challenge, T0);
    expect(position(t, T0 + 25 * MINUTE_MS - 1).done).toBe(false);
    const end = position(t, T0 + 25 * MINUTE_MS);
    expect(end.done).toBe(true);
    expect(end.remainingTotalMs).toBe(0);
    const later = position(t, T0 + 3 * 60 * MINUTE_MS);
    expect(later.elapsedMs).toBe(25 * MINUTE_MS);
    expect(later.focusElapsedMs).toBe(25 * MINUTE_MS);
  });

  it('never reports negative time if the clock goes backwards', () => {
    const t = startTimer(challenge, T0);
    expect(elapsedMs(t, T0 - 5000)).toBe(0);
  });

  it('tracks the current phase and focus time across breaks', () => {
    const t = startTimer(pomodoro, T0);
    const inBreak = position(t, T0 + 27 * MINUTE_MS);
    expect(inBreak.phase).toBe('break');
    expect(inBreak.index).toBe(1);
    expect(inBreak.focusElapsedMs).toBe(25 * MINUTE_MS);
    expect(inBreak.focusBlocksDone).toBe(1);
    const second = position(t, T0 + 40 * MINUTE_MS);
    expect(second.phase).toBe('focus');
    expect(second.focusElapsedMs).toBe(35 * MINUTE_MS);
  });

  it('reports when the current segment ends', () => {
    const t = startTimer(pomodoro, T0);
    expect(segmentEndsAt(t, T0 + 10 * MINUTE_MS)).toBe(T0 + 25 * MINUTE_MS);
    expect(segmentEndsAt(t, T0 + 26 * MINUTE_MS)).toBe(T0 + 30 * MINUTE_MS);
  });
});

describe('pause and resume', () => {
  it('freezes time while paused and excludes it afterwards', () => {
    let t = startTimer(challenge, T0);
    t = pauseTimer(t, T0 + 10 * MINUTE_MS);
    expect(elapsedMs(t, T0 + 30 * MINUTE_MS)).toBe(10 * MINUTE_MS);
    expect(position(t, T0 + 30 * MINUTE_MS).paused).toBe(true);
    expect(segmentEndsAt(t, T0 + 30 * MINUTE_MS)).toBeNull();
    t = resumeTimer(t, T0 + 30 * MINUTE_MS);
    expect(elapsedMs(t, T0 + 35 * MINUTE_MS)).toBe(15 * MINUTE_MS);
    expect(position(t, T0 + 45 * MINUTE_MS).done).toBe(true);
  });

  it('accumulates several pauses and ignores repeated calls', () => {
    let t = startTimer(challenge, T0);
    t = pauseTimer(t, T0 + 1 * MINUTE_MS);
    t = pauseTimer(t, T0 + 2 * MINUTE_MS); // ignored
    t = resumeTimer(t, T0 + 3 * MINUTE_MS);
    t = resumeTimer(t, T0 + 4 * MINUTE_MS); // ignored
    t = pauseTimer(t, T0 + 5 * MINUTE_MS);
    t = resumeTimer(t, T0 + 9 * MINUTE_MS);
    expect(t.pausedTotal).toBe(6 * MINUTE_MS);
    expect(elapsedMs(t, T0 + 10 * MINUTE_MS)).toBe(4 * MINUTE_MS);
  });
});

describe('formatClock', () => {
  it('formats minutes, hours and rounds up', () => {
    expect(formatClock(25 * MINUTE_MS)).toBe('25:00');
    expect(formatClock(59_001)).toBe('1:00');
    expect(formatClock(5_000)).toBe('0:05');
    expect(formatClock(90 * MINUTE_MS)).toBe('1:30:00');
    expect(formatClock(-10)).toBe('0:00');
  });
});
