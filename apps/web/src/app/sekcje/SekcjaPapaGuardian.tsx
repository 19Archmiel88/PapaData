import { PapaGuardianPanel } from "../../components/guardian/PapaGuardianPanel";
import { useUI } from "../../context/useUI";

type SekcjaPapaGuardianProps = {
  onUruchomAnalize: () => void;
};

type ZasadaGuardiana = {
  nazwa: string;
  opis: string;
};

type TekstySekcjiGuardiana = {
  kicker: string;
  tytul: string;
  opis: string;
  cta: string;
  zasady: ZasadaGuardiana[];
};

const TEKSTY_SEKCJI_GUARDIANA: Record<"pl" | "en", TekstySekcjiGuardiana> = {
  pl: {
    kicker: "Papa Guardian",
    tytul: "Warstwa AI, ktora pilnuje decyzji i marzy.",
    opis:
      "Guardian nie generuje przypadkowych insightow. Najpierw laczy sygnaly z kampanii, produktow i kosztow, a potem podaje kroki z najwyzszym efektem finansowym.",
    cta: "Uruchom analize Guardian",
    zasady: [
      {
        nazwa: "Priorytety",
        opis: "Rozroznia, co jest pilne, co jest ryzykiem i co jest okazja.",
      },
      {
        nazwa: "Wyjasnienia",
        opis: "Kazda rekomendacja zawiera przyczyne i oczekiwany efekt finansowy.",
      },
      {
        nazwa: "Symulacje",
        opis: "Porownuje scenariusz wdrozenia i scenariusz braku decyzji.",
      },
    ],
  },
  en: {
    kicker: "Papa Guardian",
    tytul: "AI layer that protects decisions and margin.",
    opis:
      "Guardian does not generate random insights. It first unifies campaign, product, and cost signals, then recommends steps with the highest financial impact.",
    cta: "Run Guardian analysis",
    zasady: [
      {
        nazwa: "Priorities",
        opis: "Separates urgent actions from risks and growth opportunities.",
      },
      {
        nazwa: "Explanations",
        opis: "Every recommendation includes reason and expected financial effect.",
      },
      {
        nazwa: "Simulations",
        opis: "Compares implementation scenario with no-action scenario.",
      },
    ],
  },
};

export function SekcjaPapaGuardian({ onUruchomAnalize }: SekcjaPapaGuardianProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_SEKCJI_GUARDIANA[jezyk];

  return (
    <section
      className="pd-container pd-reveal py-12 md:py-14"
      aria-labelledby="guardian-tytul"
      data-pd-reveal="guardian"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-stretch">
        {/* odpowiada za pozycjonowanie wartosci Papa Guardian */}
        <article className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft pd-section-shell h-full border border-black/10 dark:border-white/10">
          <p className="pd-section-kicker">
            {tekst.kicker}
          </p>
          <h2 id="guardian-tytul" className="pd-section-title">
            {tekst.tytul}
          </h2>
          <p className="pd-section-lead">
            {tekst.opis}
          </p>

          <ul className="mt-6 space-y-3">
            {tekst.zasady.map((zasada) => (
              <li key={zasada.nazwa} className="pd-enterprise-card-muted rounded-2xl px-4 py-3">
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">{zasada.nazwa}</p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{zasada.opis}</p>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <button
              type="button"
              onClick={onUruchomAnalize}
              className="pd-btn-primary pd-focus-ring h-12 rounded-2xl px-6 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
            >
              {tekst.cta}
            </button>
          </div>
        </article>

        {/* odpowiada za osadzony panel Vertex z interakcjami i scenariuszami */}
        <article className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft h-full rounded-[30px] border border-black/10 p-4 md:p-5 dark:border-white/10">
          <PapaGuardianPanel
            wariant="sekcja"
            className="h-full"
            dopasujWysokosc={true}
            automatycznaPrezentacja={true}
            onOpenReport={onUruchomAnalize}
          />
        </article>
      </div>
    </section>
  );
}

export default SekcjaPapaGuardian;
