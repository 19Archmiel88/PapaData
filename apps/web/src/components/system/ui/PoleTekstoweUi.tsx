import { forwardRef, useId, type InputHTMLAttributes } from "react";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

type PoleTekstoweUiProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  etykieta?: string;
  pomoc?: string;
  blad?: string;
};

export const PoleTekstoweUi = forwardRef<HTMLInputElement, PoleTekstoweUiProps>(
  function PoleTekstoweUi({ etykieta, pomoc, blad, className, id, ...props }, ref) {
    const autoId = useId();
    const resolvedId = id ?? `pole-${autoId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const infoId = `${resolvedId}-info`;
    const komunikat = blad ?? pomoc;

    return (
      <label htmlFor={resolvedId} className="block space-y-2">
        {etykieta ? (
          <span className="block pl-1 text-[10px] font-bold tracking-[0.14em] uppercase text-slate-500 dark:text-slate-400">
            {etykieta}
          </span>
        ) : null}

        <input
          ref={ref}
          id={resolvedId}
          aria-invalid={Boolean(blad) || undefined}
          aria-describedby={komunikat ? infoId : undefined}
          className={cx(
            "h-11 w-full rounded-xl border px-4 text-sm font-semibold outline-none transition-all duration-200",
            "border-slate-300/70 bg-white/90 text-slate-900 placeholder:text-slate-400",
            "focus:border-violet-400/60 focus:ring-2 focus:ring-cyan-300/35",
            "dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500",
            "dark:focus:border-violet-300/55 dark:focus:ring-cyan-400/30",
            blad &&
              "border-rose-500/60 focus:border-rose-500 focus:ring-rose-300/30 dark:border-rose-500/60 dark:focus:border-rose-400",
            className
          )}
          {...props}
        />

        {komunikat ? (
          <span
            id={infoId}
            className={cx(
              "block px-1 text-xs font-semibold",
              blad ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
            )}
          >
            {komunikat}
          </span>
        ) : null}
      </label>
    );
  }
);

export default PoleTekstoweUi;
