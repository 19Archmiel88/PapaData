import { useId, useMemo, useRef, useState } from "react";
import {
  INTEGRACJE_KATALOG,
  type IntegracjaKatalogu,
  type KategoriaIntegracji,
  lokalizujIntegracjeKatalog,
  pobierzKategorieIntegracji,
} from "./katalogIntegracji";
import { IkonaIntegracji } from "./IkonaIntegracji";
import {
  useBlokadaScrollaWDialogu,
  usePulapkaFokusuWDialogu,
} from "../modale/narzedziaModala";
import { useUI } from "../../context/useUI";

type KategoriaFiltra = KategoriaIntegracji | "wszystkie";

type ModalIntegracjiProps = {
  otwarty: boolean;
  onZamknij: () => void;
  onWybierzIntegracje: (integracja: IntegracjaKatalogu) => void;
};

function IkonaSzukaj() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M11 4a7 7 0 1 1 0 14a7 7 0 0 1 0-14Zm0 0l9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IkonaUstawienia() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M10 3h4l.7 2.5a7.6 7.6 0 0 1 1.7 1l2.4-.8l2 3.4l-1.8 1.7c.1.3.1.8.1 1.2s0 .9-.1 1.2l1.8 1.7l-2 3.4l-2.4-.8c-.5.4-1.1.8-1.7 1L14 21h-4l-.7-2.5a7.6 7.6 0 0 1-1.7-1l-2.4.8l-2-3.4l1.8-1.7A6.6 6.6 0 0 1 5 12c0-.4 0-.9.1-1.2L3.3 9.1l2-3.4l2.4.8c.5-.4 1.1-.8 1.7-1L10 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IkonaPlus() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IkonaZap() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M13 2L5 13h6l-1 9l9-13h-6l0-7Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function klasaStatusuTechnicznego(status: IntegracjaKatalogu["status"]) {
  if (status === "live") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  if (status === "beta") return "border-amber-500/25 bg-amber-500/10 text-amber-300";
  return "border-slate-500/25 bg-slate-500/10 text-slate-300";
}

type TekstyModaluIntegracji = {
  closeOverlayAria: string;
  titleKicker: string;
  title: string;
  description: string;
  closeModalAria: string;
  badgeBeta: string;
  badgeOnline: string;
  subtitle: string;
  summaryAria: string;
  connectedLabel: string;
  healthCheckLabel: string;
  categoriesAria: string;
  allLabel: string;
  searchPlaceholder: string;
  searchAria: string;
  noResults: string;
  statusLabel: Record<IntegracjaKatalogu["status"], string>;
  activeLabel: string;
  configLabel: string;
  connectLabel: string;
  addNewAria: string;
  addNewLabel: string;
  addNewMailSubject: string;
  closeButton: string;
  openConfigAria: (nazwa: string) => string;
  connectIntegrationAria: (nazwa: string) => string;
};

const TEKSTY_MODALU_INTEGRACJI: Record<"pl" | "en", TekstyModaluIntegracji> = {
  pl: {
    closeOverlayAria: "Zamknij katalog integracji",
    titleKicker: "Integracje",
    title: "Źródła danych",
    description:
      "Zarządzaj strumieniami danych i łącz zewnętrzne API, aby zasilić algorytmy PapaData Intelligence.",
    closeModalAria: "Zamknij modal",
    badgeBeta: "Beta v2.0",
    badgeOnline: "System online",
    subtitle: "Podłączaj sklepy, reklamy i marketplace bez ręcznego scalania danych.",
    summaryAria: "Podsumowanie stanu integracji",
    connectedLabel: "Połączone",
    healthCheckLabel: "Health check",
    categoriesAria: "Kategorie integracji",
    allLabel: "Wszystkie",
    searchPlaceholder: "Szukaj integracji...",
    searchAria: "Szukaj integracji",
    noResults: "Brak wyników dla podanych filtrów.",
    statusLabel: {
      live: "Live",
      beta: "Beta",
      wkrotce: "Wkrótce",
    },
    activeLabel: "Aktywna",
    configLabel: "Konfiguracja",
    connectLabel: "Połącz",
    addNewAria: "Zgłoś nową integrację",
    addNewLabel: "Zgłoś nową integrację",
    addNewMailSubject: "Nowa integracja",
    closeButton: "Zamknij",
    openConfigAria: (nazwa) => `Skonfiguruj integrację ${nazwa}`,
    connectIntegrationAria: (nazwa) => `Połącz integrację ${nazwa}`,
  },
  en: {
    closeOverlayAria: "Close integrations catalog",
    titleKicker: "Integrations",
    title: "Data Sources",
    description:
      "Manage data streams and connect external APIs to power PapaData Intelligence algorithms.",
    closeModalAria: "Close modal",
    badgeBeta: "Beta v2.0",
    badgeOnline: "System online",
    subtitle: "Connect stores, ads, and marketplaces without manual data stitching.",
    summaryAria: "Integration status summary",
    connectedLabel: "Connected",
    healthCheckLabel: "Health check",
    categoriesAria: "Integration categories",
    allLabel: "All",
    searchPlaceholder: "Search integrations...",
    searchAria: "Search integrations",
    noResults: "No results for selected filters.",
    statusLabel: {
      live: "Live",
      beta: "Beta",
      wkrotce: "Soon",
    },
    activeLabel: "Active",
    configLabel: "Configuration",
    connectLabel: "Connect",
    addNewAria: "Request a new integration",
    addNewLabel: "Request new integration",
    addNewMailSubject: "New integration",
    closeButton: "Close",
    openConfigAria: (nazwa) => `Configure integration ${nazwa}`,
    connectIntegrationAria: (nazwa) => `Connect integration ${nazwa}`,
  },
};

