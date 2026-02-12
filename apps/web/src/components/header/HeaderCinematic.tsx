import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useScrollHeader } from "./useScrollHeader";
import { LogoPapaData } from "../branding/LogoPapaData";
import { useModal } from "../../context/useModal";
import { useUI } from "../../context/useUI";
import { FUNKCJE_RAPORTOWE, type DefinicjaFunkcjiRaportowej } from "../../app/sekcje/daneFunkcjiRaportowych";

type NavItem = {
  id: "features" | "pricing" | "integrations" | "knowledge" | "about";
  label: string;
};

type DropdownItem = {
  label: string;
  onClick: () => void;
};

type HeaderCinematicProps = {
  onCta: () => void;
  onLogin: () => void;
  onNavTo: (id: NavItem["id"]) => void;
  lang: "pl" | "en";
  onLangChange: (lang: "pl" | "en") => void;
};

type HeaderMode = "hidden" | "floating";
type DesktopDropdown = "features" | "integrations" | "language" | null;
type MobileRozwiniecie = "features" | "integrations" | null;

type SlownikHeadera = {
  bannerAria: string;
  brandAria: string;
  openMenu: string;
  closeMenu: string;
  mobileMenuAria: string;
  functionsNav: string;
  pricingNav: string;
  integrationsNav: string;
  knowledgeNav: string;
  aboutNav: string;
  functionsMenuAria: string;
  integrationsMenuAria: string;
  integrationsEcommerce: string;
  integrationsAds: string;
  integrationsAnalytics: string;
  integrationsAll: string;
  login: string;
  dashboardCta: string;
  dashboardShort: string;
  languageButtonAria: string;
  languageListAria: string;
  languagePlLabel: string;
  languageEnLabel: string;
  langPlAria: string;
  langEnAria: string;
  themeGroupAria: string;
  darkThemeAria: string;
  lightThemeAria: string;
};

type LokalizacjaFunkcji = Pick<
  DefinicjaFunkcjiRaportowej,
  "nazwa" | "opis" | "zastosowania" | "daneWejsciowe"
>;

const SLOWNIK_HEADERA: Record<"pl" | "en", SlownikHeadera> = {
  pl: {
    bannerAria: "Nagłówek",
    brandAria: "Strona główna PapaData",
    openMenu: "Otwórz menu",
    closeMenu: "Zamknij menu",
    mobileMenuAria: "Menu mobilne",
    functionsNav: "Funkcje",
    pricingNav: "Cennik",
    integrationsNav: "Integracje",
    knowledgeNav: "Baza wiedzy",
    aboutNav: "O nas",
    functionsMenuAria: "Funkcje",
    integrationsMenuAria: "Integracje",
    integrationsEcommerce: "Platformy e-commerce",
    integrationsAds: "Platformy reklamowe",
    integrationsAnalytics: "Platformy analityczne",
    integrationsAll: "Wszystkie integracje",
    login: "Zaloguj się",
    dashboardCta: "Przejdź do dashboardu",
    dashboardShort: "Dashboard",
    languageButtonAria: "Otwórz listę języków",
    languageListAria: "Lista wyboru języka",
    languagePlLabel: "Polski",
    languageEnLabel: "Angielski",
    langPlAria: "Ustaw język polski",
    langEnAria: "Ustaw język angielski",
    themeGroupAria: "Wybierz motyw",
    darkThemeAria: "Ustaw ciemny motyw",
    lightThemeAria: "Ustaw jasny motyw",
  },
  en: {
    bannerAria: "Header",
    brandAria: "PapaData home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mobileMenuAria: "Mobile menu",
    functionsNav: "Features",
    pricingNav: "Pricing",
    integrationsNav: "Integrations",
    knowledgeNav: "Knowledge base",
    aboutNav: "About us",
    functionsMenuAria: "Features",
    integrationsMenuAria: "Integrations",
    integrationsEcommerce: "E-commerce platforms",
    integrationsAds: "Advertising platforms",
    integrationsAnalytics: "Analytics platforms",
    integrationsAll: "All integrations",
    login: "Log in",
    dashboardCta: "Go to Dashboard",
    dashboardShort: "Dashboard",
    languageButtonAria: "Open language list",
    languageListAria: "Language selection list",
    languagePlLabel: "Polish",
    languageEnLabel: "English",
    langPlAria: "Set Polish language",
    langEnAria: "Set English language",
    themeGroupAria: "Select theme",
    darkThemeAria: "Enable dark theme",
    lightThemeAria: "Enable light theme",
  },
};

const TLUMACZENIA_FUNKCJI: Record<
  string,
  Record<"pl" | "en", LokalizacjaFunkcji>
