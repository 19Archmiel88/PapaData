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
} from "./typyDashboardApi";

export interface DashboardApi {
  getMeta: () => Promise<MetaDashboardu>;
  getDataReadiness: () => Promise<GotowoscDanychDashboardu>;
  getOverview: (range: ZakresCzasuDashboardu) => Promise<PrzegladDashboardu>;
  getAlerts: (range: ZakresAlertow) => Promise<AlertDashboardu[]>;
  getAlertDetails: (id: string) => Promise<SzczegolyAlertuDashboardu>;
  getAdsView: (range: ZakresCzasuDashboardu) => Promise<WidokReklamDashboardu>;
  getProductsView: (range: ZakresCzasuDashboardu) => Promise<WidokProduktowDashboardu>;
  getCustomersView: (range: ZakresCzasuDashboardu) => Promise<WidokKlientowDashboardu>;
  getPipelineView: () => Promise<WidokPipelineDashboardu>;
  getIntegrations: () => Promise<IntegracjaDashboardu[]>;
  startIntegrationConnect: (key: string) => Promise<{ url: string }>;
  getPandL: (range: ZakresPandL) => Promise<WynikPandLDashboardu>;
  getAnalyticsView: (range: ZakresCzasuDashboardu) => Promise<WidokAnalitykiDashboardu>;
  getKnowledgeView: (query?: string) => Promise<WidokWiedzyDashboardu>;
  getReportsView: () => Promise<WidokRaportowDashboardu>;
  getReports: () => Promise<RaportDashboardu[]>;
  requestReport: (type: TypRaportuDashboardu) => Promise<{ id: string }>;
  getSettingsOrgView: () => Promise<WidokUstawienOrganizacjiDashboardu>;
  updateSettingsOrg: (
    payload: AktualizacjaUstawienOrganizacjiDashboardu
  ) => Promise<WidokUstawienOrganizacjiDashboardu>;
  getSettingsWorkspaceView: () => Promise<WidokUstawienWorkspaceDashboardu>;
  updateSettingsWorkspace: (
    payload: AktualizacjaUstawienWorkspaceDashboardu
  ) => Promise<WidokUstawienWorkspaceDashboardu>;
  guardianChatSend: (input: WejscieWiadomosciGuardiana) => Promise<OdpowiedzWysylkiCzatu>;
  guardianChatGetThread: (threadId: string) => Promise<WatekCzatuGuardiana>;
}
