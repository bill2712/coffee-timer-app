/**
 * Wires the "share your focus" buttons (used on the results card and the stats
 * page). The canvas renderer is imported only when a button is pressed.
 */

import { lastDays, summarise, type SessionRecord } from './stats';

type T = (key: string, params?: Record<string, string | number>) => string;

export function attachShare(scope: ParentNode, getRecords: () => SessionRecord[], t: T): void {
  const $ = <E extends HTMLElement>(id: string) => document.getElementById(id) as E | null;
  let url = '';
  let file: File | null = null;

  scope.querySelectorAll<HTMLButtonElement>('[data-share]').forEach((button) => {
    button.addEventListener('click', async () => {
      const format = button.dataset.share === 'square' ? 'square' : 'story';
      const error = $('bf-share-error');
      if (error) error.hidden = true;
      button.disabled = true;
      try {
        const { renderFocusCard, canvasToBlob } = await import('./shareCard');
        const records = getRecords();
        const s = summarise(records, Date.now());
        const h = Math.floor(s.monthMinutes / 60);
        const m = Math.round(s.monthMinutes % 60);
        const canvas = await renderFocusCard({
          format,
          headline: s.streak > 0 ? t('share.card.streak', { n: s.streak }) : t('share.card.noStreak'),
          lines: [t('share.card.month', { time: h ? t('stats.hours', { h, m }) : t('stats.mins', { m }) }), t('share.card.cups', { n: s.completed })],
          site: t('share.card.site'),
          bars: lastDays(records, Date.now(), 7).map((d) => d.minutes)
        });
        const blob = await canvasToBlob(canvas);
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(blob);
        const name = `brew-focus-${format}.png`;
        file = new File([blob], name, { type: 'image/png' });
        const img = $<HTMLImageElement>('bf-share-img');
        if (img) {
          img.width = canvas.width;
          img.height = canvas.height;
          img.src = url;
        }
        const link = $<HTMLAnchorElement>('bf-share-download');
        if (link) {
          link.href = url;
          link.download = name;
        }
        const native = $('bf-share-native');
        if (native) native.hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
        $('bf-share-result')?.removeAttribute('hidden');
      } catch {
        if (error) error.hidden = false;
      } finally {
        button.disabled = false;
      }
    });
  });

  $('bf-share-native')?.addEventListener('click', async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: 'Brew Focus', text: 'coffeetimer.online/focus' });
    } catch {
      /* cancelled */
    }
  });
}
