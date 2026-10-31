/**
 * localStorage persistence for Brew Focus, plus JSON export/import.
 * Every access is wrapped in try/catch so private browsing or a full quota falls
 * back to in-memory state.
 */

import type { SessionRecord } from './stats';
import type { SessionPlan, TimerState } from './timer';
import { normalisePlan } from './timer';
import type { GuardState, Strictness } from './guard';

export const FOCUS_KEY = 'barista_flow_focus_v1';
export const ACTIVE_KEY = 'barista_flow_focus_active_v1';
export const SUPPORT_DISMISSED_KEY = 'barista_flow_support_dismissed_at';
export const MAX_RECORDS = 2000;

export type AmbientSound = 'off' | 'brown' | 'rain' | 'cafe';

export interface FocusSettings {
  plan: SessionPlan;
  /** null = choose by device (gentle on touch screens). */
  strictness: Strictness | null;
  sound: AmbientSound;
  volume: number;
  notify: boolean;
  chime: boolean;
}

export interface FocusData {
  records: SessionRecord[];
  settings: FocusSettings;
}

/** A session in progress, saved so a reload can restore or settle it. */
export interface ActiveSession {
  id: string;
  timer: TimerState;
  guard: GuardState;
  label?: string;
  /** Last time the page was known to be open. */
  heartbeat: number;
}

export const DEFAULT_SETTINGS: FocusSettings = {
  plan: { mode: 'focus', focusMin: 25, breakMin: 5, cycles: 4 },
  strictness: null,
  sound: 'off',
  volume: 0.5,
  notify: false,
  chime: true
};

const OUTCOMES = new Set(['completed', 'failed', 'stopped']);

function sanitiseRecord(raw: unknown): SessionRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
  const startedAt = num(r.startedAt);
  const endedAt = num(r.endedAt);
  const focusMs = num(r.focusMs);
  if (typeof r.id !== 'string' || !r.id || Number.isNaN(startedAt) || Number.isNaN(endedAt) || endedAt < startedAt) return null;
  if (Number.isNaN(focusMs) || focusMs < 0 || focusMs > 24 * 3_600_000) return null;
  if (!OUTCOMES.has(String(r.outcome))) return null;
  const record: SessionRecord = {
    id: r.id.slice(0, 64),
    startedAt,
    endedAt,
    mode: r.mode === 'challenge' ? 'challenge' : 'focus',
    strictness: r.strictness === 'strict' ? 'strict' : 'gentle',
    plannedFocusMin: Math.max(0, Math.min(1440, num(r.plannedFocusMin) || 0)),
    focusMs,
    outcome: r.outcome as SessionRecord['outcome'],
    interruptions: Math.max(0, Math.min(999, Math.round(num(r.interruptions) || 0)))
  };
  if (typeof r.label === 'string' && r.label.trim()) record.label = r.label.trim().slice(0, 80);
  return record;
}

export function sanitiseSettings(raw: unknown): FocusSettings {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Partial<FocusSettings>;
  const plan = s.plan && typeof s.plan === 'object' ? normalisePlan({ ...DEFAULT_SETTINGS.plan, ...s.plan }) : DEFAULT_SETTINGS.plan;
  const volume = Number(s.volume);
  return {
    plan,
    strictness: s.strictness === 'strict' || s.strictness === 'gentle' ? s.strictness : null,
    sound: s.sound === 'brown' || s.sound === 'rain' || s.sound === 'cafe' ? s.sound : 'off',
    volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_SETTINGS.volume,
    notify: s.notify === true,
    chime: s.chime !== false
  };
}

/** Repairs anything malformed; duplicates (by id) keep the first copy. */
export function sanitiseData(raw: unknown): FocusData {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Partial<FocusData>;
  const seen = new Set<string>();
  const records = (Array.isArray(obj.records) ? obj.records : [])
    .map(sanitiseRecord)
    .filter((r): r is SessionRecord => r !== null && !seen.has(r.id) && Boolean(seen.add(r.id)))
    .sort((a, b) => a.endedAt - b.endedAt)
    .slice(-MAX_RECORDS);
  return { records, settings: sanitiseSettings(obj.settings) };
}

/** Merges imported records into existing ones (by id); settings stay as they are. */
export function mergeImport(current: FocusData, imported: unknown): { data: FocusData; added: number } {
  const incoming = sanitiseData(imported);
  const ids = new Set(current.records.map((r) => r.id));
  const fresh = incoming.records.filter((r) => !ids.has(r.id));
  const data = sanitiseData({ records: [...current.records, ...fresh], settings: current.settings });
  return { data, added: fresh.length };
}

export function exportJson(data: FocusData, now = Date.now()): string {
  return JSON.stringify({ app: 'barista-flow-focus', version: 1, exportedAt: new Date(now).toISOString(), ...data }, null, 2);
}

/* ---------- browser storage ---------- */

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

export function loadData(): FocusData {
  try {
    const raw = window.localStorage.getItem(FOCUS_KEY);
    return sanitiseData(raw ? JSON.parse(raw) : null);
  } catch {
    return sanitiseData(null);
  }
}

export function saveData(data: FocusData): boolean {
  try {
    window.localStorage.setItem(FOCUS_KEY, JSON.stringify({ version: 1, ...data }));
    return true;
  } catch {
    return false;
  }
}

export function loadActive(): ActiveSession | null {
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveSession;
    if (!parsed?.timer?.segments?.length || !parsed.guard || typeof parsed.id !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveActive(active: ActiveSession | null): void {
  try {
    if (active) window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* in-memory only */
  }
}

export function clearAll(): void {
  try {
    window.localStorage.removeItem(FOCUS_KEY);
    window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* nothing stored */
  }
}

const SNOOZE_MS = 7 * 86_400_000;

export function supportSnoozed(now = Date.now()): boolean {
  try {
    const at = Number(window.localStorage.getItem(SUPPORT_DISMISSED_KEY));
    return Number.isFinite(at) && at > 0 && now - at < SNOOZE_MS;
  } catch {
    return false;
  }
}

export function snoozeSupport(now = Date.now()): void {
  try {
    window.localStorage.setItem(SUPPORT_DISMISSED_KEY, String(now));
  } catch {
    /* ignore */
  }
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
