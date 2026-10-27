/**
 * Caffeine pharmacokinetic model (pure functions, no DOM, no storage).
 *
 * Each dose follows a one-compartment model with first-order absorption and
 * first-order elimination (the "Bateman function"):
 *
 *   A(τ) = D · ka / (ka − ke) · (e^(−ke·τ) − e^(−ka·τ))      for τ > 0
 *
 *   D   dose in mg (oral bioavailability of caffeine is close to 100%, so F = 1)
 *   τ   hours since the dose was drunk
 *   ke  elimination rate = ln 2 / half-life
 *   ka  absorption rate, solved so the single-dose peak lands at `tmaxMinutes`
 *       (45 min by default, inside the 15–120 min range reported in the literature)
 *
 * The total amount in the body is the sum over all doses (linear superposition).
 * Results are *amounts* (mg in the body), not blood concentrations, and are
 * estimates for education only — real people vary a lot.
 *
 * All times are epoch milliseconds so the module works across midnight and
 * time zones without special cases.
 */

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;

/** A logged (or simulated) drink. */
export interface Dose {
  /** Caffeine in milligrams. */
  mg: number;
  /** When it was drunk (epoch ms). */
  time: number;
}

export interface ModelParams {
  /** Elimination half-life in hours (typical adult range ≈ 2–10 h). */
  halfLifeHours: number;
  /** Minutes from drinking to the single-dose peak. Defaults to 45. */
  tmaxMinutes?: number;
}

export const DEFAULT_TMAX_MINUTES = 45;
export const STANDARD_CUP_MG = 95;

/** Elimination rate constant ke (per hour) for a half-life in hours. */
export function eliminationRate(halfLifeHours: number): number {
  if (!Number.isFinite(halfLifeHours) || halfLifeHours <= 0) {
    throw new RangeError('halfLifeHours must be a positive number');
  }
  return Math.LN2 / halfLifeHours;
}

/** Time to peak (hours) for given absorption and elimination rates. */
export function peakTimeHours(ka: number, ke: number): number {
  if (Math.abs(ka - ke) < 1e-9) return 1 / ke;
  return Math.log(ka / ke) / (ka - ke);
}

const absorptionCache = new Map<string, number>();

/**
 * Solves for the absorption rate ka (per hour) that puts the single-dose peak at
 * `tmaxHours`. Peak time falls monotonically as ka rises, so bisection is safe.
 */
export function absorptionRate(halfLifeHours: number, tmaxHours = DEFAULT_TMAX_MINUTES / 60): number {
  const key = `${halfLifeHours}|${tmaxHours}`;
  const cached = absorptionCache.get(key);
  if (cached !== undefined) return cached;

  const ke = eliminationRate(halfLifeHours);
  // The slowest possible peak (ka → ke) happens at 1/ke. Anything later is impossible.
  if (!(tmaxHours > 0) || tmaxHours >= 1 / ke) {
    throw new RangeError('tmax must be positive and shorter than 1/ke');
  }
  let lo = ke * (1 + 1e-9);
  let hi = 1000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (peakTimeHours(mid, ke) > tmaxHours) lo = mid; // peak too late → absorb faster
    else hi = mid;
  }
  const ka = (lo + hi) / 2;
  absorptionCache.set(key, ka);
  return ka;
}

/** Rate constants for a parameter set. */
export function rates(params: ModelParams): { ka: number; ke: number } {
  const ke = eliminationRate(params.halfLifeHours);
  const ka = absorptionRate(params.halfLifeHours, (params.tmaxMinutes ?? DEFAULT_TMAX_MINUTES) / 60);
  return { ka, ke };
}

/** Amount (mg) remaining in the body from one dose, `hours` after drinking it. */
export function singleDoseAmount(mg: number, hours: number, ka: number, ke: number): number {
  if (!(hours > 0) || !isValidMg(mg)) return 0;
  if (Math.abs(ka - ke) < 1e-9) return mg * ke * hours * Math.exp(-ke * hours);
  return (mg * ka) / (ka - ke) * (Math.exp(-ke * hours) - Math.exp(-ka * hours));
}

function isValidMg(mg: number): boolean {
  return Number.isFinite(mg) && mg > 0;
}

