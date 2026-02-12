export type KodBleduApi =
  | "API_HTTP"
  | "API_TIMEOUT"
  | "API_SIEC"
  | "API_PARSER"
  | "API_KONFIGURACJA"
  | "API_NOT_IMPLEMENTED";

type ParametryBleduApi = {
  kod: KodBleduApi;
  komunikat: string;
  status?: number;
  endpoint?: string;
  przyczyna?: unknown;
};

export class BladApi extends Error {
  readonly kod: KodBleduApi;
  readonly status?: number;
  readonly endpoint?: string;
  readonly przyczyna?: unknown;

  constructor(parametry: ParametryBleduApi) {
    super(parametry.komunikat);
    this.name = "BladApi";
    this.kod = parametry.kod;
    this.status = parametry.status;
    this.endpoint = parametry.endpoint;
    this.przyczyna = parametry.przyczyna;
  }
}

export class BladNiezaimplementowane extends BladApi {
  constructor(opisFunkcji: string, endpoint?: string, przyczyna?: unknown) {
    super({
      kod: "API_NOT_IMPLEMENTED",
      komunikat: `Funkcja "${opisFunkcji}" nie jest jeszcze dostepna po stronie backendu.`,
      endpoint,
      przyczyna,
    });
    this.name = "BladNiezaimplementowane";
  }
}

export class BladKonfiguracjiApi extends BladApi {
  constructor(komunikat: string, endpoint?: string, przyczyna?: unknown) {
    super({ kod: "API_KONFIGURACJA", komunikat, endpoint, przyczyna });
    this.name = "BladKonfiguracjiApi";
  }
}

export function czyBladApi(blad: unknown): blad is BladApi {
  return blad instanceof BladApi;
}

export function zbudujKomunikatStatusu(status: number, endpoint?: string) {
  const sufix = endpoint ? ` (${endpoint})` : "";
  return `Zadanie API zakonczone statusem HTTP ${status}${sufix}.`;
}
