import type { ReactNode } from "react";

export type KolumnaTabeli<T> = {
  id: string;
  naglowek: string;
  render: (wiersz: T) => ReactNode;
  className?: string;
};

type TabelaRuntimeProps<T> = {
  ariaLabel: string;
  kolumny: Array<KolumnaTabeli<T>>;
  wiersze: T[];
  kluczWiersza: (wiersz: T, indeks: number) => string;
  pustyStan?: string;
};

// odpowiada za wspolny komponent tabel runtime dashboardu
export function TabelaRuntime<T>({
  ariaLabel,
  kolumny,
  wiersze,
  kluczWiersza,
  pustyStan = "Brak danych do wyswietlenia.",
}: TabelaRuntimeProps<T>) {
  if (!wiersze.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-sm font-semibold text-slate-600 dark:border-white/20 dark:text-slate-300">
        {pustyStan}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
      <table className="min-w-full border-collapse text-left text-sm" aria-label={ariaLabel}>
        <thead className="bg-slate-100/85 dark:bg-slate-800/70">
          <tr>
            {kolumny.map((kolumna) => (
              <th
                key={kolumna.id}
                className={[
                  "px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300",
                  kolumna.className ?? "",
                ].join(" ")}
              >
                {kolumna.naglowek}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white/80 dark:divide-white/10 dark:bg-slate-900/50">
          {wiersze.map((wiersz, indeks) => (
            <tr key={kluczWiersza(wiersz, indeks)} className="align-top">
              {kolumny.map((kolumna) => (
                <td
                  key={kolumna.id}
                  className={[
                    "px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200",
                    kolumna.className ?? "",
                  ].join(" ")}
                >
                  {kolumna.render(wiersz)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaRuntime;

