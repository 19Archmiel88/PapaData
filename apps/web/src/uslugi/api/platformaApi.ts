import { zapytanieApi } from "./klientApi";

export type PoziomZdarzeniaObservability = "info" | "warning" | "error";

export type ZdarzenieObservability = {
  name: string;
  level: PoziomZdarzeniaObservability;
  source: string;
  occurredAt: string;
  context?: Record<string, unknown>;
};

export type WynikCallbackuIntegracji = {
  ok: boolean;
  provider: string;
};

function znormalizujQuery(query?: Record<string, string | undefined>) {
  if (!query) return undefined;
  const wynik: Record<string, string> = {};
  Object.entries(query).forEach(([klucz, wartosc]) => {
    if (!wartosc) return;
    wynik[klucz] = wartosc;
  });
  return wynik;
}

// odpowiada za walidacje callbacku integracji po powrocie z zewnetrznego OAuth
export async function obsluzCallbackIntegracji(
  provider: string,
  query?: Record<string, string | undefined>
): Promise<WynikCallbackuIntegracji> {
  return zapytanieApi<WynikCallbackuIntegracji>(`/integracje/callback/${encodeURIComponent(provider)}`, {
    metoda: "GET",
    query: znormalizujQuery(query),
  });
}

// odpowiada za wysylke paczki eventow runtime do endpointu observability
export async function wyslijZdarzeniaObservability(
  zdarzenia: ZdarzenieObservability[]
): Promise<void> {
  if (!zdarzenia.length) return;
  await zapytanieApi<{ ok: boolean; received: number }>("/observability/events", {
    metoda: "POST",
    body: { events: zdarzenia },
  });
}

