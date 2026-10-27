# Barista Flow / Coffee Timer

Barista Flow is a static coffee-brewing companion published at [coffeetimer.online](https://coffeetimer.online/zh-TW/). It combines an adjustable brew-ratio calculator, three-stage pour timer, local brew log, equipment guides, and an editorially reviewed coffee glossary.

## Published languages

- Hong Kong Traditional Chinese (`zh-TW`)

Other locale files remain unpublished drafts until their terminology, claims, links, and natural language have completed a human editorial review.

Additional translations remain in the repository as unpublished drafts until they receive a human review. They are excluded from navigation, generated routes, hreflang, search, RSS, and the sitemap.

## Local development

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run astro -- check
npm run build
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

## Data handling

The site has no user database. Recipes, preferences, and brew logs remain in browser `localStorage`. Shared recipe links contain only the parameters the user chooses to place in the URL. See the public privacy policy and methodology pages for the current disclosures and calculation assumptions.

## Content and advertising status

Ad placements are disabled while the site is under publisher review. The AdSense account meta tag, review loader, and root `ads.txt` remain available for verification. Advertising must not be enabled until the site is approved and a Google-certified CMP is configured where required.

## Reporting problems

- Functional or content issues: [open a GitHub issue](https://github.com/bill2712/coffee-timer-app/issues/new/choose)
- Security vulnerabilities: use [private vulnerability reporting](https://github.com/bill2712/coffee-timer-app/security/advisories/new); do not disclose vulnerabilities in a public issue.

## Deployment

Pushes to `main` are built and deployed through the GitHub Pages workflow in `.github/workflows/deploy.yml`.
