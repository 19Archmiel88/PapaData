import { useEffect, useState, type ReactNode } from "react";

type AnimowanyHeroProps = {
  children: ReactNode;
  className?: string;
  intensywnoscGlow?: number;
};

function cx(...wartosci: Array<string | false | null | undefined>) {
  return wartosci.filter(Boolean).join(" ");
}

function clamp(min: number, max: number, value: number) {
  return Math.max(min, Math.min(max, value));
}

export function AnimowanyHero({
  children,
  className,
  intensywnoscGlow = 1,
}: AnimowanyHeroProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  // odpowiada za reakcje na prefers-reduced-motion bez zewnetrznych bibliotek
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    const aktualizuj = () => setReduceMotion(mql.matches);
    aktualizuj();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", aktualizuj);
      return () => mql.removeEventListener("change", aktualizuj);
    }

    mql.addListener(aktualizuj);
    return () => mql.removeListener(aktualizuj);
  }, []);

  const opacityGlowA = clamp(0.08, 0.9, 0.36 * intensywnoscGlow);
  const opacityGlowB = clamp(0.06, 0.78, 0.28 * intensywnoscGlow);

  return (
    <div
      className={cx("pd-hero-animated relative isolate", !reduceMotion && "pd-hero-enter", className)}
    >
      <div
        aria-hidden="true"
        className={cx("pd-hero-glow-a", !reduceMotion && "pd-hero-glow-a-anim")}
        style={{ opacity: opacityGlowA }}
      />
      <div
        aria-hidden="true"
        className={cx("pd-hero-glow-b", !reduceMotion && "pd-hero-glow-b-anim")}
        style={{ opacity: opacityGlowB }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default AnimowanyHero;

