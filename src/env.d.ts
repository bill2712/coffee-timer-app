/// <reference types="astro/client" />

interface Window {
  MSStream?: unknown;
  dictImpossible: string;
  grindDict: Record<string, string>;
  dictBean: Record<string, string>;
  historyDict: Record<string, string>;
}

interface ImportMetaEnv {
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_ADS_ENABLED?: string;
  readonly PUBLIC_AD_SLOT_RESULTS?: string;
  readonly PUBLIC_AD_SLOT_IN_ARTICLE?: string;
  readonly PUBLIC_AD_SLOT_SIDEBAR?: string;
  readonly PUBLIC_AD_SLOT_TOP?: string;
  readonly PUBLIC_AD_SLOT_BOTTOM?: string;
  readonly PUBLIC_BMC_USERNAME?: string;
}
