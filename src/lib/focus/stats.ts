/**
 * Progress statistics for Brew Focus (pure functions).
 *
 * Days are calendar days in a given IANA time zone (the browser's by default),
 * keyed as "YYYY-MM-DD". Using explicit time zones makes streaks behave across
 * midnight, daylight-saving changes and travel, and makes them testable.
 */

import type { FocusMode } from './timer';
import type { Strictness } from './guard';

export type Outcome = 'completed' | 'failed' | 'stopped';

export interface SessionRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  mode: FocusMode;
  strictness: Strictness;
  /** Planned focus minutes for the whole session (all blocks). */
  plannedFocusMin: number;
  /** Focus time actually completed, in ms. */
  focusMs: number;
  outcome: Outcome;
  interruptions: number;
  label?: string;
}

const DAY_MS = 86_400_000;
const keyFormatters = new Map<string, Intl.DateTimeFormat>();

/** Calendar day of `ts` in `timeZone`, as YYYY-MM-DD. */
export function dayKey(ts: number, timeZone?: string): string {
  const cacheKey = timeZone ?? '__local__';
  let fmt = keyFormatters.get(cacheKey);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
    keyFormatters.set(cacheKey, fmt);
  }
  const parts = fmt.formatToParts(ts);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Adds whole days to a day key (calendar arithmetic, no time-zone effects). */
export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d) + days * DAY_MS);
  return date.toISOString().slice(0, 10);
}

/** Day of week for a key: 0 = Sunday … 6 = Saturday. */
export function weekday(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const isCompleted = (r: SessionRecord) => r.outcome === 'completed';

/** Days (keys) with at least one completed session. */
export function completedDays(records: readonly SessionRecord[], timeZone?: string): Set<string> {
  return new Set(records.filter(isCompleted).map((r) => dayKey(r.endedAt, timeZone)));
}

/**
 * Current streak: consecutive days with a completed session, ending today — or
 * yesterday, because today's session may simply not have happened yet. One
 * missed day resets it to zero.
 */
export function currentStreak(records: readonly SessionRecord[], now: number, timeZone?: string): number {
  const days = completedDays(records, timeZone);
  const today = dayKey(now, timeZone);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(records: readonly SessionRecord[], timeZone?: string): number {
  const days = [...completedDays(records, timeZone)].sort();
  let best = 0;
  let run = 0;
  let previous = '';
  for (const day of days) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

/** Focus minutes per day (completed sessions only). */
export function minutesByDay(records: readonly SessionRecord[], timeZone?: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of records) {
    if (!isCompleted(r)) continue;
    const key = dayKey(r.endedAt, timeZone);
    map.set(key, (map.get(key) ?? 0) + r.focusMs / 60_000);
  }
  return map;
}

export interface DayValue {
  key: string;
  minutes: number;
}

/** The last `days` days ending today, oldest first. */
export function lastDays(records: readonly SessionRecord[], now: number, days = 7, timeZone?: string): DayValue[] {
  const byDay = minutesByDay(records, timeZone);
  const today = dayKey(now, timeZone);
  return Array.from({ length: days }, (_, i) => {
    const key = addDays(today, i - (days - 1));
    return { key, minutes: byDay.get(key) ?? 0 };
  });
}

export interface HeatmapCell extends DayValue {
  /** 0 = none, 1–4 = increasing focus time. */
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

export function heatLevel(minutes: number): HeatmapCell['level'] {
  if (minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

/**
 * GitHub-style heatmap: `weeks` columns of 7 days (Sunday first), ending with the
 * week that contains today. Days after today are flagged `future`.
 */
export function heatmap(records: readonly SessionRecord[], now: number, weeks = 18, timeZone?: string): HeatmapCell[][] {
  const byDay = minutesByDay(records, timeZone);
  const today = dayKey(now, timeZone);
  const firstSunday = addDays(today, -weekday(today) - (weeks - 1) * 7);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const key = addDays(firstSunday, w * 7 + d);
      const minutes = byDay.get(key) ?? 0;
      return { key, minutes, level: heatLevel(minutes), future: key > today };
    })
  );
}

export interface Summary {
  streak: number;
  longest: number;
  totalMinutes: number;
  completed: number;
  attempted: number;
  /** 0–1, or null before the first session. */
  successRate: number | null;
  monthMinutes: number;
  todayMinutes: number;
}

export function summarise(records: readonly SessionRecord[], now: number, timeZone?: string): Summary {
  const completed = records.filter(isCompleted);
  const byDay = minutesByDay(records, timeZone);
  const today = dayKey(now, timeZone);
  const month = today.slice(0, 7);
  let monthMinutes = 0;
  for (const [key, minutes] of byDay) if (key.startsWith(month)) monthMinutes += minutes;
  return {
    streak: currentStreak(records, now, timeZone),
    longest: longestStreak(records, timeZone),
    totalMinutes: completed.reduce((sum, r) => sum + r.focusMs / 60_000, 0),
    completed: completed.length,
    attempted: records.length,
    successRate: records.length ? completed.length / records.length : null,
    monthMinutes,
    todayMinutes: byDay.get(today) ?? 0
  };
}

/* ------------------------------------------------------------------ */
/* Cups brewed (cosmetic collection)                                   */
/* ------------------------------------------------------------------ */

export type CupStyle = 'espresso' | 'cortado' | 'cappuccino' | 'latte' | 'pour-over' | 'cold-brew';

/** Minimum focus minutes for each cup, longest first. */
export const CUP_TIERS: { style: CupStyle; minMinutes: number }[] = [
  { style: 'cold-brew', minMinutes: 120 },
  { style: 'pour-over', minMinutes: 90 },
  { style: 'latte', minMinutes: 60 },
  { style: 'cappuccino', minMinutes: 45 },
  { style: 'cortado', minMinutes: 25 },
  { style: 'espresso', minMinutes: 0 }
];

/** The cup a completed session earns, based on its focus minutes. */
export function cupFor(focusMinutes: number): CupStyle {
  return (CUP_TIERS.find((tier) => focusMinutes >= tier.minMinutes) ?? CUP_TIERS[CUP_TIERS.length - 1]).style;
}

/** Cups on the shelf, newest first. */
export function shelf(records: readonly SessionRecord[]): { id: string; style: CupStyle; endedAt: number; minutes: number }[] {
  return records
    .filter(isCompleted)
    .sort((a, b) => b.endedAt - a.endedAt)
    .map((r) => ({ id: r.id, style: cupFor(r.focusMs / 60_000), endedAt: r.endedAt, minutes: r.focusMs / 60_000 }));
}

/** Count of each cup style collected. */
export function cupCounts(records: readonly SessionRecord[]): Record<CupStyle, number> {
  const counts = Object.fromEntries(CUP_TIERS.map((t) => [t.style, 0])) as Record<CupStyle, number>;
  for (const cup of shelf(records)) counts[cup.style]++;
  return counts;
}
