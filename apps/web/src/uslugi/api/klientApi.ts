import { BladApi, BladKonfiguracjiApi, zbudujKomunikatStatusu } from "./bledyApi";

type MetodaHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type WartoscQuery = string | number | boolean | null | undefined;
type QueryApi = Record<string, WartoscQuery | WartoscQuery[]>;

export type OpcjeZapytaniaApi = {
  metoda?: MetodaHttp;
  headers?: HeadersInit;
  query?: QueryApi;
  body?: unknown;
  token?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  cache?: RequestCache;
  oczekiwaneStatusy?: number[];
};

const DOMYSLNY_TIMEOUT_MS = 15_000;

function pobierzBazowyUrlApi() {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");
  return import.meta.env.DEV ? "/api" : "http://127.0.0.1:3001";
}

function zbudujUrl(sciezka: string, query?: QueryApi) {
  const base = pobierzBazowyUrlApi();
  if (!base) throw new BladKonfiguracjiApi("Brak konfiguracji adresu API.");

  const sciezkaNorm = sciezka.startsWith("/") ? sciezka : `/${sciezka}`;
  const url = new URL(`${base}${sciezkaNorm}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([klucz, wartosc]) => {
      if (Array.isArray(wartosc)) {
        wartosc.forEach((element) => {
          if (element === null || element === undefined) return;
          url.searchParams.append(klucz, String(element));
        });
        return;
      }
      if (wartosc === null || wartosc === undefined) return;
      url.searchParams.set(klucz, String(wartosc));
    });
  }

  return url.toString();
}

function przygotujBody(
  body: unknown,
  headers: Headers
): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
    return body;
  }
  if (typeof body === "string") return body;

  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
}

function odczytajKomunikatBledu(payload: unknown, fallback: string) {
  if (!payload) return fallback;
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  if (typeof payload === "object" && payload !== null) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return fallback;
}

async function odczytajPayload(response: Response) {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text.trim() ? text : undefined;
}

export async function zapytanieApi<T>(sciezka: string, opcje: OpcjeZapytaniaApi = {}): Promise<T> {
  const metoda = opcje.metoda ?? "GET";
  const url = zbudujUrl(sciezka, opcje.query);
  const headers = new Headers(opcje.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (opcje.token) headers.set("Authorization", `Bearer ${opcje.token}`);

  const controller = new AbortController();
  const timeoutMs = opcje.timeoutMs ?? DOMYSLNY_TIMEOUT_MS;
  let timeoutId: number | null = null;
  let bylTimeout = false;

  const obsluzAbortZewnetrzny = () => {
    controller.abort(opcje.signal?.reason);
  };

  if (opcje.signal) {
    if (opcje.signal.aborted) controller.abort(opcje.signal.reason);
    else opcje.signal.addEventListener("abort", obsluzAbortZewnetrzny, { once: true });
  }

  if (timeoutMs > 0) {
    timeoutId = window.setTimeout(() => {
      bylTimeout = true;
      controller.abort("timeout");
    }, timeoutMs);
  }

  try {
    const response = await fetch(url, {
      method: metoda,
      headers,
      body: przygotujBody(opcje.body, headers),
      signal: controller.signal,
      cache: opcje.cache ?? "no-store",
    });

    const payload = await odczytajPayload(response);
    const oczekiwane = opcje.oczekiwaneStatusy;
    const statusOk =
      Array.isArray(oczekiwane) && oczekiwane.length > 0
        ? oczekiwane.includes(response.status)
        : response.ok;

    if (!statusOk) {
      const fallback = zbudujKomunikatStatusu(response.status, url);
      throw new BladApi({
        kod: "API_HTTP",
        status: response.status,
        endpoint: url,
        komunikat: odczytajKomunikatBledu(payload, fallback),
        przyczyna: payload,
      });
    }

    return payload as T;
  } catch (blad) {
    if (blad instanceof BladApi) throw blad;
    if (blad instanceof DOMException && blad.name === "AbortError") {
      if (bylTimeout) {
        throw new BladApi({
          kod: "API_TIMEOUT",
          endpoint: url,
          komunikat: `Przekroczono limit czasu ${timeoutMs}ms dla ${metoda} ${url}.`,
          przyczyna: blad,
        });
      }

      throw new BladApi({
        kod: "API_SIEC",
        endpoint: url,
        komunikat: `Zadanie ${metoda} ${url} zostalo przerwane.`,
        przyczyna: blad,
      });
    }

    throw new BladApi({
      kod: "API_SIEC",
      endpoint: url,
      komunikat: `Nie udalo sie nawiazac polaczenia dla ${metoda} ${url}.`,
      przyczyna: blad,
    });
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    if (opcje.signal) opcje.signal.removeEventListener("abort", obsluzAbortZewnetrzny);
  }
}

export function pobierzAdresBazowyApi() {
  return pobierzBazowyUrlApi();
}
