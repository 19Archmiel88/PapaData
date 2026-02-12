import { useCallback, useEffect, useMemo, useState } from "react";
import { Scene } from "../components/Scene";
import type { IdIntegracji, KontraktIntegracji, StanPolaczeniaIntegracji } from "../kontrakty/Integracje";
import { normalizeApiError } from "../hooks/useApiError";
import { allegroApi } from "../integracje/allegro/allegroApi";
import { woocommerceApi } from "../integracje/woocommerce/woocommerceApi";

type StronaIntegracjeProps = {
  onOpenDashboard: () => void;
  onBackToLanding: () => void;
};

const MAPA_INTEGRACJI: Record<IdIntegracji, KontraktIntegracji> = {
  woocommerce: woocommerceApi,
  allegro: allegroApi,
};

function etykietaStatusu(status: StanPolaczeniaIntegracji["status"]) {
  if (status === "polaczona") return "Polaczona";
  if (status === "wymaga_autoryzacji") return "Wymaga autoryzacji";
  if (status === "synchronizacja") return "Synchronizacja";
  if (status === "blad") return "Blad";
  return "Niepolaczona";
}

export function StronaIntegracje({ onOpenDashboard, onBackToLanding }: StronaIntegracjeProps) {
  const [statusy, setStatusy] = useState<StanPolaczeniaIntegracji[]>([]);
  const [laduje, setLaduje] = useState(true);
  const [blad, setBlad] = useState<string | null>(null);
  const [akcja, setAkcja] = useState<string | null>(null);
  const [komunikat, setKomunikat] = useState<string | null>(null);

  const odswiezStatusy = useCallback(async () => {
    setLaduje(true);
    setBlad(null);
    try {
      const wynik = await Promise.all([
        woocommerceApi.pobierzStatusPolaczenia(),
        allegroApi.pobierzStatusPolaczenia(),
      ]);
      setStatusy(wynik);
    } catch (error) {
      setBlad(normalizeApiError(error, "Nie udalo sie pobrac statusow integracji."));
    } finally {
      setLaduje(false);
    }
  }, []);

  useEffect(() => {
    void odswiezStatusy();
  }, [odswiezStatusy]);

  // odpowiada za uruchomienie flow autoryzacji wskazanej integracji
  const onAutoryzuj = useCallback(async (id: IdIntegracji) => {
    const adapter = MAPA_INTEGRACJI[id];
    setAkcja(`${id}-autoryzacja`);
    setBlad(null);
    setKomunikat(null);
    try {
      const out = await adapter.zainicjujAutoryzacje({
        callbackUrl: window.location.origin,
      });
      window.location.href = out.urlAutoryzacji;
    } catch (error) {
      setBlad(normalizeApiError(error, `Nie udalo sie uruchomic autoryzacji ${id}.`));
    } finally {
      setAkcja(null);
    }
  }, []);

  // odpowiada za uruchomienie synchronizacji wskazanej integracji
  const onSynchronizuj = useCallback(async (id: IdIntegracji) => {
    const adapter = MAPA_INTEGRACJI[id];
    setAkcja(`${id}-sync`);
    setBlad(null);
    setKomunikat(null);
    try {
      const out = await adapter.uruchomSynchronizacje({ zakres: "przyrostowy" });
      setKomunikat(`Synchronizacja ${id} uruchomiona. Zadanie: ${out.idZadania}.`);
      await odswiezStatusy();
    } catch (error) {
      setBlad(normalizeApiError(error, `Nie udalo sie uruchomic synchronizacji ${id}.`));
    } finally {
      setAkcja(null);
    }
  }, [odswiezStatusy]);

  // odpowiada za odlaczenie wskazanej integracji z workspace
  const onRozlacz = useCallback(async (id: IdIntegracji) => {
    const adapter = MAPA_INTEGRACJI[id];
    setAkcja(`${id}-disconnect`);
    setBlad(null);
    setKomunikat(null);
    try {
      await adapter.rozlaczIntegracje();
      setKomunikat(`Integracja ${id} zostala odlaczona.`);
      await odswiezStatusy();
    } catch (error) {
      setBlad(normalizeApiError(error, `Nie udalo sie odlaczyc ${id}.`));
    } finally {
      setAkcja(null);
    }
  }, [odswiezStatusy]);

  const stanAtmosfery = useMemo(() => {
    if (blad) return "blad";
    if (laduje) return "ladowanie";
    return "gotowe";
  }, [blad, laduje]);

  return (
    <>
      <Scene motion="balanced" stanSystemu={stanAtmosfery} />
      <main className="relative z-[var(--z-content)]" role="main" aria-label="Integracje PapaData">
        <section className="pd-container py-16">
          <div className="pd-glass pd-edge pd-innerglow rounded-[30px] border border-black/10 p-6 dark:border-white/10 md:p-8">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Integracje platformowe</h1>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="pd-btn-secondary h-10 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.12em]"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="pd-btn-secondary h-10 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.12em]"
                >
                  Landing
                </button>
              </div>
            </header>

            {laduje && (
              <p className="mt-5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Ladowanie statusow integracji...
              </p>
            )}

            {!laduje && (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {statusy.map((status) => (
                  <article
                    key={status.idIntegracji}
                    className="rounded-2xl border border-slate-200 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-100">
                      {status.idIntegracji}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Status: {etykietaStatusu(status.status)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Ostatnia synchronizacja: {status.ostatniaSynchronizacjaUtc ?? "brak"}
                    </p>
                    {status.komunikat && (
                      <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-200">
                        {status.komunikat}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onAutoryzuj(status.idIntegracji)}
                        disabled={akcja !== null}
                        className="pd-btn-secondary h-9 rounded-xl px-3 text-xs font-extrabold uppercase tracking-[0.1em] disabled:opacity-60"
                      >
                        {akcja === `${status.idIntegracji}-autoryzacja` ? "Trwa..." : "Autoryzuj"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSynchronizuj(status.idIntegracji)}
                        disabled={akcja !== null}
                        className="pd-btn-secondary h-9 rounded-xl px-3 text-xs font-extrabold uppercase tracking-[0.1em] disabled:opacity-60"
                      >
                        {akcja === `${status.idIntegracji}-sync` ? "Trwa..." : "Synchronizuj"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRozlacz(status.idIntegracji)}
                        disabled={akcja !== null}
                        className="h-9 rounded-xl border border-rose-300 bg-white px-3 text-xs font-extrabold uppercase tracking-[0.1em] text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-400/40 dark:bg-slate-900/60 dark:text-rose-200 dark:hover:bg-rose-500/20"
                      >
                        {akcja === `${status.idIntegracji}-disconnect` ? "Trwa..." : "Rozlacz"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void odswiezStatusy()}
                className="pd-btn-secondary h-9 rounded-xl px-3 text-xs font-extrabold uppercase tracking-[0.1em]"
              >
                Odswiez statusy
              </button>
            </div>

            {blad && (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
                {blad}
              </p>
            )}
            {komunikat && (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                {komunikat}
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default StronaIntegracje;

