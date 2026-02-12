import { createContext } from "react";

export type IdModala =
  | "auth"
  | "demo"
  | "kontakt"
  | "wkrotce"
  | "integracja_polaczenie"
  | "integracje"
  | "funkcja";

export type PropsModala = Record<string, unknown>;

export type ElementStosuModali = {
  id: IdModala;
  props: PropsModala;
};

export type StanModali = {
  czyOtwarty: boolean;
  aktywnyModal: ElementStosuModali | null;
  stos: ElementStosuModali[];
  otworzModal: (id: IdModala, props?: PropsModala, opcje?: { stack?: boolean }) => void;
  zamknijModal: () => void;
  zamknijWszystkieModale: () => void;
};

export const KontekstModala = createContext<StanModali | undefined>(undefined);
