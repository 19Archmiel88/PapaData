import { useMemo, useState } from "react";
import {
  ModalSzczegolowFunkcji,
  type SzczegolyFunkcji,
} from "../../components/modale/ModalSzczegolowFunkcji";
import { useUI } from "../../context/useUI";
import { FUNKCJE_RAPORTOWE, lokalizujFunkcjeRaportowa } from "./daneFunkcjiRaportowych";

type TekstySekcjiRaportow = {
  kicker: string;
  tytul: string;
  lead: string;
  problemLabel: string;
  decyzjaLabel: string;
  efektLabel: string;
  detailsLabel: string;
  showAllLabel: string;
  showLessLabel: string;
  ariaGrid: string;
  ariaOpenDetails: (nazwaFunkcji: string) => string;
};

const LIMIT_POCZATKOWYCH_KART = 6;

const TEKSTY_SEKCJI: Record<"pl" | "en", TekstySekcjiRaportow> = {
  pl: {
    kicker: "Kluczowe raporty gotowe do działania",
    tytul: "Kluczowe Raporty Gotowe Dla Ciebie",
    lead: "Moduły działają na jednym modelu danych BigQuery — zapewniając spójne widoki kosztów, sprzedaży i zysku. Kontroluj kampanie, wykrywaj anomalie i skaluj dzięki głębokim wglądom.",
    problemLabel: "Problem",
    decyzjaLabel: "Decyzja",
    efektLabel: "Efekt",
    detailsLabel: "Zobacz szczegóły",
    showAllLabel: "Pokaż wszystkie moduły",
    showLessLabel: "Pokaż mniej",
    ariaGrid: "Katalog modułów raportowych",
    ariaOpenDetails: (nazwaFunkcji) => `Otwórz szczegóły funkcji ${nazwaFunkcji}`,
  },
  en: {
    kicker: "Key reports ready to execute",
    tytul: "Each module supports a specific business decision.",
    lead: "PapaData runs on one data model, so reporting stays consistent across marketing, sales, and finance.",
    problemLabel: "Problem",
    decyzjaLabel: "Decision",
    efektLabel: "Impact",
    detailsLabel: "View details",
    showAllLabel: "Show all modules",
    showLessLabel: "Show less",
    ariaGrid: "Catalog of reporting modules",
    ariaOpenDetails: (nazwaFunkcji) => `Open details for ${nazwaFunkcji}`,
  },
};

export function SekcjaRaporty() {
  const { jezyk } = useUI();
  const tekst = TEKSTY_SEKCJI[jezyk];
  const [otwartyRaportId, setOtwartyRaportId] = useState<string | null>(null);
  const [czyPokazacWszystkie, setCzyPokazacWszystkie] = useState(false);

  const raporty = useMemo(
    () => FUNKCJE_RAPORTOWE.map((raport) => lokalizujFunkcjeRaportowa(raport, jezyk)),
    [jezyk]
  );

  const raportyWidoczne = useMemo(() => {
    if (czyPokazacWszystkie) return raporty;
    return raporty.slice(0, LIMIT_POCZATKOWYCH_KART);
  }, [raporty, czyPokazacWszystkie]);

  const czyMoznaRozwinac = raporty.length > LIMIT_POCZATKOWYCH_KART;

  const otwartyRaport = useMemo<SzczegolyFunkcji | null>(() => {
    if (!otwartyRaportId) return null;
    return raporty.find((raport) => raport.id === otwartyRaportId) ?? null;
  }, [raporty, otwartyRaportId]);

  return (
    <section
      className="pd-container pd-reveal py-12 md:py-16"
      aria-labelledby="raporty-tytul"
      data-pd-reveal="raporty"
    >
      <div className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft pd-section-shell border border-black/10 dark:border-white/10">
        {/* odpowiada za naglowek sekcji raportow */}
        <header className="max-w-[76ch]">
          <p className="pd-section-kicker">{tekst.kicker}</p>
          <h2 id="raporty-tytul" className="pd-section-title">
            {tekst.tytul}
          </h2>
          <p className="pd-section-lead">{tekst.lead}</p>
        </header>

        {/* odpowiada za katalog modulow analitycznych z hierarchia problem/decyzja/efekt */}
        <div id="raporty-katalog" className="mt-8 pd-bento-grid" aria-label={tekst.ariaGrid}>
          {raportyWidoczne.map((raport) => (
            <button
              key={raport.id}
              type="button"
              onClick={() => setOtwartyRaportId(raport.id)}
              aria-label={tekst.ariaOpenDetails(raport.nazwa)}
              className={[
                "pd-enterprise-card pd-enterprise-card-interactive pd-focus-ring rounded-[22px] p-5 text-left",
                raport.wariantKarty === "szeroka" ? "pd-bento-span-2" : "",
              ].join(" ")}
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{raport.nazwa}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                {raport.opis}
              </p>

              <div className="mt-4 space-y-2.5">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <span className="mr-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                    {tekst.problemLabel}
                  </span>
                  {raport.modelKarty.problem}
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <span className="mr-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                    {tekst.decyzjaLabel}
                  </span>
                  {raport.modelKarty.decyzja}
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <span className="mr-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300">
                    {tekst.efektLabel}
                  </span>
                  {raport.modelKarty.efekt}
                </p>
              </div>

              <div className="mt-5 text-xs font-extrabold tracking-[0.14em] uppercase text-violet-700 dark:text-violet-300">
                {tekst.detailsLabel}
              </div>
            </button>
          ))}
        </div>

        {/* odpowiada za progressive disclosure katalogu (6 kart domyslnie) */}
        {czyMoznaRozwinac && (
          <footer className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setCzyPokazacWszystkie((aktualne) => !aktualne)}
              className="pd-btn-secondary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 dark:text-slate-100"
              aria-controls="raporty-katalog"
              aria-expanded={czyPokazacWszystkie}
            >
              {czyPokazacWszystkie ? tekst.showLessLabel : tekst.showAllLabel}
            </button>
          </footer>
        )}
      </div>

      <ModalSzczegolowFunkcji
        otwarty={otwartyRaport !== null}
        funkcja={otwartyRaport}
        onZamknij={() => setOtwartyRaportId(null)}
      />
    </section>
  );
}

export default SekcjaRaporty;
