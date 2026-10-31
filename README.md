# Barista Flow / Coffee Timer

Barista Flow is a static coffee-brewing companion published at [coffeetimer.online](https://coffeetimer.online/zh-TW/). It combines an adjustable brew-ratio calculator, three-stage pour timer, local brew log, equipment guides, and an editorially reviewed coffee glossary.

## Published languages

- Hong Kong Traditional Chinese (`zh-TW`)
- English (`en`)

Earlier machine-translated drafts for other languages were removed on 2026-10-21; they remain in the git history if a reviewed translation is ever started.

## Local development

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run check        # Astro type and template check
npm run build
npm run check:links  # fails on any broken internal link in dist/
npm run preview
```

## Caffeine calculator

`/[lang]/caffeine-calculator/` estimates how much caffeine is in your body now, at bedtime, and the latest time for one more 95 mg cup. Three source-backed guides live in `src/content/guides/{en,zh-TW}/` and are served at `/[lang]/guides/<slug>/`.

### How the model works

The model is in `src/lib/caffeine/caffeineModel.ts`. It is pure TypeScript with no DOM access and is unit-tested in `caffeineModel.test.ts`.

- **Per dose:** a one-compartment model with first-order absorption and elimination (the Bateman function), `A(τ) = D·ka/(ka−ke)·(e^(−ke·τ) − e^(−ka·τ))`.
  - `ke = ln 2 / half-life`.
  - `ka` is solved numerically so the single-dose peak lands at 45 minutes.
- **Total:** the sum of every dose (superposition). Results are milligrams in the body, not blood concentration.
- **Bedtime check:** the amount at bedtime plus the highest amount in the first 3 hours of sleep. This catches a late cup that is still being absorbed. If bedtime has already passed, it assesses "if you sleep now".
- **Last call:** steps back from bedtime in 5-minute increments and returns the latest time a 95 mg cup keeps the sleep check at or below the threshold.
- **Status:** good (≤ 80% of the threshold), borderline (80–100%) or too high (above it).

Run the tests with:

```sh
npm test
```

They run in a fixed time zone (Asia/Hong_Kong) so cases across midnight are reproducible.

Other modules:

| File | Purpose |
| --- | --- |
| `src/lib/caffeine/drinks.ts` | Preset drinks (typical mg and range) |
| `src/lib/caffeine/storage.ts` | localStorage with try/catch and in-memory fallback; entries older than 72 h are pruned |
| `src/lib/caffeine/chart.ts` | Dependency-free SVG chart |
| `src/lib/caffeine/shareCard.ts` | Canvas share image, loaded on demand |
| `src/lib/caffeine/app.ts` | Browser controller |
| `src/components/caffeine/CaffeineCalculator.astro` | Markup and styles |
| `src/i18n/caffeine.ts` | Every UI string (en and zh-TW) plus the FAQ used for FAQPage structured data |

### Adding a drink

1. Add an entry to `DRINKS` in `src/lib/caffeine/drinks.ts`: `id`, typical `mg`, `range` and `emoji`. Set `quick: true` to show it as a quick-add button.
2. Add the strings `drink.<id>` and `drink.<id>.size` to **both** languages in `src/i18n/caffeine.ts`. TypeScript reports a missing Chinese key.
3. Optionally add a row with a source to the "caffeine in drinks" guides.

### AdSense and Buy Me a Coffee settings

All monetization settings live in `src/config/monetization.ts`. Each can be overridden at build time with a `PUBLIC_*` environment variable (see `.env.example`). For GitHub Pages, add them as repository **Variables** and pass them to the build step as `env:` in `.github/workflows/deploy.yml`.

| Setting | Variable | Default |
| --- | --- | --- |
| Publisher ID | `PUBLIC_ADSENSE_CLIENT` | The site's existing verified ID (also in `public/ads.txt`) |
| Ad units on/off | `PUBLIC_ADS_ENABLED` | `false`. Turn on only after approval and once a Google-certified CMP is in place |
| Ad unit IDs | `PUBLIC_AD_SLOT_RESULTS`, `PUBLIC_AD_SLOT_IN_ARTICLE`, `PUBLIC_AD_SLOT_SIDEBAR` | Placeholder `XXXXXXXXXX`; a placeholder slot never renders |
| Buy Me a Coffee username | `PUBLIC_BMC_USERNAME` | `YOUR_USERNAME`; until it is set, support buttons fall back to the existing Ko-fi page |

How `AdSlot` (`src/components/AdSlot.astro`) behaves:

- It reserves a fixed height so ads don't shift the layout.
- It labels each unit "Advertisement" and fills units lazily as they near the viewport.
- In `astro dev` it shows a dashed preview box instead of an ad.

The AdSense script is injected after page load or idle time by `AdSenseLoader.astro`. Keep ads away from buttons, inputs and the drink logger, as required by AdSense policy.

## Brew Focus

`/[lang]/focus/` is a coffee-themed focus timer. A cup fills while you work and spills if you leave the tab. Your personal stats are at `/[lang]/focus/stats/`; that page is noindex and left out of the sitemap because it only shows data stored in the browser. Three guides (`tool: focus`) live in `src/content/guides/{en,zh-TW}/`.

### How focus detection works and its limits

- **Signal:** the **Page Visibility API** (`visibilitychange`). It reports only whether the page is visible or hidden, never which app or site the user opened. Nothing is sent to a server.
- **Strict mode:** hiding the page during a focus block fails the session immediately. The spill animation plays when the user returns.
- **Gentle mode:** gives a 10-second grace period. Returning within it shows a reminder; a longer absence counts one interruption and the session keeps going.
- **Never enforced:** breaks and paused time.
- **Reloads:** an in-progress session is saved to localStorage with a 10-second heartbeat. On reload, strict mode treats the time the page was closed as leaving; gentle mode applies the grace period.
- **Phone screen locks:** on most phones, locking the screen hides the page exactly like switching apps, and browsers don't let sites tell the two apart. To reduce false failures:
  - gentle mode is the default on touch devices (`pointer: coarse`);
  - the Screen Wake Lock API keeps the screen on during a session where supported;
  - the setup screen explains the limitation.
- **What it can't see:** a second device or a book. It's a commitment aid, not surveillance.
- **Timer accuracy:** time is computed from timestamps (start time, accumulated pause time and `Date.now()`), not tick counting, so background throttling or device sleep can't make it drift. Notifications fired from a background tab may still arrive late because browsers throttle timers.

### Code

| File | Purpose |
| --- | --- |
| `src/lib/focus/timer.ts` | Pure timestamp timer: plans, focus/break segments, pause/resume, position |
| `src/lib/focus/guard.ts` | Pure strict/gentle rules, grace period, restore after reload |
| `src/lib/focus/stats.ts` | Pure streaks (time-zone aware day keys), totals, weekly and heatmap data, cup styles |
| `src/lib/focus/storage.ts` | localStorage with fallback, sanitising, JSON export/import merge, active-session persistence |
| `src/lib/focus/audio.ts` | Ambient sound generated with Web Audio (brown noise, rain, café murmur) and chimes. No audio files |
| `src/lib/focus/notify.ts` | Opt-in notifications (through the service worker when available) |
| `src/lib/focus/app.ts`, `statsApp.ts` | Browser controllers for the two pages |
| `src/components/focus/BrewFocus.astro`, `src/styles/focus.css` | Markup and styles |
| `src/i18n/focus.ts` | All strings (en and zh-TW), singular forms (`<key>.one`), and the FAQ used for FAQPage structured data |

Run the tests with `npm test`. They cover:
- timer accuracy and pause/resume;
- the gentle grace period and strict failure;
- reload restore;
- streaks across midnight, time zones and daylight-saving changes, and a missed day resetting the streak;
- cups, and export/import.

### Ads and support on Brew Focus

Ads and support links use the same `src/config/monetization.ts` settings described above:
- `PUBLIC_ADSENSE_CLIENT`, `PUBLIC_ADS_ENABLED` and the `PUBLIC_AD_SLOT_*` IDs;
- `PUBLIC_BMC_USERNAME` for Buy Me a Coffee.

Placement rules:
- `html.bf-session-active` hides every ad while a session runs.
- Ads appear below the setup and results card (separated from controls by text), on the stats page, and in the guides.
- The Buy Me a Coffee card shows only on the success screen from the 3rd completed session, and a dismissal snoozes it for 7 days.

## Data handling

The site has no user database. Recipes, preferences, and brew logs remain in browser `localStorage`. Shared recipe links contain only the parameters the user chooses to place in the URL. See the public privacy policy and methodology pages for the current disclosures and calculation assumptions.

## Content and advertising status

Ad placements are disabled while the site is under publisher review. The AdSense account meta tag, root `ads.txt` and a consent-aware loader (`src/components/AdsLoader.astro`) remain for verification. The loader skips AdSense entirely after a visitor declines in the cookie banner and requests only non-personalised ads until they accept. Advertising must not be enabled until the site is approved and Google's certified CMP is turned on for the EEA, UK and Switzerland.

## Reporting problems

- Functional or content issues: [open a GitHub issue](https://github.com/bill2712/coffee-timer-app/issues/new/choose)
- Security vulnerabilities: use [private vulnerability reporting](https://github.com/bill2712/coffee-timer-app/security/advisories/new); do not disclose vulnerabilities in a public issue.

## Deployment

Cloudflare Workers Builds builds and deploys `main` to coffeetimer.online (see `wrangler.jsonc`); pull requests get a preview URL. `public/_headers` sets security and caching headers.

GitHub Actions (`.github/workflows/ci.yml`) runs the check, build and link check on every pull request and push to `main`. It does not deploy.

Mail to `hello@coffeetimer.online` relies on Cloudflare Email Routing.
