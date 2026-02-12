import { forwardRef, type HTMLAttributes } from "react";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

type KartaUiProps = HTMLAttributes<HTMLDivElement>;

export const KartaUi = forwardRef<HTMLDivElement, KartaUiProps>(function KartaUi(
  { children, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx(
        "pd-enterprise-card glass-card rounded-2xl p-6 md:p-8 transition-all duration-200",
        "border border-slate-300/35 dark:border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default KartaUi;
