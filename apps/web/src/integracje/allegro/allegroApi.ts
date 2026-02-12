import type {
  KontraktIntegracji,
  StanPolaczeniaIntegracji,
  UruchomSynchronizacjeIntegracjiWejscie,
  UruchomSynchronizacjeIntegracjiWynik,
  ZainicjujAutoryzacjeIntegracjiWejscie,
  ZainicjujAutoryzacjeIntegracjiWynik,
} from "../../kontrakty/Integracje";
import { BladNiezaimplementowane, czyBladApi } from "../../uslugi/api/bledyApi";
import { zapytanieApi } from "../../uslugi/api/klientApi";

const SCIEZKA_BAZOWA = "/integracje/allegro";

function rzucJesliBrakEndpointu(blad: unknown, nazwaFunkcji: string, endpoint: string): never {
  if (czyBladApi(blad) && blad.status === 404) {
    throw new BladNiezaimplementowane(`Allegro.${nazwaFunkcji}`, endpoint, blad);
  }
  throw blad;
}

export const allegroApi: KontraktIntegracji = {
  idIntegracji: "allegro",

  // odpowiada za pobranie statusu polaczenia Allegro
  async pobierzStatusPolaczenia(): Promise<StanPolaczeniaIntegracji> {
    const endpoint = `${SCIEZKA_BAZOWA}/status`;
    try {
      return await zapytanieApi<StanPolaczeniaIntegracji>(endpoint);
    } catch (blad) {
      rzucJesliBrakEndpointu(blad, "pobierzStatusPolaczenia", endpoint);
    }
  },

  // odpowiada za inicjalizacje autoryzacji Allegro
  async zainicjujAutoryzacje(
    wejscie: ZainicjujAutoryzacjeIntegracjiWejscie
  ): Promise<ZainicjujAutoryzacjeIntegracjiWynik> {
    const endpoint = `${SCIEZKA_BAZOWA}/autoryzacja`;
    try {
      return await zapytanieApi<ZainicjujAutoryzacjeIntegracjiWynik>(endpoint, {
        metoda: "POST",
        body: wejscie,
      });
    } catch (blad) {
      rzucJesliBrakEndpointu(blad, "zainicjujAutoryzacje", endpoint);
    }
  },

  // odpowiada za uruchomienie synchronizacji danych Allegro
  async uruchomSynchronizacje(
    wejscie: UruchomSynchronizacjeIntegracjiWejscie
  ): Promise<UruchomSynchronizacjeIntegracjiWynik> {
    const endpoint = `${SCIEZKA_BAZOWA}/synchronizacja`;
    try {
      return await zapytanieApi<UruchomSynchronizacjeIntegracjiWynik>(endpoint, {
        metoda: "POST",
        body: wejscie,
      });
    } catch (blad) {
      rzucJesliBrakEndpointu(blad, "uruchomSynchronizacje", endpoint);
    }
  },

  // odpowiada za odlaczenie konta Allegro
  async rozlaczIntegracje(): Promise<void> {
    const endpoint = `${SCIEZKA_BAZOWA}/polaczenie`;
    try {
      await zapytanieApi<void>(endpoint, { metoda: "DELETE", oczekiwaneStatusy: [200, 204] });
    } catch (blad) {
      rzucJesliBrakEndpointu(blad, "rozlaczIntegracje", endpoint);
    }
  },
};

export default allegroApi;
