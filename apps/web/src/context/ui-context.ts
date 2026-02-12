import { createContext } from "react";
import type { TrybMotywu } from "../app/motyw/motyw";

export type JezykUI = "pl" | "en";

export type StanUi = {
  motyw: TrybMotywu;
  jezyk: JezykUI;
  ustawJezyk: (jezyk: JezykUI) => void;
  ustawMotyw: (motyw: TrybMotywu) => void;
  przelaczMotyw: () => void;
};

export const KontekstUi = createContext<StanUi | undefined>(undefined);
