/**
 * localStorage persistence for the caffeine calculator.
 * Every access is wrapped in try/catch: private browsing, blocked cookies or a
 * full quota fall back to in-memory state instead of throwing.
 */

import { clampHalfLife, HOUR_MS } from './caffeineModel';

export const STORAGE_KEY = 'barista_flow_caffeine_v1';
export const SUPPORT_DISMISSED_KEY = 'barista_flow_support_dismissed_at';
/** Entries older than this no longer affect the curve and are pruned. */
export const RETENTION_MS = 72 * HOUR_MS;

export interface Entry {
  id: string;
  drinkId: string;
  /** Optional user label (used for custom drinks). */
  label?: string;
  mg: number;
  time: number;
}

export type TimeFormat = 'auto' | '12' | '24';

export interface Settings {
  /** Minutes after midnight. */
  bedtime: number;
  halfLife: number;
  threshold: number;
  dailyLimit: number;
  timeFormat: TimeFormat;
}

export interface State {
  entries: Entry[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  bedtime: 23 * 60,
  halfLife: 5,
  threshold: 50,
  dailyLimit: 400,
  timeFormat: 'auto'
};

export function storageAvailable(): boolean {
  try {
    const probe = '__bf_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

/** Repairs anything malformed so the UI never has to. */
export function sanitizeState(raw: unknown, now = Date.now()): State {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Partial<State>;
  const s = (obj.settings && typeof obj.settings === 'object' ? obj.settings : {}) as Partial<Settings>;
  const settings: Settings = {
    bedtime: Math.round(num(s.bedtime, DEFAULT_SETTINGS.bedtime, 0, 1439)),
    halfLife: clampHalfLife(num(s.halfLife, DEFAULT_SETTINGS.halfLife, 2, 10)),
    threshold: num(s.threshold, DEFAULT_SETTINGS.threshold, 1, 400),
    dailyLimit: num(s.dailyLimit, DEFAULT_SETTINGS.dailyLimit, 50, 2000),
    timeFormat: s.timeFormat === '12' || s.timeFormat === '24' ? s.timeFormat : 'auto'
  };
  const entries = (Array.isArray(obj.entries) ? obj.entries : [])
    .filter((e): e is Entry =>
      Boolean(e) && typeof e.id === 'string' && typeof e.drinkId === 'string' &&
      Number.isFinite(e.mg) && e.mg > 0 && e.mg <= 3000 && Number.isFinite(e.time))
    .filter((e) => now - e.time < RETENTION_MS && e.time - now < 24 * HOUR_MS)
    .map((e) => ({ id: e.id, drinkId: e.drinkId, mg: e.mg, time: e.time, ...(e.label ? { label: String(e.label).slice(0, 60) } : {}) }))
    .sort((a, b) => a.time - b.time);
  return { entries, settings };
}

export function loadState(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return sanitizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return sanitizeState(null);
  }
}

export function saveState(state: State): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...state }));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(SUPPORT_DISMISSED_KEY);
  } catch {
    /* nothing stored */
  }
}

const SUPPORT_SNOOZE_MS = 7 * 24 * HOUR_MS;

export function supportSnoozed(now = Date.now()): boolean {
  try {
    const at = Number(window.localStorage.getItem(SUPPORT_DISMISSED_KEY));
    return Number.isFinite(at) && at > 0 && now - at < SUPPORT_SNOOZE_MS;
  } catch {
    return false;
  }
}

export function snoozeSupport(now = Date.now()): void {
  try {
    window.localStorage.setItem(SUPPORT_DISMISSED_KEY, String(now));
  } catch {
    /* in-memory only */
  }
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
