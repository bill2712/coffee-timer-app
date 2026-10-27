/**
 * Preset drinks. Every value is a *typical estimate*; real drinks vary with bean,
 * roast, brew method, recipe and cup size, so users can override any amount.
 *
 * To add a drink:
 *   1. Add an entry below (a unique `id`, a typical `mg`, a plausible `range`).
 *   2. Add `caffeine.drink.<id>` and `caffeine.drink.<id>.size` strings for every
 *      language in `src/i18n/caffeine.ts`.
 *   3. Optionally add a row to the "Caffeine in drinks" guide with a source.
 */

export interface DrinkPreset {
  id: string;
  /** Typical caffeine in mg used as the default amount. */
  mg: number;
  /** Plausible range [min, max] in mg (estimates, shown to users). */
  range: [number, number];
  emoji: string;
  /** Shown as a quick-add button on the main logger. */
  quick?: boolean;
}

export const DRINKS: DrinkPreset[] = [
  { id: 'espresso', mg: 63, range: [50, 100], emoji: '☕', quick: true },
  { id: 'double-espresso', mg: 126, range: [100, 200], emoji: '☕' },
  { id: 'drip', mg: 95, range: [70, 140], emoji: '🫖', quick: true },
  { id: 'americano', mg: 126, range: [63, 200], emoji: '🥤' },
  { id: 'latte-single', mg: 63, range: [50, 100], emoji: '🥛', quick: true },
  { id: 'latte-double', mg: 126, range: [100, 200], emoji: '🥛' },
  { id: 'cold-brew', mg: 175, range: [150, 200], emoji: '🧊', quick: true },
  { id: 'instant', mg: 60, range: [30, 90], emoji: '🥄' },
  { id: 'black-tea', mg: 47, range: [25, 70], emoji: '🍵', quick: true },
  { id: 'green-tea', mg: 28, range: [20, 45], emoji: '🍃' },
  { id: 'cola', mg: 34, range: [30, 45], emoji: '🥫' },
  { id: 'energy', mg: 80, range: [70, 160], emoji: '⚡' },
  { id: 'decaf', mg: 3, range: [2, 15], emoji: '😴' }
];

export const CUSTOM_DRINK_ID = 'custom';

export function findDrink(id: string): DrinkPreset | undefined {
  return DRINKS.find((drink) => drink.id === id);
}
