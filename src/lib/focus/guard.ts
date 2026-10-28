/**
 * Focus enforcement rules (pure). The app feeds it Page Visibility events; this
 * module decides what they mean.
 *
 * - strict: leaving the page during a focus block fails the session at once.
 * - gentle: leaving starts a grace period. Coming back within it only shows a
 *   warning; staying away longer counts one interruption. Gentle never fails.
 *
 * Breaks and paused time are never enforced. A visibility change can also come
 * from locking the phone screen — browsers do not tell the two apart — which is
 * why gentle mode is the default on touch devices.
 */

export type Strictness = 'strict' | 'gentle';
export const GRACE_MS = 10_000;

export interface GuardState {
  strictness: Strictness;
  graceMs: number;
  /** When the page was hidden during an enforced focus block (null when visible). */
  hiddenSince: number | null;
  interruptions: number;
  /** Total milliseconds away during enforced focus blocks. */
  awayMs: number;
  failed: boolean;
  failedAt: number | null;
}

export type GuardEvent =
  | { kind: 'none' }
  | { kind: 'failed' }
  /** Returned within the grace period. */
  | { kind: 'warned'; awayMs: number }
  /** Returned after the grace period: counted as an interruption. */
  | { kind: 'interrupted'; awayMs: number; interruptions: number };

export function createGuard(strictness: Strictness, graceMs = GRACE_MS): GuardState {
  return { strictness, graceMs, hiddenSince: null, interruptions: 0, awayMs: 0, failed: false, failedAt: null };
}

/**
 * The page became hidden. `enforced` is true only during a running (unpaused)
 * focus block.
 */
export function onHidden(state: GuardState, now: number, enforced: boolean): [GuardState, GuardEvent] {
  if (state.failed || !enforced || state.hiddenSince !== null) return [state, { kind: 'none' }];
  if (state.strictness === 'strict') {
    return [{ ...state, failed: true, failedAt: now, hiddenSince: now }, { kind: 'failed' }];
  }
  return [{ ...state, hiddenSince: now }, { kind: 'none' }];
}

/** The page became visible again. */
export function onVisible(state: GuardState, now: number): [GuardState, GuardEvent] {
  if (state.hiddenSince === null || state.failed) return [{ ...state, hiddenSince: null }, { kind: 'none' }];
  const away = Math.max(0, now - state.hiddenSince);
  const next = { ...state, hiddenSince: null, awayMs: state.awayMs + away };
  if (away <= state.graceMs) return [next, { kind: 'warned', awayMs: away }];
  const interruptions = state.interruptions + 1;
  return [{ ...next, interruptions }, { kind: 'interrupted', awayMs: away, interruptions }];
}

/**
 * The page was closed or reloaded mid-session and is being restored. Strict mode
 * treats that as leaving; gentle mode counts it like any other absence.
 */
export function onRestore(state: GuardState, leftAt: number, now: number, enforced: boolean): [GuardState, GuardEvent] {
  const [hidden, event] = onHidden(state, leftAt, enforced);
  if (event.kind === 'failed' || hidden.hiddenSince === null) return [hidden, event];
  return onVisible(hidden, now);
}

/** A touch-first device, where screen locks commonly fire visibility changes. */
export function defaultStrictness(isCoarsePointer: boolean): Strictness {
  return isCoarsePointer ? 'gentle' : 'strict';
}
