import React, { memo, useId, useMemo } from "react";

type HeroCinematicProps = {
  onPrimary: () => void;
  onSecondary: () => void;
};

/**
 * HERO CINEMATIC
 * - animated gradient ONLY on selected tokens
 * - cinematic slow background-position flow
 * - respects motion system (balanced / cinematic / still)
 * - prefers-reduced-motion → static accent
 */
export const HeroCinematic = memo(function HeroCinematic({
  onPrimary,
  onSecondary,
}: HeroCinematicProps) {
  /* tokens objęte animacją */
  const highlight = useMemo(
    () =>
      new Set(
        ["dane", "rekomendacje", "wzrostu", "ai", "e-commerce"].map((s) =>
          s.toLowerCase()
        )
      ),
    []
  );

  const line1 = "Analizuje dane e-commerce";
  const line2 = "oraz daje rekomendacje dla";
  const line3 = "wzrostu - PapaData,";
  const line4 = "AI tworzony przez zawodowych";
  const line5 = "marketerów dla e-commerce.";

  const headingId = useId();
  const descId = useId();

  /* renderer tokenów */
  const render = (line: string) => {
    const tokens = line.split(/\s+/).filter(Boolean);
    return tokens.map((t, i) => {
      const clean = t.replace(/[^\p{L}\p{N}-]+/gu, "").toLowerCase();
      const isAccent = highlight.has(clean);

      return (
        <React.Fragment key={`${t}-${i}`}>
          {i > 0 ? " " : ""}
          {isAccent ? <span className="pd-hero-token">{t}</span> : <span>{t}</span>}
        </React.Fragment>
      );
    });
  };

  return (
    <section
      className="relative z-[var(--z-content)] pt-28 md:pt-36 pb-16 md:pb-24 min-h-[78vh] flex items-center"
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      {/* LOCAL styles — isolated + motion-aware */}
      <style>
        {`
          .pd-hero-token{
            position: relative;
            display: inline-block;
            background: linear-gradient(
              120deg,
              var(--pd-accent-a),
              var(--pd-accent-b),
              var(--pd-accent-a)
            );
            background-size: 260% 100%;
            background-position: 0% 50%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: pd-hero-token-flow var(--pd-hero-flow-ms, 16s)
              ease-in-out infinite;
            will-change: background-position;
          }

          /* subtle glow — disabled in still */
          .pd-hero-token::after{
            content: "";
            position: absolute;
            inset: 0;
            background: inherit;
            filter: blur(10px);
            opacity: 0.16;
            pointer-events: none;
          }

          @keyframes pd-hero-token-flow{
            0%   { background-position:   0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position:   0% 50%; }
          }

          /* motion profiles */
          .pd-motion-cinematic{ --pd-hero-flow-ms: 18s; }
          .pd-motion-balanced { --pd-hero-flow-ms: 16s; }
          .pd-motion-still    { --pd-hero-flow-ms: 0s; }

          @media (prefers-reduced-motion: reduce){
            .pd-hero-token{ animation: none; background-size: 100% 100%; background-position: 50% 50%; }
            .pd-hero-token::after{ display: none; }
          }
        `}
      </style>

      <div className="pd-container">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/55 dark:bg-white/5 text-sm font-semibold text-black/70 dark:text-white/70">
              PapaData Intelligence
            </div>

            <h1
              id={headingId}
              className="mt-6 font-black tracking-tight leading-[1.03] text-[clamp(34px,4.4vw,62px)] text-black dark:text-white"
            >
              <div>{render(line1)}</div>
              <div>{render(line2)}</div>
              <div>{render(line3)}</div>
              <div className="opacity-90">{render(line4)}</div>
              <div className="opacity-80">{render(line5)}</div>
            </h1>

            <p
              id={descId}
              className="mt-6 max-w-[62ch] text-base md:text-lg italic leading-relaxed text-black/60 dark:text-white/60"
            >
              Połącz dane ze sklepu, marketplace’ów i reklam w jeden spójny model
              w BigQuery. PapaData codziennie generuje raporty i alerty, żeby nie
              składać tego ręcznie. Wypróbuj inteligentną platformę marketingową
              PapaData.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <button
                type="button"
                onClick={onPrimary}
                className="h-14 px-8 rounded-[18px] font-semibold text-white shadow-[0_20px_70px_-38px_rgba(79,70,229,0.70)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pd-accent-a), var(--pd-accent-b))",
                }}
                aria-label="Rozpocznij 14-dniowy okres próbny"
              >
                Rozpocznij 14-dniowy trial
              </button>

              <button
                type="button"
                onClick={onSecondary}
                className="h-14 px-7 rounded-[18px] font-semibold border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/85 dark:hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-300 dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-0"
                aria-label="Zobacz demo"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="w-9 h-9 rounded-2xl grid place-items-center border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M8 5v14l11-7-11-7z" />
                    </svg>
                  </span>
                  Zobacz Demo
                </span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-black/55 dark:text-white/55">
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                Bez karty
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                Dane w UE (Warszawa)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                Bez kodowania
              </span>
            </div>
          </div>

          {/* RIGHT – reserved */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
});

export default HeroCinematic;
