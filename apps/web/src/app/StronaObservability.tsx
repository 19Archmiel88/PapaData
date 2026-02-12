import { useCallback, useMemo, useState } from "react";
import { Scene } from "../components/Scene";
import { normalizeApiError } from "../hooks/useApiError";
import { wyslijZdarzeniaObservability } from "../uslugi/api/platformaApi";

type StronaObservabilityProps = {
  onOpenDashboard: () => void;
  onBackToLanding: () => void;
};

export function StronaObservability({
  onOpenDashboard,
  onBackToLanding,
}: StronaObservabilityProps) {
  const [status, setStatus] = useState<"bezczynny" | "wysylanie" | "ok" | "blad">("bezczynny");
  const [komunikat, setKomunikat] = useState<string | null>(null);

  // odpowiada za wysylke testowego eventu observability z runtime web
  const onWyslijProbe = useCallback(async () => {
    setStatus("wysylanie");
    setKomunikat(null);

    try {
      await wyslijZdarzeniaObservability([
        {
          name: "manual_observability_probe",
          level: "info",
          source: "observability-screen",
          occurredAt: new Date().toISOString(),
          context: {
            path: window.location.pathname,
            userAgent: navigator.userAgent,
          },
        },
      ]);
      setStatus("ok");
      setKomunikat("Event testowy zostal wyslany do /observability/events.");
    } catch (error) {
      setStatus("blad");
      setKomunikat(normalizeApiError(error, "Nie udalo sie wyslac eventu observability."));
    }
  }, []);

  const stanAtmosfery = useMemo(() => {
    if (status === "blad") return "blad";
    if (status === "wysylanie") return "ladowanie";
    return "gotowe";
  }, [status]);

  return (
    <>
      <Scene motion="balanced" stanSystemu={stanAtmosfery} />
      <main className="relative z-[var(--z-content)]" role="main" aria-label="Observability PapaData">
        <section className="pd-container py-16">
          <div className="pd-glass pd-edge pd-innerglow rounded-[30px] border border-black/10 p-6 dark:border-white/10 md:p-8">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Observability runtime</h1>
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

            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Endpoint backendu: <span className="font-black">POST /observability/events</span>
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={onWyslijProbe}
                disabled={status === "wysylanie"}
                className="pd-btn-primary h-11 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-white disabled:opacity-60"
              >
                {status === "wysylanie" ? "Wysylanie..." : "Wyslij probe observability"}
              </button>
            </div>

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
          </div>
        </section>
      </main>
    </>
  );
}

export default StronaObservability;

