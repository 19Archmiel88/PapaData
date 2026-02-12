import { useEffect } from "react";

export function useGlobalPointerGlow() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const root = document.documentElement;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarsePointer || reducedMotion) return;

    let rafId = 0;
    let x = 50;
    let y = 36;

    const ustawPozycje = () => {
      rafId = 0;
      root.style.setProperty("--pd-pointer-x", `${x}%`);
      root.style.setProperty("--pd-pointer-y", `${y}%`);
    };

    const onPointerMove = (event: PointerEvent) => {
      x = Math.max(0, Math.min(100, (event.clientX / window.innerWidth) * 100));
      y = Math.max(0, Math.min(100, (event.clientY / window.innerHeight) * 100));
      if (rafId) return;
      rafId = window.requestAnimationFrame(ustawPozycje);
    };

    root.style.setProperty("--pd-pointer-x", "50%");
    root.style.setProperty("--pd-pointer-y", "36%");
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (rafId) window.cancelAnimationFrame(rafId);
      root.style.removeProperty("--pd-pointer-x");
      root.style.removeProperty("--pd-pointer-y");
    };
  }, []);
}

export default useGlobalPointerGlow;
