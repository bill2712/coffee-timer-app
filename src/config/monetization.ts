/**
 * Advertising and support-link settings, in one place.
 *
 * Override any value at build time with a PUBLIC_* environment variable
 * (see `.env.example`), e.g. in the GitHub Actions workflow or a local `.env`.
 */

const env = import.meta.env;

/** Placeholder used for anything that has not been configured yet. */
export const PLACEHOLDER_AD_SLOT = 'XXXXXXXXXX';
export const PLACEHOLDER_BMC_USERNAME = 'YOUR_USERNAME';

/**
 * AdSense publisher ID. Defaults to the ID already used for this site's AdSense
 * verification (it also appears in /ads.txt), so verification keeps working.
 */
export const ADSENSE_CLIENT: string = env.PUBLIC_ADSENSE_CLIENT || 'ca-pub-7189047900748105';

/**
 * Ad units stay off until AdSense approves the site and a Google-certified
 * consent management platform is in place. Set PUBLIC_ADS_ENABLED=true to turn on.
 */
export const ADS_ENABLED: boolean = env.PUBLIC_ADS_ENABLED === 'true';

/**
 * Ad unit (slot) IDs from AdSense → Ads → By ad unit. A slot with a placeholder
 * or empty ID never renders, even when ads are enabled.
 */
export const AD_SLOTS = {
  /** Below the caffeine results dashboard. */
  results: env.PUBLIC_AD_SLOT_RESULTS || PLACEHOLDER_AD_SLOT,
  /** Inside long-form articles, after the second section. */
  'in-article': env.PUBLIC_AD_SLOT_IN_ARTICLE || PLACEHOLDER_AD_SLOT,
  /** Desktop-only sidebar unit. */
  sidebar: env.PUBLIC_AD_SLOT_SIDEBAR || PLACEHOLDER_AD_SLOT,
  /** Legacy placements used elsewhere on the site (disabled unless configured). */
  'top-leaderboard': env.PUBLIC_AD_SLOT_TOP || '',
  'bottom-utility': env.PUBLIC_AD_SLOT_BOTTOM || ''
} as const;

export type AdSlotType = keyof typeof AD_SLOTS;

export function isSlotConfigured(type: AdSlotType): boolean {
  const id = AD_SLOTS[type];
  return Boolean(id) && id !== PLACEHOLDER_AD_SLOT;
}

/** Buy Me a Coffee username, e.g. "baristaflow" for https://buymeacoffee.com/baristaflow */
export const BMC_USERNAME: string = env.PUBLIC_BMC_USERNAME || PLACEHOLDER_BMC_USERNAME;
export const BMC_CONFIGURED = BMC_USERNAME !== PLACEHOLDER_BMC_USERNAME;
export const BMC_URL = `https://buymeacoffee.com/${BMC_USERNAME}`;

/** The site's existing, working support page. */
export const KOFI_URL = 'https://ko-fi.com/beyond01hk';

/**
 * Where "Buy me a coffee" buttons point. Until a Buy Me a Coffee username is set,
 * we fall back to the existing Ko-fi page so the site never ships a broken link.
 */
export const SUPPORT_URL = BMC_CONFIGURED ? BMC_URL : KOFI_URL;
