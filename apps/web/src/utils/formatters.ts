const cacheFormatterow = new Map<string, Intl.NumberFormat>();
const LIMIT_CACHE = 200;

function stabilnyJson(wartosc: unknown): string {
  const seen = new WeakSet<object>();

  const walk = (value: unknown): unknown => {
    if (value === null) return null;
    const typ = typeof value;

    if (typ === "string" || typ === "number" || typ === "boolean") return value;
    if (typ === "undefined") return "__undefined__";
    if (typ === "bigint") return `__bigint__:${String(value)}`;
    if (typ === "symbol") return `__symbol__:${String(value)}`;
    if (typ === "function") return "__function__";

    if (Array.isArray(value)) return value.map(walk);

    if (typ === "object") {
      const obiekt = value as Record<string, unknown>;
      if (seen.has(obiekt)) return "__circular__";
      seen.add(obiekt);

      const wyjscie: Record<string, unknown> = {};
      Object.keys(obiekt)
        .sort()
        .forEach((klucz) => {
          wyjscie[klucz] = walk(obiekt[klucz]);
        });
      return wyjscie;
    }

    return String(value);
  };

  return JSON.stringify(walk(wartosc));
}

function kluczFormattera(locale: string, opcje?: Intl.NumberFormatOptions) {
  return `${locale}:${stabilnyJson(opcje ?? {})}`;
}

function zapiszDoCache(klucz: string, formatter: Intl.NumberFormat) {
  if (cacheFormatterow.has(klucz)) cacheFormatterow.delete(klucz);
  cacheFormatterow.set(klucz, formatter);

  while (cacheFormatterow.size > LIMIT_CACHE) {
    const najstarszy = cacheFormatterow.keys().next().value as string | undefined;
    if (!najstarszy) break;
    cacheFormatterow.delete(najstarszy);
  }
}

export function getNumberFormatter(locale: string, opcje: Intl.NumberFormatOptions = {}) {
  const klucz = kluczFormattera(locale, opcje);
  const cached = cacheFormatterow.get(klucz);
  if (cached) {
    cacheFormatterow.delete(klucz);
    cacheFormatterow.set(klucz, cached);
    return cached;
  }

  const formatter = new Intl.NumberFormat(locale, opcje);
  zapiszDoCache(klucz, formatter);
  return formatter;
}

export function formatNumber(
  wartosc: number,
  locale: string,
  opcje: Intl.NumberFormatOptions = { maximumFractionDigits: 2 },
  fallback = "—"
) {
  if (!Number.isFinite(wartosc)) return fallback;
  return getNumberFormatter(locale, opcje).format(wartosc);
}

export function formatCurrencyPln(
  wartosc: number,
  locale: string,
  maximumFractionDigits = 0,
  fallback = "—"
) {
  if (!Number.isFinite(wartosc)) return fallback;
  return getNumberFormatter(locale, {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits,
  }).format(wartosc);
}

export function formatCompactCurrencyPln(
  wartosc: number,
  locale: string,
  maximumFractionDigits = 1,
  fallback = "—"
) {
  if (!Number.isFinite(wartosc)) return fallback;
  const abs = Math.abs(wartosc);
  if (abs < 10_000) return formatCurrencyPln(wartosc, locale, 0, fallback);

  return getNumberFormatter(locale, {
    style: "currency",
    currency: "PLN",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits,
  }).format(wartosc);
}

export function formatPercentValue(
  wartosc: number,
  locale: string,
  maximumFractionDigits = 2,
  fallback = "—"
) {
  if (!Number.isFinite(wartosc)) return fallback;
  const formatted = getNumberFormatter(locale, {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(wartosc);
  return `${formatted}%`;
}

export default formatNumber;
