import type {
  KontraktPlatnosci,
  DaneSubskrypcji,
  OtworzPortalKlientaWejscie,
  OtworzPortalKlientaWynik,
  UtworzCheckoutWejscie,
  UtworzCheckoutWynik,
} from "../../kontrakty/Platnosci";
import { BladNiezaimplementowane, czyBladApi } from "../../uslugi/api/bledyApi";
import { zapytanieApi } from "../../uslugi/api/klientApi";

const SCIEZKA_BAZOWA = "/platnosci";

function rzucJesliBrakEndpointu(blad: unknown, nazwaFunkcji: string, endpoint: string): never {
  if (czyBladApi(blad) && blad.status === 404) {
    throw new BladNiezaimplementowane(`Platnosci.${nazwaFunkcji}`, endpoint, blad);
  }
  throw blad;
}

export const platnosciApi: KontraktPlatnosci = {
  // odpowiada za utworzenie sesji checkout po stronie backendu
  async utworzCheckout(wejscie: UtworzCheckoutWejscie): Promise<UtworzCheckoutWynik> {
    const endpoint = `${SCIEZKA_BAZOWA}/checkout`;
    try {
      return await zapytanieApi<UtworzCheckoutWynik>(endpoint, {
        metoda: "POST",
        body: wejscie,
      });
    } catch (blad) {
      rzucJesliBrakEndpointu(blad, "utworzCheckout", endpoint);
    }
  },

  // odpowiada za pobranie stanu subskrypcji klienta
  async pobierzSubskrypcje(): Promise<DaneSubskrypcji> {
    const endpoint = `${SCIEZKA_BAZOWA}/subskrypcja`;
    try {
      return await zapytanieApi<DaneSubskrypcji>(endpoint);
    } catch (blad) {
      rzucJesliBrakEndpointu(blad, "pobierzSubskrypcje", endpoint);
    }
  },

  // odpowiada za anulowanie subskrypcji po stronie billing backendu
  async anulujSubskrypcje(): Promise<void> {
    const endpoint = `${SCIEZKA_BAZOWA}/subskrypcja/anuluj`;
    try {
      await zapytanieApi<void>(endpoint, { metoda: "POST", oczekiwaneStatusy: [200, 204] });
    } catch (blad) {
      rzucJesliBrakEndpointu(blad, "anulujSubskrypcje", endpoint);
    }
  },

  // odpowiada za otwarcie portalu klienta billing
  async otworzPortalKlienta(
    wejscie: OtworzPortalKlientaWejscie
  ): Promise<OtworzPortalKlientaWynik> {
    const endpoint = `${SCIEZKA_BAZOWA}/portal`;
    try {
      return await zapytanieApi<OtworzPortalKlientaWynik>(endpoint, {
        metoda: "POST",
        body: wejscie,
      });
    } catch (blad) {
      rzucJesliBrakEndpointu(blad, "otworzPortalKlienta", endpoint);
    }
  },
};

export default platnosciApi;
