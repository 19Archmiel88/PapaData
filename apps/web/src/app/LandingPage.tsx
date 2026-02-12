import React, { useCallback, useMemo, useState } from "react";
import { Scene } from "../components/Scene";
import { HeaderCinematic } from "../components/header/HeaderCinematic";
import { ModalUstawienCookies } from "../components/cookies/ModalUstawienCookies";
import {
  type PreferencjeCookies,
  pobierzPreferencjeCookies,
  zapiszPreferencjeCookies,
} from "../components/cookies/zgodaCookies";
import { pobierzSesje } from "../services/auth";
import {
  pobierzCzySaIntegracje,
  wyliczStanSystemuAtmosfery,
} from "./atmosfera/stanSystemuAtmosfery";
import { SekcjaHero } from "./sekcje/SekcjaHero";
import { SekcjaRaporty } from "./sekcje/SekcjaRaporty";
import { SekcjaKalkulatorZyskow } from "./sekcje/SekcjaKalkulatorZyskow";
import { SekcjaIntegracje } from "./sekcje/SekcjaIntegracje";
import { SekcjaStandardy } from "./sekcje/SekcjaStandardy";
import { SekcjaCennik } from "./sekcje/SekcjaCennik";
import { SekcjaFaq } from "./sekcje/SekcjaFaq";
import { SekcjaFinalneCta } from "./sekcje/SekcjaFinalneCta";
import { SekcjaFooter } from "./sekcje/SekcjaFooter";
import { PasmoIntegracji } from "../components/integracje/PasmoIntegracji";
import { INTEGRACJE_KATALOG } from "../components/integracje/katalogIntegracji";
import { useModal } from "../context/useModal";
import { useUI } from "../context/useUI";
import { WidgetCzatuPapaAi } from "../components/chat/WidgetCzatuPapaAi";
import { PrzyciskScrollDoGory } from "../components/ux/PrzyciskScrollDoGory";
import { ModalPromocjiTriala } from "../components/promocje/ModalPromocjiTriala";
import { PasekPromocjiTriala } from "../components/promocje/PasekPromocjiTriala";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useGlobalPointerGlow } from "../hooks/useGlobalPointerGlow";

type SectionId = "features" | "pricing" | "integrations" | "knowledge" | "about";
type PlanCennika = "Starter" | "Professional" | "Enterprise";

type LandingPageProps = {
  onLogin: () => void;
  onRegister: () => void;
  onOpenDashboard: () => void;
  backendStatus: "ladowanie" | "ok" | "blad";
};

type StanCookies = {
  preferencje: PreferencjeCookies | null;
  modalOtwarty: boolean;
  wymaganaDecyzja: boolean;
  widok: "szybki" | "ustawienia";
  sesja: number;
};

type StanPromocjiTriala = {
  modalOtwarty: boolean;
  pasekWidoczny: boolean;
};

const KLUCZ_PROMOCJI_MODAL = "papadata_trial_promo_modal_v2026_02";
const KLUCZ_PROMOCJI_PASEK = "papadata_trial_promo_pasek_v2026_02";
const INTEGRACJE_PASMO_HERO = INTEGRACJE_KATALOG.map((integracja) => integracja.nazwa);
const ETYKIETA_PASMA_HERO: Record<"pl" | "en", string> = {
  pl: "Zintegrowany ekosystem danych i reklam",
  en: "Integrated data and advertising ecosystem",
};

function utworzStanCookiesPoczatkowy(): StanCookies {
  const preferencje = pobierzPreferencjeCookies();
  const wymaganaDecyzja = preferencje === null;

  return {
    preferencje,
    modalOtwarty: wymaganaDecyzja,
    wymaganaDecyzja,
    widok: wymaganaDecyzja ? "szybki" : "ustawienia",
    sesja: 0,
  };
}

function odczytajFlageStorage(klucz: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(klucz) === "1";
  } catch {
    return false;
  }
}

function zapiszFlageStorage(klucz: string, wartosc: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(klucz, wartosc ? "1" : "0");
  } catch {
    // celowo brak throw - brak dostepu do storage nie moze blokowac UI
  }
}

function utworzStanPromocjiPoczatkowy(): StanPromocjiTriala {
  const modalBylZamkniety = odczytajFlageStorage(KLUCZ_PROMOCJI_MODAL);
  const pasekJestUkryty = odczytajFlageStorage(KLUCZ_PROMOCJI_PASEK);

  return {
    modalOtwarty: !modalBylZamkniety,
    pasekWidoczny: !pasekJestUkryty,
  };
}

