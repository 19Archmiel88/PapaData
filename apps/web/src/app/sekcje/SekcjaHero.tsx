import { useEffect, useRef, useState } from "react";
import { PapaGuardianPanel } from "../../components/guardian/PapaGuardianPanel";
import { AnimowanyHero } from "../../components/hero/AnimowanyHero";
import { useUI } from "../../context/useUI";

type SekcjaHeroProps = {
  onPrimary: () => void;
  onSecondary: () => void;
  onOpenAnalysis: () => void;
  onGuardianProcessingChange?: (stan: "bezczynny" | "przetwarzanie") => void;
};

type TekstyHero = {
  tytulLinia1: string;
  tytulLinia2: string;
  tytulLinia3: string;
  tytulLinia4: string;
  lead: string;
  opis: string;
  ctaPrimary: string;
  ctaPrimaryAria: string;
  ctaSecondary: string;
  ctaSecondaryAria: string;
  trustNoCard: string;
  trustEu: string;
  trustNoCode: string;
  panelAria: string;
};

const TEKSTY_HERO: Record<"pl" | "en", TekstyHero> = {
  pl: {
    tytulLinia1: "Analizuje dane e-commerce",
    tytulLinia2: "oraz daje rekomendacje",
    tytulLinia3: "dla wzrostu",
    tytulLinia4: "Twojego biznesu.",
    lead: "PapaData to AI tworzone przez zawodowych marketerów dla e-commerce.",
    opis:
      "Połącz dane ze sklepu, marketplace'ów i reklam w jeden spójny model w BigQuery. PapaData codziennie generuje raporty i alerty, żebyś nie składał tego ręcznie. Wypróbuj inteligentną platformę marketingową PapaData.",
    ctaPrimary: "Rozpocznij 14-dniowy trial",
    ctaPrimaryAria: "Rozpocznij 14-dniowy trial PapaData",
    ctaSecondary: "Zobacz demo",
    ctaSecondaryAria: "Zobacz demo produktu PapaData",
    trustNoCard: "Bez karty",
    trustEu: "Dane w UE",
    trustNoCode: "Bez kodowania",
    panelAria: "Podgląd Papa Guardian",
  },
  en: {
    tytulLinia1: "Analyze e-commerce data",
    tytulLinia2: "and get recommendations",
    tytulLinia3: "for growth.",
    tytulLinia4: "Your business.",
    lead: "PapaData is AI built by professional marketers for e-commerce.",
    opis:
      "Connect store, marketplace, and ads data into one coherent BigQuery model. PapaData generates daily reports and alerts, so you do not assemble this manually. Try PapaData intelligent marketing platform.",
    ctaPrimary: "Start 14-day trial",
    ctaPrimaryAria: "Start PapaData 14-day trial",
    ctaSecondary: "Watch demo",
    ctaSecondaryAria: "Watch PapaData product demo",
    trustNoCard: "No card required",
    trustEu: "EU data hosting",
    trustNoCode: "No coding required",
    panelAria: "Papa Guardian preview",
  },
};

export function SekcjaHero({
  onPrimary,
  onSecondary,
  onOpenAnalysis,
  onGuardianProcessingChange,
}: SekcjaHeroProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_HERO[jezyk];
  const kolumnaWartosciRef = useRef<HTMLDivElement | null>(null);
  const [wysokoscKolumnyHero, setWysokoscKolumnyHero] = useState<number | null>(null);

  // odpowiada za wyrownanie wysokosci lewej i prawej kolumny Hero na desktopie
  useEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") return;
    const kolumna = kolumnaWartosciRef.current;
    if (!kolumna) return;

    const media = window.matchMedia("(min-width: 1024px)");
    let rafId = 0;

    const aktualizujWysokosc = () => {
      if (!media.matches) {
        setWysokoscKolumnyHero(null);
        return;
      }

      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        const nastepnaWysokosc = Math.ceil(kolumna.getBoundingClientRect().height);
        setWysokoscKolumnyHero((poprzednia) =>
          poprzednia === nastepnaWysokosc ? poprzednia : nastepnaWysokosc
        );
      });
    };

    aktualizujWysokosc();

    const observer = new ResizeObserver(() => aktualizujWysokosc());
    observer.observe(kolumna);
    window.addEventListener("resize", aktualizujWysokosc, { passive: true });

    const onMediaChange = () => aktualizujWysokosc();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onMediaChange);
    } else {
      media.addListener(onMediaChange);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", aktualizujWysokosc);
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", onMediaChange);
      } else {
        media.removeListener(onMediaChange);
      }
    };
  }, []);

  return (
    <section className="pd-container pd-reveal pb-18 pt-28 md:pb-24 md:pt-36" data-pd-reveal="hero">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-stretch">
        {/* odpowiada za glowna obietnice wartosci i CTA */}
        <div ref={kolumnaWartosciRef} className="h-full">
          <AnimowanyHero className="relative z-[var(--z-content)] h-full" intensywnoscGlow={1.02}>
            <h1 className="pd-hero-title">
              <span className="block lg:whitespace-nowrap">{tekst.tytulLinia1}</span>
              <span className="block lg:whitespace-nowrap">{tekst.tytulLinia2}</span>
              <span className="block lg:whitespace-nowrap">{tekst.tytulLinia3}</span>
              <span className="block lg:whitespace-nowrap">{tekst.tytulLinia4}</span>
            </h1>

            <p className="pd-section-lead text-slate-900 dark:text-slate-200/94">
              {tekst.lead}
            </p>

            <p className="mt-4 text-base font-semibold leading-relaxed text-slate-900 dark:text-slate-200/90">
              {tekst.opis}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onPrimary}
                className="pd-btn-primary pd-focus-ring h-14 rounded-[18px] px-8 text-base font-bold text-white"
                aria-label={tekst.ctaPrimaryAria}
              >
                {tekst.ctaPrimary}
              </button>

              <button
                type="button"
                onClick={onSecondary}
                className="pd-btn-secondary pd-focus-ring h-14 rounded-[18px] px-7 text-base font-bold text-slate-900 dark:text-slate-100"
                aria-label={tekst.ctaSecondaryAria}
              >
                {tekst.ctaSecondary}
              </button>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-900 dark:text-slate-200/90">
              <li className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                {tekst.trustNoCard}
              </li>
              <li className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                {tekst.trustEu}
              </li>
              <li className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                {tekst.trustNoCode}
              </li>
            </ul>
          </AnimowanyHero>
        </div>

        {/* odpowiada za panel Papa Guardian z auto-zmieniajacymi sie ekranami */}
        <aside
          className="relative z-[var(--z-content)] h-full lg:self-stretch"
          aria-label={tekst.panelAria}
          style={wysokoscKolumnyHero ? { height: `${wysokoscKolumnyHero}px` } : undefined}
        >
          <PapaGuardianPanel
            wariant="sekcja"
            className="h-full"
            dopasujWysokosc={true}
            automatycznaPrezentacja={true}
            onOpenReport={onOpenAnalysis}
            onStanSilnikaChange={onGuardianProcessingChange}
          />
        </aside>
      </div>
    </section>
  );
}

export default SekcjaHero;
