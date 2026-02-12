import type { DashboardApi } from "../api/kontraktDashboardApi";
import { BladNiezaimplementowane, czyBladApi } from "../../uslugi/api/bledyApi";
import { zapytanieApi } from "../../uslugi/api/klientApi";
import { pobierzSesje } from "../../services/auth";
import type {
  AktualizacjaUstawienOrganizacjiDashboardu,
  AktualizacjaUstawienWorkspaceDashboardu,
  AlertDashboardu,
  GotowoscDanychDashboardu,
  IntegracjaDashboardu,
  MetaDashboardu,
  OdpowiedzWysylkiCzatu,
  PrzegladDashboardu,
  RaportDashboardu,
  SzczegolyAlertuDashboardu,
  TypRaportuDashboardu,
  WejscieWiadomosciGuardiana,
  WidokAnalitykiDashboardu,
  WidokKlientowDashboardu,
  WidokPipelineDashboardu,
  WidokProduktowDashboardu,
  WidokReklamDashboardu,
  WidokRaportowDashboardu,
  WidokUstawienOrganizacjiDashboardu,
  WidokUstawienWorkspaceDashboardu,
  WidokWiedzyDashboardu,
  WatekCzatuGuardiana,
  WynikPandLDashboardu,
  ZakresAlertow,
  ZakresCzasuDashboardu,
  ZakresPandL,
} from "../api/typyDashboardApi";

type OpcjeTenantAdaptera = {
  tenantId?: string;
};

function pobierzToken() {
  return pobierzSesje()?.token ?? undefined;
}

function rzucJesliBrakEndpointu(blad: unknown, nazwaFunkcji: string, endpoint: string): never {
  if (czyBladApi(blad) && blad.status === 404) {
    throw new BladNiezaimplementowane(`Dashboard.${nazwaFunkcji}`, endpoint, blad);
  }
  throw blad;
}

function polaczQuery(tenantId?: string) {
  if (!tenantId) return undefined;
  return { tenantId };
}

