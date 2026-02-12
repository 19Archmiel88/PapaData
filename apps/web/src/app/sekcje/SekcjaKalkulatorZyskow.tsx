import { useMemo, useState } from "react";
import { useUI } from "../../context/useUI";
import { formatCurrencyPln, formatNumber } from "../../utils/formatters";

type SekcjaKalkulatorZyskowProps = {
  onPrimary: () => void;
};

type TekstyKalkulatora = {
  kicker: string;
  tytul: string;
  lead: string;
  oszczednoscRoczna: string;
  odzyskanyCzas: string;
  godzinyMiesiac: string;
  etatPrefix: string;
  etatUnit: string;
  etatSuffix: string;
  cta: string;
  ctaAria: string;
  parametryWejsciowe: string;
  liczbaRaportowLabel: string;
  godzinyNaRaportLabel: string;
  kosztGodzinyLabel: string;
  opisSzacunku: (redukcjaProc: string) => string;
  ariaRaporty: (wartosc: string) => string;
  ariaGodziny: (wartosc: string) => string;
  ariaKoszt: (wartosc: string) => string;
};

const WSPOLCZYNNIK_REDUKCJI_PRACY_MANUALNEJ = 0.46;

const TEKSTY_KALKULATORA: Record<"pl" | "en", TekstyKalkulatora> = {
  pl: {
    kicker: "Kalkulator zysków",
    tytul: "Oblicz ile zyskasz i jakie problemy rozwiążesz dzięki PapaData:",
    lead: "Kalkulator pokazuje realną oszczędność czasu i kosztu pracy. Wynik to szacunek oparty na Twoich parametrach operacyjnych, nie na sztywnym szablonie.",
    oszczednoscRoczna: "Oszczędność roczna",
    odzyskanyCzas: "Odzyskany czas",
    godzinyMiesiac: "h / miesiąc",
    etatPrefix: "To odpowiada około",
    etatUnit: "% etatu",
    etatSuffix: "miesięcznie.",
    cta: "Zacznij oszczędzać teraz",
    ctaAria: "Rozpocznij okres próbny i zacznij oszczędzać czas",
    parametryWejsciowe: "Parametry wejściowe",
    liczbaRaportowLabel: "Liczba raportów / miesiąc",
    godzinyNaRaportLabel: "Godziny na raport",
    kosztGodzinyLabel: "Koszt godziny pracy (PLN)",
    opisSzacunku: (redukcjaProc) =>
      `Szacunek zakłada redukcję pracy manualnej o ${redukcjaProc}. Dokładny wynik zależy od modelu danych, jakości trackingu i skali kampanii.`,
    ariaRaporty: (wartosc) => `Liczba raportów miesięcznie: ${wartosc}`,
    ariaGodziny: (wartosc) => `Godziny na raport: ${wartosc}`,
    ariaKoszt: (wartosc) => `Koszt godziny pracy: ${wartosc} PLN`,
  },
  en: {
    kicker: "Profit calculator",
    tytul: "Calculate how much you gain after analytics automation.",
    lead: "The calculator estimates realistic time and labor-cost savings. The result is based on your operating parameters, not a fixed template.",
    oszczednoscRoczna: "Annual savings",
    odzyskanyCzas: "Recovered time",
    godzinyMiesiac: "h / month",
    etatPrefix: "This equals about",
    etatUnit: "% of FTE",
    etatSuffix: "monthly.",
    cta: "Start saving now",
    ctaAria: "Start trial and begin saving time",
    parametryWejsciowe: "Input parameters",
    liczbaRaportowLabel: "Reports per month",
    godzinyNaRaportLabel: "Hours per report",
    kosztGodzinyLabel: "Hourly labor cost (PLN)",
    opisSzacunku: (redukcjaProc) =>
      `Estimate assumes a ${redukcjaProc} reduction in manual work. Actual result depends on data model, tracking quality, and campaign scale.`,
    ariaRaporty: (wartosc) => `Reports per month: ${wartosc}`,
    ariaGodziny: (wartosc) => `Hours per report: ${wartosc}`,
    ariaKoszt: (wartosc) => `Hourly labor cost: ${wartosc} PLN`,
  },
};

