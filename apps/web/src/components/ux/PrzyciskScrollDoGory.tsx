import { useEffect, useMemo, useState } from "react";

type PrzyciskScrollDoGoryProps = {
  ukryty?: boolean;
};

function cls(...wartosci: Array<string | false | null | undefined>) {
  return wartosci.filter(Boolean).join(" ");
}

export function PrzyciskScrollDoGory({ ukryty = false }: PrzyciskScrollDoGoryProps) {
  const [widoczny, setWidoczny] = useState(false);
  const preferReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // odpowiada za widocznosc przycisku po przewinieciu strony
  useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId = 0;

    const odswiez = () => {
      rafId = 0;
      const kolejnyStan = window.scrollY > 420;
      setWidoczny((poprzedni) => (poprzedni === kolejnyStan ? poprzedni : kolejnyStan));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(odswiez);
    };

    odswiez();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!widoczny || ukryty) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: preferReducedMotion ? "auto" : "smooth",
        })
      }
      className={cls(
        "pd-focus-ring fixed bottom-[88px] right-[18px] z-[var(--z-floating)] grid h-10 w-10 place-items-center rounded-xl border border-black/15 bg-white/90 text-base font-black text-slate-900 shadow-[0_14px_34px_-24px_rgba(2,6,23,0.8)] transition hover:bg-white dark:border-white/15 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:bg-slate-900",
        "sm:bottom-[92px] sm:right-[22px]"
      )}
      aria-label="Przewin strone do gory"
    >
      ↑
    </button>
  );
}

export default PrzyciskScrollDoGory;
