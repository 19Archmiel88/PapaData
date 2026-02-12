import { useUI } from "../../context/useUI";

type SekcjaFinalneCtaProps = {
  onPrimary: () => void;
  onSecondary: () => void;
};

type TekstyFinalnegoCta = {
  kicker: string;
  tytul: string;
  lead: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryAria: string;
  ctaSecondaryAria: string;
  badgeZaufania: string[];
};

const TEKSTY_FINALNEGO_CTA: Record<"pl" | "en", TekstyFinalnegoCta> = {
  pl: {
    kicker: "Gotowość wdrożeniowa",
    tytul: "Zamień dane i sygnały AI w codzienne decyzje wzrostowe.",
    lead: "Uruchom trial i zobacz pierwsze rekomendacje Guardiana bez przebudowy stacku danych. Jeśli potrzebujesz wsparcia wdrożeniowego, przejdź do ścieżki demo.",
    ctaPrimary: "Rozpocznij 14-dniowy trial",
    ctaSecondary: "Zobacz demo",
    ctaPrimaryAria: "Rozpocznij 14-dniowy trial PapaData",
    ctaSecondaryAria: "Przejdź do wersji demo",
    badgeZaufania: ["Bez karty", "Dane w UE", "Wsparcie wdrożenia"],
  },
  en: {
    kicker: "Implementation readiness",
    tytul: "Turn data and AI signals into daily growth decisions.",
    lead: "Start a trial and see first Guardian recommendations without rebuilding your data stack. If you need implementation support, use the demo path.",
    ctaPrimary: "Start 14-day trial",
    ctaSecondary: "View demo",
    ctaPrimaryAria: "Start PapaData 14-day trial",
    ctaSecondaryAria: "Go to demo flow",
    badgeZaufania: ["No card", "EU data", "Implementation support"],
  },
};

export function SekcjaFinalneCta({ onPrimary, onSecondary }: SekcjaFinalneCtaProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_FINALNEGO_CTA[jezyk];

  return (
    <section
      className="pd-container pd-reveal py-12 md:py-16"
      aria-labelledby="finalne-cta-tytul"
      data-pd-reveal="finalne-cta"
    >
      <div className="relative overflow-hidden rounded-[30px] border border-black/10 bg-[var(--pd-card-bg)] p-7 shadow-[var(--pd-card-shadow)] md:p-10 dark:border-white/10">
        {/* odpowiada za ambient sekcji finalnego domkniecia konwersji */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(62% 58% at 12% 12%, rgba(31,163,255,0.14), transparent 70%), radial-gradient(56% 52% at 88% 92%, rgba(57,214,255,0.14), transparent 72%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[900px] text-center">
          {/* odpowiada za naglowek i jednoznaczna obietnice finalnego CTA */}
          <p className="pd-section-kicker text-slate-600 dark:text-slate-300">
            {tekst.kicker}
          </p>
          <h2 id="finalne-cta-tytul" className="pd-section-title">
            {tekst.tytul}
          </h2>
          <p className="pd-section-lead mx-auto mt-4 max-w-[66ch] text-slate-700 dark:text-slate-300">
            {tekst.lead}
          </p>

          {/* odpowiada za finalna hierarchie CTA w sekcji domykajacej */}
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onPrimary}
              className="pd-btn-primary pd-focus-ring h-12 rounded-2xl px-8 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
              aria-label={tekst.ctaPrimaryAria}
            >
              {tekst.ctaPrimary}
            </button>

            <button
              type="button"
              onClick={onSecondary}
              className="pd-btn-secondary pd-focus-ring h-12 rounded-2xl px-8 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 dark:text-slate-100"
              aria-label={tekst.ctaSecondaryAria}
            >
              {tekst.ctaSecondary}
            </button>
          </div>

          {/* odpowiada za trust-markery wspierajace decyzje przy finalnym CTA */}
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-extrabold tracking-[0.14em] uppercase text-slate-600 dark:text-slate-300">
            {tekst.badgeZaufania.map((badge) => (
              <li key={badge} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default SekcjaFinalneCta;
