import type { DashboardApi } from "../api/kontraktDashboardApi";
import type {
  AktualizacjaUstawienOrganizacjiDashboardu,
  AktualizacjaUstawienWorkspaceDashboardu,
  AlertDashboardu,
  OdpowiedzWysylkiCzatu,
  SzczegolyAlertuDashboardu,
  TypRaportuDashboardu,
  WejscieWiadomosciGuardiana,
  WidokUstawienOrganizacjiDashboardu,
  WidokUstawienWorkspaceDashboardu,
} from "../api/typyDashboardApi";
import {
  ANALITYKA_DEMO_30D,
  ALERTY_DEMO_30D,
  KLIENCI_DEMO_30D,
  GOTOWOSC_DANYCH_DEMO,
  INTEGRACJE_DEMO,
  META_DEMO_DASHBOARDU,
  ODPOWIEDZ_CZATU_DEMO,
  PANDL_DEMO_30D,
  PIPELINE_DEMO,
  PRODUKTY_DEMO_30D,
  PRZEGLAD_DEMO_30D,
  REKLAMY_DEMO_30D,
  WIDOK_RAPORTOW_DEMO,
  SZCZEGOLY_ALERTOW_DEMO,
  USTAWIENIA_ORG_DEMO,
  USTAWIENIA_WORKSPACE_DEMO,
  WIEDZA_DEMO,
  WATEK_CZATU_DEMO,
} from "./fixturesDemoDashboardu";

type OpcjeDemoAdaptera = {
  tenantId?: string;
  opoznienieMs?: number;
};

