/**
 * Browser controller for /focus/stats: tiles, weekly chart, heatmap, cup shelf,
 * history, share card and data management (export / import / clear).
 */

import { CUP_TIERS, cupCounts, heatmap, lastDays, shelf, summarise, type SessionRecord } from './stats';
import { clearAll, exportJson, loadData, mergeImport, saveData, storageAvailable, type FocusData } from './storage';
import { cupSvg } from './cups';
import { attachShare } from './shareUi';
import { translate, type FocusDict } from '../../i18n/focus';

const SHELF_LIMIT = 60;

export function initFocusStats(): void {
  const root = document.getElementById('bf-stats');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';

  let dict = {} as FocusDict;
  try {
    dict = JSON.parse(document.getElementById('bf-i18n')?.textContent || '{}');
  } catch {
    /* keys */
  }
  const t = (key: string, params?: Record<string, string | number>) => translate(dict as Record<string, string>, key, params);
  const lang = root.dataset.lang || 'en';
  const locale = lang === 'zh-TW' ? 'zh-HK' : 'en-US';
  const $ = <E extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as E | null;
  const setText = (id: string, text: string) => {
    const el = $(id);
    if (el) el.textContent = text;
  };
  const duration = (minutes: number) => {
    const total = Math.round(minutes);
    const h = Math.floor(total / 60);
    return h ? t('stats.hours', { h, m: total % 60 }) : t('stats.mins', { m: total });
  };
  const dayLabel = (key: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'UTC' }).format(Date.parse(`${key}T12:00:00Z`));

  const persistent = storageAvailable();
  if (!persistent) $('bf-storage-warning')?.removeAttribute('hidden');
  let data: FocusData = loadData();

  function renderTiles(): void {
    const s = summarise(data.records, Date.now());
    setText('st-streak', t('stats.days', { n: s.streak }));
    setText('st-longest', t('stats.days', { n: s.longest }));
    setText('st-total', duration(s.totalMinutes));
    setText('st-sessions', String(s.completed));
    setText('st-success', s.successRate === null ? t('stats.na') : `${Math.round(s.successRate * 100)}%`);
    setText('st-month', duration(s.monthMinutes));
  }

  function renderWeek(): void {
    const host = $('st-week');
    if (!host) return;
    const days = lastDays(data.records, Date.now(), 7);
    const max = Math.max(30, ...days.map((d) => d.minutes));
    const w = 700;
    const h = 200;
    const gap = 18;
    const bw = (w - gap * 6) / 7;
    const top = 22;
    const bottom = h - 26;
    const bars = days
      .map((d, i) => {
        const x = i * (bw + gap);
        const bh = d.minutes > 0 ? Math.max(4, (d.minutes / max) * (bottom - top)) : 4;
        const label = dayLabel(d.key, { weekday: 'short' });
        return `<rect class="${d.minutes > 0 ? 'bar' : 'bar-empty'}" x="${x.toFixed(1)}" y="${(bottom - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="6"></rect>` +
          (d.minutes > 0 ? `<text class="val" x="${(x + bw / 2).toFixed(1)}" y="${(bottom - bh - 6).toFixed(1)}" text-anchor="middle">${Math.round(d.minutes)}</text>` : '') +
          `<text x="${(x + bw / 2).toFixed(1)}" y="${h - 6}" text-anchor="middle">${label}</text>`;
      })
      .join('');
    host.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
    setText('st-week-summary', days.map((d) => `${dayLabel(d.key, { weekday: 'long', month: 'short', day: 'numeric' })}: ${duration(d.minutes)}`).join('; '));
  }

  function renderHeatmap(): void {
    const host = $('st-heat');
    if (!host) return;
    host.className = 'st-heat';
    const grid = heatmap(data.records, Date.now(), 18);
    const cells = grid.flat();
    host.replaceChildren(
      ...cells.map((cell) => {
        const span = document.createElement('span');
        span.className = `st-cell st-l${cell.level}${cell.future ? ' st-future' : ''}`;
        span.title = `${dayLabel(cell.key, { month: 'short', day: 'numeric' })}: ${duration(cell.minutes)}`;
        return span;
      })
    );
    const active = cells.filter((c) => c.minutes > 0 && !c.future);
    const best = active.reduce<(typeof cells)[number] | null>((b, c) => (!b || c.minutes > b.minutes ? c : b), null);
    setText('st-heat-summary', t('stats.heatmapSummary', { days: active.length, best: best ? `${dayLabel(best.key, { month: 'short', day: 'numeric' })} (${duration(best.minutes)})` : t('stats.na') }));
  }

  function renderShelf(): void {
    const cups = shelf(data.records);
    const host = $('st-shelf');
    if (host) {
      host.innerHTML =
        cups.slice(0, SHELF_LIMIT).map((c) => cupSvg(c.style, 40, `${t(`cup.${c.style}`)} · ${duration(c.minutes)}`)).join('') +
        (cups.length > SHELF_LIMIT ? `<span class="st-shelf-more">${t('stats.shelfMore', { n: cups.length - SHELF_LIMIT })}</span>` : '');
    }
    $('st-shelf-empty')?.toggleAttribute('hidden', cups.length > 0);
    const counts = cupCounts(data.records);
    for (const tier of CUP_TIERS) setText(`st-count-${tier.style}`, String(counts[tier.style]));
  }

  function renderHistory(): void {
    const list = $('st-history');
    if (!list) return;
    const recent = [...data.records].sort((a, b) => b.endedAt - a.endedAt).slice(0, 20);
    $('st-history-empty')?.toggleAttribute('hidden', recent.length > 0);
    const when = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    list.replaceChildren(
      ...recent.map((r: SessionRecord) => {
        const li = document.createElement('li');
        const main = document.createElement('span');
        main.textContent = `${r.label ? `${r.label} · ` : ''}${duration(r.focusMs / 60_000)}`;
        const meta = document.createElement('small');
        meta.textContent = when.format(r.endedAt);
        const outcome = document.createElement('span');
        outcome.className = r.outcome === 'completed' ? 'st-ok' : 'st-bad';
        outcome.textContent = t(`stats.outcome.${r.outcome}`);
        const left = document.createElement('span');
        left.append(main, document.createElement('br'), meta);
        li.append(left, outcome);
        return li;
      })
    );
  }

  function renderAll(): void {
    renderTiles();
    renderWeek();
    renderHeatmap();
    renderShelf();
    renderHistory();
  }

  attachShare(root, () => data.records, t);

  // Export
  $('st-export')?.addEventListener('click', () => {
    const blob = new Blob([exportJson(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brew-focus-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // Import (merges by session id)
  $<HTMLInputElement>('st-import')?.addEventListener('change', async (event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('too large');
      const parsed = JSON.parse(await file.text());
      const { data: merged, added } = mergeImport(data, parsed);
      if (!added && !(Array.isArray(parsed?.records) && parsed.records.length)) throw new Error('empty');
      data = merged;
      if (persistent) saveData(data);
      renderAll();
      setText('st-data-status', t('stats.imported', { n: added }));
    } catch {
      setText('st-data-status', t('stats.importError'));
    }
  });

  // Clear
  const dialog = $<HTMLDialogElement>('st-confirm');
  const wipe = () => {
    clearAll();
    data = loadData();
    renderAll();
    setText('st-data-status', t('stats.cleared'));
  };
  $('st-clear')?.addEventListener('click', () => {
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.returnValue = '';
      dialog.showModal();
    } else if (window.confirm(`${t('stats.confirm.title')}\n\n${t('stats.confirm.body')}`)) wipe();
  });
  dialog?.addEventListener('close', () => {
    if (dialog.returnValue === 'confirm') wipe();
  });

  window.addEventListener('storage', (event) => {
    if (event.key && !event.key.startsWith('barista_flow_focus')) return;
    data = loadData();
    renderAll();
  });

  renderAll();
}
