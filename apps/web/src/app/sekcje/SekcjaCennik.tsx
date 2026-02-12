import { type KeyboardEvent, useMemo, useState } from "react";
import { useUI } from "../../context/useUI";
import { formatCurrencyPln } from "../../utils/formatters";

type OkresPlatnosci = "miesiecznie" | "rocznie";
type NazwaPlanu = "Starter" | "Professional" | "Enterprise";

type PlanCennika = {
  nazwa: NazwaPlanu;
  cenaRocznaMiesiecznie: number | null;
  cenaMiesieczna: number | null;
  wyrozniony: boolean;
};

type SekcjaCennikProps = {
  onWyborPlanu: (plan: NazwaPlanu) => void;
};

type TresciPlanu = {
  notatka: string;
  opis: string;
  cechyGlowne: [string, string, ...string[]];
  cta: string;
};

type TekstyCennika = {
  kicker: string;
  tytul: string;
  lead: string;
  etykietaRozliczenia: string;
  miesiecznie: string;
  rocznie: string;
  rabatRoczny: string;
  zrodloCen: string;
  enterpriseCena: string;
  enterpriseSubline: string;
  roczneSubline: string;
  miesieczneSubline: string;
  badgeProfessional: string;
  oszczedzaszMiesiecznie: (kwota: string) => string;
  ctaAria: (plan: NazwaPlanu) => string;
  nazwyPlanow: Record<NazwaPlanu, string>;
  tresciPlanow: Record<NazwaPlanu, TresciPlanu>;
};

const PROCENT_RABATU_ROCZNEGO = 18;

const PLANY: PlanCennika[] = [
  {
    nazwa: "Starter",
    cenaRocznaMiesiecznie: 159,
    cenaMiesieczna: 199,
    wyrozniony: false,
  },
  {
    nazwa: "Professional",
    cenaRocznaMiesiecznie: 399,
    cenaMiesieczna: 499,
    wyrozniony: true,
  },
  {
    nazwa: "Enterprise",
    cenaRocznaMiesiecznie: null,
    cenaMiesieczna: null,
    wyrozniony: false,
  },
];

const TEKSTY_CENNIKA: Record<"pl" | "en", TekstyCennika> = {
  pl: {
    kicker: "Cennik bez ukrytych kosztów",
    tytul: "Transparentne plany, jasne limity i czytelna ścieżka decyzji.",
    lead: "Ceny netto i klarowny zakres każdego planu. Bez gwiazdek, bez ukrytych opłat i bez niejasnych limitów.",
    etykietaRozliczenia: "Okres rozliczeniowy",
    miesiecznie: "Miesięcznie",
    rocznie: "Rocznie",
    rabatRoczny: `Rocznie (-${PROCENT_RABATU_ROCZNEGO}%)`,
    zrodloCen: "Ceny netto.",
    enterpriseCena: "Wycena indywidualna",
    enterpriseSubline: "Kontakt z zespołem enterprise",
    roczneSubline: "Przy planie rocznym",
    miesieczneSubline: "Przy rozliczeniu miesięcznym",
    badgeProfessional: "Najczęściej wybierany",
    oszczedzaszMiesiecznie: (kwota) => `Oszczędzasz ${kwota} miesięcznie`,
    ctaAria: (plan) => `Wybierz plan ${plan}`,
    nazwyPlanow: {
      Starter: "Starter",
      Professional: "Professional",
      Enterprise: "Enterprise",
    },
    tresciPlanow: {
      Starter: {
        notatka: "Do 3 źródeł, raport tygodniowy",
        opis: "Plan startowy dla zespołów, które chcą uporządkować dane i raportowanie.",
        cechyGlowne: ["Do 3 źródeł danych", "Raport tygodniowy", "Wsparcie mailowe"],
        cta: "Rozpocznij trial",
      },
      Professional: {
        notatka: "Do 15 źródeł, raport dzienny",
        opis: "Plan operacyjny dla zespołów, które codziennie optymalizują marżę i budżety.",
        cechyGlowne: ["Do 15 źródeł danych", "Raport dzienny", "Alerty priorytetów"],
        cta: "Wybierz Professional",
      },
      Enterprise: {
        notatka: "Nielimitowane źródła, raporty real-time",
        opis: "Wersja dla organizacji z wymaganiami enterprise, SLA i governance.",
        cechyGlowne: ["Nielimitowane źródła", "Raporty real-time", "Dedykowane wsparcie"],
        cta: "Zapytaj o ofertę",
      },
    },
  },
  en: {
    kicker: "Pricing with no hidden fees",
    tytul: "Transparent plans, clear limits, and a simple decision path.",
    lead: "Net pricing and clear scope per plan. No asterisks, no hidden fees, no vague limits.",
    etykietaRozliczenia: "Billing period",
    miesiecznie: "Monthly",
    rocznie: "Yearly",
    rabatRoczny: `Yearly (-${PROCENT_RABATU_ROCZNEGO}%)`,
    zrodloCen: "Net prices.",
    enterpriseCena: "Custom pricing",
    enterpriseSubline: "Contact enterprise team",
    roczneSubline: "With annual plan",
    miesieczneSubline: "With monthly billing",
    badgeProfessional: "Most popular",
    oszczedzaszMiesiecznie: (kwota) => `You save ${kwota} per month`,
    ctaAria: (plan) => `Choose ${plan} plan`,
    nazwyPlanow: {
      Starter: "Starter",
      Professional: "Professional",
      Enterprise: "Enterprise",
    },
    tresciPlanow: {
      Starter: {
        notatka: "Up to 3 sources, weekly report",
        opis: "Entry plan for teams that need structured data and reporting.",
        cechyGlowne: ["Up to 3 data sources", "Weekly report", "Email support"],
        cta: "Start trial",
      },
      Professional: {
        notatka: "Up to 15 sources, daily report",
        opis: "Operational plan for teams optimizing margin and budgets every day.",
        cechyGlowne: ["Up to 15 data sources", "Daily report", "Priority alerts"],
        cta: "Choose Professional",
      },
      Enterprise: {
        notatka: "Unlimited sources, real-time reports",
        opis: "Version for organizations requiring enterprise SLA and governance.",
        cechyGlowne: ["Unlimited sources", "Real-time reports", "Dedicated support"],
        cta: "Request offer",
      },
    },
  },
};

