// apps/web/src/components/TloAplikacji.tsx
import { memo, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

type TrybMotywu = "light" | "dark";
type WariantTla = "aurora" | "neural" | "both";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// odpowiada za szum (tekstura)
const NOISE_SVG_DATA_URI =
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

/* =========================================
   THEME STORE (bez setState w useEffect)
========================================= */

function pobierzTrybMotywuZDom(): TrybMotywu {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subskrybujZmianeMotywu(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  const html = document.documentElement;

  const observer = new MutationObserver(() => callback());
  observer.observe(html, { attributes: true, attributeFilter: ["class"] });

  return () => observer.disconnect();
}

function useTrybMotywu(): TrybMotywu {
  return useSyncExternalStore(
    subskrybujZmianeMotywu,
    pobierzTrybMotywuZDom,
    () => "light"
  );
}

// ------------------------- AURORA -------------------------
const WarstwaAurory = memo(function WarstwaAurory() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* gradienty — light */}
      <div
        className="absolute inset-0 dark:hidden opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(79,70,229,0.28), transparent 52%), radial-gradient(circle at 82% 78%, rgba(14,165,233,0.22), transparent 58%), radial-gradient(circle at 55% 45%, rgba(139,92,246,0.10), transparent 62%)",
        }}
      />
      {/* gradienty — dark */}
      <div
        className="absolute inset-0 hidden dark:block opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22% 14%, rgba(79,70,229,0.30), transparent 54%), radial-gradient(circle at 78% 84%, rgba(14,165,233,0.24), transparent 60%), radial-gradient(circle at 55% 48%, rgba(34,211,238,0.12), transparent 62%)",
        }}
      />

      {/* aurora blobs */}
      <div
        className="aurora-blob absolute w-190 h-190 top-[-14%] left-[-14%] bg-[#4E26E2] opacity-30! dark:opacity-24! animate-float motion-reduce:animate-none will-change-transform rounded-full"
        style={{ animationDuration: "18s" }}
      />

      <div
        className="aurora-blob absolute w-170 h-170 bottom-[-18%] right-[-14%] bg-[#4285F4] opacity-26! dark:opacity-20! animate-float motion-reduce:animate-none will-change-transform rounded-full"
        style={{ animationDuration: "22s", animationDelay: "1.2s" }}
      />

      <div
        className="aurora-blob absolute w-140 h-140 top-[42%] left-[14%] bg-[#22D3EE] opacity-18! dark:opacity-14! animate-float motion-reduce:animate-none will-change-transform rounded-full"
        style={{ animationDuration: "26s", animationDelay: "3.8s" }}
      />

      <div
        className="aurora-blob absolute w-130 h-130 top-[18%] right-[10%] bg-[#A78BFA] opacity-16! dark:opacity-12! animate-float motion-reduce:animate-none will-change-transform rounded-full"
        style={{ animationDuration: "20s", animationDelay: "2.4s" }}
      />

      {/* delikatny sheen */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-30"
        style={{
          backgroundImage: "radial-gradient(ellipse at center, rgba(255,255,255,0.22), transparent 60%)",
        }}
      />

      {/* film grain */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.045]"
        style={{ backgroundImage: NOISE_SVG_DATA_URI }}
      />
    </div>
  );
});

// ------------------------- NEURAL -------------------------
type KonfiguracjaKolorow = {
  dot: string;
  connect: string;
};

class Czastka {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  density: number;

  constructor(width: number, height: number, speedMul: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    const base = 0.55 * speedMul;
    this.vx = (Math.random() - 0.5) * base;
    this.vy = (Math.random() - 0.5) * base;

    this.size = Math.random() * 2.2 + 0.7;
    this.density = Math.random() * 30 + 1;
  }