export function utworzTenantAdapterDashboardu(opcje: OpcjeTenantAdaptera = {}): DashboardApi {
  const queryTenant = polaczQuery(opcje.tenantId);

  return {
    // odpowiada za metadane dashboardu tenantowego
    async getMeta(): Promise<MetaDashboardu> {
      const endpoint = "/dashboard/meta";
      try {
        return await zapytanieApi<MetaDashboardu>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getMeta", endpoint);
      }
    },

    // odpowiada za ocene gotowosci danych tenantowych
    async getDataReadiness(): Promise<GotowoscDanychDashboardu> {
      const endpoint = "/dashboard/data-readiness";
      try {
        return await zapytanieApi<GotowoscDanychDashboardu>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getDataReadiness", endpoint);
      }
    },

    // odpowiada za pobranie overview tenantu
    async getOverview(range: ZakresCzasuDashboardu): Promise<PrzegladDashboardu> {
      const endpoint = "/dashboard/overview";
      try {
        return await zapytanieApi<PrzegladDashboardu>(endpoint, {
          token: pobierzToken(),
          query: { ...queryTenant, range },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getOverview", endpoint);
      }
    },

    // odpowiada za pobranie feedu alertow
    async getAlerts(range: ZakresAlertow): Promise<AlertDashboardu[]> {
      const endpoint = "/dashboard/alerts";
      try {
        return await zapytanieApi<AlertDashboardu[]>(endpoint, {
          token: pobierzToken(),
          query: { ...queryTenant, range },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getAlerts", endpoint);
      }
    },

    // odpowiada za pobranie szczegolow alertu
    async getAlertDetails(id: string): Promise<SzczegolyAlertuDashboardu> {
      const endpoint = `/dashboard/alerts/${encodeURIComponent(id)}`;
      try {
        return await zapytanieApi<SzczegolyAlertuDashboardu>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getAlertDetails", endpoint);
      }
    },

    // odpowiada za widok reklam i kampanii tenantu
    async getAdsView(range: ZakresCzasuDashboardu): Promise<WidokReklamDashboardu> {
      const endpoint = "/dashboard/ads";
      try {
        return await zapytanieApi<WidokReklamDashboardu>(endpoint, {
          token: pobierzToken(),
          query: { ...queryTenant, range },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getAdsView", endpoint);
      }
    },

    // odpowiada za widok produktow tenantu
    async getProductsView(range: ZakresCzasuDashboardu): Promise<WidokProduktowDashboardu> {
      const endpoint = "/dashboard/products";
      try {
        return await zapytanieApi<WidokProduktowDashboardu>(endpoint, {
          token: pobierzToken(),
          query: { ...queryTenant, range },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getProductsView", endpoint);
      }
    },

    // odpowiada za widok klientow tenantu
    async getCustomersView(range: ZakresCzasuDashboardu): Promise<WidokKlientowDashboardu> {
      const endpoint = "/dashboard/customers";
      try {
        return await zapytanieApi<WidokKlientowDashboardu>(endpoint, {
          token: pobierzToken(),
          query: { ...queryTenant, range },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getCustomersView", endpoint);
      }
    },

    // odpowiada za pipeline dzialan tenantu
    async getPipelineView(): Promise<WidokPipelineDashboardu> {
      const endpoint = "/dashboard/pipeline";
      try {
        return await zapytanieApi<WidokPipelineDashboardu>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getPipelineView", endpoint);
      }
    },

    // odpowiada za liste integracji tenantu
    async getIntegrations(): Promise<IntegracjaDashboardu[]> {
      const endpoint = "/dashboard/integrations";
      try {
        return await zapytanieApi<IntegracjaDashboardu[]>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getIntegrations", endpoint);
      }
    },

    // odpowiada za inicjalizacje realnego flow podlaczenia integracji
    async startIntegrationConnect(key: string): Promise<{ url: string }> {
      const endpoint = `/dashboard/integrations/${encodeURIComponent(key)}/connect`;
      try {
        return await zapytanieApi<{ url: string }>(endpoint, {
          metoda: "POST",
          token: pobierzToken(),
          body: queryTenant ? { tenantId: queryTenant.tenantId } : undefined,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "startIntegrationConnect", endpoint);
      }
    },

    // odpowiada za wynik rentownosci P&L tenantu
    async getPandL(range: ZakresPandL): Promise<WynikPandLDashboardu> {
      const endpoint = "/dashboard/pandl";
      try {
        return await zapytanieApi<WynikPandLDashboardu>(endpoint, {
          token: pobierzToken(),
          query: { ...queryTenant, range },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getPandL", endpoint);
      }
    },

    // odpowiada za runtime analytics tenantu
    async getAnalyticsView(range: ZakresCzasuDashboardu): Promise<WidokAnalitykiDashboardu> {
      const endpoint = "/dashboard/analytics";
      try {
        return await zapytanieApi<WidokAnalitykiDashboardu>(endpoint, {
          token: pobierzToken(),
          query: { ...queryTenant, range },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getAnalyticsView", endpoint);
      }
    },

    // odpowiada za runtime knowledge tenantu
    async getKnowledgeView(query?: string): Promise<WidokWiedzyDashboardu> {
      const endpoint = "/dashboard/knowledge";
      try {
        return await zapytanieApi<WidokWiedzyDashboardu>(endpoint, {
          token: pobierzToken(),
          query: { ...queryTenant, q: query },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getKnowledgeView", endpoint);
      }
    },

    // odpowiada za runtime reports tenantu
    async getReportsView(): Promise<WidokRaportowDashboardu> {
      const endpoint = "/dashboard/reports";
      try {
        return await zapytanieApi<WidokRaportowDashboardu>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getReportsView", endpoint);
      }
    },

    // odpowiada za liste raportow tenantu
    async getReports(): Promise<RaportDashboardu[]> {
      const endpoint = "/dashboard/reports";
      try {
        const widok = await zapytanieApi<WidokRaportowDashboardu>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
        return widok.reports;
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getReports", endpoint);
      }
    },

    // odpowiada za zlecenie raportu po stronie backendu
    async requestReport(type: TypRaportuDashboardu): Promise<{ id: string }> {
      const endpoint = "/dashboard/reports/request";
      try {
        return await zapytanieApi<{ id: string }>(endpoint, {
          metoda: "POST",
          token: pobierzToken(),
          body: { type, ...queryTenant },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "requestReport", endpoint);
      }
    },

    // odpowiada za pobranie ustawien organizacji tenantu
    async getSettingsOrgView(): Promise<WidokUstawienOrganizacjiDashboardu> {
      const endpoint = "/dashboard/settings/org";
      try {
        return await zapytanieApi<WidokUstawienOrganizacjiDashboardu>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getSettingsOrgView", endpoint);
      }
    },

    // odpowiada za aktualizacje ustawien organizacji tenantu
    async updateSettingsOrg(
      payload: AktualizacjaUstawienOrganizacjiDashboardu
    ): Promise<WidokUstawienOrganizacjiDashboardu> {
      const endpoint = "/dashboard/settings/org";
      try {
        return await zapytanieApi<WidokUstawienOrganizacjiDashboardu>(endpoint, {
          metoda: "PATCH",
          token: pobierzToken(),
          body: { ...payload, ...queryTenant },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "updateSettingsOrg", endpoint);
      }
    },

    // odpowiada za pobranie ustawien workspace tenantu
    async getSettingsWorkspaceView(): Promise<WidokUstawienWorkspaceDashboardu> {
      const endpoint = "/dashboard/settings/workspace";
      try {
        return await zapytanieApi<WidokUstawienWorkspaceDashboardu>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "getSettingsWorkspaceView", endpoint);
      }
    },

    // odpowiada za aktualizacje ustawien workspace tenantu
    async updateSettingsWorkspace(
      payload: AktualizacjaUstawienWorkspaceDashboardu
    ): Promise<WidokUstawienWorkspaceDashboardu> {
      const endpoint = "/dashboard/settings/workspace";
      try {
        return await zapytanieApi<WidokUstawienWorkspaceDashboardu>(endpoint, {
          metoda: "PATCH",
          token: pobierzToken(),
          body: { ...payload, ...queryTenant },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "updateSettingsWorkspace", endpoint);
      }
    },

    // odpowiada za wysylke wiadomosci do Papa AI Guardiana
    async guardianChatSend(input: WejscieWiadomosciGuardiana): Promise<OdpowiedzWysylkiCzatu> {
      const endpoint = "/dashboard/guardian/chat/send";
      try {
        return await zapytanieApi<OdpowiedzWysylkiCzatu>(endpoint, {
          metoda: "POST",
          token: pobierzToken(),
          body: { ...input, ...queryTenant },
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "guardianChatSend", endpoint);
      }
    },

    // odpowiada za odczyt historii watku Papa AI
    async guardianChatGetThread(threadId: string): Promise<WatekCzatuGuardiana> {
      const endpoint = `/dashboard/guardian/chat/thread/${encodeURIComponent(threadId)}`;
      try {
        return await zapytanieApi<WatekCzatuGuardiana>(endpoint, {
          token: pobierzToken(),
          query: queryTenant,
        });
      } catch (blad) {
        rzucJesliBrakEndpointu(blad, "guardianChatGetThread", endpoint);
      }
    },
  };
}

export default utworzTenantAdapterDashboardu;