export function SekcjaCennik({ onWyborPlanu }: SekcjaCennikProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_CENNIKA[jezyk];
  const locale = jezyk === "en" ? "en-US" : "pl-PL";
  const [okres, setOkres] = useState<OkresPlatnosci>("rocznie");

  const plansze = useMemo(
    () =>
      PLANY.map((plan) => {
        if (plan.cenaMiesieczna === null || plan.cenaRocznaMiesiecznie === null) {
          return {
            ...plan,
            cenaAktywna: null as number | null,
            oszczednoscMiesieczna: null as number | null,
          };
        }

        return {
          ...plan,
          cenaAktywna: okres === "rocznie" ? plan.cenaRocznaMiesiecznie : plan.cenaMiesieczna,
          oszczednoscMiesieczna: Math.max(plan.cenaMiesieczna - plan.cenaRocznaMiesiecznie, 0),
        };
      }),
    [okres]
  );

  const onToggleOkresKlawiatura = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setOkres((aktualny) => (aktualny === "miesiecznie" ? "rocznie" : "miesiecznie"));
  };

  return (
    <section
      className="pd-container pd-reveal py-12 md:py-16"
      aria-labelledby="cennik-tytul"
      data-pd-reveal="cennik"
    >
      <div className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft pd-section-shell border border-black/10 dark:border-white/10">
        {/* odpowiada za naglowek i wybor okresu platnosci */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[72ch]">
            <p className="pd-section-kicker">{tekst.kicker}</p>
            <h2 id="cennik-tytul" className="pd-section-title">
              {tekst.tytul}
            </h2>
            <p className="pd-section-lead">{tekst.lead}</p>
          </div>

          <div
            className="pd-enterprise-chip inline-flex rounded-2xl p-1"
            role="radiogroup"
            aria-label={tekst.etykietaRozliczenia}
            onKeyDown={onToggleOkresKlawiatura}
          >
            <button
              type="button"
              onClick={() => setOkres("miesiecznie")}
              role="radio"
              tabIndex={okres === "miesiecznie" ? 0 : -1}
              className={[
                "pd-focus-ring h-10 rounded-xl px-4 text-sm font-bold transition",
                okres === "miesiecznie"
                  ? "bg-slate-900/90 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:bg-white/12 dark:text-slate-100"
                  : "text-slate-700 dark:text-slate-300",
              ].join(" ")}
              aria-checked={okres === "miesiecznie"}
            >
              {tekst.miesiecznie}
            </button>
            <button
              type="button"
              onClick={() => setOkres("rocznie")}
              role="radio"
              tabIndex={okres === "rocznie" ? 0 : -1}
              className={[
                "pd-focus-ring h-10 rounded-xl px-4 text-sm font-bold transition",
                okres === "rocznie"
                  ? "bg-slate-900/90 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:bg-white/12 dark:text-slate-100"
                  : "text-slate-700 dark:text-slate-300",
              ].join(" ")}
              aria-checked={okres === "rocznie"}
            >
              {tekst.rabatRoczny}
            </button>
          </div>
        </header>

        {/* odpowiada za karty planow */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plansze.map((plan) => {
            const oszczednoscMiesieczna = plan.oszczednoscMiesieczna ?? 0;

            return (
              <article
                key={plan.nazwa}
                className={[
                  "pd-enterprise-card relative rounded-[24px] p-5 md:p-6",
                  plan.wyrozniony
                    ? "border-sky-400/70 bg-[radial-gradient(130%_130%_at_50%_0%,rgba(14,165,233,0.22),rgba(255,255,255,0)_62%)] p-6 md:p-7 shadow-[0_38px_84px_-36px_rgba(2,132,199,0.88)] ring-1 ring-sky-400/55 lg:-translate-y-2 lg:scale-[1.05] dark:bg-[radial-gradient(130%_130%_at_50%_0%,rgba(14,165,233,0.25),rgba(2,6,23,0)_66%)]"
                    : "",
                ].join(" ")}
              >
                {plan.wyrozniony && (
                  <span className="absolute right-4 top-4 rounded-xl border border-sky-400/40 bg-sky-500/14 px-3 py-1 text-[10px] font-black tracking-[0.12em] uppercase text-sky-700 dark:text-sky-300">
                    {tekst.badgeProfessional}
                  </span>
                )}

                <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                  {tekst.nazwyPlanow[plan.nazwa]}
                </p>
                <p
                  className={[
                    "mt-4 font-black text-slate-950 dark:text-slate-50",
                    plan.wyrozniony ? "text-4xl" : "text-3xl",
                  ].join(" ")}
                >
                  {plan.cenaAktywna === null
                    ? tekst.enterpriseCena
                    : `${formatCurrencyPln(plan.cenaAktywna, locale, 0)} / ${jezyk === "en" ? "mo" : "mies."}`}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {plan.cenaAktywna === null
                    ? tekst.enterpriseSubline
                    : okres === "rocznie"
                      ? tekst.roczneSubline
                      : tekst.miesieczneSubline}
                </p>
                {plan.cenaAktywna !== null && okres === "rocznie" && oszczednoscMiesieczna > 0 && (
                  <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {tekst.oszczedzaszMiesiecznie(
                      formatCurrencyPln(oszczednoscMiesieczna, locale, 0)
                    )}
                  </p>
                )}
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {tekst.zrodloCen}
                </p>

                <p className="mt-4 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                  {tekst.tresciPlanow[plan.nazwa].opis}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {tekst.tresciPlanow[plan.nazwa].notatka}
                </p>

                <ul className="mt-5 space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {tekst.tresciPlanow[plan.nazwa].cechyGlowne.map((cecha) => (
                    <li key={cecha} className="flex items-start gap-2">
                      <span
                        className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-500/35 bg-emerald-500/12 text-xs font-black text-emerald-600 dark:text-emerald-300"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      {cecha}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onWyborPlanu(plan.nazwa)}
                  className={[
                    "pd-focus-ring mt-6 h-11 w-full rounded-2xl text-sm font-extrabold tracking-[0.08em] uppercase transition",
                    plan.wyrozniony
                      ? "pd-btn-primary text-white"
                      : "pd-btn-secondary text-slate-900 dark:text-slate-100",
                  ].join(" ")}
                  aria-label={tekst.ctaAria(plan.nazwa)}
                >
                  {tekst.tresciPlanow[plan.nazwa].cta}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SekcjaCennik;
