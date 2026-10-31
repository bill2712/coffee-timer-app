/**
 * Timestamp-based focus timer (pure functions, no DOM).
 *
 * Nothing here counts ticks. Every value is derived from wall-clock timestamps
 * (`startedAt`, pause bookkeeping and `now`), so the timer stays correct when the
 * browser throttles timers in background tabs, the device sleeps, or the page
 * is reloaded and the state restored from storage.
 */

export const MINUTE_MS = 60_000;

export type FocusMode = 'focus' | 'challenge';
export type Phase = 'focus' | 'break';

export interface SessionPlan {
  mode: FocusMode;
  /** Minutes per focus block (5–180). */
  focusMin: number;
  /** Minutes per break (0 for the Phone Down Challenge). */
  breakMin: number;
  /** Number of focus blocks (1 for the Phone Down Challenge). */
  cycles: number;
}

export interface Segment {
  phase: Phase;
  durationMs: number;
  /** Offset from the start of the session (active time, pauses excluded). */
  startMs: number;
}

export interface TimerState {
  plan: SessionPlan;
  segments: Segment[];
  startedAt: number;
  /** Set while paused. */
  pausedAt: number | null;
  /** Total paused milliseconds before the current pause. */
  pausedTotal: number;
}

export interface TimerPosition {
  /** Active (unpaused) milliseconds since the session started. */
  elapsedMs: number;
  totalMs: number;
  remainingTotalMs: number;
  index: number;
  phase: Phase;
  segmentElapsedMs: number;
  segmentRemainingMs: number;
  /** 0–1 progress through the current segment. */
  segmentProgress: number;
  /** Completed focus milliseconds so far (breaks excluded). */
  focusElapsedMs: number;
  /** Focus blocks completed so far. */
  focusBlocksDone: number;
  done: boolean;
  paused: boolean;
}

export const MIN_FOCUS = 5;
export const MAX_FOCUS = 180;

export const PRESETS_MIN = [15, 25, 45, 60, 90] as const;
export const POMODORO_PRESETS = [
  { id: '25-5', focusMin: 25, breakMin: 5 },
  { id: '50-10', focusMin: 50, breakMin: 10 }
] as const;

/** Clamps and rounds a user-entered duration to the allowed range. */
export function clampMinutes(value: number, min = MIN_FOCUS, max = MAX_FOCUS): number {
  if (!Number.isFinite(value)) return 25;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Normalises a plan so the timer never sees impossible values. */
export function normalisePlan(plan: SessionPlan): SessionPlan {
  if (plan.mode === 'challenge') {
    return { mode: 'challenge', focusMin: clampMinutes(plan.focusMin), breakMin: 0, cycles: 1 };
  }
  return {
    mode: 'focus',
    focusMin: clampMinutes(plan.focusMin),
    breakMin: plan.breakMin > 0 ? clampMinutes(plan.breakMin, 1, 60) : 0,
    cycles: Math.min(8, Math.max(1, Math.round(Number.isFinite(plan.cycles) ? plan.cycles : 1)))
  };
}

/** Focus, break, focus, … — no trailing break after the last block. */
export function buildSegments(plan: SessionPlan): Segment[] {
  const p = normalisePlan(plan);
  const segments: Segment[] = [];
  let offset = 0;
  for (let i = 0; i < p.cycles; i++) {
    segments.push({ phase: 'focus', durationMs: p.focusMin * MINUTE_MS, startMs: offset });
    offset += p.focusMin * MINUTE_MS;
    if (i < p.cycles - 1 && p.breakMin > 0) {
      segments.push({ phase: 'break', durationMs: p.breakMin * MINUTE_MS, startMs: offset });
      offset += p.breakMin * MINUTE_MS;
    }
  }
  return segments;
}

export function startTimer(plan: SessionPlan, now: number): TimerState {
  const normalised = normalisePlan(plan);
  return { plan: normalised, segments: buildSegments(normalised), startedAt: now, pausedAt: null, pausedTotal: 0 };
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  if (state.pausedAt !== null) return state;
  return { ...state, pausedAt: now };
}

export function resumeTimer(state: TimerState, now: number): TimerState {
  if (state.pausedAt === null) return state;
  return { ...state, pausedAt: null, pausedTotal: state.pausedTotal + Math.max(0, now - state.pausedAt) };
}

export function totalDurationMs(state: TimerState): number {
  const last = state.segments[state.segments.length - 1];
  return last ? last.startMs + last.durationMs : 0;
}

/** Active milliseconds since start, excluding pauses; never negative. */
export function elapsedMs(state: TimerState, now: number): number {
  const reference = state.pausedAt ?? now;
  return Math.max(0, reference - state.startedAt - state.pausedTotal);
}

/** Where the session is at time `now`. */
export function position(state: TimerState, now: number): TimerPosition {
  const totalMs = totalDurationMs(state);
  const elapsed = Math.min(totalMs, elapsedMs(state, now));
  const done = elapsed >= totalMs;

  let index = state.segments.length - 1;
  for (let i = 0; i < state.segments.length; i++) {
    const s = state.segments[i];
    if (elapsed < s.startMs + s.durationMs) {
      index = i;
      break;
    }
  }
  const segment = state.segments[index];
  const segmentElapsedMs = Math.min(segment.durationMs, Math.max(0, elapsed - segment.startMs));

  let focusElapsedMs = 0;
  let focusBlocksDone = 0;
  for (const s of state.segments) {
    if (s.phase !== 'focus') continue;
    const inSegment = Math.min(s.durationMs, Math.max(0, elapsed - s.startMs));
    focusElapsedMs += inSegment;
    if (inSegment >= s.durationMs) focusBlocksDone++;
  }

  return {
    elapsedMs: elapsed,
    totalMs,
    remainingTotalMs: totalMs - elapsed,
    index,
    phase: segment.phase,
    segmentElapsedMs,
    segmentRemainingMs: segment.durationMs - segmentElapsedMs,
    segmentProgress: segment.durationMs ? segmentElapsedMs / segment.durationMs : 1,
    focusElapsedMs,
    focusBlocksDone,
    done,
    paused: state.pausedAt !== null
  };
}

/** Absolute time the current segment ends (for scheduling a notification). */
export function segmentEndsAt(state: TimerState, now: number): number | null {
  if (state.pausedAt !== null) return null;
  const pos = position(state, now);
  if (pos.done) return null;
  return now + pos.segmentRemainingMs;
}

/** mm:ss, or h:mm:ss for an hour or more. Rounds up so 0:00 means "finished". */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}
