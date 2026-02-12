import { useCallback, useEffect, useState } from "react";

type StanLadowania = "ladowanie" | "gotowe" | "pusto" | "blad";

type StanZasobu<T> = {
  status: StanLadowania;
  dane: T | null;
  blad: unknown;
};

function czyPuste<T>(dane: T): boolean {
  if (Array.isArray(dane)) return dane.length === 0;
  if (dane === null || dane === undefined) return true;
  return false;
}

type OpcjeZasobuDashboardu = {
  aktywne?: boolean;
};

export function useZasobDashboardu<T>(
  loader: () => Promise<T>,
  opcje: OpcjeZasobuDashboardu = {}
) {
  const aktywne = opcje.aktywne ?? true;
  const [stan, setStan] = useState<StanZasobu<T>>({
    status: "ladowanie",
    dane: null,
    blad: null,
  });

  const odswiez = useCallback(async () => {
    if (!aktywne) return;

    setStan((prev) => ({
      status: prev.dane ? prev.status : "ladowanie",
      dane: prev.dane,
      blad: null,
    }));

    try {
      const wynik = await loader();
      setStan({
        status: czyPuste(wynik) ? "pusto" : "gotowe",
        dane: wynik,
        blad: null,
      });
    } catch (blad) {
      setStan((prev) => ({
        status: "blad",
        dane: prev.dane,
        blad,
      }));
    }
  }, [aktywne, loader]);

  useEffect(() => {
    if (!aktywne) return;

    let aktywny = true;

    const uruchom = async () => {
      setStan({
        status: "ladowanie",
        dane: null,
        blad: null,
      });

      try {
        const wynik = await loader();
        if (!aktywny) return;
        setStan({
          status: czyPuste(wynik) ? "pusto" : "gotowe",
          dane: wynik,
          blad: null,
        });
      } catch (blad) {
        if (!aktywny) return;
        setStan({
          status: "blad",
          dane: null,
          blad,
        });
      }
    };

    uruchom();

    return () => {
      aktywny = false;
    };
  }, [aktywne, loader]);

  return {
    ...stan,
    odswiez,
  };
}

export default useZasobDashboardu;
