import { useCallback, useMemo } from "react";
import { Scene } from "../components/Scene";
import { pobierzSesje } from "../services/auth";
import {
  pobierzCzySaIntegracje,
  wyliczStanSystemuAtmosfery,
} from "./atmosfera/stanSystemuAtmosfery";
import { SekcjaDashboardRuntime } from "./sekcje/SekcjaDashboardRuntime";

type StronaDashboardProps = {
  backendStatus: "ladowanie" | "ok" | "blad";
  onBackToLanding: () => void;
  onRegister: () => void;
};

export function StronaDashboard({
  backendStatus,
  onBackToLanding,
  onRegister,
}: StronaDashboardProps) {
  const sesja = pobierzSesje();
  const maSesje = sesja !== null;
  const maIntegracje = pobierzCzySaIntegracje();
  const trybDashboardu = maSesje ? "TENANT" : "DEMO";

  // odpowiada za ustawienie semantycznego stanu atmosfery na stronie dashboardu
  const stanSystemuAtmosfery = useMemo(
    () =>
      wyliczStanSystemuAtmosfery({
        backendStatus,
        aktywnoscGuardiana: "bezczynny",
        maSesje,
        maIntegracje,
      }),
    [backendStatus, maSesje, maIntegracje]
  );

  // odpowiada za domyslna akcje primary CTA runtime dashboardu
  const onPrimaryCta = useCallback(() => {
    if (maSesje) {
      onBackToLanding();
      window.setTimeout(() => {
        const sekcja = document.getElementById("integrations");
        sekcja?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 10);
      return;
    }
    onRegister();
  }, [maSesje, onBackToLanding, onRegister]);

  return (
    <>
      <Scene motion="balanced" stanSystemu={stanSystemuAtmosfery} />

      <main
        className="relative z-[var(--z-content)]"
        role="main"
        aria-label="Dashboard PapaData"
      >
        <SekcjaDashboardRuntime
          tryb={trybDashboardu}
          tenantId={sesja?.userId}
          onPrimaryCta={onPrimaryCta}
          pelnyEkran={true}
        />
      </main>
    </>
  );
}

export default StronaDashboard;
