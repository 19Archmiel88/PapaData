import { useId, useRef } from "react";
import {
  useBlokadaScrollaWDialogu,
  usePulapkaFokusuWDialogu,
} from "./narzedziaModala";

type ModalPowiadomienieDemoProps = {
  otwarty: boolean;
  onPrimary: () => void;
  onZamknij: () => void;
};

export function ModalPowiadomienieDemo({
  otwarty,
  onPrimary,
  onZamknij,
}: ModalPowiadomienieDemoProps) {
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
        aria-label="Zamknij okno informacji o demo"
      />

      <div className="relative z-[var(--z-floating)] flex min-h-screen items-center justify-center px-4 py-8">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTytulu}
          aria-describedby={idOpisu}
          tabIndex={-1}
          className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft w-full max-w-[640px] rounded-[28px] p-6 outline-none md:p-7"
        >
          {/* odpowiada za komunikat i jasny wybor sciezki demo */}
          <header className="flex items-start justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                Demo produktu
              </p>
              <h3
                id={idTytulu}
                className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50"
              >
                Pokazemy Ci wersje na realnych scenariuszach e-commerce.
              </h3>
            </div>
            <button
              type="button"
              onClick={onZamknij}
              className="pd-focus-ring grid h-11 w-11 place-items-center rounded-2xl border border-black/10 bg-white/70 text-lg font-black text-slate-800 transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              aria-label="Zamknij modal"
            >
              ×
            </button>
          </header>

          <p
            id={idOpisu}
            className="mt-5 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
          >
            Demo obejmuje przekroj kampanii, marzy i priorytetow Guardiana. Jesli chcesz przejsc
            dalej od razu, uruchom trial albo zaloz konto i dostaniesz dostep do pelnej sciezki.
          </p>

          <footer className="mt-6 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end dark:border-white/10">
            <button
              type="button"
              onClick={onPrimary}
              className="pd-btn-primary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
            >
              Przejdź do logowania
            </button>
            <button
              type="button"
              onClick={onZamknij}
              className="pd-btn-secondary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 dark:text-slate-100"
            >
              Zamknij
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default ModalPowiadomienieDemo;