/** Total caffeine in the body (mg) at time `t` (epoch ms). */
export function caffeineAt(doses: readonly Dose[], t: number, params: ModelParams): number {
  const { ka, ke } = rates(params);
  let total = 0;
  for (const dose of doses) {
    if (!Number.isFinite(dose.time)) continue;
    total += singleDoseAmount(dose.mg, (t - dose.time) / HOUR_MS, ka, ke);
  }
  return total;
}

/**
 * Caffeine drunk but not yet absorbed (still in the stomach/gut) at time `t`.
 * For one dose that is D · e^(−ka·τ). Shown so a fresh cup doesn't read as "0 mg".
 */
export function pendingAbsorption(doses: readonly Dose[], t: number, params: ModelParams): number {
  const { ka } = rates(params);
  let total = 0;
  for (const dose of doses) {
    if (!Number.isFinite(dose.time) || !isValidMg(dose.mg) || dose.time > t) continue;
    total += dose.mg * Math.exp(-ka * ((t - dose.time) / HOUR_MS));
  }
  return total;
}

export interface CurvePoint {
  t: number;
  mg: number;
}

/** Samples the total-caffeine curve from `start` to `end` (inclusive) every `stepMinutes`. */
export function caffeineCurve(
  doses: readonly Dose[],
  start: number,
  end: number,
  params: ModelParams,
  stepMinutes = 5
): CurvePoint[] {
  const step = Math.max(1, stepMinutes) * MINUTE_MS;
  const points: CurvePoint[] = [];
  for (let t = start; t <= end; t += step) points.push({ t, mg: caffeineAt(doses, t, params) });
  return points;
}

/* ------------------------------------------------------------------ */
/* Calendar helpers                                                    */
/* ------------------------------------------------------------------ */

/** Local wall-clock time on the same calendar day as `reference`. */
export function atLocalTime(reference: number, minutesOfDay: number): number {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutesOfDay);
  return d.getTime();
}