  update(width: number, height: number, mouseX: number, mouseY: number, repelMul: number) {
    this.x += this.vx;
    this.y += this.vy;

    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distSq = dx * dx + dy * dy;
    const maxDist = 220;

    if (distSq < maxDist * maxDist) {
      const distance = Math.sqrt(distSq);
      if (distance > 0.0001) {
        const force = (maxDist - distance) / maxDist;
        const directionX = (dx / distance) * force * this.density;
        const directionY = (dy / distance) * force * this.density;

        this.x -= directionX * 0.032 * repelMul;
        this.y -= directionY * 0.032 * repelMul;
      }
    }

    // zawijanie
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
}

const WarstwaNeural = memo(function WarstwaNeural({ theme }: { theme: TrybMotywu }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const koloryRef = useRef<KonfiguracjaKolorow>({ dot: "", connect: "" });
  const parametryRef = useRef({
    isDark: false,
    connectDist: 140,
    speedMul: 1,
    repelMul: 1,
  });

  // mapowanie motywu -> kolory/parametry (bez setState; ref jest OK)
  useEffect(() => {
    const isDark = theme === "dark";

    koloryRef.current = {
      dot: isDark ? "rgba(78, 38, 226, 0.55)" : "rgba(78, 38, 226, 0.32)",
      connect: isDark ? "rgba(66, 133, 244, 0.22)" : "rgba(66, 133, 244, 0.16)",
    };

    parametryRef.current = {
      isDark,
      connectDist: isDark ? 155 : 170,
      speedMul: isDark ? 1.15 : 1.1,
      repelMul: isDark ? 1.2 : 1.15,
    };
  }, [theme]);

  // canvas + animacja + cleanup
  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let czastki: Czastka[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;

    let rafId = 0;
    let running = false;

    const clampDpr = (v: number) => Math.max(1, Math.min(2, v || 1));

    const reduceMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let reduceMotion = Boolean(reduceMotionQuery?.matches);

    const rysuj = ({ animate }: { animate: boolean }) => {
      ctx.clearRect(0, 0, width, height);

      const aktualneKolory = koloryRef.current;
      const { connectDist, repelMul, isDark } = parametryRef.current;
      const connectDistSq = connectDist * connectDist;

      if (mouse.current.x === 0 && mouse.current.y === 0) {
        mouse.current.x = width / 2;
        mouse.current.y = height / 2;
      }

      const t = performance.now() / 1000;
      const pulse = isDark ? 0.85 + 0.15 * Math.sin(t * 1.6) : 0.78 + 0.22 * Math.sin(t * 1.8);

      if (animate) {
        for (let i = 0; i < czastki.length; i++) {
          czastki[i].update(width, height, mouse.current.x, mouse.current.y, repelMul);
        }
      }

      // linie połączeń
      ctx.beginPath();
      ctx.strokeStyle = aktualneKolory.connect;
      ctx.lineWidth = isDark ? 1.05 : 1.1;

      for (let i = 0; i < czastki.length; i++) {
        const p = czastki[i];
        for (let j = i + 1; j < czastki.length; j++) {
          const q = czastki[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connectDistSq) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
        }
      }

      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = animate ? Math.min(1, Math.max(0.35, pulse)) : isDark ? 0.85 : 0.8;
      ctx.stroke();
      ctx.globalAlpha = prevAlpha;

      // kropki
      ctx.beginPath();
      ctx.fillStyle = aktualneKolory.dot;
      ctx.globalAlpha = isDark ? 0.9 : 0.95;

      for (let i = 0; i < czastki.length; i++) {
        const p = czastki[i];
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }

      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const initCzastek = () => {
      czastki = [];
      const { speedMul } = parametryRef.current;
      const ilosc = width < 768 ? 55 : 120;
      for (let i = 0; i < ilosc; i++) {
        czastki.push(new Czastka(width, height, speedMul));
      }
    };

    const resize = () => {
      dpr = clampDpr(window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      mouse.current.x = width / 2;
      mouse.current.y = height / 2;

      initCzastek();
      rysuj({ animate: !reduceMotion });
    };

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 200);
    };

    const onPointerMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const onPointerLeave = () => {
      mouse.current.x = width / 2;
      mouse.current.y = height / 2;
    };

    const targetFps = 55;
    let last = 0;

    const tick = (ts: number) => {
      if (!running) return;
      const dt = ts - last;
      const minFrame = 1000 / targetFps;
      if (dt >= minFrame) {
        last = ts;
        rysuj({ animate: true });
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      rafId = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(rafId);
    };

    const onReduceMotionChange = () => {
      reduceMotion = Boolean(reduceMotionQuery?.matches);
      if (reduceMotion) {
        stop();
        rysuj({ animate: false });
      } else {
        start();
      }
    };

    if (reduceMotionQuery?.addEventListener) reduceMotionQuery.addEventListener("change", onReduceMotionChange);
    else (reduceMotionQuery as unknown as { addListener?: (cb: () => void) => void })?.addListener?.(onReduceMotionChange);

    const onVisibilityChange = () => {
      const isVisible = typeof document !== "undefined" ? !document.hidden : true;
      if (!isVisible) stop();
      else if (!reduceMotion) {
        mouse.current.x = width / 2;
        mouse.current.y = height / 2;
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    resize();

    const isVisible = typeof document !== "undefined" ? !document.hidden : true;
    if (!reduceMotion && isVisible) start();
    else rysuj({ animate: false });

    return () => {
      stop();

      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);

      document.removeEventListener("visibilitychange", onVisibilityChange);

      if (reduceMotionQuery?.removeEventListener) reduceMotionQuery.removeEventListener("change", onReduceMotionChange);
      else
        (reduceMotionQuery as unknown as { removeListener?: (cb: () => void) => void })?.removeListener?.(
          onReduceMotionChange
        );

      if (resizeTimeout) clearTimeout(resizeTimeout);
      czastki = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{
        transform: "translateZ(0)",
        imageRendering: "auto",
        mixBlendMode: "normal",
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
});

// ------------------------- ROOT WRAPPER -------------------------
export const TloAplikacji = memo(function TloAplikacji({
  wariant = "both",
  className,
}: {
  wariant?: WariantTla;
  className?: string;
}) {
  const theme = useTrybMotywu();

  const showAurora = wariant === "aurora" || wariant === "both";
  const showNeural = wariant === "neural" || wariant === "both";

  const wrapperClassName = useMemo(
    () =>
      cx(
        "fixed inset-0 z-0 pointer-events-none isolate overflow-hidden",
        "bg-[rgb(var(--pd-bg))] transition-colors duration-700",
        className
      ),
    [className]
  );

  return (
    <div className={wrapperClassName} aria-hidden="true" data-pd-tlo="app">
      {showAurora ? <WarstwaAurory /> : null}
      {showNeural ? <WarstwaNeural theme={theme} /> : null}
    </div>
  );
});

export default TloAplikacji;
