export type IdIntegracji = "woocommerce" | "allegro";

export type StatusPolaczeniaIntegracji =
  | "niepolaczona"
  | "wymaga_autoryzacji"
  | "polaczona"
  | "synchronizacja"
  | "blad";

export type TypAutoryzacjiIntegracji = "oauth2" | "api_key";

export type StanPolaczeniaIntegracji = {
  idIntegracji: IdIntegracji;
  status: StatusPolaczeniaIntegracji;
  typAutoryzacji: TypAutoryzacjiIntegracji;
  ostatniaSynchronizacjaUtc?: string | null;
  komunikat?: string | null;
};

export type ZainicjujAutoryzacjeIntegracjiWejscie = {
  callbackUrl: string;
};

export type ZainicjujAutoryzacjeIntegracjiWynik = {
  urlAutoryzacji: string;
  stan: string;
  wygasaUtc: string;
};

export type UruchomSynchronizacjeIntegracjiWejscie = {
  zakres: "pelny" | "przyrostowy";
};

export type UruchomSynchronizacjeIntegracjiWynik = {
  idZadania: string;
  status: "uruchomione" | "w_kolejce";
};

export interface KontraktIntegracji {
  readonly idIntegracji: IdIntegracji;
  pobierzStatusPolaczenia: () => Promise<StanPolaczeniaIntegracji>;
  zainicjujAutoryzacje: (
    wejscie: ZainicjujAutoryzacjeIntegracjiWejscie
  ) => Promise<ZainicjujAutoryzacjeIntegracjiWynik>;
  uruchomSynchronizacje: (
    wejscie: UruchomSynchronizacjeIntegracjiWejscie
  ) => Promise<UruchomSynchronizacjeIntegracjiWynik>;
  rozlaczIntegracje: () => Promise<void>;
}