function opoznij(ms: number) {
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function znajdzAlert(id: string, lista: AlertDashboardu[]): SzczegolyAlertuDashboardu {
  const bazowy = SZCZEGOLY_ALERTOW_DEMO[id];
  if (bazowy) return bazowy;

  const alert = lista.find((element) => element.id === id);
  if (alert) {
    return {
      id: alert.id,
      analysis: {
        facts: [`Wykryto odchylenie metryki: ${alert.metricLabel} (${alert.metricValue}).`],
        causes: ["Wymagana pogłębiona analiza po podłączeniu pełnych źródeł danych."],
        confidence: "med",
      },
      recommendations: [
        {
          id: `rekomendacja-${alert.id}`,
          title: "Zweryfikuj metrykę i uruchom monitoring",
          steps: [
            "Sprawdź segment, który generuje odchylenie.",
            "Ustaw alert automatyczny dla tej metryki.",
          ],
          effort: "low",
        },
      ],
      simulation: {
        rangeDays: 30,
        withChange: [100_000, 108_000, 115_000, 121_000, 127_000],
        withoutChange: [100_000, 99_000, 97_000, 96_000, 94_000],
        unit: "PLN",
      },
    };
  }

  return {
    id,
    analysis: {
      facts: ["Brak szczegółów dla tego alertu w zestawie demo."],
      causes: ["Alert nie jest dostępny w aktualnej sesji demonstracyjnej."],
      confidence: "low",
    },
    recommendations: [
      {
        id: `fallback-${id}`,
        title: "Odśwież dane demonstracyjne",
        steps: ["Przeładuj panel i ponownie otwórz alert."],
        effort: "low",
      },
    ],
    simulation: {
      rangeDays: 30,
      withChange: [0, 0, 0],
      withoutChange: [0, 0, 0],
      unit: "PLN",
    },
  };
}

export function utworzDemoAdapterDashboardu(opcje: OpcjeDemoAdaptera = {}): DashboardApi {
  const opoznienieMs = opcje.opoznienieMs ?? 260;
  let ustawieniaOrg: WidokUstawienOrganizacjiDashboardu = USTAWIENIA_ORG_DEMO;
  let ustawieniaWorkspace: WidokUstawienWorkspaceDashboardu = USTAWIENIA_WORKSPACE_DEMO;
  const meta = {
    ...META_DEMO_DASHBOARDU,
    tenantId: opcje.tenantId,
    generatedAt: new Date().toISOString(),
  };

  return {
    // odpowiada za metadane trybu DEMO i status źródeł
    async getMeta() {
      await opoznij(opoznienieMs);
      return meta;
    },

    // odpowiada za gotowość danych i listę braków
    async getDataReadiness() {
      await opoznij(opoznienieMs);
      return GOTOWOSC_DANYCH_DEMO;
    },

    // odpowiada za KPI i highlights dashboardu
    async getOverview() {
      await opoznij(opoznienieMs);
      return PRZEGLAD_DEMO_30D;
    },

    // odpowiada za listę alertów w feedzie Guardiana
    async getAlerts() {
      await opoznij(opoznienieMs);
      return ALERTY_DEMO_30D;
    },

    // odpowiada za szczegóły wybranego alertu
    async getAlertDetails(id: string) {
      await opoznij(opoznienieMs);
      return znajdzAlert(id, ALERTY_DEMO_30D);
    },

    // odpowiada za widok operacyjny reklam
    async getAdsView() {
      await opoznij(opoznienieMs);
      return REKLAMY_DEMO_30D;
    },

    // odpowiada za widok produktowy i marzowy
    async getProductsView() {
      await opoznij(opoznienieMs);
      return PRODUKTY_DEMO_30D;
    },

    // odpowiada za widok segmentow klientow
    async getCustomersView() {
      await opoznij(opoznienieMs);
      return KLIENCI_DEMO_30D;
    },

    // odpowiada za pipeline zadan i wdrozen
    async getPipelineView() {
      await opoznij(opoznienieMs);
      return PIPELINE_DEMO;
    },

    // odpowiada za status listy integracji
    async getIntegrations() {
      await opoznij(opoznienieMs);
      return INTEGRACJE_DEMO;
    },

    // odpowiada za symulowany start połączenia integracji
    async startIntegrationConnect(key: string) {
      await opoznij(opoznienieMs);
      return { url: `/integracje/demo/${encodeURIComponent(key)}` };
    },

    // odpowiada za wynik P&L
    async getPandL() {
      await opoznij(opoznienieMs);
      return PANDL_DEMO_30D;
    },

    // odpowiada za runtime reports (P1.2)
    async getReportsView() {
      await opoznij(opoznienieMs);
      return WIDOK_RAPORTOW_DEMO;
    },

    // odpowiada za runtime analytics (P1.2)
    async getAnalyticsView() {
      await opoznij(opoznienieMs);
      return ANALITYKA_DEMO_30D;
    },

    // odpowiada za runtime knowledge (P1.2)
    async getKnowledgeView(query?: string) {
      await opoznij(opoznienieMs);
      if (!query?.trim()) return WIEDZA_DEMO;
      const filtr = query.trim().toLowerCase();
      return {
        query,
        playbooks: WIEDZA_DEMO.playbooks.filter((element) => {
          const dane = [element.title, element.summary, ...element.tags].join(" ").toLowerCase();
          return dane.includes(filtr);
        }),
      };
    },

    // odpowiada za listę raportów (kompatybilność kontraktu)
    async getReports() {
      await opoznij(opoznienieMs);
      return WIDOK_RAPORTOW_DEMO.reports;
    },

    // odpowiada za symulowane zamówienie nowego raportu
    async requestReport(type: TypRaportuDashboardu) {
      await opoznij(opoznienieMs);
      return { id: `demo-report-${type}-${Date.now()}` };
    },

    // odpowiada za ustawienia organizacji z access-control (P1.3)
    async getSettingsOrgView() {
      await opoznij(opoznienieMs);
      return ustawieniaOrg;
    },

    // odpowiada za aktualizacje ustawien organizacji z ochrona read-only
    async updateSettingsOrg(payload: AktualizacjaUstawienOrganizacjiDashboardu) {
      await opoznij(opoznienieMs);
      if (ustawieniaOrg.access.access === "read_only") return ustawieniaOrg;

      ustawieniaOrg = {
        ...ustawieniaOrg,
        organization: {
          ...ustawieniaOrg.organization,
          ...payload.organization,
        },
        policies: payload.policies
          ? ustawieniaOrg.policies.map((policy) => {
              const nowa = payload.policies?.find((element) => element.key === policy.key);
              return nowa ? { ...policy, enabled: nowa.enabled } : policy;
            })
          : ustawieniaOrg.policies,
        members: payload.memberRoles
          ? ustawieniaOrg.members.map((member) => {
              const nowa = payload.memberRoles?.find((element) => element.memberId === member.id);
              return nowa ? { ...member, role: nowa.role } : member;
            })
          : ustawieniaOrg.members,
      };

      return ustawieniaOrg;
    },

    // odpowiada za ustawienia workspace z access-control (P1.3)
    async getSettingsWorkspaceView() {
      await opoznij(opoznienieMs);
      return ustawieniaWorkspace;
    },

    // odpowiada za aktualizacje ustawien workspace z ochrona read-only
    async updateSettingsWorkspace(payload: AktualizacjaUstawienWorkspaceDashboardu) {
      await opoznij(opoznienieMs);
      if (ustawieniaWorkspace.access.access === "read_only") return ustawieniaWorkspace;

      ustawieniaWorkspace = {
        ...ustawieniaWorkspace,
        workspace: {
          ...ustawieniaWorkspace.workspace,
          ...payload.workspace,
        },
        notifications: {
          ...ustawieniaWorkspace.notifications,
          ...payload.notifications,
        },
        preferences: {
          ...ustawieniaWorkspace.preferences,
          ...payload.preferences,
        },
      };

      return ustawieniaWorkspace;
    },

    // odpowiada za odpowiedź eventową Papa AI chat w trybie DEMO
    async guardianChatSend(input: WejscieWiadomosciGuardiana): Promise<OdpowiedzWysylkiCzatu> {
      await opoznij(opoznienieMs);
      return {
        ...ODPOWIEDZ_CZATU_DEMO,
        threadId: input.threadId?.trim() || `demo-thread-${Date.now()}`,
      };
    },

    // odpowiada za odczyt historii czatu Guardiana
    async guardianChatGetThread(threadId: string) {
      await opoznij(opoznienieMs);
      return {
        ...WATEK_CZATU_DEMO,
        threadId,
      };
    },
  };
}

export default utworzDemoAdapterDashboardu;
