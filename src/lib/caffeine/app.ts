/**
 * Client-side controller for the caffeine calculator.
 * Reads markup rendered by CaffeineCalculator.astro, keeps state in localStorage
 * and re-renders the dashboard, list and chart once a minute.
 */

import {
  HOUR_MS,
  MINUTE_MS,
  STANDARD_CUP_MG,
  assessSleep,
  atLocalTime,
  bedtimeStatus,
  caffeineAt,
  caffeineCurve,
  clampHalfLife,
  dayStart,
  formatClock,
  lastCall,
  parseClock,
  pendingAbsorption,
  resolveBedtime,
  totalConsumed,
  validateDoseMg,
  SINGLE_DOSE_DANGER_MG,
  type BedtimeStatus,
  type CurvePoint,
  type Dose,
  type LastCallResult,
  type SleepAssessment
} from './caffeineModel';
import { CUSTOM_DRINK_ID, findDrink } from './drinks';
import {
  DEFAULT_SETTINGS,
  clearState,
  loadState,
  newId,
  saveState,
  snoozeSupport,
  storageAvailable,
  supportSnoozed,
  type Entry,
  type State,
  type TimeFormat
} from './storage';
import { geometry, renderChart, type ChartGeometry, type ChartInput } from './chart';
import { fill, intlLocale, type CaffeineDict, type CaffeineKey } from '../../i18n/caffeine';

interface Computed {
  now: number;
  bedtime: number;
  /** When sleep is assessed: tonight's bedtime, or now if that bedtime has already passed. */
  sleepAt: number;
  pendingMg: number;
  nowMg: number;
  soonMg: number;
  sleep: SleepAssessment;
  status: BedtimeStatus;
  last: LastCallResult;
  total: number;
  dayFrom: number;
  chartStart: number;
  chartEnd: number;
  curve: CurvePoint[];
  ghost: CurvePoint[] | null;
}

interface WhatIf {
  drinkId: string;
  mg: number;
  time: number;
}

