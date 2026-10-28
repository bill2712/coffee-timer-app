/**
 * Browser controller for /focus. Owns the session lifecycle:
 * setup → full-screen session (timestamp-driven) → results.
 * All decisions about time and enforcement are delegated to the pure modules.
 */

import { MINUTE_MS, formatClock, normalisePlan, pauseTimer, position, resumeTimer, startTimer, type SessionPlan, type TimerPosition } from './timer';
import { createGuard, defaultStrictness, onHidden, onRestore, onVisible, type GuardEvent, type Strictness } from './guard';
import { cupFor, summarise, type SessionRecord } from './stats';
import { attachShare } from './shareUi';
import {
  loadActive,
  loadData,
  newId,
  saveActive,
  saveData,
  snoozeSupport,
  storageAvailable,
  supportSnoozed,
  type ActiveSession,
  type AmbientSound,
  type FocusData
} from './storage';
import { playAmbient, playChime, setVolume, stopAmbient, unlockAudio } from './audio';
import { notifyState, requestNotify, showNotification } from './notify';
import { cupSvg } from './cups';
import { fill, translate, type FocusDict, type FocusKey } from '../../i18n/focus';

const SPILLED_CUP = `<svg viewBox="0 0 140 120" width="140" height="120" aria-hidden="true"><ellipse cx="70" cy="104" rx="62" ry="9" fill="#6f4426" opacity=".85"/><g transform="rotate(-78 52 96)"><path d="M28 40h64l-6 52c-1 8-5 10-11 10H45c-6 0-10-2-11-10Z" fill="#f4ede3" stroke="currentColor" stroke-width="3"/><path d="M92 52c16 0 16 30-4 30" fill="none" stroke="currentColor" stroke-width="5"/></g></svg>`;

