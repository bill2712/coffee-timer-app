import { describe, expect, it } from 'vitest';
import {
  addDays,
  cupCounts,
  cupFor,
  currentStreak,
  dayKey,
  heatLevel,
  heatmap,
  lastDays,
  longestStreak,
  shelf,
  summarise,
  weekday,
  type SessionRecord
} from './stats';
import { exportJson, mergeImport, sanitiseData, DEFAULT_SETTINGS } from './storage';

const HK = 'Asia/Hong_Kong';
const NY = 'America/New_York';
const MIN = 60_000;

let n = 0;
function rec(endedAtIso: string, minutes = 25, outcome: SessionRecord['outcome'] = 'completed'): SessionRecord {
  const endedAt = Date.parse(endedAtIso);
  return {
    id: `r${n++}`,
    startedAt: endedAt - minutes * MIN,
    endedAt,
    mode: 'focus',
    strictness: 'gentle',
    plannedFocusMin: minutes,
    focusMs: outcome === 'completed' ? minutes * MIN : 5 * MIN,
    outcome,
    interruptions: 0
  };
}

describe('day keys', () => {
  it('uses the calendar day of the given time zone', () => {
    const ts = Date.parse('2026-10-27T17:30:00Z'); // 01:30 on the 28th in HK, 13:30 on the 27th in NY
    expect(dayKey(ts, HK)).toBe('2026-10-28');
    expect(dayKey(ts, NY)).toBe('2026-10-27');
  });

  it('does calendar arithmetic across months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(weekday('2026-10-25')).toBe(0); // Sunday
  });
});

describe('streaks', () => {
  const now = Date.parse('2026-10-27T04:00:00Z'); // 12:00 noon in HK

  it('counts consecutive days ending today', () => {
    const records = [rec('2026-10-25T02:00:00Z'), rec('2026-10-26T02:00:00Z'), rec('2026-10-27T02:00:00Z')];
    expect(currentStreak(records, now, HK)).toBe(3);
  });

  it('keeps the streak alive until today is over', () => {
    const records = [rec('2026-10-25T02:00:00Z'), rec('2026-10-26T02:00:00Z')];
    expect(currentStreak(records, now, HK)).toBe(2);
  });

  it('resets after a missed day', () => {
    const records = [rec('2026-10-23T02:00:00Z'), rec('2026-10-24T02:00:00Z'), rec('2026-10-26T02:00:00Z')];
    expect(currentStreak(records, now, HK)).toBe(1);
    const stale = [rec('2026-10-23T02:00:00Z'), rec('2026-10-24T02:00:00Z')];
    expect(currentStreak(stale, now, HK)).toBe(0);
  });

  it('ignores failed and stopped sessions', () => {
    const records = [rec('2026-10-26T02:00:00Z'), rec('2026-10-27T02:00:00Z', 25, 'failed'), rec('2026-10-27T03:00:00Z', 25, 'stopped')];
    expect(currentStreak(records, now, HK)).toBe(1);
  });

  it('assigns a session just after midnight to the new day', () => {
    // 23:50 and 00:10 Hong Kong time, twenty minutes apart → two different days in HK.
    const records = [rec('2026-10-26T15:50:00Z'), rec('2026-10-26T16:10:00Z')];
    const now = Date.parse('2026-10-27T05:00:00Z');
    expect(currentStreak(records, now, HK)).toBe(2);
    // In New York both happened late morning on the 26th → one day.
    expect(currentStreak(records, now, NY)).toBe(1);
  });

  it('depends on the time zone the user is in', () => {
    // 16:30Z = 00:30 on the 27th in HK, but 12:30 on the 26th in NY.
    const records = [rec('2026-10-25T16:30:00Z'), rec('2026-10-26T16:30:00Z')];
    const now27 = Date.parse('2026-10-27T03:00:00Z');
    expect(currentStreak(records, now27, HK)).toBe(2); // 26th and 27th in HK
    expect(currentStreak(records, now27, NY)).toBe(2); // 25th and 26th in NY; now = 26th 23:00 NY
  });

  it('survives a daylight-saving change', () => {
    // US clocks fall back on 1 Nov 2026.
    const records = [rec('2026-10-31T16:00:00Z'), rec('2026-11-01T17:00:00Z'), rec('2026-11-02T17:00:00Z')];
    expect(currentStreak(records, Date.parse('2026-11-02T20:00:00Z'), NY)).toBe(3);
  });

  it('finds the longest streak', () => {
    const records = [
      rec('2026-10-01T02:00:00Z'), rec('2026-10-02T02:00:00Z'), rec('2026-10-03T02:00:00Z'), rec('2026-10-04T02:00:00Z'),
      rec('2026-10-10T02:00:00Z'), rec('2026-10-11T02:00:00Z')
    ];
    expect(longestStreak(records, HK)).toBe(4);
    expect(longestStreak([], HK)).toBe(0);
  });
});