export function SekcjaKalkulatorZyskow({ onPrimary }: SekcjaKalkulatorZyskowProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_KALKULATORA[jezyk];
  const locale = jezyk === "en" ? "en-US" : "pl-PL";

  const [liczbaRaportow, setLiczbaRaportow] = useState(35);
  const [godzinyNaRaport, setGodzinyNaRaport] = useState(2.2);
  const [kosztGodziny, setKosztGodziny] = useState(180);

  const metryki = useMemo(() => {
    const miesiecznyCzas = liczbaRaportow * godzinyNaRaport;
    const oszczednoscGodzin = miesiecznyCzas * WSPOLCZYNNIK_REDUKCJI_PRACY_MANUALNEJ;
    const oszczednoscRoczna = oszczednoscGodzin * kosztGodziny * 12;
    const etat = (oszczednoscGodzin / 160) * 100;

    return {
      miesiecznyCzas,
      oszczednoscGodzin,
      oszczednoscRoczna,
      etat,
    };
  }, [kosztGodziny, liczbaRaportow, godzinyNaRaport]);

  const liczbaRaportowTekst = formatNumber(liczbaRaportow, locale, {
    maximumFractionDigits: 0,
  });
  const godzinyNaRaportTekst = formatNumber(godzinyNaRaport, locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const kosztGodzinyTekst = formatNumber(kosztGodziny, locale, {
    maximumFractionDigits: 0,
  });
  const oszczednoscGodzinTekst = formatNumber(metryki.oszczednoscGodzin, locale, {
    maximumFractionDigits: 0,
  });
  const etatTekst = formatNumber(metryki.etat, locale, {
    maximumFractionDigits: 0,
  });
  const redukcjaPracyManualnejTekst = `${formatNumber(
    WSPOLCZYNNIK_REDUKCJI_PRACY_MANUALNEJ * 100,
    locale,
    { maximumFractionDigits: 0 }
  )}%`;

  return (
    <section
      className="pd-container pd-reveal py-12 md:py-16"
      aria-labelledby="kalkulator-tytul"
      data-pd-reveal="kalkulator"
    >
      <div className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft pd-section-shell border border-black/10 dark:border-white/10">
        <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr]">
          {/* odpowiada za narracje biznesowa i wynik koncowy */}
          <div>
            <p className="pd-section-kicker">{tekst.kicker}</p>
            <h2 id="kalkulator-tytul" className="pd-section-title">
              {tekst.tytul}
            </h2>
            <p className="pd-section-lead max-w-[60ch]">{tekst.lead}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <article className="pd-enterprise-card-muted rounded-2xl p-4">
                <p className="text-xs font-bold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
                  {tekst.oszczednoscRoczna}
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-300">
                  {formatCurrencyPln(Math.max(0, Math.round(metryki.oszczednoscRoczna)), locale, 0)}
                </p>
              </article>

              <article className="pd-enterprise-card-muted rounded-2xl p-4">
                <p className="text-xs font-bold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
                  {tekst.odzyskanyCzas}
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
                  {`${oszczednoscGodzinTekst} ${tekst.godzinyMiesiac}`}
                </p>
              </article>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {tekst.etatPrefix} <span className="font-black">{etatTekst} {tekst.etatUnit}</span>{" "}
              {tekst.etatSuffix}
            </p>

            <button
              type="button"
              onClick={onPrimary}
              className="pd-btn-primary pd-focus-ring mt-8 h-12 rounded-2xl px-6 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
              aria-label={tekst.ctaAria}
            >
              {tekst.cta}
            </button>
          </div>

          {/* odpowiada za panel sterowania kalkulacja */}
          <div className="pd-enterprise-card rounded-[24px] p-5">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {tekst.parametryWejsciowe}
            </h3>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-xs font-extrabold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
                  {tekst.liczbaRaportowLabel}: {liczbaRaportowTekst}
                </span>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={1}
                  value={liczbaRaportow}
                  onChange={(event) => setLiczbaRaportow(Number(event.target.value))}
                  aria-label={tekst.liczbaRaportowLabel}
                  aria-valuetext={tekst.ariaRaporty(liczbaRaportowTekst)}
                  className="mt-2 w-full accent-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/55"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
                  {tekst.godzinyNaRaportLabel}: {godzinyNaRaportTekst} h
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={6}
                  step={0.1}
                  value={godzinyNaRaport}
                  onChange={(event) => setGodzinyNaRaport(Number(event.target.value))}
                  aria-label={tekst.godzinyNaRaportLabel}
                  aria-valuetext={tekst.ariaGodziny(godzinyNaRaportTekst)}
                  className="mt-2 w-full accent-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/55"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
                  {tekst.kosztGodzinyLabel}: {kosztGodzinyTekst}
                </span>
                <input
                  type="range"
                  min={70}
                  max={450}
                  step={5}
                  value={kosztGodziny}
                  onChange={(event) => setKosztGodziny(Number(event.target.value))}
                  aria-label={tekst.kosztGodzinyLabel}
                  aria-valuetext={tekst.ariaKoszt(kosztGodzinyTekst)}
                  className="mt-2 w-full accent-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/55"
                />
              </label>
            </div>

            <p className="mt-6 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-400">
              {tekst.opisSzacunku(redukcjaPracyManualnejTekst)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SekcjaKalkulatorZyskow;
