import { memo, useEffect, type ReactNode } from "react";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

type RozmiarNakladki = "sm" | "md" | "lg" | "xl";
type PaddingNakladki = "tight" | "normal" | "roomy";

type NakladkaUiProps = {
  isOpen: boolean;
  onClose: () => void;
  tytul?: string;
  children: ReactNode;
  rozmiar?: RozmiarNakladki;
  padding?: PaddingNakladki;
  className?: string;
  pokazZamknij?: boolean;
};

const KLASY_ROZMIARU: Record<RozmiarNakladki, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[620px]",
  lg: "max-w-[840px]",
  xl: "max-w-[1080px]",
};

const KLASY_PADDINGU: Record<PaddingNakladki, string> = {
  tight: "p-4 md:p-6",
  normal: "p-6 md:p-8",
  roomy: "p-8 md:p-12",
};

function IkonaZamknij() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const NakladkaUi = memo(function NakladkaUi({
  isOpen,
  onClose,
  tytul,
  children,
  rozmiar = "md",
  padding = "normal",
  className,
  pokazZamknij = true,
}: NakladkaUiProps) {
  // odpowiada za blokade przewijania tla, gdy dialog jest aktywny
  useEffect(() => {
    if (typeof document === "undefined") return;

    const poprzedniOverflow = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : poprzedniOverflow;

    return () => {
      document.body.style.overflow = poprzedniOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"
        aria-label="Zamknij nakladke"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "pd-glass pd-edge pd-innerglow relative z-[var(--z-floating)] w-full rounded-[2rem] border",
          "border-slate-200/80 dark:border-white/10",
          KLASY_ROZMIARU[rozmiar],
          className
        )}
      >
        {(tytul || pokazZamknij) && (
          <header className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5 dark:border-white/10">
            {tytul ? (
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                {tytul}
              </h2>
            ) : (
              <span />
            )}
            {pokazZamknij ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Zamknij"
              >
                <IkonaZamknij />
              </button>
            ) : null}
          </header>
        )}

        <div className={KLASY_PADDINGU[padding]}>{children}</div>
      </div>
    </div>
  );
});

export default NakladkaUi;
