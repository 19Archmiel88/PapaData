import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUI } from "../../context/useUI";

type EkranGuardiana = "rozmowa" | "myslenie" | "anomalia" | "prognoza";

type KomunikatCzatu = {
  id: string;
  rola: "uzytkownik" | "guardian";
  tresc: string;
};

type PunktAnalizy = {
  id: string;
  krok: string;
  opis: string;
};

type PunktAnomalii = {
  dzien: string;
  sprzedaz: number;
  odchylenieProc: number;
};

type SlownikPanelu = {
  ariaLabel: string;
  nazwa: string;
  autoLabel: string;
  manualLabel: string;
  podtytul: string;
  etykietyEkranow: Record<EkranGuardiana, string>;
  etykietyZakladek: Record<EkranGuardiana, string>;
  sekcjaCzat: string;
  sekcjaMyslenie: string;
  sekcjaAnomalia: string;
  sekcjaPrognoza: string;
  mysliKomunikat: string;
  anomaliaWykryta: string;
  efekt7Dni: string;
  efekt7DniOpis: string;
  prognoza30Dni: string;
  prognoza30DniOpis: string;
  stopkaOpis: string;
  otworzRaport: string;
  komunikatyCzatu: KomunikatCzatu[];
  punktyAnalizy: PunktAnalizy[];
  punktyAnomalii: PunktAnomalii[];
};

type PapaGuardianPanelProps = {
  onOpenReport?: () => void;
  onStanSilnikaChange?: (stan: "bezczynny" | "przetwarzanie") => void;
  wariant?: "sekcja" | "plywajacy";
  className?: string;
  automatycznaPrezentacja?: boolean;
  dopasujWysokosc?: boolean;
};

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function formatPLN(wartosc: number, jezyk: "pl" | "en") {
  const locale = jezyk === "en" ? "en-US" : "pl-PL";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(Math.round(wartosc));
}

const KOLEJNOSC_EKRANOW: EkranGuardiana[] = [
  "rozmowa",
  "myslenie",
  "anomalia",
  "prognoza",
];

