import { useId, useMemo, type CSSProperties } from "react";

export type PunktWykresuLiniowego = {
  etykieta: string;
  wartosc: number;
  wartoscPorownawcza?: number;
};

export type WykresLiniowyProps = {
  punkty: PunktWykresuLiniowego[];
  ariaLabel: string;
  wysokosc?: number;
};

export type PunktWykresuSlupkowego = {
  etykieta: string;
  wartosc: number;
};

export type WykresSlupkowyProps = {
  punkty: PunktWykresuSlupkowego[];
  ariaLabel: string;
  wysokosc?: number;
};

function zbudujPath(points: Array<{ x: number; y: number }>) {
  return points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function policzZakres(values: number[]) {
  if (!values.length) return { min: 0, max: 1 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
}

function mapujY(value: number, min: number, max: number, wysokosc: number, paddingY: number) {
  const zakres = max - min || 1;
  const procent = (value - min) / zakres;
  return wysokosc - paddingY - procent * (wysokosc - paddingY * 2);
}

// odpowiada za rysowanie lekkiego wykresu liniowego SVG bez zewnetrznej biblioteki
export function WykresLiniowy({ punkty, ariaLabel, wysokosc = 180 }: WykresLiniowyProps) {
  const surowyId = useId();
  const bezpiecznyId = useMemo(() => surowyId.replace(/[^a-zA-Z0-9_-]/g, "_"), [surowyId]);
  const gradientId = `pd-line-main-${bezpiecznyId}`;
  const szerokosc = 620;
  const paddingX = 24;
  const paddingY = 18;
  const wszystkieWartosci = punkty.flatMap((p) =>
    p.wartoscPorownawcza === undefined ? [p.wartosc] : [p.wartosc, p.wartoscPorownawcza]
  );
  const { min, max } = policzZakres(wszystkieWartosci);
  const krokX = punkty.length > 1 ? (szerokosc - paddingX * 2) / (punkty.length - 1) : 0;

  const punktyGlowne = punkty.map((p, idx) => ({
    x: paddingX + idx * krokX,
    y: mapujY(p.wartosc, min, max, wysokosc, paddingY),
  }));

  const punktyPorownawcze = punkty
    .filter((p) => p.wartoscPorownawcza !== undefined)
    .map((p, idx) => ({
      x: paddingX + idx * krokX,
      y: mapujY(p.wartoscPorownawcza ?? 0, min, max, wysokosc, paddingY),
    }));

  if (!punkty.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-xs font-semibold text-slate-500 dark:border-white/20 dark:text-slate-300">
        Brak danych do wykresu.
      </div>
    );
  }

  return (
    <figure className="rounded-xl border border-slate-200 bg-white/75 p-3 dark:border-white/10 dark:bg-slate-900/55">
      <svg
        viewBox={`0 0 ${szerokosc} ${wysokosc}`}
        role="img"
        aria-label={ariaLabel}
        className="h-[180px] w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1FA3FF" />
            <stop offset="100%" stopColor="#39D6FF" />
          </linearGradient>
        </defs>

        <line
          x1={paddingX}
          y1={wysokosc - paddingY}
          x2={szerokosc - paddingX}
          y2={wysokosc - paddingY}
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="1"
        />

        {punktyPorownawcze.length > 1 && (
          <path
            d={zbudujPath(punktyPorownawcze)}
            fill="none"
            stroke="rgba(148,163,184,0.8)"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        )}

        <path d={zbudujPath(punktyGlowne)} fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />

        {punktyGlowne.map((p, idx) => (
          <circle key={`${punkty[idx].etykieta}-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#1FA3FF" />
        ))}
      </svg>

      <figcaption className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        <span>{punkty[0]?.etykieta}</span>
        <span>{punkty[punkty.length - 1]?.etykieta}</span>
      </figcaption>
    </figure>
  );
}

// odpowiada za rysowanie lekkiego wykresu slupkowego SVG dla rankingow i rozkladow
export function WykresSlupkowy({ punkty, ariaLabel, wysokosc = 180 }: WykresSlupkowyProps) {
  const surowyId = useId();
  const bezpiecznyId = useMemo(() => surowyId.replace(/[^a-zA-Z0-9_-]/g, "_"), [surowyId]);
  const gradientId = `pd-bar-main-${bezpiecznyId}`;
  const max = Math.max(...punkty.map((p) => p.wartosc), 1);
  const szerokosc = 620;
  const paddingX = 18;
  const paddingY = 18;
  const szerokoscWnetrza = szerokosc - paddingX * 2;
  const szerokoscSlupka = Math.max(20, szerokoscWnetrza / Math.max(punkty.length, 1) - 12);
  const step = punkty.length > 0 ? szerokoscWnetrza / punkty.length : 0;

  if (!punkty.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-xs font-semibold text-slate-500 dark:border-white/20 dark:text-slate-300">
        Brak danych do wykresu.
      </div>
    );
  }

  return (
    <figure className="rounded-xl border border-slate-200 bg-white/75 p-3 dark:border-white/10 dark:bg-slate-900/55">
      <svg viewBox={`0 0 ${szerokosc} ${wysokosc}`} role="img" aria-label={ariaLabel} className="h-[180px] w-full">
        {punkty.map((punkt, idx) => {
          const x = paddingX + idx * step + (step - szerokoscSlupka) / 2;
          const h = (punkt.wartosc / max) * (wysokosc - paddingY * 2);
          const y = wysokosc - paddingY - h;
          const style: CSSProperties = {
            fill: `url(#${gradientId})`,
          };
          return <rect key={`${punkt.etykieta}-${idx}`} x={x} y={y} width={szerokoscSlupka} height={h} rx={6} style={style} />;
        })}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39D6FF" />
            <stop offset="100%" stopColor="#1FA3FF" />
          </linearGradient>
        </defs>
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {punkty.map((punkt) => (
          <span key={punkt.etykieta} className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800/80">
            {punkt.etykieta}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export default WykresLiniowy;