export function initBrewFocus(): void {
  const root = document.getElementById('bf-app');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';

  /* ---------- i18n ---------- */
  let dict = {} as FocusDict;
  try {
    dict = JSON.parse(document.getElementById('bf-i18n')?.textContent || '{}');
  } catch {
    /* fall back to keys */
  }
  const t = (key: FocusKey | string, params?: Record<string, string | number>) => translate(dict as Record<string, string>, key, params);
  const lang = root.dataset.lang || 'en';
  const locale = lang === 'zh-TW' ? 'zh-HK' : 'en-US';
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  const setText = (id: string, text: string) => {
    const el = $(id);
    if (el && el.textContent !== text) el.textContent = text;
  };
  const fmtTime = (ts: number) => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(ts);
  const mins = (ms: number) => Math.round(ms / MINUTE_MS);
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const originalTitle = document.title;

  /* ---------- state ---------- */
  const persistent = storageAvailable();
  if (!persistent) $('bf-storage-warning')?.removeAttribute('hidden');
  let data: FocusData = loadData();
  let active: ActiveSession | null = null;
  let lastIndex = -1;
  let ticker = 0;
  let heartbeatTimer = 0;
  let pendingFailure: SessionRecord | null = null;
  let wakeLock: { release: () => Promise<void> } | null = null;
  let noticeTimer = 0;

  const save = () => {
    if (persistent) saveData(data);
  };
  const announce = (text: string) => {
    const live = $('bf-live');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(() => (live.textContent = text), 50);
  };

  /* ---------- settings form ---------- */
  const radios = (name: string) => [...root.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)];
  const radioValue = (name: string) => radios(name).find((r) => r.checked)?.value ?? '';
  const setRadio = (name: string, value: string) => radios(name).forEach((r) => (r.checked = r.value === value));
  const num = (id: string) => Number($<HTMLInputElement>(id)?.value);

  function fieldError(id: string, errorId: string, message: string | null): void {
    const input = $(id);
    const error = $(errorId);
    input?.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) {
      error.hidden = !message;
      error.textContent = message ?? '';
    }
  }

  /** Reads the form into a plan; returns null (and shows errors) when invalid. */
  function readPlan(showErrors = true): SessionPlan | null {
    const mode = radioValue('bf-mode') === 'challenge' ? 'challenge' : 'focus';
    const check = (id: string, errorId: string, min: number, max: number) => {
      const v = num(id);
      const ok = Number.isFinite(v) && v >= min && v <= max && $<HTMLInputElement>(id)?.value.trim() !== '';
      if (showErrors) fieldError(id, errorId, ok ? null : t('setup.err.range', { min, max }));
      return ok ? Math.round(v) : null;
    };
    if (mode === 'challenge') {
      const choice = radioValue('bf-duration');
      const focusMin = choice === 'custom' ? check('bf-duration-min', 'bf-duration-error', 5, 180) : Number(choice);
      return focusMin ? normalisePlan({ mode, focusMin, breakMin: 0, cycles: 1 }) : null;
    }
    const pattern = radioValue('bf-pattern');
    let focusMin: number | null = 25;
    let breakMin: number | null = 5;
    if (pattern === '50-10') [focusMin, breakMin] = [50, 10];
    if (pattern === 'custom') {
      focusMin = check('bf-focus-min', 'bf-focus-min-error', 5, 180);
      breakMin = check('bf-break-min', 'bf-break-min-error', 1, 60);
    }
    const cycles = Math.min(8, Math.max(1, Math.round(num('bf-rounds') || 1)));
    return focusMin && breakMin ? normalisePlan({ mode, focusMin, breakMin, cycles }) : null;
  }

  function strictness(plan: SessionPlan): Strictness {
    return plan.mode === 'challenge' ? 'strict' : (radioValue('bf-strict') as Strictness) || 'gentle';
  }

  let shownMode: 'focus' | 'challenge' | '' = '';
  function syncFormVisibility(): void {
    const challenge = radioValue('bf-mode') === 'challenge';
    $('bf-focus-opts')!.hidden = challenge;
    $('bf-challenge-opts')!.hidden = !challenge;
    $('bf-custom-pattern')!.hidden = radioValue('bf-pattern') !== 'custom';
    $('bf-custom-duration')!.hidden = radioValue('bf-duration') !== 'custom';
    $('bf-challenge-note')!.hidden = !challenge;
    $('bf-mobile-note')!.hidden = !coarse;
    radios('bf-strict').forEach((r) => (r.disabled = challenge));
    // Only touch the strictness radios when the mode itself changes, so a user's
    // choice is never overwritten: the challenge forces strict, focus restores theirs.
    const mode = challenge ? 'challenge' : 'focus';
    if (mode !== shownMode) {
      setRadio('bf-strict', challenge ? 'strict' : data.settings.strictness ?? defaultStrictness(coarse));
      shownMode = mode;
    }
  }

  function renderSummary(): void {
    const plan = readPlan(false);
    if (!plan) return setText('bf-summary', '');
    const total = plan.focusMin * plan.cycles + plan.breakMin * (plan.cycles - 1);
    const end = fmtTime(Date.now() + total * MINUTE_MS);
    setText(
      'bf-summary',
      plan.mode === 'focus' && plan.cycles > 1
        ? t('setup.summary.focus', { rounds: plan.cycles, focus: plan.focusMin, break: plan.breakMin, total, end })
        : t('setup.summary.single', { focus: plan.focusMin, end })
    );
  }

  function persistSettings(): void {
    const plan = readPlan(false);
    const s = data.settings;
    if (plan) s.plan = plan;
    if (radioValue('bf-mode') !== 'challenge') s.strictness = (radioValue('bf-strict') as Strictness) || s.strictness;
    s.sound = (radioValue('bf-sound') as AmbientSound) || 'off';
    s.volume = Number($<HTMLInputElement>('bf-volume')?.value ?? 0.5);
    s.chime = Boolean($<HTMLInputElement>('bf-chime')?.checked);
    save();
  }

  function applySettingsToForm(): void {
    const { plan, sound, volume, notify, chime } = data.settings;
    setRadio('bf-mode', plan.mode);
    if (plan.mode === 'challenge') {
      const preset = [15, 25, 45, 60, 90].includes(plan.focusMin);
      setRadio('bf-duration', preset ? String(plan.focusMin) : 'custom');
      if (!preset) $<HTMLInputElement>('bf-duration-min')!.value = String(plan.focusMin);
    } else {
      const pattern = plan.focusMin === 25 && plan.breakMin === 5 ? '25-5' : plan.focusMin === 50 && plan.breakMin === 10 ? '50-10' : 'custom';
      setRadio('bf-pattern', pattern);
      $<HTMLInputElement>('bf-focus-min')!.value = String(plan.focusMin);
      $<HTMLInputElement>('bf-break-min')!.value = String(plan.breakMin || 5);
      $<HTMLInputElement>('bf-rounds')!.value = String(plan.cycles);
    }
    setRadio('bf-sound', sound);
    $<HTMLInputElement>('bf-volume')!.value = String(volume);
    setVolume(volume);
    $<HTMLInputElement>('bf-notify')!.checked = notify && notifyState() === 'granted';
    $<HTMLInputElement>('bf-chime')!.checked = chime;
    syncFormVisibility();
    renderSummary();
  }

  root.querySelector('#bf-setup')?.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.id === 'bf-notify') return;
    syncFormVisibility();
    renderSummary();
    persistSettings();
    if (target.name === 'bf-sound' && $('bf-preview')?.getAttribute('aria-pressed') === 'true') playAmbient(data.settings.sound);
  });
  root.querySelector('#bf-setup')?.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.id === 'bf-volume') setVolume(Number(target.value));
    if (target.type === 'number') renderSummary();
  });
  const stepRounds = (delta: number) => {
    const input = $<HTMLInputElement>('bf-rounds');
    if (!input) return;
    input.value = String(Math.min(8, Math.max(1, (Number(input.value) || 1) + delta)));
    renderSummary();
    persistSettings();
  };
  $('bf-rounds-dec')?.addEventListener('click', () => stepRounds(-1));
  $('bf-rounds-inc')?.addEventListener('click', () => stepRounds(1));

  $('bf-preview')?.addEventListener('click', () => {
    const btn = $('bf-preview')!;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = t(on ? 'sound.stop' : 'sound.preview');
    if (on) {
      unlockAudio();
      playAmbient(data.settings.sound === 'off' ? 'brown' : data.settings.sound);
    } else stopAmbient();
  });
  const stopPreview = () => {
    const btn = $('bf-preview');
    if (btn?.getAttribute('aria-pressed') === 'true') {
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = t('sound.preview');
    }
  };

  $<HTMLInputElement>('bf-notify')?.addEventListener('change', async (event) => {
    const box = event.target as HTMLInputElement;
    const note = $('bf-notify-note');
    if (!box.checked) {
      data.settings.notify = false;
      save();
      return;
    }
    const state = notifyState() === 'granted' ? 'granted' : await requestNotify();
    const ok = state === 'granted';
    box.checked = ok;
    data.settings.notify = ok;
    save();
    if (note) {
      note.hidden = ok;
      note.textContent = state === 'unsupported' ? t('setup.notifyUnsupported') : ok ? '' : t('setup.notifyDenied');
    }
  });

  /* ---------- progress summary ---------- */
  function renderProgress(): void {
    const s = summarise(data.records, Date.now());
    setText('bf-progress-streak', t('stats.days', { n: s.streak }));
    setText('bf-progress-today', t('stats.mins', { m: Math.round(s.todayMinutes) }));
    setText('bf-progress-cups', String(s.completed));
    const empty = $('bf-progress-empty');
    if (empty) empty.hidden = s.completed > 0;
  }

  /* ---------- wake lock ---------- */
  async function requestWakeLock(): Promise<void> {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
      if (!wakeLock && nav.wakeLock && document.visibilityState === 'visible') wakeLock = await nav.wakeLock.request('screen');
    } catch {
      wakeLock = null;
    }
  }
  function releaseWakeLock(): void {
    wakeLock?.release().catch(() => undefined);
    wakeLock = null;
  }

  /* ---------- session view ---------- */
  const sessionEl = $('bf-session')!;

  function openSessionView(): void {
    sessionEl.hidden = false;
    sessionEl.classList.remove('is-spilled', 'is-full', 'is-break', 'is-paused');
    document.documentElement.classList.add('bf-session-active');
    $('bf-stop')?.focus();
  }

  function closeSessionView(): void {
    sessionEl.hidden = true;
    document.documentElement.classList.remove('bf-session-active');
    document.title = originalTitle;
  }

  function showNotice(text: string): void {
    const el = $('bf-notice');
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => (el.hidden = true), 7000);
  }

  function renderSession(pos: TimerPosition): void {
    if (!active) return;
    const plan = active.timer.plan;
    const focusTotal = plan.focusMin * plan.cycles * MINUTE_MS;
    const fillLevel = Math.min(1, pos.focusElapsedMs / focusTotal);
    const phaseLabel = pos.phase === 'focus' ? t('session.focus') : t('session.break');
    const round = active.timer.segments.slice(0, pos.index + 1).filter((s) => s.phase === 'focus').length;
    setText('bf-phase', plan.cycles > 1 ? `${phaseLabel} · ${t('session.round', { n: round, total: plan.cycles })}` : phaseLabel);
    setText('bf-time', formatClock(pos.segmentRemainingMs));
    $('bf-liquid')?.setAttribute('transform', `translate(0 ${(194 - 126 * fillLevel).toFixed(1)})`);
    $('bf-bigcup')?.setAttribute('aria-label', t('session.cupLabel', { pct: Math.round(fillLevel * 100) }));
    sessionEl.classList.toggle('is-full', fillLevel >= 0.98);
    sessionEl.classList.toggle('is-break', pos.phase === 'break');
    sessionEl.classList.toggle('is-paused', pos.paused);
    const hint = pos.paused
      ? t('session.paused')
      : pos.phase === 'break'
        ? t('session.breakHint')
        : active.guard.strictness === 'strict'
          ? t('session.strictHint')
          : t('session.gentleHint');
    setText('bf-session-hint', hint);
    const pauseBtn = $<HTMLButtonElement>('bf-pause');
    if (pauseBtn) {
      pauseBtn.hidden = plan.mode === 'challenge';
      pauseBtn.textContent = pos.paused ? t('session.resume') : t('session.pause');
    }
    document.title = fill(t('session.title'), { time: formatClock(pos.segmentRemainingMs), phase: pos.paused ? t('session.paused') : phaseLabel });
  }

  function persistActive(): void {
    if (!active) return;
    active.heartbeat = Date.now();
    if (persistent) saveActive(active);
  }

  function handleTransition(pos: TimerPosition): void {
    if (!active) return;
    const plan = active.timer.plan;
    const notify = data.settings.notify;
    if (data.settings.chime) playChime();
    if (pos.phase === 'break') {
      announce(t('announce.break', { min: plan.breakMin }));
      if (notify && document.hidden) void showNotification(t('notify.focusEnd.title'), t('notify.focusEnd.body', { min: plan.breakMin }));
    } else {
      const round = pos.focusBlocksDone + 1;
      announce(t('announce.focus', { n: round }));
      if (notify && document.hidden) void showNotification(t('notify.breakEnd.title'), t('notify.breakEnd.body', { n: round }));
    }
  }

  function tick(): void {
    if (!active) return;
    const now = Date.now();
    const pos = position(active.timer, now);
    if (pos.done) {
      finish('completed', now);
      return;
    }
    if (lastIndex !== -1 && pos.index !== lastIndex) handleTransition(pos);
    lastIndex = pos.index;
    renderSession(pos);
  }

  function startLoop(): void {
    window.clearInterval(ticker);
    window.clearInterval(heartbeatTimer);
    ticker = window.setInterval(tick, 250);
    heartbeatTimer = window.setInterval(persistActive, 10_000);
    tick();
  }

  function stopLoop(): void {
    window.clearInterval(ticker);
    window.clearInterval(heartbeatTimer);
  }

  function beginSession(session: ActiveSession, resumed = false): void {
    active = session;
    lastIndex = position(session.timer, Date.now()).index;
    const label = $('bf-session-label');
    if (label) {
      label.hidden = !session.label;
      label.textContent = session.label ?? '';
    }
    $('bf-setup')!.hidden = true;
    $('bf-result')!.hidden = true;
    openSessionView();
    resetStop();
    persistActive();
    startLoop();
    void requestWakeLock();
    stopPreview();
    if (data.settings.sound !== 'off') playAmbient(data.settings.sound);
    if (!resumed) announce(t('announce.start', { min: session.timer.plan.focusMin }));
  }

  $('bf-start')?.addEventListener('click', () => {
    const plan = readPlan(true);
    if (!plan) return;
    persistSettings();
    unlockAudio();
    const now = Date.now();
    const label = $<HTMLInputElement>('bf-label')?.value.trim().slice(0, 80) || undefined;
    beginSession({ id: newId(), timer: startTimer(plan, now), guard: createGuard(strictness(plan)), label, heartbeat: now });
  });

  /* ---------- pause / stop ---------- */
  $('bf-pause')?.addEventListener('click', () => {
    if (!active || active.timer.plan.mode === 'challenge') return;
    const now = Date.now();
    const paused = active.timer.pausedAt !== null;
    active.timer = paused ? resumeTimer(active.timer, now) : pauseTimer(active.timer, now);
    announce(t(paused ? 'announce.resumed' : 'announce.paused'));
    persistActive();
    tick();
  });

  let stopArmed = 0;
  function resetStop(): void {
    window.clearTimeout(stopArmed);
    stopArmed = 0;
    const btn = $('bf-stop');
    if (btn) {
      btn.classList.remove('is-confirming');
      btn.textContent = t('session.stop');
    }
  }
  $('bf-stop')?.addEventListener('click', () => {
    if (!active) return;
    const btn = $('bf-stop')!;
    if (!stopArmed) {
      const pos = position(active.timer, Date.now());
      btn.classList.add('is-confirming');
      btn.textContent = active.timer.plan.mode === 'focus' && pos.focusBlocksDone > 0 ? t('session.stopKeep', { n: pos.focusBlocksDone }) : t('session.stopConfirm');
      stopArmed = window.setTimeout(resetStop, 4000);
      return;
    }
    resetStop();
    const now = Date.now();
    const pos = position(active.timer, now);
    // In Focus mode, finished rounds still count as a brewed cup.
    if (active.timer.plan.mode === 'focus' && pos.focusBlocksDone > 0) finish('completed', now, pos.focusBlocksDone * active.timer.plan.focusMin * MINUTE_MS);
    else finish('stopped', now);
  });
  sessionEl.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      $('bf-stop')?.focus();
    }
    // Keep focus inside the session dialog.
    if (event.key === 'Tab') {
      const items = [...sessionEl.querySelectorAll<HTMLElement>('button:not([hidden])')];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------- finishing ---------- */
  function buildRecord(outcome: SessionRecord['outcome'], endedAt: number, focusMs?: number): SessionRecord {
    const s = active!;
    const pos = position(s.timer, endedAt);
    const plan = s.timer.plan;
    return {
      id: s.id,
      startedAt: s.timer.startedAt,
      endedAt: Math.max(endedAt, s.timer.startedAt),
      mode: plan.mode,
      strictness: s.guard.strictness,
      plannedFocusMin: plan.focusMin * plan.cycles,
      focusMs: Math.round(focusMs ?? pos.focusElapsedMs),
      outcome,
      interruptions: s.guard.interruptions,
      ...(s.label ? { label: s.label } : {})
    };
  }

  function finish(outcome: SessionRecord['outcome'], endedAt: number, focusMs?: number, restored = false): void {
    if (!active) return;
    const record = buildRecord(outcome, endedAt, focusMs);
    data.records = [...data.records.filter((r) => r.id !== record.id), record];
    save();
    stopLoop();
    if (persistent) saveActive(null);
    active = null;
    stopAmbient();
    releaseWakeLock();
    if (outcome === 'completed') {
      if (data.settings.chime) playChime();
      announce(t('announce.done'));
      if (data.settings.notify && document.hidden) void showNotification(t('notify.done.title'), t('notify.done.body', { min: mins(record.focusMs) }));
    }
    closeSessionView();
    showResult(record, restored);
  }

  /** Strict failure: record immediately, show the spill when the user comes back. */
  function fail(at: number): void {
    if (!active) return;
    const record = buildRecord('failed', at);
    data.records = [...data.records.filter((r) => r.id !== record.id), record];
    save();
    stopLoop();
    if (persistent) saveActive(null);
    stopAmbient();
    releaseWakeLock();
    pendingFailure = record;
    active = null; // nothing left to persist or restore
    announce(t('announce.failed'));
    if (!document.hidden) playSpill();
  }

  function playSpill(): void {
    const record = pendingFailure;
    if (!record) return;
    pendingFailure = null;
    sessionEl.classList.add('is-spilled');
    window.setTimeout(() => {
      closeSessionView();
      showResult(record, false);
    }, reducedMotion() ? 0 : 1900);
  }

  function showResult(record: SessionRecord, restored: boolean): void {
    const result = $('bf-result')!;
    const minutes = mins(record.focusMs);
    const summary = summarise(data.records, Date.now());
    const cupEl = $('bf-result-cup')!;
    const tip = $('bf-result-tip')!;
    tip.hidden = record.outcome !== 'failed';
    if (record.outcome === 'completed') {
      const style = cupFor(record.focusMs / MINUTE_MS);
      cupEl.innerHTML = cupSvg(style, 120);
      setText('bf-result-title', t('result.success.title'));
      setText('bf-result-body', t('result.success.body', { cup: t(`cup.${style}`), min: minutes, label: record.label ? ` — ${record.label}` : '' }));
    } else if (record.outcome === 'failed') {
      cupEl.innerHTML = SPILLED_CUP;
      setText('bf-result-title', t('result.failed.title'));
      setText('bf-result-body', t('result.failed.body', { min: minutes }));
    } else {
      cupEl.innerHTML = cupSvg('espresso', 90);
      setText('bf-result-title', t('result.stopped.title'));
      setText('bf-result-body', t('result.stopped.body', { min: minutes }));
    }
    const meta = [
      record.interruptions ? t('result.interruptions', { n: record.interruptions }) : record.strictness === 'gentle' && record.outcome === 'completed' ? t('result.noInterruptions') : '',
      t('result.streak', { n: summary.streak }),
      t('result.today', { min: Math.round(summary.todayMinutes) })
    ].filter(Boolean);
    $('bf-result-meta')!.replaceChildren(...meta.map((text) => Object.assign(document.createElement('li'), { textContent: text })));
    setText('bf-again', record.outcome === 'failed' ? t('result.retry') : t('result.again'));
    $('bf-result-restored')!.hidden = !restored;
    $('bf-share-result')!.hidden = true;
    // Support card: success screen only, from the 3rd completed session on.
    const support = $('bf-support')!;
    const showSupport = record.outcome === 'completed' && summary.completed >= 3 && !supportSnoozed() && Boolean(root!.dataset.supportUrl);
    support.hidden = !showSupport;
    if (showSupport) setText('bf-support-text', t('support.text', { n: summary.completed }));
    $('bf-setup')!.hidden = true;
    result.hidden = false;
    renderProgress();
    result.focus({ preventScroll: true });
    result.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  $('bf-again')?.addEventListener('click', () => {
    $('bf-result')!.hidden = true;
    $('bf-setup')!.hidden = false;
    renderSummary();
    $('bf-start')?.focus();
  });
  const hideSupport = () => {
    snoozeSupport();
    $('bf-support')?.setAttribute('hidden', '');
  };
  $('bf-support-dismiss')?.addEventListener('click', hideSupport);
  $('bf-support-link')?.addEventListener('click', () => window.setTimeout(hideSupport, 300));

  /* ---------- share ---------- */
  attachShare(root, () => data.records, t);

  /* ---------- focus enforcement ---------- */
  function enforced(now: number): boolean {
    if (!active) return false;
    const pos = position(active.timer, now);
    return pos.phase === 'focus' && !pos.paused && !pos.done;
  }

  function applyGuardEvent(event: GuardEvent): void {
    if (event.kind === 'warned') showNotice(t('session.warned', { s: Math.max(1, Math.round(event.awayMs / 1000)) }));
    if (event.kind === 'interrupted') {
      const secs = Math.round(event.awayMs / 1000);
      const time = secs >= 60 ? `${Math.floor(secs / 60)} min ${secs % 60} s` : `${secs} s`;
      showNotice(t('session.interrupted', { time, n: event.interruptions }));
    }
  }

  document.addEventListener('visibilitychange', () => {
    const now = Date.now();
    if (document.visibilityState === 'hidden') {
      if (!active) return;
      const [guard, event] = onHidden(active.guard, now, enforced(now));
      active.guard = guard;
      if (event.kind === 'failed') fail(now);
      else persistActive();
      return;
    }
    // Visible again
    if (pendingFailure) {
      playSpill();
      return;
    }
    if (!active) return;
    const [guard, event] = onVisible(active.guard, now);
    active.guard = guard;
    applyGuardEvent(event);
    persistActive();
    void requestWakeLock();
    tick();
  });

  window.addEventListener('pagehide', persistActive);
  window.addEventListener('beforeunload', (event) => {
    persistActive();
    if (active && active.guard.strictness === 'strict' && enforced(Date.now())) event.preventDefault();
  });

  /* ---------- restore a session after reload ---------- */
  function restore(): void {
    const saved = persistent ? loadActive() : null;
    if (!saved) return;
    const now = Date.now();
    const leftAt = Math.min(now, saved.heartbeat);
    active = saved;
    const leftPos = position(saved.timer, leftAt);
    const wasEnforced = leftPos.phase === 'focus' && !leftPos.paused && !leftPos.done;
    const [guard, event] = onRestore(saved.guard, leftAt, now, wasEnforced);
    active.guard = guard;
    if (event.kind === 'failed') {
      const record = buildRecord('failed', leftAt);
      data.records = [...data.records.filter((r) => r.id !== record.id), record];
      save();
      saveActive(null);
      active = null;
      showResult(record, true);
      return;
    }
    if (position(saved.timer, now).done) {
      finish('completed', saved.timer.startedAt + saved.timer.pausedTotal + position(saved.timer, now).totalMs, undefined, true);
      return;
    }
    beginSession(active, true);
    applyGuardEvent(event);
  }

  /* ---------- init ---------- */
  applySettingsToForm();
  renderProgress();
  restore();
  // Keep the "ends around" time fresh while the setup screen is open.
  window.setInterval(() => {
    if (!active && !$('bf-setup')?.hidden) renderSummary();
  }, 30_000);
}