const SLOWNIK_PANELU: Record<"pl" | "en", SlownikPanelu> = {
  pl: {
    ariaLabel: "Papa Guardian",
    nazwa: "Papa Guardian",
    autoLabel: "Auto",
    manualLabel: "Ręcznie",
    podtytul: "Analizuje, raportuje i przewiduje anomalie sprzedaży dla e-commerce.",
    etykietyEkranow: {
      rozmowa: "Czat decyzyjny",
      myslenie: "Silnik analityczny",
      anomalia: "Anomalia sprzedaży",
      prognoza: "Prognoza i raport",
    },
    etykietyZakladek: {
      rozmowa: "Czat",
      myslenie: "Analiza",
      anomalia: "Anomalia",
      prognoza: "Prognoza",
    },
    sekcjaCzat: "Czat i rekomendacje",
    sekcjaMyslenie: "Silnik przetwarzania",
    sekcjaAnomalia: "Monitoring anomalii",
    sekcjaPrognoza: "Prognoza i raport",
    mysliKomunikat: "Myślę nad zmianą budżetu i ryzykiem marży...",
    anomaliaWykryta: "Wykryto anomalię: spadek sprzedaży o 14% w środę.",
    efekt7Dni: "Efekt 7 dni",
    efekt7DniOpis: "Po wdrożeniu rekomendacji Guardiana",
    prognoza30Dni: "Prognoza 30 dni",
    prognoza30DniOpis: "Oczekiwany zysk netto po korekcie budżetu",
    stopkaOpis: "Papa Guardian analizuje, raportuje i przewiduje anomalie w trybie ciągłym.",
    otworzRaport: "Otwórz raport",
    komunikatyCzatu: [
      {
        id: "q1",
        rola: "uzytkownik",
        tresc: "Dlaczego marża spadła w kampaniach prospecting?",
      },
      {
        id: "a1",
        rola: "guardian",
        tresc: "Wzrósł koszt kliknięcia, a rabaty zostały podniesione na top SKU.",
      },
      {
        id: "q2",
        rola: "uzytkownik",
        tresc: "Co wdrożyć dzisiaj, żeby odzyskać wynik?",
      },
      {
        id: "a2",
        rola: "guardian",
        tresc: "Przenieść 20% budżetu do retargetingu i ograniczyć rabat premium.",
      },
    ],
    punktyAnalizy: [
      {
        id: "dane",
        krok: "Łączenie danych",
        opis: "Sklep, marketplace i kampanie trafiają do wspólnego modelu BigQuery.",
      },
      {
        id: "anomalia",
        krok: "Detekcja odchyleń",
        opis: "Silnik wykrywa nietypowe sygnały marży, CVR i kosztu pozyskania.",
      },
      {
        id: "decyzja",
        krok: "Raport i rekomendacja",
        opis: "Guardian priorytetyzuje akcje według efektu finansowego i ryzyka.",
      },
    ],
    punktyAnomalii: [
      { dzien: "Pon", sprzedaz: 92, odchylenieProc: 0 },
      { dzien: "Wt", sprzedaz: 88, odchylenieProc: -3 },
      { dzien: "Śr", sprzedaz: 71, odchylenieProc: -14 },
      { dzien: "Czw", sprzedaz: 82, odchylenieProc: -6 },
      { dzien: "Pt", sprzedaz: 95, odchylenieProc: 2 },
    ],
  },
  en: {
    ariaLabel: "Papa Guardian",
    nazwa: "Papa Guardian",
    autoLabel: "Auto",
    manualLabel: "Manual",
    podtytul: "Analyzes, reports, and predicts sales anomalies for e-commerce.",
    etykietyEkranow: {
      rozmowa: "Decision chat",
      myslenie: "Analytics engine",
      anomalia: "Sales anomaly",
      prognoza: "Forecast and report",
    },
    etykietyZakladek: {
      rozmowa: "Chat",
      myslenie: "Analysis",
      anomalia: "Anomaly",
      prognoza: "Forecast",
    },
    sekcjaCzat: "Chat and recommendations",
    sekcjaMyslenie: "Processing engine",
    sekcjaAnomalia: "Anomaly monitoring",
    sekcjaPrognoza: "Forecast and report",
    mysliKomunikat: "Thinking about budget reallocation and margin risk...",
    anomaliaWykryta: "Anomaly detected: sales dropped by 14% on Wednesday.",
    efekt7Dni: "7-day effect",
    efekt7DniOpis: "After implementing Guardian recommendations",
    prognoza30Dni: "30-day forecast",
    prognoza30DniOpis: "Expected net profit after budget correction",
    stopkaOpis: "Papa Guardian continuously analyzes reports and predicts anomalies.",
    otworzRaport: "Open report",
    komunikatyCzatu: [
      {
        id: "q1",
        rola: "uzytkownik",
        tresc: "Why did margin drop in prospecting campaigns?",
      },
      {
        id: "a1",
        rola: "guardian",
        tresc: "Click cost increased while discounts were raised on top SKUs.",
      },
      {
        id: "q2",
        rola: "uzytkownik",
        tresc: "What should we deploy today to recover performance?",
      },
      {
        id: "a2",
        rola: "guardian",
        tresc: "Move 20% of budget to retargeting and reduce premium discounting.",
      },
    ],
    punktyAnalizy: [
      {
        id: "dane",
        krok: "Data unification",
        opis: "Store, marketplace, and campaign data flow into one BigQuery model.",
      },
      {
        id: "anomalia",
        krok: "Deviation detection",
        opis: "Engine detects unusual margin, CVR, and acquisition cost signals.",
      },
      {
        id: "decyzja",
        krok: "Report and recommendation",
        opis: "Guardian prioritizes actions by financial impact and risk.",
      },
    ],
    punktyAnomalii: [
      { dzien: "Mon", sprzedaz: 92, odchylenieProc: 0 },
      { dzien: "Tue", sprzedaz: 88, odchylenieProc: -3 },
      { dzien: "Wed", sprzedaz: 71, odchylenieProc: -14 },
      { dzien: "Thu", sprzedaz: 82, odchylenieProc: -6 },
      { dzien: "Fri", sprzedaz: 95, odchylenieProc: 2 },
    ],
  },
};

function nastepnyEkran(ekran: EkranGuardiana) {
  const index = KOLEJNOSC_EKRANOW.indexOf(ekran);
  const nastepnyIndex = (index + 1) % KOLEJNOSC_EKRANOW.length;
  return KOLEJNOSC_EKRANOW[nastepnyIndex];
}

