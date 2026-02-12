import { zapytanieApi } from "./klientApi";

export type OdpowiedzLookupFirmy = {
  nip: string;
  nazwa: string;
  adres?: string | null;
  kodPocztowy?: string | null;
  miasto?: string | null;
  kraj?: string | null;
  aktywna?: boolean;
  [klucz: string]: unknown;
};

export async function pobierzFirmePoNip(
  nip: string,
  opcje?: { signal?: AbortSignal }
): Promise<OdpowiedzLookupFirmy> {
  const nipNorm = nip.replace(/\D/g, "").trim();
  return zapytanieApi<OdpowiedzLookupFirmy>("/public/company", {
    metoda: "GET",
    query: { nip: nipNorm },
    signal: opcje?.signal,
    timeoutMs: 10_000,
  });
}

export default pobierzFirmePoNip;
