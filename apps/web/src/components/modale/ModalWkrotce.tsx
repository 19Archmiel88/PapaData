import { useId, useRef } from "react";
import {
  useBlokadaScrollaWDialogu,
  usePulapkaFokusuWDialogu,
} from "./narzedziaModala";
import { useUI } from "../../context/useUI";

type ModalWkrotceProps = {
  otwarty: boolean;
  kontekst?: string;
  onZamknij: () => void;
};

type TekstyModaluWkrotce = {
  closeOverlayAria: string;
  kicker: string;
  title: string;
  closeModalAria: string;
  description: (kontekst?: string) => string;
  closeButton: string;
};

const TEKSTY_MODALU_WKROTCE: Record<"pl" | "en", TekstyModaluWkrotce> = {
  pl: {
    closeOverlayAria: "Zamknij modal informacji o wdrożeniu",
    kicker: "Status rolloutu",
    title: "Ta funkcja będzie dostępna wkrótce.",
    closeModalAria: "Zamknij modal",
    description: (kontekst) =>
      `${kontekst ? `Rozszerzenie "${kontekst}" jest w kolejce wdrożeniowej.` : "Rozszerzenie jest w kolejce wdrożeniowej."} Skontaktuj się z zespołem enterprise, aby dostać plan uruchomienia i ETA.`,
    closeButton: "Zamknij",
  },
  en: {
    closeOverlayAria: "Close rollout information modal",
    kicker: "Rollout status",
    title: "This feature will be available soon.",
    closeModalAria: "Close modal",
    description: (kontekst) =>
      `${kontekst ? `Extension "${kontekst}" is in rollout queue.` : "Extension is in rollout queue."} Contact enterprise team to get launch plan and ETA.`,
    closeButton: "Close",
  },
};

export function ModalWkrotce({ otwarty, kontekst, onZamknij }: ModalWkrotceProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_MODALU_WKROTCE[jezyk];
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
          className="pd-glass glass-panel pd-edge pd-innerglow w-full max-w-[620px] rounded-[28px] p-6 outline-none md:p-7"
        >
          {/* odpowiada za prosty komunikat statusu rolloutu danej funkcji */}
          <header className="flex items-start justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                {tekst.kicker}
              </p>
              <h3
                id={idTytulu}
                className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50"
              >
                {tekst.title}
              </h3>
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

          <p
            id={idOpisu}
            className="mt-5 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
          >
            {tekst.description(kontekst)}
          </p>

          <footer className="mt-6 flex justify-end border-t border-black/10 pt-5 dark:border-white/10">
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

export default ModalWkrotce;