/** Parses "HH:MM" into minutes after midnight, or null when invalid. */
export function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/** Formats minutes after midnight as "HH:MM". */
export function formatClock(minutesOfDay: number): string {
  const total = ((Math.round(minutesOfDay) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * The bedtime that "tonight" refers to: the first bedtime occurrence after
 * `now − lookbackHours`. With a 23:00 bedtime this returns today's 23:00 all day,
 * still returns it at 01:30 (you're up late), and handles bedtimes after midnight
 * (e.g. 00:30) by rolling over to the next calendar day.
 */
export function resolveBedtime(now: number, bedtimeMinutes: number, lookbackHours = 6): number {
  const from = now - lookbackHours * HOUR_MS;
  let candidate = atLocalTime(from, bedtimeMinutes);
  // Step forward a day at a time (setDate keeps DST transitions correct).
  while (candidate <= from) {
    const d = new Date(candidate);
    d.setDate(d.getDate() + 1);
    candidate = d.getTime();
  }
  return candidate;
}

/** Start of the caffeine "day": 24 hours before tonight's bedtime. */
export function dayStart(bedtime: number): number {
  const d = new Date(bedtime);
  d.setDate(d.getDate() - 1);
  return d.getTime();
}

/** Sum of mg drunk in the half-open window (from, to]. */
export function totalConsumed(doses: readonly Dose[], from: number, to: number): number {
  return doses.reduce((sum, d) => (d.time > from && d.time <= to && isValidMg(d.mg) ? sum + d.mg : sum), 0);
}

/* ------------------------------------------------------------------ */
/* Bedtime assessment                                                  */
/* ------------------------------------------------------------------ */

/**
 * Hours after bedtime that we still check. A drink taken shortly before bed is
 * not fully absorbed at bedtime, so its peak lands after you lie down; looking
 * at the first few hours of sleep catches that instead of rewarding a late cup.
 */
export const SLEEP_WINDOW_HOURS = 3;

export interface SleepAssessment {
  /** Estimated mg in the body exactly at bedtime. */
  atBedtime: number;
  /** Highest estimated mg during the first hours of sleep (≥ atBedtime). */
  peak: number;
  /** When that peak happens. */
  peakTime: number;
}

export function assessSleep(
  doses: readonly Dose[],
  bedtime: number,
  params: ModelParams,
  windowHours = SLEEP_WINDOW_HOURS
): SleepAssessment {
  const atBedtime = caffeineAt(doses, bedtime, params);
  let peak = atBedtime;
  let peakTime = bedtime;
  for (let t = bedtime + 5 * MINUTE_MS; t <= bedtime + windowHours * HOUR_MS; t += 5 * MINUTE_MS) {
    const mg = caffeineAt(doses, t, params);
    if (mg > peak) {
      peak = mg;
      peakTime = t;
    }
  }
  return { atBedtime, peak, peakTime };
}

export type BedtimeStatus = 'good' | 'borderline' | 'high';

/** Fraction of the threshold below which the status is "good". */
export const BORDERLINE_FRACTION = 0.8;

/**
 * good       ≤ 80 % of the threshold
 * borderline 80–100 % of the threshold
 * high       above the threshold
 */
export function bedtimeStatus(mg: number, thresholdMg: number): BedtimeStatus {
  if (mg > thresholdMg) return 'high';
  if (mg > thresholdMg * BORDERLINE_FRACTION) return 'borderline';
  return 'good';
}

export type LastCallResult =
  /** Latest clock time a cup fits (may be in the past — compare with now). */
  | { kind: 'time'; time: number }
  /** Already over the threshold without another cup. */
  | { kind: 'over' }
  /** Even a cup 24 h before bedtime would not fit (very low threshold / slow metabolism). */
  | { kind: 'none' };

export interface LastCallOptions {
  bedtime: number;
  thresholdMg: number;
  params: ModelParams;
  cupMg?: number;
  stepMinutes?: number;
}

/**
 * Latest time a cup of `cupMg` (95 mg by default) can be drunk while keeping the
 * estimated amount during early sleep at or below the threshold. Scans backwards
 * from bedtime in `stepMinutes` steps and returns the first time that fits, so the
 * answer is rounded down (on the cautious side).
 */
export function lastCall(doses: readonly Dose[], opts: LastCallOptions): LastCallResult {
  const { bedtime, thresholdMg, params } = opts;
  const cupMg = opts.cupMg ?? STANDARD_CUP_MG;
  const step = Math.max(1, opts.stepMinutes ?? 5) * MINUTE_MS;

  if (assessSleep(doses, bedtime, params).peak > thresholdMg) return { kind: 'over' };

  // Align candidates to whole steps of the clock so results read nicely (e.g. 14:35).
  let t = Math.floor(bedtime / step) * step;
  const earliest = bedtime - 24 * HOUR_MS;
  for (; t >= earliest; t -= step) {
    const trial = [...doses, { mg: cupMg, time: t }];
    if (assessSleep(trial, bedtime, params).peak <= thresholdMg) return { kind: 'time', time: t };
  }
  return { kind: 'none' };
}

/* ------------------------------------------------------------------ */
/* Input validation                                                    */
/* ------------------------------------------------------------------ */

export const MAX_ENTRY_MG = 3000;
export const SINGLE_DOSE_DANGER_MG = 1000;
export const DEFAULT_DAILY_LIMIT_MG = 400;

export type DoseValidation =
  | { ok: true; mg: number; warning?: 'very-high' }
  | { ok: false; error: 'not-a-number' | 'not-positive' | 'too-large' };

/** Validates a user-entered caffeine amount. */
export function validateDoseMg(input: unknown): DoseValidation {
  const mg = typeof input === 'string' ? Number(input.trim().replace(',', '.')) : Number(input);
  if (input === '' || input === null || input === undefined || !Number.isFinite(mg)) {
    return { ok: false, error: 'not-a-number' };
  }
  if (mg <= 0) return { ok: false, error: 'not-positive' };
  if (mg > MAX_ENTRY_MG) return { ok: false, error: 'too-large' };
  const rounded = Math.round(mg * 10) / 10;
  return rounded > SINGLE_DOSE_DANGER_MG ? { ok: true, mg: rounded, warning: 'very-high' } : { ok: true, mg: rounded };
}

/** Clamps a half-life to the range the UI offers. */
export function clampHalfLife(hours: number): number {
  if (!Number.isFinite(hours)) return 5;
  return Math.min(10, Math.max(2, hours));
}
