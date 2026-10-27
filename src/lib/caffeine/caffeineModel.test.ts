import { describe, expect, it } from 'vitest';
import {
  HOUR_MS,
  MINUTE_MS,
  absorptionRate,
  assessSleep,
  atLocalTime,
  bedtimeStatus,
  caffeineAt,
  caffeineCurve,
  clampHalfLife,
  dayStart,
  eliminationRate,
  formatClock,
  lastCall,
  pendingAbsorption,
  parseClock,
  peakTimeHours,
  rates,
  resolveBedtime,
  singleDoseAmount,
  totalConsumed,
  validateDoseMg,
  type Dose
} from './caffeineModel';

// Tests run with TZ=Asia/Hong_Kong (see package.json) so local times are stable.
const DAY = new Date(2026, 9, 27).getTime(); // 27 Oct 2026, 00:00 local
const at = (h: number, m = 0, dayOffset = 0) => DAY + dayOffset * 24 * HOUR_MS + h * HOUR_MS + m * MINUTE_MS;
const params = { halfLifeHours: 5 };

describe('rate constants', () => {
  it('derives ke from the half-life', () => {
    expect(eliminationRate(5)).toBeCloseTo(Math.LN2 / 5, 12);
  });

  it('rejects impossible half-lives', () => {
    expect(() => eliminationRate(0)).toThrow(RangeError);
    expect(() => eliminationRate(Number.NaN)).toThrow(RangeError);
  });

  it.each([2, 3, 5, 7, 10])('solves ka so the peak is at 45 minutes (half-life %d h)', (hl) => {
    const ke = eliminationRate(hl);
    const ka = absorptionRate(hl);
    expect(ka).toBeGreaterThan(ke);
    expect(peakTimeHours(ka, ke) * 60).toBeCloseTo(45, 4);
  });
});

describe('single dose', () => {
  const { ka, ke } = rates(params);

  it('is zero before and at the moment of drinking', () => {
    expect(singleDoseAmount(100, -1, ka, ke)).toBe(0);
    expect(singleDoseAmount(100, 0, ka, ke)).toBe(0);
  });

  it('peaks at ~45 minutes', () => {
    const dose: Dose[] = [{ mg: 100, time: at(8) }];
    let best = { t: 0, mg: -1 };
    for (let minute = 0; minute <= 180; minute++) {
      const mg = caffeineAt(dose, at(8) + minute * MINUTE_MS, params);
      if (mg > best.mg) best = { t: minute, mg };
    }
    expect(best.t).toBeGreaterThanOrEqual(44);
    expect(best.t).toBeLessThanOrEqual(46);
    // Closed form: at the peak, amount = D · e^(−ke·tmax)
    expect(best.mg).toBeCloseTo(100 * Math.exp(-ke * 0.75), 1);
  });

  it('halves every half-life once absorbed', () => {
    const dose: Dose[] = [{ mg: 200, time: at(8) }];
    const a = caffeineAt(dose, at(12), params);
    const b = caffeineAt(dose, at(17), params);
    const c = caffeineAt(dose, at(22), params);
    expect(b / a).toBeCloseTo(0.5, 4);
    expect(c / b).toBeCloseTo(0.5, 4);
  });

  it('decays faster with a shorter half-life', () => {
    const dose: Dose[] = [{ mg: 100, time: at(8) }];
    const fast = caffeineAt(dose, at(18), { halfLifeHours: 3 });
    const slow = caffeineAt(dose, at(18), { halfLifeHours: 7 });
    expect(fast).toBeLessThan(slow);
  });

  it('scales linearly with dose size', () => {
    const one = caffeineAt([{ mg: 50, time: at(8) }], at(11), params);
    const two = caffeineAt([{ mg: 100, time: at(8) }], at(11), params);
    expect(two).toBeCloseTo(one * 2, 8);
  });
});

describe('pendingAbsorption', () => {
  it('starts at the full dose and is almost gone after 90 minutes', () => {
    const doses: Dose[] = [{ mg: 95, time: at(8) }];
    expect(pendingAbsorption(doses, at(8), params)).toBeCloseTo(95, 6);
    expect(pendingAbsorption(doses, at(9, 30), params)).toBeLessThan(1);
    expect(pendingAbsorption(doses, at(7), params)).toBe(0);
  });

  it('plus the absorbed amount never exceeds what was drunk', () => {
    const doses: Dose[] = [{ mg: 95, time: at(8) }, { mg: 63, time: at(8, 20) }];
    for (const minute of [0, 10, 30, 60, 120]) {
      const t = at(8, 20) + minute * MINUTE_MS;
      expect(caffeineAt(doses, t, params) + pendingAbsorption(doses, t, params)).toBeLessThanOrEqual(158 + 1e-9);
    }
  });
});

