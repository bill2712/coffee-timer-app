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
