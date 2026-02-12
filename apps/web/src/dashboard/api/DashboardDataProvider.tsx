import { useMemo, type ReactNode } from "react";
import type { TrybDashboardu } from "./typyDashboardApi";
import { utworzDemoAdapterDashboardu } from "../demo/demoAdapterDashboardu";
import { utworzTenantAdapterDashboardu } from "../tenant/tenantAdapterDashboardu";
import { KontekstDashboardApi } from "./kontekstDashboardApi";

export type DashboardDataProviderProps = {
  tryb: TrybDashboardu;
  tenantId?: string;
  children: ReactNode;
};

export function DashboardDataProvider({ tryb, tenantId, children }: DashboardDataProviderProps) {
  const api = useMemo(() => {
    if (tryb === "TENANT") {
      return utworzTenantAdapterDashboardu({ tenantId });
    }
    return utworzDemoAdapterDashboardu({ tenantId });
  }, [tryb, tenantId]);

  const wartosc = useMemo(
    () => ({
      api,
      tryb,
    }),
    [api, tryb]
  );

  return <KontekstDashboardApi.Provider value={wartosc}>{children}</KontekstDashboardApi.Provider>;
}

export default DashboardDataProvider;