describe('totals and charts', () => {
  const now = Date.parse('2026-10-27T04:00:00Z');
  const records = [
    rec('2026-10-27T02:00:00Z', 25),
    rec('2026-10-27T03:00:00Z', 50),
    rec('2026-10-26T02:00:00Z', 45),
    rec('2026-10-26T03:00:00Z', 25, 'failed'),
    rec('2026-09-30T02:00:00Z', 90)
  ];

  it('summarises totals, month and success rate', () => {
    const s = summarise(records, now, HK);
    expect(s.completed).toBe(4);
    expect(s.attempted).toBe(5);
    expect(s.successRate).toBeCloseTo(0.8, 10);
    expect(s.totalMinutes).toBe(210);
    expect(s.monthMinutes).toBe(120);
    expect(s.todayMinutes).toBe(75);
    expect(summarise([], now, HK).successRate).toBeNull();
  });

  it('builds the last 7 days oldest first', () => {
    const week = lastDays(records, now, 7, HK);
    expect(week).toHaveLength(7);
    expect(week[6]).toEqual({ key: '2026-10-27', minutes: 75 });
    expect(week[5]).toEqual({ key: '2026-10-26', minutes: 45 });
    expect(week[0].key).toBe('2026-10-21');
  });

  it('builds a Sunday-first heatmap ending this week', () => {
    const grid = heatmap(records, now, 4, HK);
    expect(grid).toHaveLength(4);
    expect(grid.every((col) => col.length === 7)).toBe(true);
    expect(weekday(grid[0][0].key)).toBe(0);
    const flat = grid.flat();
    expect(flat.find((c) => c.key === '2026-10-27')?.level).toBe(3);
    expect(flat.find((c) => c.key === '2026-10-28')?.future).toBe(true);
  });

  it('maps minutes to heat levels', () => {
    expect([0, 10, 45, 90, 200].map(heatLevel)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('cups brewed', () => {
  it('unlocks bigger cups for longer sessions', () => {
    expect(cupFor(15)).toBe('espresso');
    expect(cupFor(25)).toBe('cortado');
    expect(cupFor(45)).toBe('cappuccino');
    expect(cupFor(60)).toBe('latte');
    expect(cupFor(90)).toBe('pour-over');
    expect(cupFor(180)).toBe('cold-brew');
  });

  it('puts only completed sessions on the shelf, newest first', () => {
    const records = [rec('2026-10-26T02:00:00Z', 60), rec('2026-10-27T02:00:00Z', 25), rec('2026-10-27T03:00:00Z', 90, 'failed')];
    expect(shelf(records).map((c) => c.style)).toEqual(['cortado', 'latte']);
    expect(cupCounts(records)).toMatchObject({ cortado: 1, latte: 1, 'pour-over': 0 });
  });
});

describe('export / import', () => {
  it('drops malformed records and repairs settings', () => {
    const data = sanitiseData({
      records: [rec('2026-10-27T02:00:00Z'), { id: 'bad', outcome: 'completed' }, { ...rec('2026-10-27T02:00:00Z'), focusMs: -1 }, null],
      settings: { plan: { mode: 'focus', focusMin: 999, breakMin: 5, cycles: 99 }, volume: 4, sound: 'disco' }
    });
    expect(data.records).toHaveLength(1);
    expect(data.settings.plan).toEqual({ mode: 'focus', focusMin: 180, breakMin: 5, cycles: 8 });
    expect(data.settings.volume).toBe(1);
    expect(data.settings.sound).toBe('off');
  });

  it('round-trips through JSON and merges by id', () => {
    const a = rec('2026-10-26T02:00:00Z');
    const b = rec('2026-10-27T02:00:00Z');
    const current = sanitiseData({ records: [a], settings: DEFAULT_SETTINGS });
    const file = JSON.parse(exportJson(sanitiseData({ records: [a, b] }), Date.parse('2026-10-27T05:00:00Z')));
    expect(file.app).toBe('barista-flow-focus');
    const { data, added } = mergeImport(current, file);
    expect(added).toBe(1);
    expect(data.records.map((r) => r.id)).toEqual([a.id, b.id]);
  });

  it('rejects garbage without throwing', () => {
    expect(mergeImport(sanitiseData(null), 'not json at all').added).toBe(0);
    expect(mergeImport(sanitiseData(null), { records: 'nope' }).added).toBe(0);
  });
});
