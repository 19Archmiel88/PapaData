import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

type WariantPrzycisku = "primary" | "secondary" | "ghost";
type RozmiarPrzycisku = "sm" | "md" | "lg";

type PrzyciskUiProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  wariant?: WariantPrzycisku;
  rozmiar?: RozmiarPrzycisku;
  ladowanie?: boolean;
};

const KLASY_WARIANTU: Record<WariantPrzycisku, string> = {
  primary:
    "pd-btn-primary border border-cyan-300/30 text-white hover:brightness-105 active:brightness-95",
  secondary:
    "pd-btn-secondary border border-slate-300/35 text-slate-900 hover:border-violet-300/40 dark:text-slate-100",
  ghost:
    "border border-transparent bg-transparent text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10",
};

const KLASY_ROZMIARU: Record<RozmiarPrzycisku, string> = {
  sm: "h-9 px-4 text-xs font-bold",
  md: "h-11 px-5 text-sm font-bold",
  lg: "h-12 px-7 text-base font-extrabold",
};

export const PrzyciskUi = forwardRef<HTMLButtonElement, PrzyciskUiProps>(function PrzyciskUi(
  {
    children,
    className,
    wariant = "primary",
    rozmiar = "md",
    disabled,
    ladowanie = false,
    type = "button",
    ...props
  },
  ref
) {
  const nieaktywny = disabled || ladowanie;

  return (
    <button
      ref={ref}
      type={type}
      disabled={nieaktywny}
      aria-busy={ladowanie || undefined}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
        "dark:focus-visible:ring-offset-slate-900",
        "disabled:cursor-not-allowed disabled:opacity-60",
        KLASY_WARIANTU[wariant],
        KLASY_ROZMIARU[rozmiar],
        className
      )}
      {...props}
    >
      {ladowanie ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      <span className={cx("inline-flex items-center gap-2", ladowanie && "opacity-80")}>{children}</span>
    </button>
  );
});

export default PrzyciskUi;