export function initCaffeineApp(): void {
  const root = document.getElementById('cc-app');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';

  /* ---------- i18n & formatting ---------- */
  let dict = {} as CaffeineDict;
  try {
    dict = JSON.parse(document.getElementById('cc-i18n')?.textContent || '{}');
  } catch {
    /* keys will show as-is */
  }
  const t = (key: CaffeineKey | string, params?: Record<string, string | number>) =>
    fill((dict as Record<string, string>)[key] ?? key, params);
  const lang = root.dataset.lang || 'en';
  const locale = intlLocale(lang);
  const supportUrl = root.dataset.supportUrl || '';

  const byId = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  const setText = (id: string, text: string) => {
    const el = byId(id);
    if (el && el.textContent !== text) el.textContent = text;
  };

  /* ---------- state ---------- */
  const persistent = storageAvailable();
  if (!persistent) byId('cc-storage-warning')?.removeAttribute('hidden');
  let state: State = loadState();
  let editingId: string | null = null;
  let whatIf: WhatIf | null = null;
  let supportShown = false;
  let latest: Computed | null = null;
  let chartGeo: ChartGeometry | null = null;
  let cursorT: number | null = null;

  const save = () => {
    if (persistent) saveState(state);
  };

  const hour12 = (): boolean | undefined => {
    const f: TimeFormat = state.settings.timeFormat;
    return f === '12' ? true : f === '24' ? false : undefined;
  };
  const fmtTime = (ts: number) =>
    new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: hour12() }).format(ts);
  const fmtTick = (ts: number) =>
    hour12() === false || (hour12() === undefined && !new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12)
      ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(ts)
      : new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true }).format(ts);
  const fmtDayTime = (ts: number) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: hour12() }).format(ts);
  const fmtMg = (mg: number) => Math.round(Math.max(0, mg)).toLocaleString(locale);
  const drinkName = (e: { drinkId: string; label?: string }) =>
    e.label || (findDrink(e.drinkId) ? t(`drink.${e.drinkId}`) : t('drink.custom'));
  const drinkEmoji = (id: string) => findDrink(id)?.emoji ?? '✏️';
  const statusLabel = (s: BedtimeStatus) =>
    t(s === 'good' ? 'dash.status.good' : s === 'borderline' ? 'dash.status.borderline' : 'dash.status.high');
  const minutesOf = (ts: number) => {
    const d = new Date(ts);
    return d.getHours() * 60 + d.getMinutes();
  };
  const addDays = (ts: number, days: number) => {
    const d = new Date(ts);
    d.setDate(d.getDate() + days);
    return d.getTime();
  };

  /* ---------- toast ---------- */
  let toastTimer = 0;
  const showToast = (message: string, undo?: () => void) => {
    const toast = byId('cc-toast');
    const undoBtn = byId<HTMLButtonElement>('cc-toast-undo');
    if (!toast || !undoBtn) return;
    setText('cc-toast-text', message);
    undoBtn.hidden = !undo;
    undoBtn.onclick = undo
      ? () => {
          undo();
          toast.hidden = true;
        }
      : null;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast.hidden = true), undo ? 6000 : 3500);
  };

  /* ---------- computation ---------- */
  const doses = (): Dose[] => state.entries.map((e) => ({ mg: e.mg, time: e.time }));

  function compute(now = Date.now()): Computed {
    const params = { halfLifeHours: state.settings.halfLife };
    const all = doses();
    const bedtime = resolveBedtime(now, state.settings.bedtime);
    // Up past bedtime? Then the useful question is "what if I go to sleep now?".
    const sleepAt = Math.max(bedtime, now);
    const sleep = assessSleep(all, sleepAt, params);
    const chartStart = bedtime - 18 * HOUR_MS;
    const chartEnd = bedtime + 6 * HOUR_MS;
    return {
      now,
      bedtime,
      sleepAt,
      pendingMg: pendingAbsorption(all, now, params),
      nowMg: caffeineAt(all, now, params),
      soonMg: caffeineAt(all, now + 10 * MINUTE_MS, params),
      sleep,
      status: bedtimeStatus(sleep.peak, state.settings.threshold),
      last: lastCall(all, { bedtime: sleepAt, thresholdMg: state.settings.threshold, params, cupMg: STANDARD_CUP_MG }),
      total: totalConsumed(all, dayStart(bedtime), now),
      dayFrom: dayStart(bedtime),
      chartStart,
      chartEnd,
      curve: caffeineCurve(all, chartStart, chartEnd, params, 5),
      ghost: whatIf ? caffeineCurve([...all, { mg: whatIf.mg, time: whatIf.time }], chartStart, chartEnd, params, 5) : null
    };
  }

  /* ---------- dashboard ---------- */
  function renderDashboard(c: Computed): void {
    const { settings } = state;
    setText('cc-now', fmtMg(c.nowMg));

    const diff = c.soonMg - c.nowMg;
    const trendKey =
      c.nowMg < 0.5 && c.soonMg < 0.5 ? 'dash.trend.none' : diff > 0.3 ? 'dash.trend.rising' : diff < -0.3 ? 'dash.trend.falling' : 'dash.trend.steady';
    const pending = c.pendingMg >= 5 ? t('dash.pending', { mg: fmtMg(c.pendingMg) }) : '';
    setText('cc-trend', `${trendKey === 'dash.trend.rising' ? '↗' : trendKey === 'dash.trend.falling' ? '↘' : '→'} ${t(trendKey)}${pending}`);

    setText('cc-bed-label', t(c.sleepAt > c.bedtime ? 'dash.bedtime.passedLabel' : 'dash.bedtime.label', { time: fmtTime(c.bedtime) }));
    const rising = c.sleep.peak > c.sleep.atBedtime + 1;
    setText('cc-bed-mg', rising ? `${fmtMg(c.sleep.atBedtime)} → ${fmtMg(c.sleep.peak)}` : fmtMg(c.sleep.atBedtime));
    const badge = byId('cc-bed-status');
    if (badge) {
      badge.className = `cc-badge mt-2 cc-${c.status}`;
      badge.textContent = statusLabel(c.status);
    }
    setText(
      'cc-bed-note',
      rising
        ? t('dash.bedtime.rising', { mg: fmtMg(c.sleep.peak), time: fmtTime(c.sleep.peakTime) })
        : t('dash.threshold.note', { mg: fmtMg(settings.threshold) })
    );

    let lastText = '—';
    let lastNote = t('dash.lastcall.note', { mg: fmtMg(settings.threshold) });
    if (c.last.kind === 'time') {
      lastText = c.last.time > c.now ? fmtTime(c.last.time) : t('dash.lastcall.passed', { time: fmtTime(c.last.time) });
    } else if (c.last.kind === 'over') {
      lastText = t('dash.lastcall.over');
      lastNote = t('dash.lastcall.overNote');
    } else {
      lastText = t('dash.lastcall.none');
      lastNote = t('dash.lastcall.noneNote');
    }
    setText('cc-lastcall', lastText);
    setText('cc-lastcall-note', lastNote);

    setText('cc-today', t('dash.today.value', { mg: fmtMg(c.total), limit: fmtMg(settings.dailyLimit) }));
    const progress = byId('cc-progress');
    const bar = byId('cc-progress-bar');
    if (progress && bar) {
      bar.style.width = `${Math.min(100, (c.total / settings.dailyLimit) * 100).toFixed(1)}%`;
      progress.setAttribute('aria-valuenow', String(Math.round(c.total)));
      progress.setAttribute('aria-valuemax', String(settings.dailyLimit));
      progress.setAttribute('aria-valuetext', t('dash.today.value', { mg: fmtMg(c.total), limit: fmtMg(settings.dailyLimit) }));
      progress.classList.toggle('is-over', c.total > settings.dailyLimit);
    }

    // Warnings
    const warnings = byId('cc-warnings');
    if (warnings) {
      const items: [string, string][] = [];
      if (state.entries.some((e) => e.mg > SINGLE_DOSE_DANGER_MG)) items.push(['cc-alert-danger', `🚨 ${t('warn.single')}`]);
      if (c.total > settings.dailyLimit) {
        items.push(['cc-alert-warn', `⚠️ ${t('warn.daily', { mg: fmtMg(c.total), limit: fmtMg(settings.dailyLimit) })}`]);
      }
      const signature = items.map((i) => i[1]).join('|');
      if (warnings.dataset.sig !== signature) {
        warnings.dataset.sig = signature;
        warnings.replaceChildren(
          ...items.map(([cls, text]) => {
            const p = document.createElement('p');
            p.className = `cc-alert ${cls} m-0`;
            p.setAttribute('role', cls === 'cc-alert-danger' ? 'alert' : 'status');
            p.textContent = text;
            return p;
          })
        );
      }
    }
  }

  /* ---------- drink list ---------- */
  function entryRow(entry: Entry): HTMLElement {
    const row = document.createElement('div');
    row.className = 'cc-entry';
    row.setAttribute('role', 'listitem');
    const icon = document.createElement('span');
    icon.className = 'text-xl';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = drinkEmoji(entry.drinkId);
    const main = document.createElement('div');
    main.className = 'cc-entry-main';
    const name = document.createElement('span');
    name.className = 'cc-entry-name';
    name.textContent = drinkName(entry);
    const meta = document.createElement('span');
    meta.className = 'cc-entry-meta';
    meta.textContent = `${fmtTime(entry.time)} · ${fmtMg(entry.mg)} ${t('dash.unit')}${entry.mg > SINGLE_DOSE_DANGER_MG ? ' 🚨' : ''}`;
    main.append(name, meta);

    const actions = document.createElement('div');
    actions.className = 'cc-entry-actions';
    const params = { drink: drinkName(entry), time: fmtTime(entry.time) };
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'cc-icon-btn';
    edit.textContent = t('log.edit');
    edit.setAttribute('aria-label', t('log.editAria', params));
    edit.addEventListener('click', () => startEdit(entry.id));
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'cc-icon-btn';
    del.textContent = t('log.delete');
    del.setAttribute('aria-label', t('log.deleteAria', params));
    del.addEventListener('click', () => deleteEntry(entry.id));
    actions.append(edit, del);
    row.append(icon, main, actions);
    return row;
  }

  function renderList(c: Computed): void {
    const list = byId('cc-list');
    const empty = byId('cc-empty');
    if (!list || !empty) return;
    empty.hidden = state.entries.length > 0;
    const today = state.entries.filter((e) => e.time > c.dayFrom).sort((a, b) => b.time - a.time);
    const earlier = state.entries.filter((e) => e.time <= c.dayFrom).sort((a, b) => b.time - a.time);
    const groups: [string, Entry[]][] = [
      [t('log.list.today'), today],
      [t('log.list.earlier'), earlier]
    ];
    const nodes: HTMLElement[] = [];
    for (const [title, entries] of groups) {
      if (!entries.length) continue;
      const heading = document.createElement('p');
      heading.className = 'cc-list-heading';
      heading.textContent = title;
      const group = document.createElement('div');
      group.setAttribute('role', 'list');
      group.setAttribute('aria-label', title);
      group.append(...entries.map(entryRow));
      nodes.push(heading, group);
    }
    list.replaceChildren(...nodes);
  }

  /* ---------- chart ---------- */
  function renderChartArea(c: Computed): void {
    const host = byId('cc-chart');
    if (!host) return;
    const width = Math.max(280, Math.round(host.clientWidth || 600));
    const height = Math.max(200, Math.round(host.clientHeight || 260));
    const input: ChartInput = {
      width,
      height,
      start: c.chartStart,
      end: c.chartEnd,
      curve: c.curve,
      ghost: c.ghost,
      threshold: state.settings.threshold,
      bedtime: c.bedtime,
      now: c.now,
      doses: state.entries.map((e) => ({ time: e.time, mg: e.mg, label: `${drinkName(e)} · ${fmtMg(e.mg)} mg · ${fmtTime(e.time)}` })),
      formatTick: fmtTick,
      labels: { threshold: t('chart.legend.threshold'), bedtime: t('chart.legend.bedtime'), now: t('chart.legend.now'), unit: t('dash.unit') }
    };
    host.innerHTML = renderChart(input);
    chartGeo = geometry(input);
    byId('cc-legend-ghost')?.toggleAttribute('hidden', !c.ghost);

    // Screen-reader summary
    const peak = c.curve.reduce((best, p) => (p.mg > best.mg ? p : best), c.curve[0] ?? { t: c.now, mg: 0 });
    setText(
      'cc-chart-summary',
      peak.mg < 0.5
        ? t('chart.summary.empty')
        : t('chart.summary', {
            start: fmtDayTime(c.chartStart),
            end: fmtDayTime(c.chartEnd),
            now: fmtMg(c.nowMg),
            peak: fmtMg(peak.mg),
            peakTime: fmtTime(peak.t),
            bedtime: fmtTime(c.bedtime),
            bed: fmtMg(c.sleep.atBedtime),
            threshold: fmtMg(state.settings.threshold)
          })
    );
    if (cursorT !== null) showCursor(cursorT);
  }

  function showCursor(ts: number): void {
    const host = byId('cc-chart');
    const tip = byId('cc-tooltip');
    if (!host || !tip || !latest || !chartGeo) return;
    const c = latest;
    const idx = Math.max(0, Math.min(c.curve.length - 1, Math.round((ts - c.chartStart) / (5 * MINUTE_MS))));
    const point = c.curve[idx];
    if (!point) return;
    cursorT = point.t;
    const x = chartGeo.x(point.t);
    const y = chartGeo.y(point.mg);
    const cursor = host.querySelector<SVGGElement>('.cc-cursor');
    if (cursor) {
      cursor.setAttribute('visibility', 'visible');
      cursor.querySelector('line')?.setAttribute('x1', String(x));
      cursor.querySelector('line')?.setAttribute('x2', String(x));
      cursor.querySelector('circle')?.setAttribute('cx', String(x));
      cursor.querySelector('circle')?.setAttribute('cy', String(y));
    }
    const ghostPoint = c.ghost?.[idx];
    tip.replaceChildren(`${fmtTime(point.t)} · ${fmtMg(point.mg)} ${t('dash.unit')}`);
    if (ghostPoint) {
      const small = document.createElement('small');
      small.textContent = t('chart.tooltip.ghost', { mg: fmtMg(ghostPoint.mg) });
      tip.append(small);
    }
    tip.hidden = false;
    const half = tip.offsetWidth / 2 + 4;
    tip.style.left = `${Math.min(host.clientWidth - half, Math.max(half, x))}px`;
  }

  function hideCursor(): void {
    cursorT = null;
    byId('cc-tooltip')?.setAttribute('hidden', '');
    byId('cc-chart')?.querySelector('.cc-cursor')?.setAttribute('visibility', 'hidden');
  }

  function pointerToTime(event: PointerEvent): number | null {
    const host = byId('cc-chart');
    if (!host || !latest || !chartGeo) return null;
    const rect = host.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = (x - chartGeo.left) / (chartGeo.right - chartGeo.left);
    return latest.chartStart + Math.min(1, Math.max(0, ratio)) * (latest.chartEnd - latest.chartStart);
  }

  /* ---------- what if ---------- */
  function renderWhatIf(c: Computed): void {
    const result = byId('cc-wi-result');
    const clear = byId<HTMLButtonElement>('cc-wi-clear');
    if (!result || !clear) return;
    clear.hidden = !whatIf;
    if (!whatIf) {
      setText('cc-wi-result', t('whatif.idle'));
      return;
    }
    const params = { halfLifeHours: state.settings.halfLife };
    // A drink simulated after tonight's sleep point affects the *next* bedtime instead.
    const target = whatIf.time < c.sleepAt ? c.sleepAt : resolveBedtime(whatIf.time, state.settings.bedtime, 0);
    const before = assessSleep(doses(), target, params);
    const after = assessSleep([...doses(), { mg: whatIf.mg, time: whatIf.time }], target, params);
    const status = bedtimeStatus(after.peak, state.settings.threshold);
    let text = t('whatif.result', {
      drink: whatIf.drinkId ? t(`drink.${whatIf.drinkId}`) : t('drink.custom'),
      mg: fmtMg(whatIf.mg),
      time: fmtTime(whatIf.time),
      after: fmtMg(after.atBedtime),
      status: statusLabel(status),
      before: fmtMg(before.atBedtime)
    });
    if (after.peak > after.atBedtime + 1) text += ` ${t('whatif.resultRising', { peak: fmtMg(after.peak) })}`;
    setText('cc-wi-result', text);
  }

  function readWhatIf(): void {
    const drink = byId<HTMLSelectElement>('cc-wi-drink')?.value || '';
    const mgCheck = validateDoseMg(byId<HTMLInputElement>('cc-wi-mg')?.value ?? '');
    const minutes = parseClock(byId<HTMLInputElement>('cc-wi-time')?.value ?? '');
    if (!drink) {
      whatIf = null;
    } else if (mgCheck.ok && minutes !== null) {
      whatIf = { drinkId: drink, mg: mgCheck.mg, time: resolveBedtime(Date.now(), minutes) };
    } else {
      whatIf = null;
      refresh();
      setText('cc-wi-result', t('whatif.err'));
      return;
    }
    refresh();
  }

  /* ---------- logging form ---------- */
  const form = byId<HTMLFormElement>('cc-form');
  const drinkSelect = byId<HTMLSelectElement>('cc-drink');
  const mgInput = byId<HTMLInputElement>('cc-mg');
  const nameField = byId('cc-name-field');
  const nameInput = byId<HTMLInputElement>('cc-name');
  const timeInput = byId<HTMLInputElement>('cc-time');
  const daySelect = byId<HTMLSelectElement>('cc-day');
  const details = byId<HTMLDetailsElement>('cc-details');

  // A third day option for entries from two days ago (labelled with the date).
  if (daySelect && daySelect.options.length === 2) {
    const opt = document.createElement('option');
    opt.value = '-2';
    opt.textContent = new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric' }).format(addDays(Date.now(), -2));
    daySelect.append(opt);
  }

  function setFieldError(input: HTMLElement | null, errorId: string, message: string | null): void {
    const error = byId(errorId);
    if (!error) return;
    error.hidden = !message;
    error.textContent = message ?? '';
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function syncDrinkFields(keepMg = false): void {
    if (!drinkSelect || !mgInput) return;
    const preset = findDrink(drinkSelect.value);
    const isCustom = drinkSelect.value === CUSTOM_DRINK_ID;
    if (nameField) nameField.hidden = !isCustom;
    if (!keepMg) mgInput.value = preset ? String(preset.mg) : '';
    setText('cc-mg-hint', preset ? t('log.mg.hint', { min: preset.range[0], max: preset.range[1] }) : t('log.mg.customHint'));
    setFieldError(mgInput, 'cc-mg-error', null);
  }

  function resetForm(): void {
    editingId = null;
    if (drinkSelect) drinkSelect.value = 'drip';
    syncDrinkFields();
    if (nameInput) nameInput.value = '';
    if (timeInput) timeInput.value = formatClock(minutesOf(Date.now()));
    if (daySelect) daySelect.value = '0';
    setFieldError(timeInput, 'cc-time-error', null);
    byId('cc-editing')?.setAttribute('hidden', '');
    setText('cc-submit', t('log.submit'));
    byId('cc-cancel')?.setAttribute('hidden', '');
  }

  function startEdit(id: string): void {
    const entry = state.entries.find((e) => e.id === id);
    if (!entry || !drinkSelect || !mgInput || !timeInput || !daySelect || !details) return;
    editingId = id;
    drinkSelect.value = findDrink(entry.drinkId) ? entry.drinkId : CUSTOM_DRINK_ID;
    syncDrinkFields(true);
    mgInput.value = String(entry.mg);
    if (nameInput) nameInput.value = entry.label ?? '';
    timeInput.value = formatClock(minutesOf(entry.time));
    const todayMidnight = atLocalTime(Date.now(), 0);
    const entryMidnight = atLocalTime(entry.time, 0);
    const dayDiff = Math.round((entryMidnight - todayMidnight) / (24 * HOUR_MS));
    daySelect.value = String(Math.max(-2, Math.min(0, dayDiff)));
    const editing = byId('cc-editing');
    if (editing) {
      editing.textContent = t('log.editing', { drink: drinkName(entry) });
      editing.hidden = false;
    }
    setText('cc-submit', t('log.save'));
    byId('cc-cancel')?.removeAttribute('hidden');
    details.open = true;
    details.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    mgInput.focus({ preventScroll: true });
  }

  function addEntry(entry: Entry, message: string): void {
    state.entries = [...state.entries, entry].sort((a, b) => a.time - b.time);
    save();
    refresh();
    showToast(message, () => {
      state.entries = state.entries.filter((e) => e.id !== entry.id);
      save();
      refresh();
    });
    const todayCount = latest ? state.entries.filter((e) => e.time > latest!.dayFrom).length : state.entries.length;
    if (todayCount >= 2) maybeShowSupport();
  }

  function deleteEntry(id: string): void {
    const entry = state.entries.find((e) => e.id === id);
    if (!entry) return;
    state.entries = state.entries.filter((e) => e.id !== id);
    if (editingId === id) resetForm();
    save();
    refresh();
    showToast(t('log.deleted', { drink: drinkName(entry) }), () => {
      state.entries = [...state.entries, entry].sort((a, b) => a.time - b.time);
      save();
      refresh();
    });
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!drinkSelect || !mgInput || !timeInput || !daySelect) return;
    const check = validateDoseMg(mgInput.value);
    if (!check.ok) {
      const key = check.error === 'not-a-number' ? 'log.err.nan' : check.error === 'not-positive' ? 'log.err.positive' : 'log.err.large';
      setFieldError(mgInput, 'cc-mg-error', t(key));
      mgInput.focus();
      return;
    }
    setFieldError(mgInput, 'cc-mg-error', null);
    const minutes = parseClock(timeInput.value);
    if (minutes === null) {
      setFieldError(timeInput, 'cc-time-error', t('log.err.time'));
      timeInput.focus();
      return;
    }
    const now = Date.now();
    const time = atLocalTime(addDays(now, Number(daySelect.value) || 0), minutes);
    if (time > now + 5 * MINUTE_MS) {
      setFieldError(timeInput, 'cc-time-error', t('log.err.future'));
      timeInput.focus();
      return;
    }
    setFieldError(timeInput, 'cc-time-error', null);

    const drinkId = drinkSelect.value;
    const label = drinkId === CUSTOM_DRINK_ID ? (nameInput?.value.trim().slice(0, 60) || undefined) : undefined;
    if (editingId) {
      const id = editingId;
      state.entries = state.entries
        .map((e) => (e.id === id ? { id, drinkId, mg: check.mg, time, ...(label ? { label } : {}) } : e))
        .sort((a, b) => a.time - b.time);
      save();
      resetForm();
      refresh();
      showToast(t('log.saved', { drink: label || t(`drink.${drinkId}`) }));
      return;
    }
    const entry: Entry = { id: newId(), drinkId, mg: check.mg, time, ...(label ? { label } : {}) };
    addEntry(entry, t('log.added', { drink: drinkName(entry), mg: fmtMg(entry.mg), time: fmtTime(entry.time) }));
    resetForm();
  });

  drinkSelect?.addEventListener('change', () => syncDrinkFields());
  mgInput?.addEventListener('input', () => setFieldError(mgInput, 'cc-mg-error', null));
  timeInput?.addEventListener('input', () => setFieldError(timeInput, 'cc-time-error', null));
  byId('cc-cancel')?.addEventListener('click', resetForm);
  details?.addEventListener('toggle', () => {
    if (details.open && !editingId && timeInput) timeInput.value = formatClock(minutesOf(Date.now()));
  });
  byId('cc-more')?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!details) return;
    details.open = true;
    drinkSelect?.focus();
  });

  // Quick add
  root.querySelectorAll<HTMLButtonElement>('#cc-quick [data-drink]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = findDrink(button.dataset.drink || '');
      if (!preset) return;
      const entry: Entry = { id: newId(), drinkId: preset.id, mg: preset.mg, time: Date.now() };
      addEntry(entry, t('log.added', { drink: t(`drink.${preset.id}`), mg: preset.mg, time: fmtTime(entry.time) }));
      button.classList.add('is-added');
      window.setTimeout(() => button.classList.remove('is-added'), 900);
    });
  });

  /* ---------- what-if wiring ---------- */
  const wiDrink = byId<HTMLSelectElement>('cc-wi-drink');
  const wiMg = byId<HTMLInputElement>('cc-wi-mg');
  const wiTime = byId<HTMLInputElement>('cc-wi-time');
  wiDrink?.addEventListener('change', () => {
    const preset = findDrink(wiDrink.value);
    if (preset && wiMg) wiMg.value = String(preset.mg);
    if (wiTime && !wiTime.value) {
      const next = Math.ceil((minutesOf(Date.now()) + 1) / 15) * 15;
      wiTime.value = formatClock(next);
    }
    readWhatIf();
  });
  wiMg?.addEventListener('input', readWhatIf);
  wiTime?.addEventListener('change', readWhatIf);
  byId('cc-wi-clear')?.addEventListener('click', () => {
    whatIf = null;
    if (wiDrink) wiDrink.value = '';
    if (wiMg) wiMg.value = '';
    if (wiTime) wiTime.value = '';
    refresh();
  });

  /* ---------- settings ---------- */
  const bedtimeInput = byId<HTMLInputElement>('cc-set-bedtime');
  const halfLifeRange = byId<HTMLInputElement>('cc-set-halflife');
  const thresholdInput = byId<HTMLInputElement>('cc-set-threshold');
  const limitInput = byId<HTMLInputElement>('cc-set-limit');

  function syncSettingsUI(): void {
    const s = state.settings;
    if (bedtimeInput) bedtimeInput.value = formatClock(s.bedtime);
    if (halfLifeRange) halfLifeRange.value = String(s.halfLife);
    setText('cc-set-halflife-value', t('settings.halflife.value', { h: s.halfLife }));
    root!.querySelectorAll<HTMLButtonElement>('[data-halflife]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(Number(chip.dataset.halflife) === s.halfLife));
    });
    if (thresholdInput) thresholdInput.value = String(s.threshold);
    if (limitInput) limitInput.value = String(s.dailyLimit);
    root!.querySelectorAll<HTMLInputElement>('input[name="cc-timeformat"]').forEach((radio) => {
      radio.checked = radio.value === s.timeFormat;
    });
  }

  function updateSettings(patch: Partial<State['settings']>): void {
    state.settings = { ...state.settings, ...patch };
    save();
    syncSettingsUI();
    refresh();
  }

  bedtimeInput?.addEventListener('change', () => {
    const minutes = parseClock(bedtimeInput.value);
    if (minutes !== null) updateSettings({ bedtime: minutes });
  });
  halfLifeRange?.addEventListener('input', () => updateSettings({ halfLife: clampHalfLife(Number(halfLifeRange.value)) }));
  root.querySelectorAll<HTMLButtonElement>('[data-halflife]').forEach((chip) => {
    chip.addEventListener('click', () => updateSettings({ halfLife: clampHalfLife(Number(chip.dataset.halflife)) }));
  });

  const numberSetting = (input: HTMLInputElement | null, errorId: string, min: number, max: number, key: 'threshold' | 'dailyLimit') => {
    input?.addEventListener('change', () => {
      const value = Number(input.value);
      if (!Number.isFinite(value) || value < min || value > max || input.value.trim() === '') {
        setFieldError(input, errorId, t('settings.err.range', { min, max }));
        return;
      }
      setFieldError(input, errorId, null);
      updateSettings({ [key]: Math.round(value) } as Partial<State['settings']>);
    });
  };
  numberSetting(thresholdInput, 'cc-threshold-error', 5, 400, 'threshold');
  numberSetting(limitInput, 'cc-limit-error', 50, 2000, 'dailyLimit');
  root.querySelectorAll<HTMLInputElement>('input[name="cc-timeformat"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) updateSettings({ timeFormat: radio.value as TimeFormat });
    });
  });

  /* ---------- clear data ---------- */
  const dialog = byId<HTMLDialogElement>('cc-confirm');
  const wipe = () => {
    clearState();
    state = { entries: [], settings: { ...DEFAULT_SETTINGS } };
    whatIf = null;
    supportShown = false;
    resetForm();
    syncSettingsUI();
    refresh();
    showToast(t('privacy.cleared'));
  };
  byId('cc-clear')?.addEventListener('click', () => {
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.returnValue = '';
      dialog.showModal();
    } else if (window.confirm(`${t('privacy.confirm.title')}\n\n${t('privacy.confirm.body')}`)) {
      wipe();
    }
  });
  dialog?.addEventListener('close', () => {
    if (dialog.returnValue === 'confirm') wipe();
  });

  /* ---------- support card ---------- */
  function maybeShowSupport(): void {
    const card = byId('cc-support');
    if (!card || supportShown || !supportUrl || supportSnoozed()) return;
    supportShown = true;
    card.hidden = false;
  }
  const hideSupport = () => {
    snoozeSupport();
    byId('cc-support')?.setAttribute('hidden', '');
  };
  byId('cc-support-dismiss')?.addEventListener('click', hideSupport);
  byId('cc-support-link')?.addEventListener('click', () => window.setTimeout(hideSupport, 300));

  /* ---------- share card ---------- */
  let shareUrl = '';
  let shareFile: File | null = null;
  root.querySelectorAll<HTMLButtonElement>('[data-share-format]').forEach((button) => {
    button.addEventListener('click', async () => {
      const format = button.dataset.shareFormat === 'square' ? 'square' : 'story';
      const errorEl = byId('cc-share-error');
      if (errorEl) errorEl.hidden = true;
      button.disabled = true;
      try {
        const c = latest ?? compute();
        const { renderShareCard, canvasToBlob } = await import('./shareCard');
        const lastLine =
          c.last.kind === 'time'
            ? c.last.time > c.now
              ? t('share.card.lastcall', { time: fmtTime(c.last.time) })
              : t('share.card.lastcallPassed', { time: fmtTime(c.last.time) })
            : t('share.card.lastcallOver');
        const canvas = await renderShareCard({
          format,
          title: t('share.card.title'),
          totalMg: c.total,
          unit: t('dash.unit'),
          lines: [`⏰ ${lastLine}`, t('share.card.now', { mg: fmtMg(c.nowMg) }), t('share.card.bedtime', { mg: fmtMg(c.sleep.atBedtime) })],
          note: `${t('share.card.note')}`,
          site: '☕ coffeetimer.online',
          curve: c.curve,
          threshold: state.settings.threshold,
          lang
        });
        const blob = await canvasToBlob(canvas);
        if (shareUrl) URL.revokeObjectURL(shareUrl);
        shareUrl = URL.createObjectURL(blob);
        const filename = `${t('share.filename')}-${format}.png`;
        shareFile = new File([blob], filename, { type: 'image/png' });
        const img = byId<HTMLImageElement>('cc-share-img');
        if (img) {
          img.width = canvas.width;
          img.height = canvas.height;
          img.src = shareUrl;
        }
        const link = byId<HTMLAnchorElement>('cc-share-download');
        if (link) {
          link.href = shareUrl;
          link.download = filename;
        }
        const nativeBtn = byId<HTMLButtonElement>('cc-share-native');
        if (nativeBtn) nativeBtn.hidden = !(navigator.canShare && navigator.canShare({ files: [shareFile] }));
        byId('cc-share-result')?.removeAttribute('hidden');
        maybeShowSupport();
      } catch {
        if (errorEl) errorEl.hidden = false;
      } finally {
        button.disabled = false;
      }
    });
  });
  byId('cc-share-native')?.addEventListener('click', async () => {
    if (!shareFile) return;
    try {
      await navigator.share({ files: [shareFile], title: t('share.card.title'), text: `${t('share.card.title')} ☕ coffeetimer.online` });
    } catch {
      /* user cancelled */
    }
  });

  /* ---------- chart interaction ---------- */
  const chartHost = byId('cc-chart');
  chartHost?.addEventListener('pointermove', (event) => {
    const ts = pointerToTime(event);
    if (ts !== null) showCursor(ts);
  });
  chartHost?.addEventListener('pointerdown', (event) => {
    const ts = pointerToTime(event);
    if (ts !== null) showCursor(ts);
  });
  chartHost?.addEventListener('pointerleave', () => {
    if (document.activeElement !== chartHost) hideCursor();
  });
  chartHost?.addEventListener('focus', () => showCursor(cursorT ?? latest?.now ?? Date.now()));
  chartHost?.addEventListener('blur', hideCursor);
  chartHost?.addEventListener('keydown', (event) => {
    if (!latest) return;
    const step = (event.shiftKey ? 60 : 15) * MINUTE_MS;
    const current = cursorT ?? latest.now;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = current + step;
    else if (event.key === 'ArrowLeft') next = current - step;
    else if (event.key === 'Home') next = latest.chartStart;
    else if (event.key === 'End') next = latest.chartEnd;
    else if (event.key === 'Escape') {
      hideCursor();
      return;
    }
    if (next === null) return;
    event.preventDefault();
    showCursor(Math.min(latest.chartEnd, Math.max(latest.chartStart, next)));
  });
  if ('ResizeObserver' in window && chartHost) {
    let lastWidth = 0;
    new ResizeObserver(() => {
      if (chartHost.clientWidth !== lastWidth && latest) {
        lastWidth = chartHost.clientWidth;
        renderChartArea(latest);
      }
    }).observe(chartHost);
  }

  /* ---------- refresh loop ---------- */
  function refresh(): void {
    latest = compute();
    renderDashboard(latest);
    renderList(latest);
    renderChartArea(latest);
    renderWhatIf(latest);
  }

  window.addEventListener('storage', (event) => {
    if (event.key && !event.key.startsWith('barista_flow_caffeine')) return;
    state = loadState();
    syncSettingsUI();
    refresh();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });
  const tick = () => {
    if (document.visibilityState === 'visible') refresh();
  };
  window.setTimeout(() => {
    tick();
    window.setInterval(tick, MINUTE_MS);
  }, MINUTE_MS - (Date.now() % MINUTE_MS) + 50);

  // Initial render
  syncSettingsUI();
  resetForm();
  refresh();
}
