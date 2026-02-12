import { updateConsentMode } from "../../utils/consent-mode";
import { safeLocalStorage } from "../../utils/safeLocalStorage";

export const WERSJA_ZGODY_COOKIES = "2026-02-10";
const KLUCZ_ZGODY_COOKIES = "papadata_cookie_consent";

export type PreferencjeCookies = {
  niezbedne: true;
  analityczne: boolean;
  marketingowe: boolean;
  wersja: string;
  zapisanoAt: string;
};

function czyObiekt(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function czyPoprawnePreferencje(value: unknown): value is PreferencjeCookies {
  if (!czyObiekt(value)) return false;

  return (
    value.niezbedne === true &&
    typeof value.analityczne === "boolean" &&
    typeof value.marketingowe === "boolean" &&
    typeof value.wersja === "string" &&
    typeof value.zapisanoAt === "string"
  );
}

export function utworzPreferencjeCookies(
  analityczne: boolean,
  marketingowe: boolean
): PreferencjeCookies {
  return {
    niezbedne: true,
    analityczne,
    marketingowe,
    wersja: WERSJA_ZGODY_COOKIES,
    zapisanoAt: new Date().toISOString(),
  };
}

export function pobierzPreferencjeCookies(): PreferencjeCookies | null {
  if (typeof window === "undefined") return null;

  const raw = safeLocalStorage.getItem(KLUCZ_ZGODY_COOKIES);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!czyPoprawnePreferencje(parsed)) return null;
    if (parsed.wersja !== WERSJA_ZGODY_COOKIES) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function zapiszPreferencjeCookies(preferencje: PreferencjeCookies) {
  if (typeof window === "undefined") return;
  safeLocalStorage.setItem(KLUCZ_ZGODY_COOKIES, JSON.stringify(preferencje));
  updateConsentMode({
    konieczne: true,
    analityczne: preferencje.analityczne,
    marketingowe: preferencje.marketingowe,
  });
}

export function czyWymaganaDecyzjaCookies() {
  return pobierzPreferencjeCookies() === null;
}
