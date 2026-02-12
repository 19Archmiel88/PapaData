import { safeLocalStorage } from "./safeLocalStorage";

const KLUCZ_STORAGE_UTM = "utm_last";

export type UtmNormalized = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
};

type UtmInput = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
};

function sanitize(wartosc: string | null | undefined): string {
  return (wartosc ?? "").trim().slice(0, 200);
}

function normalizujUtm(input: UtmInput): UtmNormalized {
  return {
    source: sanitize(input.source).toLowerCase(),
    medium: sanitize(input.medium).toLowerCase(),
    campaign: sanitize(input.campaign).toLowerCase(),
    content: sanitize(input.content),
    term: sanitize(input.term),
  };
}

function czyWartoZapisac(utm: UtmNormalized) {
  return Boolean(utm.source || utm.medium || utm.campaign);
}

export function captureUtmFromSearch(search: string): UtmNormalized | null {
  const params = new URLSearchParams(search);
  const utm = normalizujUtm({
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
    term: params.get("utm_term"),
  });

  if (!czyWartoZapisac(utm)) return null;

  try {
    safeLocalStorage.setItem(KLUCZ_STORAGE_UTM, JSON.stringify(utm));
  } catch {
    // no-op
  }

  return utm;
}

export function loadStoredUtm(): UtmNormalized | null {
  try {
    const raw = safeLocalStorage.getItem(KLUCZ_STORAGE_UTM);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UtmInput | null;
    if (!parsed || typeof parsed !== "object") return null;
    return normalizujUtm(parsed);
  } catch {
    return null;
  }
}

export default captureUtmFromSearch;
