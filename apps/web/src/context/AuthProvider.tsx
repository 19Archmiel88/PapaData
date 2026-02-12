import { useCallback, useMemo, useState, type ReactNode } from "react";
import { pobierzSesje, wyloguj as wylogujFirebase } from "../services/auth";
import { KontekstAuth, type StanSubskrypcji } from "./auth-context";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const sesjaStartowa = pobierzSesje();
  const [token, ustawToken] = useState<string | null>(sesjaStartowa?.token ?? null);
  const [czyZalogowany, ustawZalogowanie] = useState(Boolean(sesjaStartowa?.token));
  const [subskrypcja, ustawSubskrypcje] = useState<StanSubskrypcji | null>(null);

  const odswiezSesje = useCallback(() => {
    const sesja = pobierzSesje();
    ustawToken(sesja?.token ?? null);
    ustawZalogowanie(Boolean(sesja?.token));
  }, []);

  const wyloguj = useCallback(async () => {
    await wylogujFirebase();
    ustawToken(null);
    ustawZalogowanie(false);
    ustawSubskrypcje(null);
  }, []);

  const wartosc = useMemo(
    () => ({
      czyZalogowany,
      token,
      subskrypcja,
      ustawToken,
      ustawZalogowanie,
      ustawSubskrypcje,
      odswiezSesje,
      wyloguj,
    }),
    [czyZalogowany, token, subskrypcja, odswiezSesje, wyloguj]
  );

  return <KontekstAuth.Provider value={wartosc}>{children}</KontekstAuth.Provider>;
}

export default AuthProvider;
