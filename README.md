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

## Data handling

The site has no user database. Recipes, preferences, and brew logs remain in browser `localStorage`. Shared recipe links contain only the parameters the user chooses to place in the URL. See the public privacy policy and methodology pages for the current disclosures and calculation assumptions.

## Content and advertising status

Ad placements are disabled while the site is under publisher review. The AdSense account meta tag, review loader, and root `ads.txt` remain available for verification. Advertising must not be enabled until the site is approved and a Google-certified CMP is configured where required.

## Reporting problems

- Functional or content issues: [open a GitHub issue](https://github.com/bill2712/coffee-timer-app/issues/new/choose)
- Security vulnerabilities: use [private vulnerability reporting](https://github.com/bill2712/coffee-timer-app/security/advisories/new); do not disclose vulnerabilities in a public issue.

## Deployment

Pushes to `main` are built and deployed through the GitHub Pages workflow in `.github/workflows/deploy.yml`.
