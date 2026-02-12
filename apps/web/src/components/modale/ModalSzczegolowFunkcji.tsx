import { useId, useRef } from "react";
import {
  useBlokadaScrollaWDialogu,
  usePulapkaFokusuWDialogu,
} from "./narzedziaModala";
import { useUI } from "../../context/useUI";

export type SzczegolyFunkcji = {
  nazwa: string;
  opis: string;
  zastosowania: string[];
  daneWejsciowe: string;
};

type ModalSzczegolowFunkcjiProps = {
  otwarty: boolean;
  funkcja: SzczegolyFunkcji | null;
  onZamknij: () => void;
};

type TekstyModalaFunkcji = {
  closeOverlayAria: string;
  moduleLabel: string;
  closeModalAria: string;
  whatYouGetLabel: string;
  requiredDataLabel: string;
  closeButtonLabel: string;
};

const TEKSTY_MODALA_FUNKCJI: Record<"pl" | "en", TekstyModalaFunkcji> = {
  pl: {
    closeOverlayAria: "Zamknij modal szczegółów funkcji",
    moduleLabel: "Moduł raportowy",
    closeModalAria: "Zamknij modal",
    whatYouGetLabel: "Co dostajesz",
    requiredDataLabel: "Wymagane dane",
    closeButtonLabel: "Zamknij",
  },
  en: {
    closeOverlayAria: "Close feature details modal",
    moduleLabel: "Reporting module",
    closeModalAria: "Close modal",
    whatYouGetLabel: "What you get",
    requiredDataLabel: "Required data",
    closeButtonLabel: "Close",
  },
};

export function ModalSzczegolowFunkcji({
  otwarty,
  funkcja,
  onZamknij,
}: ModalSzczegolowFunkcjiProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_MODALA_FUNKCJI[jezyk];
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ostatniFokusRef = useRef<HTMLElement | null>(null);
  const idTytulu = useId();
  const idOpisu = useId();

  useBlokadaScrollaWDialogu(otwarty);
  usePulapkaFokusuWDialogu({
    otwarty,
    panelRef,
    ostatniFokusRef,
    onEscape: onZamknij,
  });

  if (!otwarty || !funkcja) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)]">
      <button
        type="button"
        aria-label={tekst.closeOverlayAria}
        className="absolute inset-0 h-full w-full bg-slate-950/65 backdrop-blur-[2px]"
        onClick={onZamknij}
      />

      <div className="relative z-[var(--z-floating)] flex min-h-screen items-center justify-center px-4 py-8">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTytulu}
          aria-describedby={idOpisu}
          tabIndex={-1}
          className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft w-full max-w-[760px] rounded-[28px] p-6 outline-none md:p-7"
        >
          {/* odpowiada za naglowek i kontekst funkcji analitycznej */}
          <header className="flex items-start justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                {tekst.moduleLabel}
              </p>
              <h3
                id={idTytulu}
                className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50"
              >
                {funkcja.nazwa}
              </h3>
              <p
                id={idOpisu}
                className="mt-2 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
              >
                {funkcja.opis}
              </p>
            </div>

            <button
              type="button"
              onClick={onZamknij}
              className="pd-focus-ring grid h-11 w-11 place-items-center rounded-2xl border border-black/10 bg-white/70 text-lg font-black text-slate-800 transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              aria-label={tekst.closeModalAria}
            >
              ×
            </button>
          </header>

          {/* odpowiada za konkretne zastosowania i wymagane dane */}
          <section className="mt-5 grid gap-4 md:grid-cols-[1fr_0.95fr]">
            <article className="pd-enterprise-card-muted rounded-2xl p-4">
              <p className="text-xs font-extrabold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
                {tekst.whatYouGetLabel}
              </p>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {funkcja.zastosowania.map((pozycja) => (
                  <li key={pozycja} className="inline-flex items-start gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    {pozycja}
                  </li>
                ))}
              </ul>
            </article>

            <article className="pd-enterprise-card-muted rounded-2xl p-4">
              <p className="text-xs font-extrabold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
                {tekst.requiredDataLabel}
              </p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                {funkcja.daneWejsciowe}
              </p>
            </article>
          </section>

          {/* odpowiada za domkniecie akcji w modalu */}
          <footer className="mt-6 flex justify-end border-t border-black/10 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={onZamknij}
              className="pd-btn-secondary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 dark:text-slate-100"
            >
              {tekst.closeButtonLabel}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default ModalSzczegolowFunkcji;