/**
 * LANDING PAGE (ROOT VIEW)
 *
 * ZASADY:
 * - Scene = fixed atmosphere (z-index 0)
 * - Header = fixed nav layer (z-index var(--z-nav))
 * - Main = content layer (z-index var(--z-content))
 * - Guardian = floating overlay (z-index var(--z-floating))
 */
export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onRegister,
  onOpenDashboard,
  backendStatus,
}) => {
  useScrollReveal();
  useGlobalPointerGlow();

  const { otworzModal } = useModal();
  const { jezyk, ustawJezyk, motyw } = useUI();
  const sesja = pobierzSesje();
  const [stanCookies, setStanCookies] = useState<StanCookies>(utworzStanCookiesPoczatkowy);
  const [stanPromocji, setStanPromocji] = useState<StanPromocjiTriala>(
    utworzStanPromocjiPoczatkowy
  );
  const [czyCzatOtwarty, setCzyCzatOtwarty] = useState(false);
  const [aktywnoscGuardiana, setAktywnoscGuardiana] = useState<"bezczynny" | "przetwarzanie">(
    "bezczynny"
  );
  const maSesje = sesja !== null;
  const maIntegracje = pobierzCzySaIntegracje();

  // odpowiada za profil ruchu sceny zależny od aktywnego motywu UI
  const profilRuchuSceny = motyw === "light" ? "still" : "balanced";

  // odpowiada za konwersje sygnalow aplikacji na semantyczny stan atmosfery
  const stanSystemuAtmosfery = useMemo(
    () =>
      wyliczStanSystemuAtmosfery({
        backendStatus,
        aktywnoscGuardiana,
        maSesje,
        maIntegracje,
      }),
    [backendStatus, aktywnoscGuardiana, maSesje, maIntegracje]
  );

  // odpowiada za smooth scroll do sekcji
  const onNavTo = useCallback((id: SectionId) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // odpowiada za otwarcie ustawien cookies ze stopki
  const onOpenCookieSettings = useCallback(() => {
    setStanCookies((prev) => ({
      ...prev,
      modalOtwarty: true,
      wymaganaDecyzja: false,
      widok: "ustawienia",
      sesja: prev.sesja + 1,
    }));
  }, []);

  // odpowiada za uruchomienie modala demo z Hero i sekcji finalnej
  const onOpenDemoModal = useCallback(() => {
    otworzModal("demo", { onPrimary: onLogin });
  }, [onLogin, otworzModal]);

  // odpowiada za zapis preferencji cookies i zamkniecie modala
  const onSaveCookiePreferences = useCallback((preferencje: PreferencjeCookies) => {
    zapiszPreferencjeCookies(preferencje);
    setStanCookies((prev) => ({
      ...prev,
      preferencje,
      wymaganaDecyzja: false,
      modalOtwarty: false,
    }));
  }, []);

  // odpowiada za zamkniecie modala cookies w trybie edycji
  const onCloseCookieModal = useCallback(() => {
    setStanCookies((prev) => ({
      ...prev,
      modalOtwarty: false,
    }));
  }, []);

  // odpowiada za domkniecie modala promocji i pozostawienie stalego paska triala
  const onZamknijPromocjeTriala = useCallback(() => {
    zapiszFlageStorage(KLUCZ_PROMOCJI_MODAL, true);
    zapiszFlageStorage(KLUCZ_PROMOCJI_PASEK, false);
    setStanPromocji((prev) => ({
      ...prev,
      modalOtwarty: false,
      pasekWidoczny: true,
    }));
  }, []);

  // odpowiada za uruchomienie triala z modala/paska promocji
  const onUruchomTrialZPromocji = useCallback(() => {
    zapiszFlageStorage(KLUCZ_PROMOCJI_MODAL, true);
    zapiszFlageStorage(KLUCZ_PROMOCJI_PASEK, false);
    setStanPromocji((prev) => ({
      ...prev,
      modalOtwarty: false,
      pasekWidoczny: true,
    }));
    onRegister();
  }, [onRegister]);

  // odpowiada za ponowne otwarcie szczegolow oferty triala z paska
  const onPokazSzczegolyPromocji = useCallback(() => {
    setStanPromocji((prev) => ({
      ...prev,
      modalOtwarty: true,
    }));
  }, []);

  // odpowiada za ukrycie stalego paska promocji triala
  const onUkryjPasekPromocji = useCallback(() => {
    zapiszFlageStorage(KLUCZ_PROMOCJI_PASEK, true);
    setStanPromocji((prev) => ({
      ...prev,
      pasekWidoczny: false,
    }));
  }, []);

  // odpowiada za realne akcje CTA planow cennika
  const onWyborPlanu = useCallback(
    (plan: PlanCennika) => {
      if (plan === "Enterprise") {
        window.location.href = "mailto:sales@papadata.pl?subject=Oferta%20Enterprise%20PapaData";
        return;
      }

      onRegister();
    },
    [onRegister]
  );

  const czyModalPromocjiOtwarty = stanPromocji.modalOtwarty && !stanCookies.modalOtwarty;

  return (
    <>
      {/* Atmosphere / motion engine (tło) */}
      <Scene motion={profilRuchuSceny} stanSystemu={stanSystemuAtmosfery} />
      <div className="pd-global-grain" aria-hidden="true" />

      {/* Cinematic header (nav layer) */}
      <HeaderCinematic
        lang={jezyk}
        onLangChange={ustawJezyk}
        onLogin={onLogin}
        onCta={onOpenDashboard}
        onNavTo={onNavTo}
      />

      {/* Content layer */}
      <main
        className="relative z-[var(--z-content)]"
        role="main"
        aria-label="Strona główna PapaData"
      >
        {/* odpowiada za sekcje hero */}
        <SekcjaHero
          onPrimary={onRegister}
          onSecondary={onOpenDemoModal}
          onOpenAnalysis={onOpenDashboard}
          onGuardianProcessingChange={setAktywnoscGuardiana}
        />

        {/* odpowiada za pasek zintegrowanego ekosystemu pod hero */}
        <div className="pd-container pd-reveal pt-2 md:pt-3" data-pd-reveal="pasmo-integracji-hero">
          <PasmoIntegracji
            pozycje={INTEGRACJE_PASMO_HERO}
            etykieta={ETYKIETA_PASMA_HERO[jezyk]}
            id="pasmo-integracji-hero"
          />
        </div>

        {/* odpowiada za sekcje kalkulatora zaraz po hero */}
        <SekcjaKalkulatorZyskow onPrimary={onRegister} />

        {/* odpowiada za sekcje funkcji */}
        <div id="features" className="scroll-mt-36">
          <SekcjaRaporty />
        </div>

        {/* odpowiada za sekcje cennika */}
        <div id="pricing" className="scroll-mt-36">
          <SekcjaCennik onWyborPlanu={onWyborPlanu} />
        </div>

        {/* odpowiada za sekcje integracji */}
        <div id="integrations" className="scroll-mt-36">
          <SekcjaIntegracje onUruchomWarsztat={onRegister} />
        </div>

        {/* odpowiada za sekcje wiedzy i zaufania */}
        <div id="knowledge" className="scroll-mt-36">
          <SekcjaStandardy />
          <SekcjaFaq />
        </div>

        {/* odpowiada za finalna sekcje konwersyjna */}
        <SekcjaFinalneCta onPrimary={onRegister} onSecondary={onOpenDemoModal} />

        {/* odpowiada za sekcje footer i formalnosci */}
        <div id="about" className="scroll-mt-36">
          <SekcjaFooter
            onOpenCookieSettings={onOpenCookieSettings}
            onOpenContact={() => otworzModal("kontakt")}
          />
        </div>
      </main>

      {/* odpowiada za staly widget czatu Papa AI w prawym dolnym rogu */}
      <WidgetCzatuPapaAi
        onOpenTrial={onUruchomTrialZPromocji}
        onZmianaOtwarcia={setCzyCzatOtwarty}
      />

      {/* odpowiada za szybki powrot na gore strony po przewinieciu */}
      <PrzyciskScrollDoGory ukryty={czyCzatOtwarty} />

      {/* odpowiada za staly pasek promocji widoczny po zamknieciu modala */}
      <PasekPromocjiTriala
        widoczny={stanPromocji.pasekWidoczny}
        onPrimary={onUruchomTrialZPromocji}
        onPokazSzczegoly={onPokazSzczegolyPromocji}
        onUkryj={onUkryjPasekPromocji}
      />

      {/* odpowiada za modal oferty 14 dni triala */}
      <ModalPromocjiTriala
        otwarty={czyModalPromocjiOtwarty}
        onPrimary={onUruchomTrialZPromocji}
        onZamknij={onZamknijPromocjeTriala}
      />

      {/* Cookie settings modal */}
      <ModalUstawienCookies
        key={stanCookies.sesja}
        otwarty={stanCookies.modalOtwarty}
        wymaganaDecyzja={stanCookies.wymaganaDecyzja}
        preferencjePoczatkowe={stanCookies.preferencje}
        startowyWidok={stanCookies.widok}
        onZapisz={onSaveCookiePreferences}
        onZamknij={onCloseCookieModal}
      />
    </>
  );
};

export default LandingPage;
