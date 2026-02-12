import type { DaneSesjiAuth } from "../../kontrakty/Auth";
import { BladNiezaimplementowane, czyBladApi } from "./bledyApi";
import { zapytanieApi } from "./klientApi";

type OdpowiedzSesjiBackend = {
  token: string;
  userId: string;
  role?: string[];
  wygasaUtc?: string | null;
};

function mapujSesjeBackend(odpowiedz: OdpowiedzSesjiBackend): DaneSesjiAuth {
  return {
    token: odpowiedz.token,
    userId: odpowiedz.userId,
    role: Array.isArray(odpowiedz.role) ? odpowiedz.role : [],
    zrodlo: "email_haslo",
    wygasaUtc: odpowiedz.wygasaUtc ?? null,
  };
}

function mapujBrakEndpointu(
  blad: unknown,
  opisFunkcji: string,
  endpoint: string
): never {
  if (czyBladApi(blad) && blad.status === 404) {
    throw new BladNiezaimplementowane(opisFunkcji, endpoint, blad);
  }
  throw blad;
}

export const autoryzacjaApi = {
  // odpowiada za wymiane tokenu Firebase na sesje backendowa
  async wymienTokenFirebaseNaSesje(idTokenFirebase: string): Promise<DaneSesjiAuth> {
    const endpoint = "/auth/exchange-firebase";
    try {
      const odpowiedz = await zapytanieApi<OdpowiedzSesjiBackend>(endpoint, {
        metoda: "POST",
        body: { idTokenFirebase },
      });
      return mapujSesjeBackend(odpowiedz);
    } catch (blad) {
      mapujBrakEndpointu(blad, "wymienTokenFirebaseNaSesje", endpoint);
    }
  },

  // odpowiada za pobranie sesji API po stronie backendu
  async pobierzSesje(): Promise<DaneSesjiAuth | null> {
    const endpoint = "/auth/session";
    try {
      const odpowiedz = await zapytanieApi<OdpowiedzSesjiBackend | null>(endpoint);
      if (!odpowiedz) return null;
      return mapujSesjeBackend(odpowiedz);
    } catch (blad) {
      mapujBrakEndpointu(blad, "pobierzSesje", endpoint);
    }
  },

  // odpowiada za zakonczenie sesji backendowej
  async wyloguj(): Promise<void> {
    const endpoint = "/auth/logout";
    try {
      await zapytanieApi<void>(endpoint, { metoda: "POST", oczekiwaneStatusy: [200, 204] });
    } catch (blad) {
      mapujBrakEndpointu(blad, "wyloguj", endpoint);
    }
  },
};

export default autoryzacjaApi;