describe('multiple doses', () => {
  it('adds doses together (superposition)', () => {
    const d1: Dose = { mg: 95, time: at(8) };
    const d2: Dose = { mg: 63, time: at(13) };
    const t = at(16);
    expect(caffeineAt([d1, d2], t, params)).toBeCloseTo(caffeineAt([d1], t, params) + caffeineAt([d2], t, params), 10);
  });

  it('ignores invalid doses instead of producing NaN', () => {
    const doses = [
      { mg: 95, time: at(8) },
      { mg: -50, time: at(9) },
      { mg: Number.NaN, time: at(9) },
      { mg: 50, time: Number.NaN }
    ];
    expect(caffeineAt(doses, at(10), params)).toBeCloseTo(caffeineAt([doses[0]], at(10), params), 10);
  });

  it('samples a curve with the requested resolution', () => {
    const curve = caffeineCurve([{ mg: 95, time: at(8) }], at(6), at(12), params, 15);
    expect(curve).toHaveLength(25);
    expect(curve[0].mg).toBe(0);
    expect(Math.max(...curve.map((p) => p.mg))).toBeGreaterThan(80);
  });
});

describe('clock helpers', () => {
  it('parses and formats HH:MM', () => {
    expect(parseClock('23:00')).toBe(1380);
    expect(parseClock('7:05')).toBe(425);
    expect(parseClock('24:00')).toBeNull();
    expect(parseClock('nope')).toBeNull();
    expect(formatClock(1380)).toBe('23:00');
    expect(formatClock(-30)).toBe('23:30');
  });

  it('builds a local time on the same day', () => {
    expect(atLocalTime(at(15, 12), 23 * 60)).toBe(at(23));
  });
});

describe('resolveBedtime', () => {
  it('uses tonight during the day', () => {
    expect(resolveBedtime(at(8), 23 * 60)).toBe(at(23));
    expect(resolveBedtime(at(22, 59), 23 * 60)).toBe(at(23));
  });

  it('keeps tonight’s bedtime when you are up late past midnight', () => {
    expect(resolveBedtime(at(1, 30, 1), 23 * 60)).toBe(at(23));
  });

  it('rolls bedtimes after midnight into the next calendar day', () => {
    expect(resolveBedtime(at(22), 30)).toBe(at(0, 30, 1));
    expect(resolveBedtime(at(0, 10, 1), 30)).toBe(at(0, 30, 1));
  });

  it('moves to the next night once the lookback has passed', () => {
    expect(resolveBedtime(at(6, 0, 1), 23 * 60)).toBe(at(23, 0, 1));
  });
});

describe('daily total', () => {
  it('counts drinks since the previous bedtime and not future ones', () => {
    const bedtime = at(23);
    const doses: Dose[] = [
      { mg: 100, time: at(22, 0, -1) }, // before last bedtime → yesterday
      { mg: 95, time: at(23, 30, -1) }, // after last bedtime → counts
      { mg: 63, time: at(9) },
      { mg: 63, time: at(20) } // later than "now"
    ];
    expect(totalConsumed(doses, dayStart(bedtime), at(12))).toBe(158);
  });
});

describe('bedtime status', () => {
  it('classifies relative to the threshold', () => {
    expect(bedtimeStatus(30, 50)).toBe('good');
    expect(bedtimeStatus(40, 50)).toBe('good');
    expect(bedtimeStatus(45, 50)).toBe('borderline');
    expect(bedtimeStatus(50, 50)).toBe('borderline');
    expect(bedtimeStatus(51, 50)).toBe('high');
  });
});

describe('assessSleep', () => {
  it('catches a dose drunk right at bedtime that peaks after you lie down', () => {
    const bedtime = at(23);
    const result = assessSleep([{ mg: 95, time: bedtime }], bedtime, params);
    expect(result.atBedtime).toBe(0);
    expect(result.peak).toBeGreaterThan(80);
    expect(result.peakTime).toBeGreaterThan(bedtime);
  });

  it('handles a dose after bedtime across midnight', () => {
    const bedtime = at(23, 30);
    const result = assessSleep([{ mg: 63, time: at(0, 15, 1) }], bedtime, params);
    expect(result.atBedtime).toBe(0);
    expect(result.peak).toBeGreaterThan(50);
    expect(bedtimeStatus(result.peak, 50)).toBe('high');
  });
});

