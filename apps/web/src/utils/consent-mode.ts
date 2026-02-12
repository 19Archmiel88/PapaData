import { safeLocalStorage } from "./safeLocalStorage";

export type UstawieniaZgody = {
  konieczne: true;
  analityczne: boolean;
  marketingowe: boolean;
};

type Zgoda = "granted" | "denied";

type ConsentModeStan = {
  ad_storage: Zgoda;
  ad_user_data: Zgoda;
  ad_personalization: Zgoda;
  analytics_storage: Zgoda;
  functionality_storage: Zgoda;
  personalization_storage: Zgoda;
  security_storage: "granted";
};

type ConsentModeDefault = ConsentModeStan & {
  wait_for_update?: number;
};

type ZapisZgodyCookies = {
  niezbedne: boolean;
  analityczne: boolean;
  marketingowe: boolean;
};

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

const KLUCZ_STORAGE_ZGODY = "papadata_cookie_consent";

function ensureGtag() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };
  }
}

function mapujZgode(settings: UstawieniaZgody): ConsentModeStan {
  return {
    ad_storage: settings.marketingowe ? "granted" : "denied",
    ad_user_data: settings.marketingowe ? "granted" : "denied",
    ad_personalization: settings.marketingowe ? "granted" : "denied",
    analytics_storage: settings.analityczne ? "granted" : "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
  };
}

function pobierzConfigTagow() {
  return {
    gtmId: (import.meta.env.VITE_GTM_ID as string | undefined)?.trim() ?? "",
    ga4Id: (import.meta.env.VITE_GA4_ID as string | undefined)?.trim() ?? "",
    googleAdsId: (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim() ?? "",
    metaPixelId: (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim() ?? "",
  };
}

function zaladujSkryptRaz(id: string, src: string) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[data-consent-tag="${id}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.dataset.consentTag = id;
  document.head.appendChild(script);
}

function loadGtm(gtmId: string) {
  if (!gtmId) return;
  ensureGtag();
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  zaladujSkryptRaz(`gtm-${gtmId}`, `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
}

function loadGtag(id: string) {
  if (!id) return;
  ensureGtag();
  zaladujSkryptRaz(`gtag-${id}`, `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  window.gtag("js", new Date());
}

function loadGa4(ga4Id: string) {
  if (!ga4Id) return;
  loadGtag(ga4Id);
  window.gtag("config", ga4Id, { anonymize_ip: true });
}

function loadGoogleAds(googleAdsId: string) {
  if (!googleAdsId) return;
  loadGtag(googleAdsId);
  window.gtag("config", googleAdsId);
}

function ensureMetaStub() {
  if (typeof window === "undefined") return;
  if (window.fbq) return;

  const fbq = ((...args: unknown[]) => {
    const maybeFbq = window.fbq;
    if (!maybeFbq) return;
    if (maybeFbq.callMethod) maybeFbq.callMethod(...args);
    else maybeFbq.queue?.push(args);
  }) as FbqFn;

  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
}

function loadMetaPixel(metaPixelId: string) {
  if (typeof document === "undefined" || !metaPixelId) return;
  ensureMetaStub();
  zaladujSkryptRaz("meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
  try {
    window.fbq?.("init", metaPixelId);
    window.fbq?.("consent", "grant");
    window.fbq?.("track", "PageView");
  } catch {
    // no-op
  }
}

function revokeMetaPixel() {
  try {
    window.fbq?.("consent", "revoke");
  } catch {
    // no-op
  }
}

const stanTagow = {
  gtm: new Set<string>(),
  gtag: new Set<string>(),
  meta: new Set<string>(),
};

function zastosujTagi(settings: UstawieniaZgody) {
  if (typeof window === "undefined") return;

  const { gtmId, ga4Id, googleAdsId, metaPixelId } = pobierzConfigTagow();

  if ((settings.analityczne || settings.marketingowe) && gtmId && !stanTagow.gtm.has(gtmId)) {
    loadGtm(gtmId);
    stanTagow.gtm.add(gtmId);
  }

  if (settings.analityczne && ga4Id && !stanTagow.gtag.has(ga4Id)) {
    loadGa4(ga4Id);
    stanTagow.gtag.add(ga4Id);
  }

  if (settings.marketingowe && googleAdsId && !stanTagow.gtag.has(googleAdsId)) {
    loadGoogleAds(googleAdsId);
    stanTagow.gtag.add(googleAdsId);
  }

  if (metaPixelId) {
    if (settings.marketingowe) {
      if (!stanTagow.meta.has(metaPixelId)) {
        loadMetaPixel(metaPixelId);
        stanTagow.meta.add(metaPixelId);
      }
    } else {
      revokeMetaPixel();
    }
  }
}

function odczytajZgodeStorage(): UstawieniaZgody | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = safeLocalStorage.getItem(KLUCZ_STORAGE_ZGODY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ZapisZgodyCookies> | null;
    if (
      !parsed ||
      typeof parsed.analityczne !== "boolean" ||
      typeof parsed.marketingowe !== "boolean"
    ) {
      return null;
    }

    return {
      konieczne: true,
      analityczne: parsed.analityczne,
      marketingowe: parsed.marketingowe,
    };
  } catch {
    return null;
  }
}

export function initConsentMode() {
  if (typeof window === "undefined") return;
  ensureGtag();

  const defaults: ConsentModeDefault = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500,
  };

  window.gtag("consent", "default", defaults);
}

export function updateConsentMode(settings: UstawieniaZgody) {
  if (typeof window === "undefined") return;
  ensureGtag();
  window.gtag("consent", "update", mapujZgode(settings));
  zastosujTagi(settings);
}

export function resetConsentMode() {
  updateConsentMode({ konieczne: true, analityczne: false, marketingowe: false });
}

export function zastosujZgodeZeStorage(): boolean {
  if (typeof window === "undefined") return false;
  initConsentMode();
  const stored = odczytajZgodeStorage();
  if (!stored) return false;
  updateConsentMode(stored);
  return true;
}

export default updateConsentMode;
