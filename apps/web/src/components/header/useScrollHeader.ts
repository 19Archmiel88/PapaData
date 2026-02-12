import { useEffect, useRef, useState } from "react";

export type ScrollHeaderState = {
  y: number;
  dir: "up" | "down";
  /**
   * true gdy jesteśmy blisko górnej krawędzi strony
   */
  atTop: boolean;
  /**
   * true gdy header ma być pokazany
   */
  show: boolean;
  /**
   * true gdy header jest w trybie glass toolbar
   * (czyli po przekroczeniu progu)
   */
  pinned: boolean;
};

type Options = {
  /**
   * px od góry traktowane jako strefa "atTop"
   */
  topThreshold?: number;

  /**
   * minimalny delta scrolla do uznania zmiany kierunku
   */
  dirThreshold?: number;

  /**
   * px od góry, po którym header może wejść w tryb toolbar
   * (ALE nadal tylko po scroll-up!)
   */
  pinThreshold?: number;
};

/**
 * CINEMATIC SCROLL HEADER ENGINE
 *
 * ZASADY:
 * - header jest stale widoczny (nawigacja produktowa nie znika)
 * - scroll zmienia tylko tryb: hero -> pinned toolbar
 */
export function useScrollHeader(options: Options = {}): ScrollHeaderState {
  const topThreshold = options.topThreshold ?? 18;
  const dirThreshold = options.dirThreshold ?? 8;
  const pinThreshold = options.pinThreshold ?? 96;

  const [state, setState] = useState<ScrollHeaderState>(() => ({
    y: 0,
    dir: "down",
    atTop: true,
    show: true,
    pinned: false,
  }));

  const rafRef = useRef<number | null>(null);
  const lastYRef = useRef(0);
  const dirRef = useRef<"up" | "down">("down");

  useEffect(() => {
    if (typeof window === "undefined") return;

    lastYRef.current = window.scrollY || 0;

    const onScroll = () => {
      if (rafRef.current != null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;

        const y = window.scrollY || 0;
        const lastY = lastYRef.current;
        const delta = y - lastY;
        const abs = Math.abs(delta);

        if (abs >= dirThreshold) {
          dirRef.current = delta < 0 ? "up" : "down";
        }

        const atTop = y <= topThreshold;

        /**
         * pinned:
         * - informacyjny stan: jesteśmy po progu toolbar
         */
        const pinned = y >= pinThreshold;

        // odpowiada za stale utrzymanie dostepu do nawigacji
        const show = true;

        lastYRef.current = y;

        setState((prev) => {
          if (
            prev.y === y &&
            prev.dir === dirRef.current &&
            prev.atTop === atTop &&
            prev.show === show &&
            prev.pinned === pinned
          ) {
            return prev;
          }
          return {
            y,
            dir: dirRef.current,
            atTop,
            show,
            pinned,
          };
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [topThreshold, dirThreshold, pinThreshold]);

  return state;
}
