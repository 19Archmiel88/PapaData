import { useCallback, useEffect, useMemo, useState } from "react";
import { useModal } from "./context/useModal";
import { LandingPage } from "./app/LandingPage";
import { StronaDashboard } from "./app/StronaDashboard";
import { StronaPlatnosci } from "./app/StronaPlatnosci";
import { StronaIntegracje } from "./app/StronaIntegracje";
import { StronaCallbackIntegracji } from "./app/StronaCallbackIntegracji";
import { StronaObservability } from "./app/StronaObservability";
import { ModalContainer } from "./components/modale/ModalContainer";
import { zapytanieApi } from "./uslugi/api/klientApi";

/** stan aplikacji */
type StatusAplikacji = "ladowanie" | "ok" | "blad";
type TypWidokuAplikacji =
  | "landing"
  | "dashboard"
  | "platnosci"
  | "integracje"
  | "callback_integracji"
  | "observability";

type WidokAplikacji = {
  typ: TypWidokuAplikacji;
  providerCallbacku?: string;
};

function wyznaczWidokDlaSciezki(pathname: string): WidokAplikacji {
  const sciezka = pathname.toLowerCase();
  if (sciezka.startsWith("/dashboard")) return { typ: "dashboard" };
  if (sciezka.startsWith("/platnosci")) return { typ: "platnosci" };
  if (sciezka.startsWith("/integracje/callback/")) {
    const segmenty = pathname.split("/").filter(Boolean);
    return {
      typ: "callback_integracji",
      providerCallbacku: decodeURIComponent(segmenty[2] ?? "provider"),
    };
  }
  if (sciezka.startsWith("/integracje")) return { typ: "integracje" };
  if (sciezka.startsWith("/observability")) return { typ: "observability" };
  return { typ: "landing" };
}

/**
 * ROOT APPLICATION
 *
 * Odpowiada za:
 * - bootstrap UI
 * - sprawdzenie health backendu
 * - sterowanie modalem autoryzacji
 */
export function Aplikacja() {
  const { otworzModal } = useModal();
  const [status, setStatus] = useState<StatusAplikacji>("ladowanie");
  const [widok, setWidok] = useState<WidokAplikacji>(() =>
    wyznaczWidokDlaSciezki(window.location.pathname)
  );

  // odpowiada za nawigacje miedzy widokami bez zewnetrznego routera
  const przejdzDo = useCallback((pathname: string) => {
    if (window.location.pathname !== pathname) {
      window.history.pushState({}, "", pathname);
    }
    setWidok(wyznaczWidokDlaSciezki(pathname));
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  /** sprawdzenie stanu backendu */
  useEffect(() => {
    let cancelled = false;

    async function checkBackendHealth() {
      try {
        const data = await zapytanieApi<{ ok?: boolean }>("/health", {
          metoda: "GET",
          timeoutMs: 7000,
        });

        if (!cancelled) {
          setStatus(data.ok ? "ok" : "blad");
        }
      } catch {
        if (cancelled) return;
        setStatus("blad");
      }
    }

    checkBackendHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  // odpowiada za obsluge nawigacji wstecz/dalej przegladarki
  useEffect(() => {
    const onPopstate = () => {
      setWidok(wyznaczWidokDlaSciezki(window.location.pathname));
    };

    window.addEventListener("popstate", onPopstate);
    return () => {
      window.removeEventListener("popstate", onPopstate);
    };
  }, []);

  const tytulDokumentu = useMemo(
    () => {
      if (widok.typ === "dashboard") return "PapaData Dashboard | Analiza e-commerce";
      if (widok.typ === "platnosci") return "PapaData Płatności | Subskrypcja";
      if (widok.typ === "integracje") return "PapaData Integracje | Połączenia";
      if (widok.typ === "callback_integracji") return "PapaData Callback Integracji";
      if (widok.typ === "observability") return "PapaData Observability | Runtime";
      return "PapaData Intelligence | AI dla e-commerce";
    },
    [widok.typ]
  );

  // odpowiada za SEO title zalezne od aktywnego widoku
  useEffect(() => {
    document.title = tytulDokumentu;
  }, [tytulDokumentu]);

  /** handlers modala */
  const otworzLogowanie = useCallback(() => {
    otworzModal("auth", { startowyTryb: "logowanie" });
  }, [otworzModal]);

  const otworzRejestracje = useCallback(() => {
    otworzModal("auth", { startowyTryb: "rejestracja" });
  }, [otworzModal]);

  const otworzDashboard = useCallback(() => {
    przejdzDo("/dashboard");
  }, [przejdzDo]);

  const otworzLanding = useCallback(() => {
    przejdzDo("/");
  }, [przejdzDo]);

  const otworzIntegracje = useCallback(() => {
    przejdzDo("/integracje");
  }, [przejdzDo]);

  return (
    <>
      {widok.typ === "dashboard" ? (
        <StronaDashboard
          backendStatus={status}
          onBackToLanding={otworzLanding}
          onRegister={otworzRejestracje}
        />
      ) : widok.typ === "platnosci" ? (
        <StronaPlatnosci
          pathname={window.location.pathname}
          onOpenDashboard={otworzDashboard}
          onBackToLanding={otworzLanding}
        />
      ) : widok.typ === "integracje" ? (
        <StronaIntegracje
          onOpenDashboard={otworzDashboard}
          onBackToLanding={otworzLanding}
        />
      ) : widok.typ === "callback_integracji" ? (
        <StronaCallbackIntegracji
          provider={widok.providerCallbacku ?? "provider"}
          onOpenDashboard={otworzDashboard}
          onOpenIntegracje={otworzIntegracje}
        />
      ) : widok.typ === "observability" ? (
        <StronaObservability
          onOpenDashboard={otworzDashboard}
          onBackToLanding={otworzLanding}
        />
      ) : (
        <LandingPage
          onLogin={otworzLogowanie}
          onRegister={otworzRejestracje}
          onOpenDashboard={otworzDashboard}
          backendStatus={status}
        />
      )}
      <ModalContainer />
    </>
  );
}

export default Aplikacja;
