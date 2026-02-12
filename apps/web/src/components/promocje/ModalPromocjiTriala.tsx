import { useId, useRef } from "react";
import {
  useBlokadaScrollaWDialogu,
  usePulapkaFokusuWDialogu,
} from "../modale/narzedziaModala";

type ModalPromocjiTrialaProps = {
  otwarty: boolean;
  onPrimary: () => void;
  onZamknij: () => void;
};

export function ModalPromocjiTriala({
  otwarty,
  onPrimary,
  onZamknij,
}: ModalPromocjiTrialaProps) {
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
        aria-label="Zamknij modal promocji triala"
      />

      <div className="relative z-[var(--z-floating)] flex min-h-screen items-center justify-center px-4 py-8">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTytulu}
          aria-describedby={idOpisu}
          tabIndex={-1}
          className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft w-full max-w-[680px] rounded-[28px] p-6 outline-none md:p-7"
        >
          {/* odpowiada za naglowek i glowna obietnice promocji */}
          <header className="border-b border-black/10 pb-4 dark:border-white/10">
            <p className="text-xs font-extrabold tracking-[0.22em] uppercase text-slate-500 dark:text-slate-400">
              Oferta czasowa
            </p>
            <h2
              id={idTytulu}
              className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50"
            >
              14 dni triala bez karty.
            </h2>
            <p
              id={idOpisu}
              className="mt-3 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
            >
              Uruchom srodowisko PapaData i zobacz pierwsze rekomendacje Guardiana na gotowym
              modelu danych. W kazdej chwili mozesz przejsc na plan platny albo zamknac trial.
            </p>
          </header>

          {/* odpowiada za najwazniejsze warunki i korzysci triala */}
          <section className="mt-5 grid gap-3 sm:grid-cols-3">
            <article className="pd-enterprise-card-muted rounded-2xl p-4">
              <p className="text-xs font-extrabold tracking-[0.14em] uppercase text-slate-500 dark:text-slate-400">
                Start
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                W 1 dzien roboczy
              </p>
            </article>
            <article className="pd-enterprise-card-muted rounded-2xl p-4">
              <p className="text-xs font-extrabold tracking-[0.14em] uppercase text-slate-500 dark:text-slate-400">
                Koszt
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                0 PLN przez 14 dni
              </p>
            </article>
            <article className="pd-enterprise-card-muted rounded-2xl p-4">
              <p className="text-xs font-extrabold tracking-[0.14em] uppercase text-slate-500 dark:text-slate-400">
                Zakres
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                Raporty + Papa Guardian
              </p>
            </article>
          </section>

          {/* odpowiada za domkniecie akcji w modalu promocji */}
          <footer className="mt-6 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-end dark:border-white/10">
            <button
              type="button"
              onClick={onPrimary}
              className="pd-btn-primary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
            >
              Rozpocznij trial
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

export default ModalPromocjiTriala;