> = {
  "wyniki-kampanii": {
    pl: {
      nazwa: "Wyniki kampanii",
      opis: "Porównuje koszty, przychód i marżę na poziomie kampanii, zestawu reklam i kreacji.",
      zastosowania: [
        "Wykrywa przepalenia budżetu po kanale i kreacji.",
        "Pokazuje realny ROAS po kosztach produktu i logistyki.",
        "Oznacza kampanie z ryzykiem utraty marży.",
      ],
      daneWejsciowe: "Meta Ads, Google Ads, koszt produktu, koszt dostawy, zamówienia.",
    },
    en: {
      nazwa: "Campaign performance",
      opis: "Compares cost, revenue, and margin by campaign, ad set, and creative.",
      zastosowania: [
        "Detects budget waste by channel and creative.",
        "Shows true ROAS after product and logistics costs.",
        "Flags campaigns with margin-loss risk.",
      ],
      daneWejsciowe: "Meta Ads, Google Ads, product cost, shipping cost, orders.",
    },
  },
  "asystent-marketingowy-ai": {
    pl: {
      nazwa: "Asystent marketingowy AI",
      opis: "Wyjaśnia odchylenia metryk i wskazuje działania o największym wpływie finansowym.",
      zastosowania: [
        "Priorytetyzuje zadania na podstawie straty alternatywnej.",
        "Wysyła alerty krytyczne dla odchyleń metryk.",
        "Buduje gotowy plan działań dla zespołu.",
      ],
      daneWejsciowe: "Ruch, konwersje, koszty kampanii, marża netto, dane o zwrotach.",
    },
    en: {
      nazwa: "AI marketing assistant",
      opis: "Explains metric deviations and recommends actions with the highest financial impact.",
      zastosowania: [
        "Prioritizes work by opportunity cost.",
        "Sends critical alerts for KPI anomalies.",
        "Builds an execution-ready action plan.",
      ],
      daneWejsciowe: "Traffic, conversions, campaign costs, net margin, returns data.",
    },
  },
  "rekomendacje-wzrostu": {
    pl: {
      nazwa: "Rekomendacje wzrostu",
      opis: "Buduje scenariusze działań i estymuje ich wpływ na marżę oraz przychód.",
      zastosowania: [
        "Symulacje 30/60/90 dni dla budżetu i marży.",
        "Plan wdrożenia bez zgadywania priorytetów.",
        "Ocena ryzyka przy zmianie rabatów i stawek.",
      ],
      daneWejsciowe: "Historia sprzedaży, koszty mediowe, stany magazynowe, atrybucja.",
    },
    en: {
      nazwa: "Growth recommendations",
      opis: "Builds action scenarios and estimates impact on margin and revenue.",
      zastosowania: [
        "30/60/90-day simulations for budget and margin.",
        "Execution plan without guesswork on priorities.",
        "Risk assessment for discounts and bid changes.",
      ],
      daneWejsciowe: "Sales history, media costs, inventory levels, attribution data.",
    },
  },
  "wplyw-rabatow": {
    pl: {
      nazwa: "Wpływ rabatów",
      opis: "Analizuje, czy rabat zwiększa zysk, czy tylko wolumen niskomarżowy.",
      zastosowania: [
        "Kontrola progów rentowności per SKU.",
        "Ochrona marży produktowej przy promocjach.",
        "Wskazanie segmentów, gdzie rabat nie jest konieczny.",
      ],
      daneWejsciowe: "Ceny bazowe, rabaty, marża na SKU, koszty kampanii i logistyki.",
    },
    en: {
      nazwa: "Discount impact",
      opis: "Checks whether discounts increase profit or just low-margin volume.",
      zastosowania: [
        "Controls profitability thresholds per SKU.",
        "Protects product margin during promotions.",
        "Identifies segments where discounting is unnecessary.",
      ],
      daneWejsciowe: "Base prices, discounts, SKU margin, campaign and logistics costs.",
    },
  },
  "analityka-produktow": {
    pl: {
      nazwa: "Analityka produktów",
      opis: "Łączy popyt, marżę i zwroty, by wskazać produkty do skalowania lub wygaszenia.",
      zastosowania: [
        "Mapa szans SKU i produktów z potencjałem wzrostu.",
        "Lista ryzyk magazynowych i stockout.",
        "Priorytet replenishment pod marżę netto.",
      ],
      daneWejsciowe: "SKU, stany magazynowe, rotacja, zwroty, przychód i koszt jednostkowy.",
    },
    en: {
      nazwa: "Product analytics",
      opis: "Combines demand, margin, and returns to identify products to scale or phase out.",
      zastosowania: [
        "Opportunity map for high-potential SKUs.",
        "Inventory risk and stockout list.",
        "Net-margin driven replenishment priorities.",
      ],
      daneWejsciowe: "SKUs, inventory levels, rotation, returns, revenue, unit cost.",
    },
  },
  "automatyczne-raporty": {
    pl: {
      nazwa: "Automatyczne raporty",
      opis: "Dostarcza codzienne i tygodniowe raporty bez pracy ręcznej zespołu.",
      zastosowania: [
        "Raport poranny dla zarządu i marketingu.",
        "Powiadomienia o odchyleniach KPI i marży.",
        "Gotowe zestawienia do weekly business review.",
      ],
      daneWejsciowe: "Wszystkie aktywne źródła danych podpięte do modelu PapaData.",
    },
    en: {
      nazwa: "Automated reports",
      opis: "Delivers daily and weekly reports without manual team effort.",
      zastosowania: [
        "Morning report for leadership and marketing.",
        "Alerts for KPI and margin deviations.",
        "Ready-to-use weekly business review summaries.",
      ],
      daneWejsciowe: "All active data sources connected to the PapaData model.",
    },
  },
  "lejek-zakupowy": {
    pl: {
      nazwa: "Lejek zakupowy",
      opis: "Pokazuje etap procesu zakupowego, na którym tracisz najwięcej przychodu.",
      zastosowania: [
        "Wykrywa punkty tarcia od karty produktu do finalizacji płatności.",
        "Segmentuje porzucenia koszyka po urządzeniu i źródle ruchu.",
        "Sugeruje priorytety UX i testy naprawcze dla checkoutu.",
      ],
      daneWejsciowe: "Widoki stron, zdarzenia koszyka, checkout, kanał pozyskania, urządzenie.",
    },
    en: {
      nazwa: "Purchase funnel",
      opis: "Shows where the buying process leaks the most revenue.",
      zastosowania: [
        "Detects friction points from product page to payment completion.",
        "Segments cart abandonment by device and traffic source.",
        "Suggests UX priorities and checkout recovery tests.",
      ],
      daneWejsciowe: "Page views, cart events, checkout data, acquisition channel, device.",
    },
  },
  "sciezka-konwersji": {
    pl: {
      nazwa: "Ścieżka konwersji",
      opis: "Analizuje sekwencje touchpointów, które realnie domykają sprzedaż.",
      zastosowania: [
        "Porównuje ścieżki pierwszego i ostatniego kontaktu.",
        "Wylicza udział kanałów wspierających konwersję.",
        "Pomaga lepiej dzielić budżet między awareness i domknięcie.",
      ],
      daneWejsciowe: "Sesje użytkowników, touchpointy kampanii, transakcje, model atrybucji.",
    },
    en: {
      nazwa: "Conversion path",
      opis: "Analyzes touchpoint sequences that actually close sales.",
      zastosowania: [
        "Compares first-touch and last-touch paths.",
        "Calculates contribution of assist channels.",
        "Improves budget split between awareness and closing.",
      ],
      daneWejsciowe: "User sessions, campaign touchpoints, transactions, attribution model.",
    },
  },
  "analiza-klientow": {
    pl: {
      nazwa: "Analiza klientów",
      opis: "Łączy zachowania klientów, marżę i retencję, by wskazać segmenty najwyższej wartości.",
      zastosowania: [
        "Identyfikuje segmenty o najwyższym LTV i marży.",
        "Wykrywa ryzyko churnu i spadku częstotliwości zakupów.",
        "Podpowiada scenariusze retencji i cross-sell.",
      ],
      daneWejsciowe: "Historia zamówień, segmenty klientów, marża, rabaty, aktywność CRM.",
    },
    en: {
      nazwa: "Customer analytics",
      opis: "Combines customer behavior, margin, and retention to find highest-value segments.",
      zastosowania: [
        "Identifies segments with highest LTV and margin.",
        "Detects churn risk and purchase frequency drops.",
        "Suggests retention and cross-sell scenarios.",
      ],
      daneWejsciowe: "Order history, customer segments, margin, discounts, CRM activity.",
    },
  },
};