export function ModalIntegracji({ otwarty, onZamknij, onWybierzIntegracje }: ModalIntegracjiProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_MODALU_INTEGRACJI[jezyk];
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ostatniFokusRef = useRef<HTMLElement | null>(null);
  const [filtr, setFiltr] = useState<KategoriaFiltra>("wszystkie");
  const [fraza, setFraza] = useState("");
  const idTytulu = useId();
  const idOpisu = useId();

  useBlokadaScrollaWDialogu(otwarty);
  usePulapkaFokusuWDialogu({
    otwarty,
    panelRef,
    ostatniFokusRef,
    onEscape: onZamknij,
  });

  const kategorieIntegracji = useMemo(() => pobierzKategorieIntegracji(jezyk), [jezyk]);

  const etykietaKategorii = useMemo(() => {
    const mapa = new Map<KategoriaIntegracji, string>();
    for (const kategoria of kategorieIntegracji) {
      mapa.set(kategoria.id, kategoria.etykieta);
    }
    return mapa;
  }, [kategorieIntegracji]);

  const integracjeLokalizowane = useMemo(
    () => INTEGRACJE_KATALOG.map((integracja) => lokalizujIntegracjeKatalog(integracja, jezyk)),
    [jezyk]
  );

  const wyniki = useMemo(() => {
    const frazaNorm = fraza.trim().toLowerCase();

    return integracjeLokalizowane.filter((integracja) => {
      const zgodnaKategoria = filtr === "wszystkie" || integracja.kategoria === filtr;
      if (!zgodnaKategoria) return false;
      if (!frazaNorm) return true;

      const tekst = `${integracja.nazwa} ${integracja.opis}`.toLowerCase();
      return tekst.includes(frazaNorm);
    });
  }, [filtr, fraza, integracjeLokalizowane]);

  const liczbaPolaczonych = useMemo(
    () => INTEGRACJE_KATALOG.filter((integracja) => integracja.stanPolaczenia === "connected").length,
    []
  );
  const liczbaWszystkich = INTEGRACJE_KATALOG.length;
  const healthCheck = Math.max(
    92,
    Math.min(99, Math.round((liczbaPolaczonych / Math.max(1, liczbaWszystkich)) * 100))
  );

  if (!otwarty) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)]">
      <button
        type="button"
        onClick={onZamknij}
        className="absolute inset-0 h-full w-full bg-slate-950/65 backdrop-blur-[2px]"
        aria-label={tekst.closeOverlayAria}
      />

      <div className="relative z-[var(--z-floating)] flex min-h-screen items-center justify-center px-4 py-8">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTytulu}
          aria-describedby={idOpisu}
          tabIndex={-1}
          className="pd-glass pd-edge pd-innerglow w-full max-w-[1180px] rounded-[28px] p-5 outline-none md:p-6"
        >
          {/* odpowiada za naglowek modala i zamkniecie klawiaturowe */}
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                {tekst.titleKicker}
              </p>
              <h3
                id={idTytulu}
                className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50"
              >
                {tekst.title}
              </h3>
              <p
                id={idOpisu}
                className="mt-2 max-w-[70ch] text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
              >
                {tekst.description}
              </p>
            </div>

            <button
              type="button"
              onClick={onZamknij}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-black/10 bg-white/70 text-lg font-black text-slate-800 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              aria-label={tekst.closeModalAria}
            >
              ×
            </button>
          </header>

          {/* odpowiada za dashboardowy widok katalogu zgodny z nowym projektem UI */}
          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-800/60 bg-[#050505] text-white shadow-2xl shadow-black/60">
            {/* odpowiada za kontekst statusu systemu i statystyki podlaczen */}
            <div className="border-b border-slate-800/70 px-4 py-5 md:px-6 md:py-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-violet-500/35 bg-violet-500/12 px-2 py-1 text-[10px] font-extrabold tracking-[0.14em] uppercase text-violet-300">
                      {tekst.badgeBeta}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] font-extrabold tracking-[0.14em] uppercase text-violet-300">
                      <IkonaZap />
                      {tekst.badgeOnline}
                    </span>
                  </div>
                  <p className="max-w-[66ch] text-sm font-medium leading-relaxed text-slate-300/90">
                    {tekst.subtitle}
                  </p>
                </div>

                <section
                  className="flex items-center gap-6 rounded-xl border border-slate-800 bg-[#0F1115]/85 px-4 py-3"
                  aria-label={tekst.summaryAria}
                >
                  <div>
                    <p className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-slate-500">
                      {tekst.connectedLabel}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-white">
                      {liczbaPolaczonych}
                      <span className="ml-1 text-sm font-bold text-slate-500">/ {liczbaWszystkich}</span>
                    </p>
                  </div>
                  <div className="h-12 w-px bg-slate-800" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-slate-500">
                      {tekst.healthCheckLabel}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 font-mono text-2xl font-black text-emerald-400">
                      {healthCheck}%
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* odpowiada za sticky filtry i wyszukiwanie konektorow */}
            <div className="max-h-[56vh] overflow-y-auto px-3 pb-4 md:px-4">
              <div className="sticky top-0 z-20 mb-5 pt-3 backdrop-blur-md">
                <div className="rounded-2xl border border-slate-800/70 bg-[#0F1115]/94 p-2 shadow-2xl shadow-black/50">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div
                      className="flex gap-1 overflow-x-auto px-1 pb-1 md:pb-0"
                      role="tablist"
                      aria-label={tekst.categoriesAria}
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={filtr === "wszystkie"}
                        onClick={() => setFiltr("wszystkie")}
                        className={[
                          "relative overflow-hidden rounded-xl px-4 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                          filtr === "wszystkie"
                            ? "bg-violet-500/20 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-white",
                        ].join(" ")}
                      >
                        {tekst.allLabel}
                        {filtr === "wszystkie" && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-1/2 h-[2px] w-1/2 -translate-x-1/2 bg-cyan-400"
                          />
                        )}
                      </button>
                      {kategorieIntegracji.map((kategoria) => (
                        <button
                          key={kategoria.id}
                          type="button"
                          role="tab"
                          aria-selected={filtr === kategoria.id}
                          onClick={() => setFiltr(kategoria.id)}
                          className={[
                            "relative overflow-hidden rounded-xl px-4 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                            filtr === kategoria.id
                              ? "bg-violet-500/20 text-white"
                              : "text-slate-400 hover:bg-white/5 hover:text-white",
                          ].join(" ")}
                        >
                          {kategoria.etykieta}
                          {filtr === kategoria.id && (
                            <span
                              aria-hidden="true"
                              className="absolute bottom-0 left-1/2 h-[2px] w-1/2 -translate-x-1/2 bg-cyan-400"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full md:mr-1 md:w-72">
                      <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-500">
                        <IkonaSzukaj />
                      </span>
                      <input
                        type="search"
                        value={fraza}
                        onChange={(event) => setFraza(event.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-800 bg-[#0A0A0A] pl-10 pr-3 text-sm font-semibold text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-cyan-400/30"
                        placeholder={tekst.searchPlaceholder}
                        aria-label={tekst.searchAria}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* odpowiada za siatke kart integracji i akcje polaczenia */}
              {wyniki.length === 0 ? (
                <p className="rounded-xl border border-slate-800 bg-[#0F1115] px-4 py-3 text-sm font-semibold text-slate-300">
                  {tekst.noResults}
                </p>
              ) : (
                <section className="grid grid-cols-1 gap-4 pb-1 sm:grid-cols-2 xl:grid-cols-3">
                  {wyniki.map((integracja) => {
                    const czyPolaczona = integracja.stanPolaczenia === "connected";
                    return (
                      <article key={integracja.id} className="group relative h-48 w-full">
                        <div
                          className="absolute -inset-0.5 rounded-2xl blur transition duration-500 group-hover:opacity-75 group-hover:duration-200"
                          style={{ backgroundColor: integracja.kolor, opacity: 0.2 }}
                          aria-hidden="true"
                        />

                        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-slate-800/70 bg-[#0F1115] p-5 transition-all duration-300 group-hover:-translate-y-[2px] group-hover:bg-[#13161C]">
                          <div
                            className="pointer-events-none absolute inset-0 opacity-[0.03]"
                            style={{
                              backgroundImage:
                                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                              backgroundSize: "20px 20px",
                            }}
                            aria-hidden="true"
                          />

                          <div className="relative z-10 flex items-start justify-between">
                            <div className="relative">
                              <div
                                className="absolute inset-0 blur-md transition-opacity group-hover:opacity-40"
                                style={{ backgroundColor: integracja.kolor, opacity: 0.2 }}
                                aria-hidden="true"
                              />
                              <div className="relative">
                                <IkonaIntegracji
                                  nazwa={integracja.nazwa}
                                  kategoria={integracja.kategoria}
                                  rozmiar="lg"
                                  kolor={integracja.kolor}
                                  skrotNadpisany={integracja.ikonaSkrot}
                                  className="rounded-lg border-slate-700/60 bg-[#1A1D24]"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              <span
                                className={[
                                  "rounded-full border px-2 py-1 text-[10px] font-extrabold tracking-[0.12em] uppercase",
                                  klasaStatusuTechnicznego(integracja.status),
                                ].join(" ")}
                              >
                                {tekst.statusLabel[integracja.status]}
                              </span>

                              {czyPolaczona ? (
                                <>
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-black tracking-[0.12em] uppercase text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {tekst.activeLabel}
                                  </span>
                                  {integracja.metryki ? (
                                    <span className="text-[10px] font-mono text-slate-500">
                                      {integracja.metryki}
                                    </span>
                                  ) : null}
                                </>
                              ) : (
                                <span className="mt-2 mr-1 h-2 w-2 rounded-full bg-slate-700" />
                              )}
                            </div>
                          </div>

                          <div className="relative z-10 mt-2">
                            <h4 className="text-lg font-black tracking-tight text-white transition-all group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text group-hover:text-transparent">
                              {integracja.nazwa}
                            </h4>
                            <p className="mt-1 text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500">
                              {etykietaKategorii.get(integracja.kategoria) ?? integracja.kategoria}
                            </p>
                          </div>

                          <div className="relative z-10 mt-auto flex items-center justify-between border-t border-slate-800/60 pt-3">
                            {czyPolaczona ? (
                              <button
                                type="button"
                                onClick={() => onWybierzIntegracje(integracja)}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                                aria-label={tekst.openConfigAria(integracja.nazwa)}
                              >
                                <IkonaUstawienia />
                                {tekst.configLabel}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onWybierzIntegracje(integracja)}
                                className="group/btn inline-flex items-center gap-2 text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                                aria-label={tekst.connectIntegrationAria(integracja.nazwa)}
                              >
                                <span className="-translate-x-2 text-cyan-400 opacity-0 transition-all duration-300 group-hover/btn:translate-x-0 group-hover/btn:opacity-100">
                                  {tekst.connectLabel}
                                </span>
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-200 transition-colors duration-300 group-hover/btn:bg-violet-600">
                                  <IkonaPlus />
                                </span>
                              </button>
                            )}

                            <span
                              aria-hidden="true"
                              className="h-1 w-8 rounded-full transition-all duration-500 group-hover:w-16"
                              style={{
                                backgroundColor: czyPolaczona ? "#10B981" : integracja.kolor,
                                opacity: czyPolaczona ? 1 : 0.6,
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      window.location.assign(
                        `mailto:integracje@papadata.pl?subject=${encodeURIComponent(tekst.addNewMailSubject)}`
                      )
                    }
                    className="group flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 text-center transition-all hover:border-slate-600 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    aria-label={tekst.addNewAria}
                  >
                    <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-500 transition-transform group-hover:scale-110 group-hover:text-white">
                      <IkonaPlus />
                    </span>
                    <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-300">
                      {tekst.addNewLabel}
                    </span>
                  </button>
                </section>
              )}
            </div>
          </div>

          {/* odpowiada za zamkniecie dialogu */}
          <footer className="mt-5 flex justify-end border-t border-black/10 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={onZamknij}
              className="pd-btn-secondary h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:text-slate-100"
            >
              {tekst.closeButton}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default ModalIntegracji;
