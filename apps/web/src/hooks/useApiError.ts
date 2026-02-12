import { BladApi, type KodBleduApi } from "../uslugi/api/bledyApi";

type Locale = "pl" | "en";

const FALLBACK: Record<Locale, string> = {
  pl: "Wystapil nieoczekiwany blad.",
  en: "An unexpected error occurred.",
};

const COPY: Record<
  Locale,
  {
    badRequest: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    conflict: string;
    rateLimited: string;
    server: string;
    network: string;
    timeout: string;
    notImplemented: string;
  }
> = {
  pl: {
    badRequest: "Nie udalo sie przetworzyc zadania.",
    unauthorized: "Sesja wygasla. Zaloguj sie ponownie.",
    forbidden: "Brak uprawnien do tych danych.",
    notFound: "Brak danych dla podanego zasobu.",
    conflict: "Dane sa aktualizowane. Sprobuj ponownie za chwile.",
    rateLimited: "Zbyt wiele zapytan. Odczekaj chwile i sprobuj ponownie.",
    server: "Wystapil blad po naszej stronie. Sprobuj ponownie.",
    network: "Brak polaczenia z internetem. Sprawdz siec i sprobuj ponownie.",
    timeout: "Przekroczono limit czasu. Sprobuj ponownie.",
    notImplemented: "Ta funkcja nie jest jeszcze dostepna po stronie backendu.",
  },
  en: {
    badRequest: "We could not process the request.",
    unauthorized: "Your session expired. Sign in again.",
    forbidden: "You do not have access to this data.",
    notFound: "Requested resource was not found.",
    conflict: "Data is updating. Try again in a moment.",
    rateLimited: "Too many requests. Please wait and try again.",
    server: "Server error. Try again.",
    network: "Network error. Check your connection and try again.",
    timeout: "The request timed out. Try again.",
    notImplemented: "This function is not implemented on backend yet.",
  },
};

function detectLocale(fallback: string): Locale {
  const lower = (fallback ?? "").toLowerCase();
  if (/[ąćęłńóśźż]/i.test(fallback)) return "pl";
  if (lower.includes("blad") || lower.includes("sprobuj") || lower.includes("brak ")) return "pl";
  return "en";
}

function isGeneric(message: string) {
  const lower = message.trim().toLowerCase();
  if (!lower) return true;
  const marker = [
    "request failed",
    "network error",
    "failed to fetch",
    "timed out",
    "timeout",
    "http",
    "unauthorized",
    "forbidden",
    "not found",
    "bad request",
  ];
  return marker.some((m) => lower === m || lower.includes(m));
}

function mapByStatus(status: number | undefined, locale: Locale): string | null {
  if (!status) return null;
  const copy = COPY[locale];
  if (status === 400 || status === 422) return copy.badRequest;
  if (status === 401) return copy.unauthorized;
  if (status === 403) return copy.forbidden;
  if (status === 404) return copy.notFound;
  if (status === 409) return copy.conflict;
  if (status === 429) return copy.rateLimited;
  if (status >= 500) return copy.server;
  return null;
}

function mapByCode(kod: KodBleduApi | undefined, locale: Locale): string | null {
  const copy = COPY[locale];
  if (!kod) return null;
  if (kod === "API_TIMEOUT") return copy.timeout;
  if (kod === "API_SIEC") return copy.network;
  if (kod === "API_NOT_IMPLEMENTED") return copy.notImplemented;
  return null;
}

export function normalizeApiError(error: unknown, fallback = FALLBACK.pl) {
  const locale = detectLocale(fallback);
  const safeFallback = fallback.trim() || FALLBACK[locale];

  if (error instanceof BladApi) {
    const mappedByCode = mapByCode(error.kod, locale);
    if (mappedByCode) return mappedByCode;

    const mappedByStatus = mapByStatus(error.status, locale);
    if (mappedByStatus) return mappedByStatus;

    if (error.message && !isGeneric(error.message)) return error.message;
    return safeFallback;
  }

  if (error instanceof Error) {
    if (error.message && !isGeneric(error.message)) return error.message;
    const lower = error.message.toLowerCase();
    if (lower.includes("network") || lower.includes("failed to fetch")) return COPY[locale].network;
    if (lower.includes("timeout") || lower.includes("timed out")) return COPY[locale].timeout;
    return safeFallback;
  }

  if (typeof error === "string") {
    if (!isGeneric(error)) return error;
    return safeFallback;
  }

  return safeFallback;
}

export default normalizeApiError;
