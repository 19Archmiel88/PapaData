import { createContext } from "react";
import type { DashboardApi } from "./kontraktDashboardApi";
import type { TrybDashboardu } from "./typyDashboardApi";

export type WartoscKontekstuDashboardApi = {
  api: DashboardApi;
  tryb: TrybDashboardu;
};

export const KontekstDashboardApi = createContext<WartoscKontekstuDashboardApi | null>(null);
