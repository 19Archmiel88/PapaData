import React, { memo, useId, useMemo } from "react";

type HeroProps = Readonly<{
  onZaloguj: () => void;
  onZalozKonto: () => void;
}>;

// prekomputowane scrimy (mniej pracy dla runtime)
const LIGHT_SCRIM =
  "radial-gradient(1200px 600px at 18% 20%, rgba(255,255,255,0.80), transparent 58%), " +
  "radial-gradient(1000px 560px at 82% 40%, rgba(255,255,255,0.55), transparent 62%), " +
  "linear-gradient(to bottom, rgba(255,255,255,0.65), rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.00))";

const DARK_SCRIM =
  "radial-gradient(1200px 600px at 18% 20%, rgba(10,10,14,0.88), transparent 58%), " +
  "radial-gradient(1000px 560px at 82% 40%, rgba(10,10,14,0.62), transparent 62%), " +
  "linear-gradient(to bottom, rgba(10,10,14,0.70), rgba(10,10,14,0.25) 40%, rgba(10,10,14,0.00))";

// odpowiada za hero (headline + CTA + czytelność na tle)
export const Hero = memo(function Hero({ onZaloguj, onZalozKonto }: HeroProps) {
  const descId = useId();

  const headline =
    "Dane, automatyzacje i AI — w jednym miejscu, z produkcyjną jakością.";

  /* tokeny objęte animacją (precyzyjnie, bez whole-h1) */
  const highlight = useMemo(
    () =>
      new Set(
        ["dane", "automatyzacje", "ai", "jednym", "miejscu", "produkcyjną"].map(
          (s) => s.toLowerCase()
        )
      ),
    []
  );

  const headlineNodes = useMemo(() => {
    const tokens = headline.split(/\s+/).filter(Boolean);

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
  }, [headline, highlight]);

  return (
    <section className="relative isolate">
      {/* scrim pod czytelność */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{ background: LIGHT_SCRIM }}
      />
      <div
        className="absolute inset-0 -z-10 hidden dark:block"
        aria-hidden="true"
        style={{ background: DARK_SCRIM }}
      />

      {/* LOCAL styles — bez globalnego zanieczyszczenia */}
      <style>
        {`
          .pd-hero-token{
            position: relative;
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
            animation: pd-hero-gradient 16s ease-in-out infinite;
          }

          /* subtelny glow — cinematic, nie neon */
          .pd-hero-token::after{
            content: "";
            position: absolute;
            inset: 0;
            background: inherit;
            filter: blur(12px);
            opacity: 0.16;
            pointer-events: none;
          }

          @keyframes pd-hero-gradient{
            0%   { background-position:   0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position:   0% 50%; }
          }

          /* prefers-reduced-motion → statyczny akcent */
          @media (prefers-reduced-motion: reduce){
            .pd-hero-token{
              animation: none;
              background-size: 100% 100%;
              background-position: 50% 50%;
            }
            .pd-hero-token::after{
              display: none;
            }
          }
        `}
      </style>

      <div className="pd-container pb-10 pt-12">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-black/55 dark:text-white/55">
            Enterprise-first
          </div>

          <h1
            className="mt-3 text-[clamp(28px,3.6vw,44px)] font-black leading-tight tracking-tight text-black dark:text-white"
            aria-describedby={descId}
          >
            {headlineNodes}
          </h1>

          <p
            id={descId}
            className="mt-4 max-w-2xl text-base text-black/70 dark:text-white/70"
          >
            PapaData to szkielet pod onboarding, autoryzację i kolejne moduły
            (NIP, role, uprawnienia, sesje). Teraz stawiamy fundament UI: tło,
            header i hero — bez kompromisów w czytelności.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onZalozKonto}
              className="h-11 rounded-xl px-5 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--pd-accent-a), var(--pd-accent-b))",
              }}
            >
              Załóż konto
            </button>

            <button
              type="button"
              onClick={onZaloguj}
              className="h-11 rounded-xl border border-black/10 bg-white/70 px-5 text-sm font-semibold text-black transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-0"
            >
              Mam konto
            </button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-black/55 dark:text-white/55">
            <li className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-black/25 dark:bg-white/25" />
              <span>Fastify + Prisma</span>
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-black/25 dark:bg-white/25" />
              <span>Firebase (UI auth)</span>
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-black/25 dark:bg-white/25" />
              <span>TS strict</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
});

export default Hero;
