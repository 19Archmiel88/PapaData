import { ModalAutoryzacji } from "../auth/AuthModal";
import { ModalIntegracji } from "../integracje/ModalIntegracji";
import { useModal } from "../../context/useModal";
import { ModalKontaktowy } from "./ModalKontaktowy";
import { ModalPolaczeniaIntegracji } from "./ModalPolaczeniaIntegracji";
import { ModalPowiadomienieDemo } from "./ModalPowiadomienieDemo";
import { ModalSzczegolowFunkcji } from "./ModalSzczegolowFunkcji";
import { ModalWkrotce } from "./ModalWkrotce";
import {
  pobierzFunkcjeRaportu,
  pobierzIntegracjeDoPolaczenia,
  pobierzKontekstWkrotce,
  pobierzOnPotwierdzPolaczenie,
  pobierzOnPrimaryDemo,
  pobierzOnWybierzIntegracje,
  pobierzTrybAuth,
} from "./ModalRegistry";

export function KontenerModali() {
  const { aktywnyModal, zamknijModal, otworzModal } = useModal();
  if (!aktywnyModal) return null;

  if (aktywnyModal.id === "auth") {
    return (
      <ModalAutoryzacji
        otwarty={true}
        startowyTryb={pobierzTrybAuth(aktywnyModal.props)}
        onZamknij={zamknijModal}
      />
    );
  }

  if (aktywnyModal.id === "demo") {
    const onPrimary = pobierzOnPrimaryDemo(aktywnyModal.props);
    return (
      <ModalPowiadomienieDemo
        otwarty={true}
        onPrimary={() => {
          zamknijModal();
          onPrimary?.();
        }}
        onZamknij={zamknijModal}
      />
    );
  }

  if (aktywnyModal.id === "kontakt") {
    return <ModalKontaktowy otwarty={true} onZamknij={zamknijModal} />;
  }

  if (aktywnyModal.id === "wkrotce") {
    return (
      <ModalWkrotce
        otwarty={true}
        kontekst={pobierzKontekstWkrotce(aktywnyModal.props)}
        onZamknij={zamknijModal}
      />
    );
  }

  if (aktywnyModal.id === "funkcja") {
    const funkcja = pobierzFunkcjeRaportu(aktywnyModal.props);
    if (!funkcja) return null;
    return <ModalSzczegolowFunkcji otwarty={true} funkcja={funkcja} onZamknij={zamknijModal} />;
  }

  if (aktywnyModal.id === "integracje") {
    const callbackZewnetrzny = pobierzOnWybierzIntegracje(aktywnyModal.props);
    return (
      <ModalIntegracji
        otwarty={true}
        onZamknij={zamknijModal}
        onWybierzIntegracje={(integracja) => {
          callbackZewnetrzny?.(integracja);
          if (!callbackZewnetrzny) {
            if (integracja.status === "wkrotce") {
              otworzModal("wkrotce", { kontekst: integracja.nazwa });
              return;
            }
            otworzModal("integracja_polaczenie", { integracja });
            return;
          }
          zamknijModal();
        }}
      />
    );
  }

  if (aktywnyModal.id === "integracja_polaczenie") {
    const integracja = pobierzIntegracjeDoPolaczenia(aktywnyModal.props);
    if (!integracja) return null;
    const onPotwierdzPolaczenie = pobierzOnPotwierdzPolaczenie(aktywnyModal.props);
    return (
      <ModalPolaczeniaIntegracji
        otwarty={true}
        integracja={integracja}
        onZamknij={zamknijModal}
        onPotwierdzPolaczenie={onPotwierdzPolaczenie ?? undefined}
      />
    );
  }

  return null;
}

export const ModalContainer = KontenerModali;

export default KontenerModali;
