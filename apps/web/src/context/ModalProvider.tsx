import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  KontekstModala,
  type ElementStosuModali,
  type IdModala,
  type PropsModala,
} from "./modal-context";

type ModalProviderProps = {
  children: ReactNode;
};

export function ModalProvider({ children }: ModalProviderProps) {
  const [stos, setStos] = useState<ElementStosuModali[]>([]);

  const otworzModal = useCallback(
    (id: IdModala, props: PropsModala = {}, opcje?: { stack?: boolean }) => {
      setStos((prev) => {
        if (opcje?.stack) return [...prev, { id, props }];
        return [{ id, props }];
      });
    },
    []
  );

  const zamknijModal = useCallback(() => {
    setStos((prev) => (prev.length <= 1 ? [] : prev.slice(0, -1)));
  }, []);

  const zamknijWszystkieModale = useCallback(() => {
    setStos([]);
  }, []);

  const aktywnyModal = stos.length > 0 ? stos[stos.length - 1] : null;
  const czyOtwarty = aktywnyModal !== null;

  const wartosc = useMemo(
    () => ({
      czyOtwarty,
      aktywnyModal,
      stos,
      otworzModal,
      zamknijModal,
      zamknijWszystkieModale,
    }),
    [czyOtwarty, aktywnyModal, stos, otworzModal, zamknijModal, zamknijWszystkieModale]
  );

  return <KontekstModala.Provider value={wartosc}>{children}</KontekstModala.Provider>;
}

export default ModalProvider;
