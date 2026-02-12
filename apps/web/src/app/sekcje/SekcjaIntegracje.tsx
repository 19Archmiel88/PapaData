import { useMemo, useState } from "react";
import { ModalIntegracji } from "../../components/integracje/ModalIntegracji";
import {
  INTEGRACJE_KATALOG,
  type IntegracjaKatalogu,
  lokalizujIntegracjeKatalog,
} from "../../components/integracje/katalogIntegracji";
import { IkonaIntegracji } from "../../components/integracje/IkonaIntegracji";
import { ModalPolaczeniaIntegracji } from "../../components/modale/ModalPolaczeniaIntegracji";
import { ModalWkrotce } from "../../components/modale/ModalWkrotce";
import { useUI } from "../../context/useUI";

const LIMIT_POCZATKOWYCH_KAFELI = 8;

type SekcjaIntegracjeProps = {
  onUruchomWarsztat: () => void;
};

type TekstySekcjiIntegracji = {
  kicker: string;
  tytul: string;
  lead: string;
  authLabel: string;
  showAll: string;
  showLess: string;
  openCatalog: string;
  openSettingsAria: (nazwa: string) => string;
};

const TEKSTY_SEKCJI_INTEGRACJI: Record<"pl" | "en", TekstySekcjiIntegracji> = {
  pl: {
    kicker: "Integracje",
    tytul: "Połącz cały ekosystem w jeden model danych.",
    lead: "PapaData redukuje koszt wdrożenia, bo dane ze sklepu, marketplace i reklam trafiają do jednej warstwy analitycznej. Raporty i KPI są gotowe od pierwszego dnia.",
    authLabel: "Typ autoryzacji",
    showAll: "Pokaż wszystkie integracje",
    showLess: "Pokaż mniej",
    openCatalog: "Sprawdź listę integracji",
    openSettingsAria: (nazwa) => `Otwórz ustawienia integracji ${nazwa}`,
  },
  en: {
    kicker: "Integrations",
    tytul: "Connect your full ecosystem into one data model.",
    lead: "PapaData reduces implementation cost by consolidating store, marketplace, and ads data into one analytics layer. Reports and KPIs are ready from day one.",
    authLabel: "Auth type",
    showAll: "Show all integrations",
    showLess: "Show less",
    openCatalog: "View integrations list",
    openSettingsAria: (nazwa) => `Open integration settings for ${nazwa}`,
  },
};

export function SekcjaIntegracje({ onUruchomWarsztat }: SekcjaIntegracjeProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_SEKCJI_INTEGRACJI[jezyk];
  const [modalKatalogOtwarty, setModalKatalogOtwarty] = useState(false);
  const [integracjaDoPolaczenia, setIntegracjaDoPolaczenia] = useState<IntegracjaKatalogu | null>(
    null
  );
  const [integracjaWkrotce, setIntegracjaWkrotce] = useState<string | null>(null);
  const [czyPokazacWszystkie, setCzyPokazacWszystkie] = useState(false);

  const integracjeLokalizowane = useMemo(
    () => INTEGRACJE_KATALOG.map((integracja) => lokalizujIntegracjeKatalog(integracja, jezyk)),
    [jezyk]
  );

  const integracjeWidoczne = useMemo(() => {
    if (czyPokazacWszystkie) return integracjeLokalizowane;
    return integracjeLokalizowane.slice(0, LIMIT_POCZATKOWYCH_KAFELI);
  }, [czyPokazacWszystkie, integracjeLokalizowane]);

  const czyMoznaRozwinac = integracjeLokalizowane.length > LIMIT_POCZATKOWYCH_KAFELI;

  const onWybierzIntegracje = (integracja: IntegracjaKatalogu) => {
    setModalKatalogOtwarty(false);
    if (integracja.status === "wkrotce") {
      setIntegracjaWkrotce(integracja.nazwa);
      return;
    }
    setIntegracjaDoPolaczenia(integracja);
  };

  const onPolaczIntegracje = async (integracja: IntegracjaKatalogu) => {
    if (integracja.status === "wkrotce") return;
    onUruchomWarsztat();
  };

  return (
    <section
      className="pd-container pd-reveal py-12 md:py-16"
      aria-labelledby="integracje-tytul"
      data-pd-reveal="integracje"
    >
      <div className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft pd-section-shell border border-black/10 dark:border-white/10">
        {/* odpowiada za komunikat gotowosci integracyjnej */}
        <header className="max-w-[70ch]">
          <p className="pd-section-kicker">{tekst.kicker}</p>
          <h2 id="integracje-tytul" className="pd-section-title">
            {tekst.tytul}
          </h2>
          <p className="pd-section-lead">{tekst.lead}</p>
        </header>

        {/* odpowiada za katalog konektorow */}
        <div
          id="integracje-kafle"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {integracjeWidoczne.map((integracja) => (
            <button
              key={integracja.id}
              type="button"
              onClick={() => onWybierzIntegracje(integracja)}
              className="pd-enterprise-card-muted pd-enterprise-card-interactive pd-focus-ring flex min-h-[136px] flex-col justify-between rounded-2xl px-5 py-4 text-left text-sm font-bold text-slate-800 dark:text-slate-100"
              aria-label={tekst.openSettingsAria(integracja.nazwa)}
            >
              <span className="inline-flex items-start gap-3">
                <IkonaIntegracji
                  nazwa={integracja.nazwa}
                  kategoria={integracja.kategoria}
                  rozmiar="md"
                  kolor={integracja.kolor}
                  skrotNadpisany={integracja.ikonaSkrot}
                />
                <span>
                  <span className="block text-base font-black text-slate-900 dark:text-slate-100">
                    {integracja.nazwa}
                  </span>
                  <span className="mt-1 block text-[11px] font-extrabold tracking-[0.12em] uppercase text-slate-500 dark:text-slate-400">
                    {tekst.authLabel}: {integracja.typAutoryzacji === "oauth2" ? "OAuth2" : "API key"}
                  </span>
                </span>
              </span>

              <span className="mt-3 block text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                {integracja.opis}
              </span>
            </button>
          ))}
        </div>

        {/* odpowiada za progressive disclosure katalogu integracji (8 kafli domyslnie) */}
        {czyMoznaRozwinac && (
          <footer className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setCzyPokazacWszystkie((aktualne) => !aktualne)}
              className="pd-btn-secondary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 dark:text-slate-100"
              aria-controls="integracje-kafle"
              aria-expanded={czyPokazacWszystkie}
            >
              {czyPokazacWszystkie ? tekst.showLess : tekst.showAll}
            </button>
          </footer>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setModalKatalogOtwarty(true)}
            className="pd-btn-primary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
          >
            {tekst.openCatalog}
          </button>
        </div>
      </div>

      <ModalIntegracji
        otwarty={modalKatalogOtwarty}
        onZamknij={() => setModalKatalogOtwarty(false)}
        onWybierzIntegracje={onWybierzIntegracje}
      />

      <ModalPolaczeniaIntegracji
        otwarty={integracjaDoPolaczenia !== null}
        integracja={integracjaDoPolaczenia}
        onZamknij={() => setIntegracjaDoPolaczenia(null)}
        onPotwierdzPolaczenie={onPolaczIntegracje}
      />

      <ModalWkrotce
        otwarty={integracjaWkrotce !== null}
        kontekst={integracjaWkrotce ?? undefined}
        onZamknij={() => setIntegracjaWkrotce(null)}
      />
    </section>
  );
}

export default SekcjaIntegracje;