function lokalizujFunkcjeRaportowa(
  funkcja: DefinicjaFunkcjiRaportowej,
  jezyk: "pl" | "en"
): DefinicjaFunkcjiRaportowej {
  const tlumaczenie = TLUMACZENIA_FUNKCJI[funkcja.id]?.[jezyk];
  if (!tlumaczenie) return funkcja;

  return {
    ...funkcja,
    nazwa: tlumaczenie.nazwa,
    opis: tlumaczenie.opis,
    zastosowania: tlumaczenie.zastosowania,
    daneWejsciowe: tlumaczenie.daneWejsciowe,
  };
}

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function IkonaFlagiPolski() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 rounded-sm shadow-sm" aria-hidden="true">
      <rect x="1.5" y="2.5" width="21" height="19" rx="2.5" fill="#ffffff" />
      <rect x="1.5" y="12" width="21" height="9.5" fill="#dc2626" />
      <rect
        x="1.5"
        y="2.5"
        width="21"
        height="19"
        rx="2.5"
        fill="none"
        stroke="rgba(15,23,42,0.28)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function IkonaFlagiAnglii() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 rounded-sm shadow-sm" aria-hidden="true">
      <rect x="1.5" y="2.5" width="21" height="19" rx="2.5" fill="#ffffff" />
      <path d="M10 2.5h4v19h-4z" fill="#dc2626" />
      <path d="M1.5 10h21v4h-21z" fill="#dc2626" />
      <rect
        x="1.5"
        y="2.5"
        width="21"
        height="19"
        rx="2.5"
        fill="none"
        stroke="rgba(15,23,42,0.28)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function IkonaSwiatla() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="4.6" fill="currentColor" />
      <path
        d="M12 1.8v3m0 14.4v3M1.8 12h3m14.4 0h3M4.6 4.6l2.1 2.1m10.6 10.6l2.1 2.1m0-14.8l-2.1 2.1M6.7 17.3l-2.1 2.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IkonaCiemna() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M14.8 3.3a8.6 8.6 0 108.1 12.1 7.8 7.8 0 01-8.1-12.1z" fill="currentColor" />
    </svg>
  );
}