export function PapaGuardianPanel({
  onOpenReport,
  onStanSilnikaChange,
  wariant = "sekcja",
  className,
  automatycznaPrezentacja = true,
  dopasujWysokosc = false,
}: PapaGuardianPanelProps) {
  const { jezyk } = useUI();
  const tekst = SLOWNIK_PANELU[jezyk];

  const [ekran, setEkran] = useState<EkranGuardiana>("rozmowa");
  const [autoodtwarzanieAktywne, setAutoodtwarzanieAktywne] = useState(automatycznaPrezentacja);
  const timeoutWznowieniaRef = useRef<number | null>(null);

  const shellCls = "pd-glass pd-edge pd-innerglow pd-glass-soft rounded-[30px] overflow-hidden";
  const sekcjaCls =
    "pd-edge pd-innerglow rounded-2xl border border-black/14 dark:border-white/10 bg-white/90 dark:bg-white/5";
  const przyciskSubtelnyCls =
    "pd-focus-ring h-10 rounded-2xl px-4 text-[11px] font-black tracking-[0.08em] uppercase transition " +
    "border border-black/14 bg-white/90 text-slate-900 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10";

  const postepEkranu = useMemo(() => {
    const index = KOLEJNOSC_EKRANOW.indexOf(ekran);
    return ((index + 1) / KOLEJNOSC_EKRANOW.length) * 100;
  }, [ekran]);

  const zatrzymajAutoNaChwile = useCallback(() => {
    if (!automatycznaPrezentacja) return;
    setAutoodtwarzanieAktywne(false);
    if (timeoutWznowieniaRef.current) window.clearTimeout(timeoutWznowieniaRef.current);
    timeoutWznowieniaRef.current = window.setTimeout(() => {
      setAutoodtwarzanieAktywne(true);
      timeoutWznowieniaRef.current = null;
    }, 12000);
  }, [automatycznaPrezentacja]);

  const wybierzEkran = useCallback(
    (wybrany: EkranGuardiana) => {
      setEkran(wybrany);
      zatrzymajAutoNaChwile();
    },
    [zatrzymajAutoNaChwile]
  );

  // odpowiada za automatyczne odtwarzanie ekranow Papa Guardian
  useEffect(() => {
    if (!automatycznaPrezentacja || !autoodtwarzanieAktywne) return;
    const intervalId = window.setInterval(() => {
      setEkran((aktualny) => nastepnyEkran(aktualny));
    }, 4600);
    return () => window.clearInterval(intervalId);
  }, [automatycznaPrezentacja, autoodtwarzanieAktywne]);

  // odpowiada za synchronizacje trybu auto po zmianie konfiguracji komponentu
  useEffect(() => {
    setAutoodtwarzanieAktywne(automatycznaPrezentacja);
  }, [automatycznaPrezentacja]);

  // odpowiada za cleanup timeoutu przy odmontowaniu
  useEffect(
    () => () => {
      if (timeoutWznowieniaRef.current) window.clearTimeout(timeoutWznowieniaRef.current);
    },
    []
  );

  // odpowiada za przekazanie stanu pracy silnika do warstwy atmosfery
  useEffect(() => {
    const stan = ekran === "rozmowa" ? "bezczynny" : "przetwarzanie";
    onStanSilnikaChange?.(stan);
  }, [ekran, onStanSilnikaChange]);

  // odpowiada za reset stanu pracy silnika po odmontowaniu
  useEffect(
    () => () => {
      onStanSilnikaChange?.("bezczynny");
    },
    [onStanSilnikaChange]
  );

  return (
    <aside
      className={cx(
        wariant === "plywajacy" ? "pd-guardian" : "relative z-[var(--z-content)] w-full",
        className
      )}
      role="region"
      aria-label={tekst.ariaLabel}
    >
      <div className={cx(shellCls, dopasujWysokosc && "h-full")}>
        <header className="border-b border-black/10 px-5 pb-4 pt-5 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold tracking-[0.22em] uppercase text-slate-800 dark:text-white/55">
                {tekst.nazwa}
              </p>
              <h3 className="pd-panel-title mt-2 text-slate-950 dark:text-white">
                {tekst.etykietyEkranow[ekran]}
              </h3>
            </div>
            <span
              className={cx(
                "inline-flex h-9 items-center rounded-2xl border px-3 text-[11px] font-extrabold tracking-[0.12em] uppercase",
                autoodtwarzanieAktywne
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "border-black/14 bg-white/90 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white/55"
              )}
            >
              {autoodtwarzanieAktywne ? tekst.autoLabel : tekst.manualLabel}
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-white/60">
            {tekst.podtytul}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {KOLEJNOSC_EKRANOW.map((wariantEkranu) => (
              <button
                key={wariantEkranu}
                type="button"
                onClick={() => wybierzEkran(wariantEkranu)}
                aria-pressed={ekran === wariantEkranu}
                className={cx(
                  "pd-focus-ring h-9 rounded-xl border text-[10px] font-extrabold tracking-[0.1em] uppercase transition",
                  ekran === wariantEkranu
                    ? "border-sky-400/45 bg-sky-500/12 text-sky-700 dark:text-sky-300"
                    : "border-black/14 bg-white/90 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                )}
              >
                {tekst.etykietyZakladek[wariantEkranu]}
              </button>
            ))}
          </div>
        </header>

        <div
          className={cx(
            "flex flex-col justify-between p-4 sm:p-5 lg:p-6",
            dopasujWysokosc ? "h-full min-h-0" : "min-h-[430px] sm:min-h-[500px] lg:min-h-[520px]"
          )}
        >
          {ekran === "rozmowa" && (
            <section className="space-y-3">
              <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-slate-700 dark:text-white/45">
                {tekst.sekcjaCzat}
              </div>
              <div className="space-y-2">
                {tekst.komunikatyCzatu.map((komunikat) => {
                  const odGuardiana = komunikat.rola === "guardian";
                  return (
                    <article
                      key={komunikat.id}
                      className={cx(
                        "max-w-[92%] rounded-2xl px-3 py-2 text-sm font-semibold",
                        odGuardiana
                          ? "mr-auto border border-sky-300/35 bg-sky-500/12 text-sky-800 dark:text-sky-200"
                          : "ml-auto border border-black/14 bg-white/92 text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-white/80"
                      )}
                    >
                      {komunikat.tresc}
                    </article>
                  );
                })}
              </div>
              <div className={cx(sekcjaCls, "px-3 py-2")}>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white/70">
                  <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
                  {tekst.mysliKomunikat}
                </p>
              </div>
            </section>
          )}

          {ekran === "myslenie" && (
            <section className="space-y-3">
              <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-slate-700 dark:text-white/45">
                {tekst.sekcjaMyslenie}
              </div>
              <div className="space-y-2">
                {tekst.punktyAnalizy.map((punkt, index) => (
                  <article key={punkt.id} className={cx(sekcjaCls, "p-3")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{punkt.krok}</p>
                      <span
                        className={cx(
                          "inline-flex h-2.5 w-2.5 rounded-full",
                          index === 1 ? "bg-cyan-400 animate-pulse" : "bg-emerald-400/80"
                        )}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white/70">{punkt.opis}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {ekran === "anomalia" && (
            <section className="space-y-3">
              <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-slate-700 dark:text-white/45">
                {tekst.sekcjaAnomalia}
              </div>
              <div className={cx(sekcjaCls, "p-4")}>
                <div className="grid h-[150px] grid-cols-5 items-end gap-2" aria-hidden="true">
                  {tekst.punktyAnomalii.map((punkt) => (
                    <div key={punkt.dzien} className="space-y-2">
                      <div className="h-[120px] rounded-xl bg-black/10 p-1 dark:bg-white/10">
                        <div
                          className={cx(
                            "w-full rounded-lg",
                            punkt.odchylenieProc <= -10
                              ? "bg-[linear-gradient(180deg,#f43f5e,#f97316)]"
                              : "bg-[linear-gradient(180deg,#22d3ee,#6366f1)]"
                          )}
                          style={{ height: `${punkt.sprzedaz}%` }}
                        />
                      </div>
                      <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-800 dark:text-white/60">
                        {punkt.dzien}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
                  {tekst.anomaliaWykryta}
                </p>
              </div>
            </section>
          )}

          {ekran === "prognoza" && (
            <section className="space-y-3">
              <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-slate-700 dark:text-white/45">
                {tekst.sekcjaPrognoza}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <article className="rounded-2xl border border-emerald-400/35 bg-emerald-500/10 p-3">
                  <p className="text-xs font-extrabold tracking-[0.12em] uppercase text-emerald-700 dark:text-emerald-300">
                    {tekst.efekt7Dni}
                  </p>
                  <p className="mt-2 text-xl font-black text-emerald-700 dark:text-emerald-200">+8.2% marży</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-800/85 dark:text-emerald-100/90">
                    {tekst.efekt7DniOpis}
                  </p>
                </article>

                <article className="rounded-2xl border border-sky-400/35 bg-sky-500/10 p-3">
                  <p className="text-xs font-extrabold tracking-[0.12em] uppercase text-sky-700 dark:text-sky-300">
                    {tekst.prognoza30Dni}
                  </p>
                  <p className="mt-2 text-xl font-black text-sky-700 dark:text-sky-200">
                    {formatPLN(384000, jezyk)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-sky-800/85 dark:text-sky-100/90">
                    {tekst.prognoza30DniOpis}
                  </p>
                </article>
              </div>
            </section>
          )}

          <footer className="mt-4 space-y-3">
            <div className="h-2 rounded-full bg-black/10 dark:bg-white/10" aria-hidden="true">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,#6366f1,#22d3ee)] transition-all duration-500"
                style={{ width: `${postepEkranu}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-800 dark:text-white/60">{tekst.stopkaOpis}</p>
              <button
                type="button"
                onClick={onOpenReport}
                disabled={!onOpenReport}
                aria-disabled={!onOpenReport}
                className={przyciskSubtelnyCls}
              >
                {tekst.otworzRaport}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </aside>
  );
}

export default PapaGuardianPanel;
