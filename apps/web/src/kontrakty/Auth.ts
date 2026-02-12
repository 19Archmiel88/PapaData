export type ZrodloLogowania = "email_haslo" | "google" | "microsoft";

export type DaneSesjiAuth = {
  token: string;
  userId: string;
  role: string[];
  zrodlo: ZrodloLogowania;
  wygasaUtc?: string | null;
};

export type WejscieLogowaniaEmailHaslo = {
  email: string;
  haslo: string;
};

export type WejscieRejestracjiEmailHaslo = {
  email: string;
  haslo: string;
};

export type WejscieLogowaniaSso = {
  provider: Extract<ZrodloLogowania, "google" | "microsoft">;
};

export interface KontraktAuth {
  pobierzSesje: () => Promise<DaneSesjiAuth | null>;
  zalogujEmailHaslo: (wejscie: WejscieLogowaniaEmailHaslo) => Promise<DaneSesjiAuth>;
  zarejestrujEmailHaslo: (wejscie: WejscieRejestracjiEmailHaslo) => Promise<DaneSesjiAuth>;
  zalogujSso: (wejscie: WejscieLogowaniaSso) => Promise<DaneSesjiAuth>;
  wyloguj: () => Promise<void>;
}
