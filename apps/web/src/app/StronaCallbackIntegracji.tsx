import { useEffect, useMemo, useState } from "react";
import { Scene } from "../components/Scene";
import { normalizeApiError } from "../hooks/useApiError";
import { obsluzCallbackIntegracji } from "../uslugi/api/platformaApi";

type StronaCallbackIntegracjiProps = {
  provider: string;
  onOpenDashboard: () => void;
  onOpenIntegracje: () => void;
};

export function StronaCallbackIntegracji({
  provider,
  onOpenDashboard,
  onOpenIntegracje,
}: StronaCallbackIntegracjiProps) {
  const [status, setStatus] = useState<"ladowanie" | "ok" | "blad">("ladowanie");
  const [komunikat, setKomunikat] = useState<string | null>(null);

  useEffect(() => {
    let aktywny = true;

    async function uruchom() {
      setStatus("ladowanie");
      setKomunikat(null);

      try {
        const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        const wynik = await obsluzCallbackIntegracji(provider, query);
        if (!aktywny) return;
        setStatus("ok");
        setKomunikat(`Callback potwierdzony dla integracji: ${wynik.provider}.`);
      } catch (error) {
        if (!aktywny) return;
        setStatus("blad");
        setKomunikat(normalizeApiError(error, "Nie udalo sie przetworzyc callbacku integracji."));
      }
    }

    void uruchom();
    return () => {
      aktywny = false;
    };
  }, [provider]);

  const stanAtmosfery = useMemo(() => {
    if (status === "blad") return "blad";
    if (status === "ladowanie") return "ladowanie";
    return "gotowe";
  }, [status]);

  return (
    <>
      <Scene motion="balanced" stanSystemu={stanAtmosfery} />
      <main className="relative z-[var(--z-content)]" role="main" aria-label="Callback integracji">
        <section className="pd-container py-16">
          <div className="pd-glass pd-edge pd-innerglow rounded-[30px] border border-black/10 p-6 dark:border-white/10 md:p-8">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Callback integracji: {provider}
            </h1>

            {status === "ladowanie" && (
              <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Przetwarzanie callbacku...
              </p>
            )}

            {komunikat && (
              <p
                className={[
                  "mt-4 rounded-xl border px-3 py-2 text-sm font-semibold",
                  status === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200",
                ].join(" ")}
              >
                {komunikat}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenIntegracje}
                className="pd-btn-secondary h-10 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.12em]"
              >
                Wroc do integracji
              </button>
              <button
                type="button"
                onClick={onOpenDashboard}
                className="pd-btn-secondary h-10 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.12em]"
              >
                Dashboard
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default StronaCallbackIntegracji;

