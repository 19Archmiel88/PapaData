import { useCallback, useEffect, useMemo, useState } from "react";
import { Scene } from "../components/Scene";
import type { DaneSubskrypcji, OkresRozliczeniowy, PlanPlatnosci } from "../kontrakty/Platnosci";
import { normalizeApiError } from "../hooks/useApiError";
import { platnosciApi } from "../integracje/platnosci/platnosciApi";

type TrybStronyPlatnosci = "panel" | "sukces" | "anulowano";

type StronaPlatnosciProps = {
  pathname: string;
  onOpenDashboard: () => void;
  onBackToLanding: () => void;
};

function rozpoznajTryb(pathname: string): TrybStronyPlatnosci {
  const sciezka = pathname.toLowerCase();
  if (sciezka.startsWith("/platnosci/sukces")) return "sukces";
  if (sciezka.startsWith("/platnosci/anulowano")) return "anulowano";
  return "panel";
}

export function StronaPlatnosci({
  pathname,
  onOpenDashboard,
  onBackToLanding,
}: StronaPlatnosciProps) {
  const tryb = useMemo(() => rozpoznajTryb(pathname), [pathname]);
  const [subskrypcja, setSubskrypcja] = useState<DaneSubskrypcji | null>(null);
  const [laduje, setLaduje] = useState(tryb === "panel");
  const [komunikat, setKomunikat] = useState<string | null>(null);
  const [blad, setBlad] = useState<string | null>(null);
  const [akcjaTrwa, setAkcjaTrwa] = useState<null | "checkout" | "anuluj" | "portal">(null);

  const odswiezSubskrypcje = useCallback(async () => {
    setLaduje(true);
    setBlad(null);
    try {
      const dane = await platnosciApi.pobierzSubskrypcje();
      setSubskrypcja(dane);
    } catch (error) {
      setBlad(normalizeApiError(error, "Nie udalo sie pobrac stanu subskrypcji."));
    } finally {
      setLaduje(false);
    }
  }, []);

  useEffect(() => {
    if (tryb !== "panel") return;
    void odswiezSubskrypcje();
  }, [odswiezSubskrypcje, tryb]);

  // odpowiada za utworzenie checkout i przekierowanie na flow platnosci
  const onCheckout = useCallback(
    async (plan: PlanPlatnosci, okres: OkresRozliczeniowy) => {
      setAkcjaTrwa("checkout");
      setBlad(null);
      setKomunikat(null);
      try {
        const origin = window.location.origin;
        const wynik = await platnosciApi.utworzCheckout({
          plan,
          okres,
          successUrl: `${origin}/platnosci/sukces`,
          cancelUrl: `${origin}/platnosci/anulowano`,
        });
        window.location.href = wynik.checkoutUrl;
      } catch (error) {
        setBlad(normalizeApiError(error, "Nie udalo sie uruchomic checkout."));
      } finally {
        setAkcjaTrwa(null);
      }
    },
    []
  );

  // odpowiada za anulowanie aktywnej subskrypcji
  const onAnulujSubskrypcje = useCallback(async () => {
    setAkcjaTrwa("anuluj");
    setBlad(null);
    setKomunikat(null);
    try {
      await platnosciApi.anulujSubskrypcje();
      setKomunikat("Subskrypcja zostala anulowana.");
      await odswiezSubskrypcje();
    } catch (error) {
      setBlad(normalizeApiError(error, "Nie udalo sie anulowac subskrypcji."));
    } finally {
      setAkcjaTrwa(null);
    }
  }, [odswiezSubskrypcje]);

  // odpowiada za przejscie do portalu klienta billing
  const onPortal = useCallback(async () => {
    setAkcjaTrwa("portal");
    setBlad(null);
    setKomunikat(null);
    try {
      const wynik = await platnosciApi.otworzPortalKlienta({
        returnUrl: `${window.location.origin}/platnosci`,
      });
      window.location.href = wynik.urlPortalu;
    } catch (error) {
      setBlad(normalizeApiError(error, "Nie udalo sie otworzyc portalu klienta."));
    } finally {
      setAkcjaTrwa(null);
    }
  }, []);

  const sessionId = new URLSearchParams(window.location.search).get("session_id");

  const stanAtmosfery = blad ? "blad" : laduje ? "ladowanie" : "gotowe";

  return (
    <>
      <Scene motion="balanced" stanSystemu={stanAtmosfery} />
      <main className="relative z-[var(--z-content)]" role="main" aria-label="Platnosci PapaData">
        <section className="pd-container py-16">
          <div className="pd-glass pd-edge pd-innerglow rounded-[30px] border border-black/10 p-6 dark:border-white/10 md:p-8">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Platnosci i subskrypcja</h1>
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

            {tryb === "sukces" && (
              <article className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm dark:border-emerald-400/35 dark:bg-emerald-500/10">
                <p className="font-black text-emerald-800 dark:text-emerald-200">Platnosc zakonczona sukcesem.</p>
                {sessionId && (
                  <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-200">Session ID: {sessionId}</p>
                )}
              </article>
            )}

            {tryb === "anulowano" && (
              <article className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm dark:border-amber-400/35 dark:bg-amber-500/10">
                <p className="font-black text-amber-800 dark:text-amber-200">Platnosc zostala anulowana.</p>
                <p className="mt-1 font-semibold text-amber-700 dark:text-amber-200">
                  Mozesz wrocic do panelu i sprobowac ponownie.
                </p>
              </article>
            )}

            {tryb === "panel" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 dark:border-white/10 dark:bg-slate-900/60">
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Aktualna subskrypcja
                  </h2>
                  {laduje && (
                    <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Ladowanie danych subskrypcji...
                    </p>
                  )}
                  {!laduje && subskrypcja && (
                    <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      <p>Plan: {subskrypcja.plan}</p>
                      <p>Status: {subskrypcja.status}</p>
                      <p>Koniec triala: {subskrypcja.koniecTrialaUtc ?? "brak"}</p>
                      <p>Koniec okresu: {subskrypcja.koniecOkresuUtc ?? "brak"}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onCheckout("Professional", "rocznie")}
                    disabled={akcjaTrwa !== null}
                    className="pd-btn-primary h-11 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-white disabled:opacity-60"
                  >
                    {akcjaTrwa === "checkout" ? "Przetwarzanie..." : "Checkout Professional (rocznie)"}
                  </button>
                  <button
                    type="button"
                    onClick={onPortal}
                    disabled={akcjaTrwa !== null}
                    className="pd-btn-secondary h-11 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.12em] disabled:opacity-60"
                  >
                    {akcjaTrwa === "portal" ? "Przetwarzanie..." : "Portal klienta"}
                  </button>
                  <button
                    type="button"
                    onClick={onAnulujSubskrypcje}
                    disabled={akcjaTrwa !== null}
                    className="h-11 rounded-xl border border-rose-300 bg-white px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-400/40 dark:bg-slate-900/60 dark:text-rose-200 dark:hover:bg-rose-500/20"
                  >
                    {akcjaTrwa === "anuluj" ? "Przetwarzanie..." : "Anuluj subskrypcje"}
                  </button>
                </div>
              </div>
            )}

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

export default StronaPlatnosci;
