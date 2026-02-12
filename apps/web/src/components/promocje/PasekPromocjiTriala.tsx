type PasekPromocjiTrialaProps = {
  widoczny: boolean;
  onPrimary: () => void;
  onPokazSzczegoly: () => void;
  onUkryj: () => void;
};

export function PasekPromocjiTriala({
  widoczny,
  onPrimary,
  onPokazSzczegoly,
  onUkryj,
}: PasekPromocjiTrialaProps) {
  if (!widoczny) return null;

  return (
    <aside className="pointer-events-none fixed bottom-3 left-0 z-[var(--z-floating)] sm:bottom-4">
      <div className="pd-glass pd-edge pd-innerglow pointer-events-auto w-[min(84vw,250px)] rounded-r-[20px] border border-black/15 p-2.5 dark:border-white/15 sm:w-[250px]">
        {/* odpowiada za drobny lewy widget promocji triala z ikona prezentu */}
        <div className="flex items-start gap-2">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-black/10 bg-white/70 text-base dark:border-white/15 dark:bg-white/10"
            aria-hidden="true"
          >
            🎁
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400">
              Oferta 14 dni
            </p>
            <p className="mt-0.5 text-xs font-bold leading-snug text-slate-900 dark:text-slate-100">
              Trial bez karty.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onPrimary}
                className="pd-btn-primary pd-focus-ring h-8 rounded-lg px-2.5 text-[10px] font-extrabold tracking-[0.07em] uppercase text-white"
              >
                Trial
              </button>
              <button
                type="button"
                onClick={onPokazSzczegoly}
                className="pd-btn-secondary pd-focus-ring h-8 rounded-lg px-2.5 text-[10px] font-extrabold tracking-[0.07em] uppercase text-slate-900 dark:text-slate-100"
              >
                Info
              </button>
            </div>
          </div>
          <div className="shrink-0">
              <button
                type="button"
                onClick={onUkryj}
                className="pd-focus-ring grid h-7 w-7 place-items-center rounded-lg border border-black/10 bg-white/70 text-sm font-black text-slate-800 transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
                aria-label="Ukryj pasek promocji triala"
              >
                ×
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default PasekPromocjiTriala;
