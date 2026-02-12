import { useId, useRef, useState } from "react";
import type { IntegracjaKatalogu } from "../integracje/katalogIntegracji";
import {
  uzyjBlokadyScrollaWDialogu,
  uzyjPulapkiFokusuWDialogu,
} from "./narzedziaModala";
import { useUI } from "../../context/useUI";

type ModalPolaczeniaIntegracjiProps = {
  otwarty: boolean;
  integracja: IntegracjaKatalogu | null;
  onZamknij: () => void;
  onPotwierdzPolaczenie?: (integracja: IntegracjaKatalogu) => Promise<void> | void;
};

type TekstyModaluPolaczenia = {
  closeOverlayAria: string;
  kicker: string;
  title: (nazwa: string) => string;
  authLabel: string;
  closeModalAria: string;
  krokiLabel: string;
  krok1: string;
  krok2: string;
  krok3: string;
  connecting: string;
  connect: string;
  closeButton: string;
  startedMessage: (nazwa: string) => string;
  errorMessage: string;
};

const TEKSTY_MODALU_POLACZENIA: Record<"pl" | "en", TekstyModaluPolaczenia> = {
  pl: {
    closeOverlayAria: "Zamknij modal łączenia integracji",
    kicker: "Połączenie integracji",
    title: (nazwa) => `Podłącz: ${nazwa}`,
    authLabel: "Autoryzacja",
    closeModalAria: "Zamknij modal",
    krokiLabel: "Kroki",
    krok1: "Potwierdź uruchomienie i przekierowanie do autoryzacji.",
    krok2: "Zakończ autoryzację i wróć do PapaData.",
    krok3: "Po synchronizacji dane pojawią się w modelu raportowym.",
    connecting: "Łączenie...",
    connect: "Połącz integrację",
    closeButton: "Zamknij",
    startedMessage: (nazwa) => `Rozpoczęto proces łączenia: ${nazwa}.`,
    errorMessage: "Nie udało się uruchomić połączenia.",
  },
  en: {
    closeOverlayAria: "Close integration connection modal",
    kicker: "Integration connection",
    title: (nazwa) => `Connect: ${nazwa}`,
    authLabel: "Authorization",
    closeModalAria: "Close modal",
    krokiLabel: "Steps",
    krok1: "Confirm launch and redirect to authorization.",
    krok2: "Finish authorization and return to PapaData.",
    krok3: "After sync, data will appear in reporting model.",
    connecting: "Connecting...",
    connect: "Connect integration",
    closeButton: "Close",
    startedMessage: (nazwa) => `Connection process started: ${nazwa}.`,
    errorMessage: "Could not start connection.",
  },
};

export function ModalPolaczeniaIntegracji({
  otwarty,
  integracja,
  onZamknij,
  onPotwierdzPolaczenie,
}: ModalPolaczeniaIntegracjiProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_MODALU_POLACZENIA[jezyk];
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ostatniFokusRef = useRef<HTMLElement | null>(null);
  const [ladowanie, setLadowanie] = useState(false);
  const [komunikat, setKomunikat] = useState<string | null>(null);
  const idTytulu = useId();
  const idOpisu = useId();

  uzyjBlokadyScrollaWDialogu(otwarty);
  uzyjPulapkiFokusuWDialogu({
    otwarty,
    panelRef,
    ostatniFokusRef,
    onEscape: onZamknij,
  });

  if (!otwarty || !integracja) return null;

  const onPolacz = async () => {
    if (!integracja) return;
    setKomunikat(null);
    setLadowanie(true);
    try {
      await onPotwierdzPolaczenie?.(integracja);
      setKomunikat(tekst.startedMessage(integracja.nazwa));
    } catch (error) {
      const tresc = error instanceof Error ? error.message : tekst.errorMessage;
      setKomunikat(tresc);
    } finally {
      setLadowanie(false);
    }
  };

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
          className="pd-glass glass-panel pd-edge pd-innerglow w-full max-w-[660px] rounded-[28px] p-6 outline-none md:p-7"
        >
          {/* odpowiada za kontekst i kroki uruchomienia konkretnej integracji */}
          <header className="flex items-start justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                {tekst.kicker}
              </p>
              <h3
                id={idTytulu}
                className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50"
              >
                {tekst.title(integracja.nazwa)}
              </h3>
              <p
                id={idOpisu}
                className="mt-2 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
              >
                {integracja.opis} {tekst.authLabel}:{" "}
                <span className="font-black uppercase">{integracja.typAutoryzacji}</span>.
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

          <section className="mt-5 rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-extrabold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
              {tekst.krokiLabel}
            </p>
            <ol className="mt-3 space-y-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <li className="inline-flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                {tekst.krok1}
              </li>
              <li className="inline-flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                {tekst.krok2}
              </li>
              <li className="inline-flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                {tekst.krok3}
              </li>
            </ol>
          </section>

          {komunikat && (
            <p className="mt-4 rounded-2xl border border-sky-300/50 bg-sky-100/70 px-4 py-3 text-sm font-semibold text-sky-900 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-200">
              {komunikat}
            </p>
          )}

          <footer className="mt-6 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end dark:border-white/10">
            <button
              type="button"
              onClick={onPolacz}
              disabled={ladowanie}
              className="pd-btn-primary h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {ladowanie ? tekst.connecting : tekst.connect}
            </button>
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

export default ModalPolaczeniaIntegracji;
