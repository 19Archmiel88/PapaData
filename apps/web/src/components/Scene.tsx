import { memo, useEffect, useRef } from "react";
import type { StanSystemuAtmosfery } from "../app/atmosfera/stanSystemuAtmosfery";

export type MotionProfile = "cinematic" | "balanced" | "still";

export type SceneProps = {
  // odpowiada za profil ruchu atmosfery (cinematic / balanced / still)
  motion?: MotionProfile;
  // odpowiada za semantyczny stan systemu sterujacy intensywnoscia tla
  stanSystemu?: StanSystemuAtmosfery;
  className?: string;
};

/**
 * SCENE / ATMOSPHERE ENGINE
 *
 * Odpowiada za:
 * - aurora / mesh / grid / noise / sheen / vignette
 * - globalny profil ruchu przez data-pd-motion
 *
 * Zasady:
 * - prefers-reduced-motion ma najwyzszy priorytet
 * - komponent ustawia i sprzata tylko swoje atrybuty/klasy
 * - warstwa pozostaje zawsze pointer-events none (tlo)
 */
export const Scene = memo(function Scene({
  motion = "balanced",
  stanSystemu = "gotowe",
  className,
}: SceneProps) {
  const appliedClassRef = useRef<MotionProfile | null>(null);
  const appliedStateRef = useRef<StanSystemuAtmosfery | null>(null);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    const root = document.documentElement;
    const classFor: Record<MotionProfile, string> = {
      cinematic: "pd-motion-cinematic",
      balanced: "pd-motion-balanced",
      still: "pd-motion-still",
    };

    const applyProfile = (profile: MotionProfile) => {
      if (appliedClassRef.current) {
        root.classList.remove(classFor[appliedClassRef.current]);
      }
      root.classList.add(classFor[profile]);
      root.setAttribute("data-pd-motion", profile);
      appliedClassRef.current = profile;
    };

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => applyProfile(mql.matches ? "still" : motion);

    sync();
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", sync);
    } else {
      mql.addListener(sync);
    }

    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", sync);
      } else {
        mql.removeListener(sync);
      }

      if (appliedClassRef.current) {
        root.classList.remove(classFor[appliedClassRef.current]);
        root.removeAttribute("data-pd-motion");
        appliedClassRef.current = null;
      }
    };
  }, [motion]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.setAttribute("data-pd-system-state", stanSystemu);
    appliedStateRef.current = stanSystemu;

    return () => {
      if (appliedStateRef.current === stanSystemu) {
        root.removeAttribute("data-pd-system-state");
        appliedStateRef.current = null;
      }
    };
  }, [stanSystemu]);

  return (
    <div
      className={["fixed inset-0 z-0 pointer-events-none", "pd-scene", className ?? ""].join(" ")}
      aria-hidden="true"
      data-pd-layer="atmosphere"
    >
      <div className="pd-blob pd-blob-a" />
      <div className="pd-blob pd-blob-b" />
      <div className="pd-blob pd-blob-c" />
      <div className="pd-energy-core" />
      <div className="pd-aurora" />
      <div className="pd-mesh" />
      <div className="pd-grid" />
      <div className="pd-noise" />
      <div className="pd-sheen" />
      <div className="pd-statewash" />
      <div className="pd-vignette" />
    </div>
  );
});

export default Scene;