describe('lastCall', () => {
  const bedtime = at(23);

  it('matches the analytic answer for an empty day', () => {
    const result = lastCall([], { bedtime, thresholdMg: 50, params });
    expect(result.kind).toBe('time');
    if (result.kind !== 'time') return;
    // Absorbed cup: 95·2^(−h/5) ≤ 50 → h ≥ 5·log2(95/50) ≈ 4.63 h; peak factor shifts it slightly.
    const hoursBefore = (bedtime - result.time) / HOUR_MS;
    expect(hoursBefore).toBeGreaterThan(4.3);
    expect(hoursBefore).toBeLessThan(5);
    // The returned time really keeps sleep under the threshold…
    expect(assessSleep([{ mg: 95, time: result.time }], bedtime, params).peak).toBeLessThanOrEqual(50);
    // …and 5 minutes later would not.
    expect(assessSleep([{ mg: 95, time: result.time + 5 * MINUTE_MS }], bedtime, params).peak).toBeGreaterThan(50);
  });

  it('moves earlier when you have already had caffeine', () => {
    const empty = lastCall([], { bedtime, thresholdMg: 50, params });
    const busy = lastCall([{ mg: 126, time: at(9) }, { mg: 95, time: at(13) }], { bedtime, thresholdMg: 50, params });
    expect(empty.kind).toBe('time');
    expect(busy.kind).toBe('time');
    if (empty.kind === 'time' && busy.kind === 'time') expect(busy.time).toBeLessThan(empty.time);
  });

  it('moves earlier for slow metabolisers', () => {
    const fast = lastCall([], { bedtime, thresholdMg: 50, params: { halfLifeHours: 3 } });
    const slow = lastCall([], { bedtime, thresholdMg: 50, params: { halfLifeHours: 7 } });
    if (fast.kind === 'time' && slow.kind === 'time') expect(slow.time).toBeLessThan(fast.time);
    else throw new Error('expected times');
  });

  it('reports "over" when bedtime is already above the threshold', () => {
    expect(lastCall([{ mg: 400, time: at(18) }], { bedtime, thresholdMg: 50, params }).kind).toBe('over');
  });

  it('reports "none" when no time in the previous 24 h fits', () => {
    expect(lastCall([], { bedtime, thresholdMg: 5, params: { halfLifeHours: 10 } }).kind).toBe('none');
  });

  it('works across midnight for a late bedtime', () => {
    const lateBedtime = at(1, 0, 1);
    const result = lastCall([], { bedtime: lateBedtime, thresholdMg: 50, params });
    expect(result.kind).toBe('time');
    if (result.kind === 'time') expect(new Date(result.time).getDate()).toBe(new Date(at(12)).getDate());
  });

  it('respects a custom cup size', () => {
    const small = lastCall([], { bedtime, thresholdMg: 50, params, cupMg: 28 });
    expect(small.kind).toBe('time');
    // A 28 mg green tea never exceeds 50 mg, so it fits right up to bedtime.
    if (small.kind === 'time') expect(small.time).toBe(bedtime);
  });
});

describe('validateDoseMg', () => {
  it('accepts normal numbers and numeric strings', () => {
    expect(validateDoseMg(95)).toEqual({ ok: true, mg: 95 });
    expect(validateDoseMg(' 62,5 ')).toEqual({ ok: true, mg: 62.5 });
  });

  it('rejects empty, non-numeric, zero and negative input', () => {
    expect(validateDoseMg('')).toEqual({ ok: false, error: 'not-a-number' });
    expect(validateDoseMg('abc')).toEqual({ ok: false, error: 'not-a-number' });
    expect(validateDoseMg(0)).toEqual({ ok: false, error: 'not-positive' });
    expect(validateDoseMg(-10)).toEqual({ ok: false, error: 'not-positive' });
  });

  it('flags very large single entries and rejects absurd ones', () => {
    expect(validateDoseMg(1200)).toEqual({ ok: true, mg: 1200, warning: 'very-high' });
    expect(validateDoseMg(1000)).toEqual({ ok: true, mg: 1000 });
    expect(validateDoseMg(5000)).toEqual({ ok: false, error: 'too-large' });
  });
});

describe('clampHalfLife', () => {
  it('keeps values within the 2–10 h range', () => {
    expect(clampHalfLife(1)).toBe(2);
    expect(clampHalfLife(12)).toBe(10);
    expect(clampHalfLife(Number.NaN)).toBe(5);
    expect(clampHalfLife(6.5)).toBe(6.5);
  });
});