export function HeaderCinematic(props: HeaderCinematicProps) {
  const { lang, onLangChange, onLogin, onCta, onNavTo } = props;
  const { otworzModal } = useModal();
  const { motyw, ustawMotyw } = useUI();
  const tekst = SLOWNIK_HEADERA[lang];
  const header = useScrollHeader({
    topThreshold: 10,
    dirThreshold: 8,
    pinThreshold: 96,
  });
  const mode: HeaderMode = header.show ? "floating" : "hidden";

  const [desktopDropdown, setDesktopDropdown] = useState<DesktopDropdown>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileRozwiniecie, setMobileRozwiniecie] = useState<MobileRozwiniecie>(null);
  const [mobileJezykOpen, setMobileJezykOpen] = useState(false);
  const [aktywnyLink, setAktywnyLink] = useState<NavItem["id"] | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const otworzModalFunkcji = useCallback(
    (funkcja: DefinicjaFunkcjiRaportowej) => {
      otworzModal("funkcja", {
        funkcja: {
          nazwa: funkcja.nazwa,
          opis: funkcja.opis,
          zastosowania: funkcja.zastosowania,
          daneWejsciowe: funkcja.daneWejsciowe,
        },
      });
    },
    [otworzModal]
  );

  const featuresItems: DropdownItem[] = useMemo(
    () =>
      FUNKCJE_RAPORTOWE.map((funkcja) => ({
        label: lokalizujFunkcjeRaportowa(funkcja, lang).nazwa,
        onClick: () => otworzModalFunkcji(lokalizujFunkcjeRaportowa(funkcja, lang)),
      })),
    [lang, otworzModalFunkcji]
  );

  const integrationsItems: DropdownItem[] = useMemo(
    () => [
      { label: tekst.integrationsEcommerce, onClick: () => onNavTo("integrations") },
      { label: tekst.integrationsAds, onClick: () => onNavTo("integrations") },
      { label: tekst.integrationsAnalytics, onClick: () => onNavTo("integrations") },
      { label: tekst.integrationsAll, onClick: () => onNavTo("integrations") },
    ],
    [onNavTo, tekst]
  );

  const shellCls = cx(
    "pd-header-shell pd-header-anim",
    mode === "floating" ? "pd-header-floating" : "pd-header-hidden"
  );

  const pillButtonCls =
    "pd-btn-secondary inline-flex items-center justify-center h-10 rounded-2xl px-4 text-sm font-semibold whitespace-nowrap shrink-0 text-slate-900 dark:text-slate-100 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-transparent";
  const primaryButtonCls =
    "pd-btn-primary inline-flex items-center justify-center h-10 rounded-2xl px-5 text-sm font-semibold whitespace-nowrap shrink-0 text-white " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-transparent";

  const themeGroupCls = "pd-enterprise-chip inline-flex items-center rounded-2xl p-0.5";
  const themeChoiceCls = (active: boolean) =>
    cx(
      "grid h-9 w-9 place-items-center rounded-[14px] text-slate-900 transition dark:text-slate-100",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-transparent",
      active ? "pd-theme-choice-active" : "hover:bg-white/35 dark:hover:bg-white/10"
    );
  const dropdownShellCls = "pd-glass pd-edge pd-innerglow rounded-2xl p-3";

  const featuresMenuId = "pd-menu-features";
  const integrationsMenuId = "pd-menu-integrations";
  const languageMenuId = "pd-menu-language";
  const mobileMenuId = "pd-menu-mobile";
  const mobileFeaturesMenuId = "pd-menu-mobile-features";
  const mobileIntegrationsMenuId = "pd-menu-mobile-integrations";
  const mobileLanguageMenuId = "pd-menu-mobile-language";

  const aktywneFunkcje = aktywnyLink === "features";
  const aktywneIntegracje = aktywnyLink === "integrations";
  const aktywnaWiedza = aktywnyLink === "knowledge";
  const aktywneONas = aktywnyLink === "about";
  const aktywnyCennik = aktywnyLink === "pricing";

  const zamknijWszystko = useCallback(() => {
    setDesktopDropdown(null);
    setMobileOpen(false);
    setMobileRozwiniecie(null);
    setMobileJezykOpen(false);
  }, []);

  const wybierzJezyk = useCallback(
    (jezyk: "pl" | "en") => {
      onLangChange(jezyk);
      setDesktopDropdown(null);
      setMobileJezykOpen(false);
    },
    [onLangChange]
  );

  const przejdzDoSekcji = useCallback(
    (id: NavItem["id"]) => {
      setDesktopDropdown(null);
      setMobileOpen(false);
      setMobileRozwiniecie(null);
      setMobileJezykOpen(false);
      setAktywnyLink(null);
      onNavTo(id);
      if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
    [onNavTo]
  );

  const toggleMobileRozwiniecie = useCallback((id: "features" | "integrations") => {
    setMobileJezykOpen(false);
    setMobileRozwiniecie((aktualne) => (aktualne === id ? null : id));
  }, []);

  // odpowiada za blokade scrolla dokumentu, kiedy otwarte jest menu mobilne
  useEffect(() => {
    if (!mobileOpen || typeof document === "undefined") return;
    const poprzedniOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = poprzedniOverflow;
    };
  }, [mobileOpen]);

  // odpowiada za automatyczne zamykanie menu po kliknieciu poza headerem
  useEffect(() => {
    if ((!desktopDropdown && !mobileOpen) || typeof document === "undefined") return;

    const onPointerDown = (event: PointerEvent) => {
      const root = navRef.current;
      if (!root || !(event.target instanceof Node)) return;
      if (!root.contains(event.target)) zamknijWszystko();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [desktopDropdown, mobileOpen, zamknijWszystko]);

  // odpowiada za aktywny link nawigacji na podstawie aktualnie widocznej sekcji
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const ids: NavItem["id"][] = ["features", "pricing", "integrations", "knowledge", "about"];
    const sekcje = ids
      .map((id) => ({ id, element: document.getElementById(id) }))
      .filter(
        (wpis): wpis is { id: NavItem["id"]; element: HTMLElement } =>
          wpis.element instanceof HTMLElement
      );

    if (sekcje.length === 0) return;

    const widocznoscSekcji = new Map<NavItem["id"], number>();
    sekcje.forEach((sekcja) => widocznoscSekcji.set(sekcja.id, 0));

    const aktualizujAktywnyLink = () => {
      let najlepszyLink: NavItem["id"] | null = null;
      let najwyzszyWynik = 0;

      widocznoscSekcji.forEach((ratio, id) => {
        if (ratio <= najwyzszyWynik) return;
        najwyzszyWynik = ratio;
        najlepszyLink = id;
      });

      setAktywnyLink((poprzedni) => (poprzedni === najlepszyLink ? poprzedni : najlepszyLink));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as NavItem["id"];
          widocznoscSekcji.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        aktualizujAktywnyLink();
      },
      { root: null, threshold: [0, 0.12, 0.2, 0.34, 0.5], rootMargin: "-34% 0px -52% 0px" }
    );

    sekcje.forEach((sekcja) => observer.observe(sekcja.element));
    aktualizujAktywnyLink();
    return () => observer.disconnect();
  }, []);

  function onKeyDownRoot(e: React.KeyboardEvent) {
    if (e.key !== "Escape") return;
    e.preventDefault();
    zamknijWszystko();
  }

  return (
    <div
      className={shellCls}
      data-state={mode}
      data-open={desktopDropdown ?? "none"}
      data-pinned={header.pinned ? "true" : "false"}
      role="banner"
      aria-label={tekst.bannerAria}
      onKeyDown={onKeyDownRoot}
    >
      <div className="pd-container">
        <div
          ref={navRef}
          className={cx(
            "pd-glass pd-edge pd-edge-allow-overflow pd-innerglow pd-header-panel rounded-3xl flex min-w-0 items-center justify-between gap-2 px-3 py-3 md:gap-4 md:px-5",
            header.pinned ? "pd-header-panel-pinned" : "pd-header-panel-hero"
          )}
        >
          {/* odpowiada za identyfikacje brandu (logo + nazwa) */}
          <button
            type="button"
            onClick={() => {
              setAktywnyLink(null);
              const redukujRuch = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              window.scrollTo({ top: 0, behavior: redukujRuch ? "auto" : "smooth" });
            }}
            className={cx(
              "flex shrink-0 items-center gap-3 min-w-[190px] transition-all duration-300",
              mode === "floating" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            )}
            aria-label={tekst.brandAria}
          >
            <span className="grid h-10 w-10 place-items-center  text-slate-900 dark:text-slate-100">
              <LogoPapaData dekoracyjne={true} size={45} />
            </span>
            <span className="leading-tight text-left">
              <span className="block text-base font-black text-black dark:text-white">PapaData</span>
              <span className="block text-xs font-semibold tracking-[0.08em] uppercase text-black/60 dark:text-white/60">
                Intelligence
              </span>
            </span>
          </button>

          {/* odpowiada za desktopowe menu glowne z dropdownami */}
          <nav className="relative z-30 hidden min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 lg:flex">
            <div
              className="relative"
              onPointerEnter={() => setDesktopDropdown("features")}
              onPointerLeave={() => setDesktopDropdown(null)}
            >
              <button
                type="button"
                className={cx(
                  "pd-nav-pill h-10 px-4 rounded-2xl whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                  (desktopDropdown === "features" || aktywneFunkcje) && "pd-nav-pill-active"
                )}
                onClick={() =>
                  setDesktopDropdown((aktualne) => (aktualne === "features" ? null : "features"))
                }
                aria-haspopup="menu"
                aria-expanded={desktopDropdown === "features"}
                aria-controls={featuresMenuId}
                aria-current={aktywneFunkcje ? "page" : undefined}
              >
                {tekst.functionsNav} <span className="ml-1 opacity-70">▾</span>
              </button>

              <div
                id={featuresMenuId}
                role="menu"
                aria-label={tekst.functionsMenuAria}
                className={cx(
                  "pd-dropdown absolute left-0 top-full w-[340px] pt-2",
                  desktopDropdown === "features" ? "pd-dropdown-open" : "pd-dropdown-closed"
                )}
              >
                <div className={dropdownShellCls}>
                  {featuresItems.map((it) => (
                    <button
                      key={it.label}
                      role="menuitem"
                      className="w-full rounded-xl px-3 py-2.5 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
                      onClick={() => {
                        it.onClick();
                        setDesktopDropdown(null);
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80" />
                        <span>{it.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className={cx(
                "pd-nav-pill h-10 px-4 rounded-2xl whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                aktywnyCennik && "pd-nav-pill-active"
              )}
              onClick={() => przejdzDoSekcji("pricing")}
              aria-current={aktywnyCennik ? "page" : undefined}
            >
              {tekst.pricingNav}
            </button>

            <div
              className="relative"
              onPointerEnter={() => setDesktopDropdown("integrations")}
              onPointerLeave={() => setDesktopDropdown(null)}
            >
              <button
                type="button"
                className={cx(
                  "pd-nav-pill h-10 px-4 rounded-2xl whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                  (desktopDropdown === "integrations" || aktywneIntegracje) && "pd-nav-pill-active"
                )}
                onClick={() =>
                  setDesktopDropdown((aktualne) =>
                    aktualne === "integrations" ? null : "integrations"
                  )
                }
                aria-haspopup="menu"
                aria-expanded={desktopDropdown === "integrations"}
                aria-controls={integrationsMenuId}
                aria-current={aktywneIntegracje ? "page" : undefined}
              >
                {tekst.integrationsNav} <span className="ml-1 opacity-70">▾</span>
              </button>

              <div
                id={integrationsMenuId}
                role="menu"
                aria-label={tekst.integrationsMenuAria}
                className={cx(
                  "pd-dropdown absolute left-0 top-full w-[320px] pt-2",
                  desktopDropdown === "integrations" ? "pd-dropdown-open" : "pd-dropdown-closed"
                )}
              >
                <div className={dropdownShellCls}>
                  {integrationsItems.map((it) => (
                    <button
                      key={it.label}
                      role="menuitem"
                      className="w-full rounded-xl px-3 py-2.5 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
                      onClick={() => {
                        it.onClick();
                        setDesktopDropdown(null);
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
                        <span>{it.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className={cx(
                "pd-nav-pill h-10 px-4 rounded-2xl whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                aktywnaWiedza && "pd-nav-pill-active"
              )}
              onClick={() => przejdzDoSekcji("knowledge")}
              aria-current={aktywnaWiedza ? "page" : undefined}
            >
              {tekst.knowledgeNav}
            </button>

            <button
              type="button"
              className={cx(
                "pd-nav-pill h-10 px-4 rounded-2xl whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                aktywneONas && "pd-nav-pill-active"
              )}
              onClick={() => przejdzDoSekcji("about")}
              aria-current={aktywneONas ? "page" : undefined}
            >
              {tekst.aboutNav}
            </button>
          </nav>

          {/* odpowiada za akcje glowne (motyw, logowanie, trial, mobile menu) */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="mr-1 hidden items-center gap-1 2xl:flex">
              <div className="relative">
                <button
                  type="button"
                  className={cx(
                    "pd-focus-ring pd-enterprise-chip inline-flex h-10 items-center gap-2 rounded-2xl px-3 transition",
                    desktopDropdown === "language" && "pd-nav-pill-active"
                  )}
                  onClick={() =>
                    setDesktopDropdown((aktualne) => (aktualne === "language" ? null : "language"))
                  }
                  aria-label={tekst.languageButtonAria}
                  aria-haspopup="menu"
                  aria-expanded={desktopDropdown === "language"}
                  aria-controls={languageMenuId}
                >
                  {lang === "pl" ? <IkonaFlagiPolski /> : <IkonaFlagiAnglii />}
                  <span className="text-[11px] font-bold tracking-[0.1em] text-slate-700 dark:text-slate-200">
                    {lang === "pl" ? "PL" : "EN"}
                  </span>
                  <span aria-hidden="true" className="text-[10px] opacity-70">
                    ▾
                  </span>
                </button>

                <div
                  id={languageMenuId}
                  role="menu"
                  aria-label={tekst.languageListAria}
                  className={cx(
                    "pd-dropdown absolute right-0 top-full z-50 w-[190px] pt-2",
                    desktopDropdown === "language" ? "pd-dropdown-open" : "pd-dropdown-closed"
                  )}
                >
                  <div className={dropdownShellCls}>
                    <ul className="grid gap-1">
                      <li>
                        <button
                          type="button"
                          role="menuitemradio"
                          className={cx(
                            "w-full rounded-xl px-2.5 py-2 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                            lang === "pl" && "pd-nav-pill-active"
                          )}
                          onClick={() => wybierzJezyk("pl")}
                          aria-label={tekst.langPlAria}
                          aria-checked={lang === "pl"}
                        >
                          <span className="inline-flex items-center gap-2">
                            <IkonaFlagiPolski />
                            <span className="text-sm font-semibold">{tekst.languagePlLabel}</span>
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          role="menuitemradio"
                          className={cx(
                            "w-full rounded-xl px-2.5 py-2 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                            lang === "en" && "pd-nav-pill-active"
                          )}
                          onClick={() => wybierzJezyk("en")}
                          aria-label={tekst.langEnAria}
                          aria-checked={lang === "en"}
                        >
                          <span className="inline-flex items-center gap-2">
                            <IkonaFlagiAnglii />
                            <span className="text-sm font-semibold">{tekst.languageEnLabel}</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={themeGroupCls} role="group" aria-label={tekst.themeGroupAria}>
                <button
                  type="button"
                  className={cx("pd-focus-ring", themeChoiceCls(motyw === "dark"))}
                  onClick={() => ustawMotyw("dark")}
                  aria-label={tekst.darkThemeAria}
                  aria-pressed={motyw === "dark"}
                >
                  <IkonaCiemna />
                </button>
                <button
                  type="button"
                  className={cx("pd-focus-ring", themeChoiceCls(motyw === "light"))}
                  onClick={() => ustawMotyw("light")}
                  aria-label={tekst.lightThemeAria}
                  aria-pressed={motyw === "light"}
                >
                  <IkonaSwiatla />
                </button>
              </div>
            </div>

            <button type="button" className={cx(pillButtonCls, "hidden xl:inline-flex")} onClick={onLogin}>
              {tekst.login}
            </button>

            <button
              type="button"
              className={cx(primaryButtonCls, "hidden min-w-0 lg:inline-flex")}
              onClick={onCta}
            >
              <span className="hidden 2xl:inline">{tekst.dashboardCta}</span>
              <span className="inline 2xl:hidden">{tekst.dashboardShort}</span>
            </button>

            <button
              type="button"
              className="pd-enterprise-chip lg:hidden grid h-10 w-10 place-items-center rounded-2xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-transparent"
              onClick={() => {
                setMobileOpen((aktualne) => !aktualne);
                setMobileRozwiniecie(null);
                setMobileJezykOpen(false);
              }}
              aria-label={mobileOpen ? tekst.closeMenu : tekst.openMenu}
              aria-expanded={mobileOpen}
              aria-controls={mobileMenuId}
            >
              ☰
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            id={mobileMenuId}
            className="lg:hidden mt-3 pd-glass pd-edge pd-innerglow rounded-2xl p-4"
            role="navigation"
            aria-label={tekst.mobileMenuAria}
          >
            <div className="grid gap-2">
              {/* odpowiada za sekcje rozwijane Funkcje i Integracje w menu mobilnym */}
              <div className="rounded-xl border border-black/10 bg-white/35 p-1 dark:border-white/10 dark:bg-white/5">
                <button
                  type="button"
                  className={cx(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-semibold text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                    (aktywneFunkcje || mobileRozwiniecie === "features") && "pd-nav-pill-active"
                  )}
                  aria-expanded={mobileRozwiniecie === "features"}
                  aria-controls={mobileFeaturesMenuId}
                  onClick={() => toggleMobileRozwiniecie("features")}
                >
                  <span>{tekst.functionsNav}</span>
                  <span aria-hidden="true" className="text-xs opacity-70">
                    {mobileRozwiniecie === "features" ? "▴" : "▾"}
                  </span>
                </button>
                <div
                  id={mobileFeaturesMenuId}
                  className={cx(
                    "overflow-hidden px-2 transition-[max-height,opacity] duration-200",
                    mobileRozwiniecie === "features" ? "max-h-[420px] opacity-100 pb-2" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="grid gap-1">
                    {featuresItems.map((it) => (
                      <button
                        key={`mobile-feature-${it.label}`}
                        type="button"
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
                        onClick={() => {
                          it.onClick();
                          setMobileOpen(false);
                          setMobileRozwiniecie(null);
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" aria-hidden="true" />
                        {it.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={cx(
                  "block w-full rounded-xl px-3 py-2 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                  aktywnyCennik ? "pd-nav-pill-active" : ""
                )}
                onClick={() => przejdzDoSekcji("pricing")}
                aria-current={aktywnyCennik ? "page" : undefined}
              >
                {tekst.pricingNav}
              </button>

              <div className="rounded-xl border border-black/10 bg-white/35 p-1 dark:border-white/10 dark:bg-white/5">
                <button
                  type="button"
                  className={cx(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-semibold text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                    (aktywneIntegracje || mobileRozwiniecie === "integrations") && "pd-nav-pill-active"
                  )}
                  aria-expanded={mobileRozwiniecie === "integrations"}
                  aria-controls={mobileIntegrationsMenuId}
                  onClick={() => toggleMobileRozwiniecie("integrations")}
                >
                  <span>{tekst.integrationsNav}</span>
                  <span aria-hidden="true" className="text-xs opacity-70">
                    {mobileRozwiniecie === "integrations" ? "▴" : "▾"}
                  </span>
                </button>
                <div
                  id={mobileIntegrationsMenuId}
                  className={cx(
                    "overflow-hidden px-2 transition-[max-height,opacity] duration-200",
                    mobileRozwiniecie === "integrations"
                      ? "max-h-[240px] opacity-100 pb-2"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="grid gap-1">
                    {integrationsItems.map((it) => (
                      <button
                        key={`mobile-integration-${it.label}`}
                        type="button"
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
                        onClick={() => {
                          it.onClick();
                          setMobileOpen(false);
                          setMobileRozwiniecie(null);
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80" aria-hidden="true" />
                        {it.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={cx(
                  "block w-full rounded-xl px-3 py-2 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                  aktywnaWiedza ? "pd-nav-pill-active" : ""
                )}
                onClick={() => przejdzDoSekcji("knowledge")}
                aria-current={aktywnaWiedza ? "page" : undefined}
              >
                {tekst.knowledgeNav}
              </button>

              <button
                type="button"
                className={cx(
                  "block w-full rounded-xl px-3 py-2 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                  aktywneONas ? "pd-nav-pill-active" : ""
                )}
                onClick={() => przejdzDoSekcji("about")}
                aria-current={aktywneONas ? "page" : undefined}
              >
                {tekst.aboutNav}
              </button>
            </div>

            {/* odpowiada za akcje pomocnicze i jezyk/motyw na mobile */}
            <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
              <div className="flex items-start gap-2">
                <div className="relative">
                  <button
                    type="button"
                    className={cx(
                      "pd-focus-ring pd-enterprise-chip inline-flex h-10 items-center gap-2 rounded-2xl px-3 transition",
                      mobileJezykOpen && "pd-nav-pill-active"
                    )}
                    onClick={() => setMobileJezykOpen((aktualne) => !aktualne)}
                    aria-label={tekst.languageButtonAria}
                    aria-haspopup="menu"
                    aria-expanded={mobileJezykOpen}
                    aria-controls={mobileLanguageMenuId}
                  >
                    {lang === "pl" ? <IkonaFlagiPolski /> : <IkonaFlagiAnglii />}
                    <span className="text-[11px] font-bold tracking-[0.1em] text-slate-700 dark:text-slate-200">
                      {lang === "pl" ? "PL" : "EN"}
                    </span>
                    <span aria-hidden="true" className="text-[10px] opacity-70">
                      ▾
                    </span>
                  </button>

                  <div
                    id={mobileLanguageMenuId}
                    role="menu"
                    aria-label={tekst.languageListAria}
                    className={cx(
                      "pd-dropdown absolute left-0 top-full z-50 w-[190px] pt-2",
                      mobileJezykOpen ? "pd-dropdown-open" : "pd-dropdown-closed"
                    )}
                  >
                    <div className={dropdownShellCls}>
                      <ul className="grid gap-1">
                        <li>
                          <button
                            type="button"
                            role="menuitemradio"
                            className={cx(
                              "w-full rounded-xl px-2.5 py-2 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                              lang === "pl" && "pd-nav-pill-active"
                            )}
                            onClick={() => wybierzJezyk("pl")}
                            aria-label={tekst.langPlAria}
                            aria-checked={lang === "pl"}
                          >
                            <span className="inline-flex items-center gap-2">
                              <IkonaFlagiPolski />
                              <span className="text-sm font-semibold">{tekst.languagePlLabel}</span>
                            </span>
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            role="menuitemradio"
                            className={cx(
                              "w-full rounded-xl px-2.5 py-2 text-left text-slate-900 transition hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/5",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                              lang === "en" && "pd-nav-pill-active"
                            )}
                            onClick={() => wybierzJezyk("en")}
                            aria-label={tekst.langEnAria}
                            aria-checked={lang === "en"}
                          >
                            <span className="inline-flex items-center gap-2">
                              <IkonaFlagiAnglii />
                              <span className="text-sm font-semibold">{tekst.languageEnLabel}</span>
                            </span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={themeGroupCls} role="group" aria-label={tekst.themeGroupAria}>
                  <button
                  type="button"
                  className={cx("pd-focus-ring", themeChoiceCls(motyw === "dark"))}
                  onClick={() => ustawMotyw("dark")}
                  aria-label={tekst.darkThemeAria}
                  aria-pressed={motyw === "dark"}
                  >
                    <IkonaCiemna />
                  </button>
                  <button
                  type="button"
                  className={cx("pd-focus-ring", themeChoiceCls(motyw === "light"))}
                  onClick={() => ustawMotyw("light")}
                  aria-label={tekst.lightThemeAria}
                  aria-pressed={motyw === "light"}
                  >
                    <IkonaSwiatla />
                  </button>
                </div>

                <div className="flex-1" />

                <button type="button" className={pillButtonCls} onClick={onLogin}>
                  {tekst.login}
                </button>
              </div>

              <button type="button" className={cx(primaryButtonCls, "mt-3 w-full")} onClick={onCta}>
                {tekst.dashboardCta}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeaderCinematic;
