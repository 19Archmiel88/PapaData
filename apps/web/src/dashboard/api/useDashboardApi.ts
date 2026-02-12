import { useContext } from "react";
import { KontekstDashboardApi } from "./kontekstDashboardApi";

export function useDashboardApi() {
  const kontekst = useContext(KontekstDashboardApi);
  if (!kontekst) {
    throw new Error("useDashboardApi musi byc uzyte wewnatrz DashboardDataProvider.");
  }
  return kontekst;
}

export default useDashboardApi;
