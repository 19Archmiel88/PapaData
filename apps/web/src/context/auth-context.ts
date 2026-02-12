import { createContext } from "react";

export type StanSubskrypcji = {
  plan?: string;
  statusSubskrypcji?: string;
  koniecTriala?: string | null;
};

export type StanAuth = {
  czyZalogowany: boolean;
  token: string | null;
  subskrypcja: StanSubskrypcji | null;
  ustawToken: (token: string | null) => void;
  ustawZalogowanie: (czy: boolean) => void;
  ustawSubskrypcje: (stan: StanSubskrypcji | null) => void;
  odswiezSesje: () => void;
  wyloguj: () => Promise<void>;
};

export const KontekstAuth = createContext<StanAuth | undefined>(undefined);
