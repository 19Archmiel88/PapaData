import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  KLUCZ_MOTYWU,
  pobierzPreferowanyMotyw,
  type TrybMotywu,
  zastosujMotywDokumentu,
} from "../app/motyw/motyw";
import { safeLocalStorage } from "../utils/safeLocalStorage";
import { KontekstUi, type JezykUI } from "./ui-context";

type UIProviderProps = {
  children: ReactNode;
};

const KLUCZ_JEZYKA = "papadata_lang";

function pobierzPoczatkowyJezyk(): JezykUI {
  if (typeof window === "undefined") return "pl";
  const wartosc = safeLocalStorage.getItem(KLUCZ_JEZYKA);
  return wartosc === "en" ? "en" : "pl";
}

export function UIProvider({ children }: UIProviderProps) {
  const [motyw, ustawMotywStan] = useState<TrybMotywu>(pobierzPreferowanyMotyw);
  const [jezyk, ustawJezyk] = useState<JezykUI>(pobierzPoczatkowyJezyk);

  const ustawMotyw = useCallback((nowyMotyw: TrybMotywu) => {
    ustawMotywStan(nowyMotyw);
    zastosujMotywDokumentu(nowyMotyw);
  }, []);

  const przelaczMotyw = useCallback(() => {
    ustawMotyw(motyw === "light" ? "dark" : "light");
  }, [motyw, ustawMotyw]);

  useEffect(() => {
    zastosujMotywDokumentu(motyw);
  }, [motyw]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== KLUCZ_MOTYWU) return;
      if (event.newValue === "light" || event.newValue === "dark") {
        ustawMotywStan(event.newValue);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    safeLocalStorage.setItem(KLUCZ_JEZYKA, jezyk);
  }, [jezyk]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = jezyk;
  }, [jezyk]);

  const wartosc = useMemo(
    () => ({
      motyw,
      jezyk,
      ustawJezyk,
      ustawMotyw,
      przelaczMotyw,
    }),
    [motyw, jezyk, ustawMotyw, przelaczMotyw]
  );

  return <KontekstUi.Provider value={wartosc}>{children}</KontekstUi.Provider>;
}

export default UIProvider;
