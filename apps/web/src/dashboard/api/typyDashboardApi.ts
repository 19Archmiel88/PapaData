export type TrybDashboardu = "DEMO" | "TENANT";
export type ZakresCzasuDashboardu = "7d" | "30d" | "90d";
export type ZakresPandL = "30d" | "90d";
export type ZakresAlertow = "7d" | "30d";
export type ZakresSymulacji = 30 | 60 | 90;

export type StatusZrodlaDashboardu = "connected" | "missing" | "error";
export type StatusIntegracjiDashboardu = "connected" | "available" | "missing" | "error";
export type KategoriaIntegracjiDashboardu =
  | "store"
  | "ads"
  | "analytics"
  | "marketplace"
  | "costs";

export type PriorytetDashboardu = "high" | "med" | "opportunity";
export type ObszarAlertuDashboardu = "ads" | "store" | "pricing" | "ux" | "inventory";
export type PoziomPewnosci = "high" | "med" | "low";
export type NakladPracy = "low" | "med" | "high";
export type FormatRaportuDashboardu = "pdf" | "link";
export type TypRaportuDashboardu = "weekly" | "monthly";
export type RolaDostepuDashboardu = "owner" | "admin" | "manager" | "analyst" | "viewer";
export type TrybDostepuDashboardu = "read_only" | "write";

export type TypBleduDashboardu =
  | "OFFLINE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_CONFIGURED"
  | "RATE_LIMIT"
  | "UNKNOWN";

export type MetaDashboardu = {
  mode: TrybDashboardu;
  tenantId?: string;
  generatedAt: string;
  dataFreshness: "fresh" | "stale" | "unknown";
  sources: Array<{ key: string; status: StatusZrodlaDashboardu; label: string }>;
  capabilities: {
    canWriteActions: boolean;
    canManageIntegrations: boolean;
    canExport: boolean;
    canUseGuardianChat: boolean;
  };
};

export type GotowoscDanychDashboardu = {
  score: number;
  issues: Array<{
    id: string;
    title: string;
    severity: "high" | "med" | "low";
    description: string;
  }>;
};

export type PrzegladDashboardu = {
  kpis: Array<{ key: string; label: string; value: number; deltaPct?: number }>;
  highlights: Array<{
    id: string;
    title: string;
    impactPln: number;
    priority: PriorytetDashboardu;
  }>;
};

export type AlertDashboardu = {
  id: string;
  title: string;
  priority: PriorytetDashboardu;
  area: ObszarAlertuDashboardu;
  metricLabel: string;
  metricValue: string;
  createdAt: string;
};

export type SzczegolyAlertuDashboardu = {
  id: string;
  analysis: {
    facts: string[];
    causes: string[];
    confidence: PoziomPewnosci;
  };
  recommendations: Array<{
    id: string;
    title: string;
    steps: string[];
    effort: NakladPracy;
  }>;
  simulation: {
    rangeDays: ZakresSymulacji;
    withChange: number[];
    withoutChange: number[];
    unit: "PLN" | "%";
  };
};

export type IntegracjaDashboardu = {
  key: string;
  label: string;
  category: KategoriaIntegracjiDashboardu;
  status: StatusIntegracjiDashboardu;
  lastSyncAt?: string;
};

export type WidokReklamDashboardu = {
  kpis: Array<{ key: string; label: string; value: number; deltaPct?: number }>;
  campaigns: Array<{
    id: string;
    name: string;
    channel: "meta" | "google" | "tiktok" | "other";
    spend: number;
    revenue: number;
    roas: number;
    status: "active" | "paused" | "learning";
  }>;
};

export type WidokProduktowDashboardu = {
  products: Array<{
    id: string;
    name: string;
    category: string;
    stock: number;
    marginPct: number;
    velocity: number;
    trend: "up" | "stable" | "down";
  }>;
};

export type WidokKlientowDashboardu = {
  kpis: Array<{ key: string; label: string; value: number; deltaPct?: number }>;
  segments: Array<{
    id: string;
    name: string;
    customers: number;
    ltv: number;
    repeatRatePct: number;
  }>;
};

export type WidokPipelineDashboardu = {
  tasks: Array<{
    id: string;
    title: string;
    owner: string;
    dueDate: string;
    priority: PriorytetDashboardu;
    status: "todo" | "in_progress" | "done";
  }>;
};

export type WidokAnalitykiDashboardu = {
  metricKey: string;
  metricLabel: string;
  summary: {
    growthPct: number;
    volatility: number;
    anomalyCount: number;
  };
  series: Array<{
    date: string;
    value: number;
    compareValue?: number;
    anomaly?: boolean;
  }>;
  channelSplit: Array<{
    key: string;
    label: string;
    value: number;
    deltaPct?: number;
  }>;
  anomalies: Array<{
    id: string;
    title: string;
    date: string;
    severity: "high" | "med" | "low";
    impact: number;
  }>;
};

export type WidokWiedzyDashboardu = {
  query?: string;
  playbooks: Array<{
    id: string;
    title: string;
    area: "ads" | "pricing" | "inventory" | "retention" | "analytics";
    level: "basic" | "advanced";
    updatedAt: string;
    summary: string;
    tags: string[];
    steps: string[];
  }>;
};

export type WynikPandLDashboardu = {
  revenue: number;
  cogs: number;
  adsCost: number;
  grossProfit: number;
  netProfit: number;
  marginPct: number;
  byChannel: Array<{ key: string; label: string; profit: number; marginPct: number }>;
};

export type RaportDashboardu = {
  id: string;
  title: string;
  createdAt: string;
  format: FormatRaportuDashboardu;
  url?: string;
};

export type WidokRaportowDashboardu = {
  reports: RaportDashboardu[];
  availableTypes: TypRaportuDashboardu[];
  canRequest: boolean;
};

export type KontekstDostepuDashboardu = {
  role: RolaDostepuDashboardu;
  access: TrybDostepuDashboardu;
  canManageUsers: boolean;
  canManageWorkspace: boolean;
};

export type WidokUstawienOrganizacjiDashboardu = {
  access: KontekstDostepuDashboardu;
  organization: {
    id: string;
    name: string;
    logoUrl?: string | null;
    plan: "starter" | "professional" | "enterprise";
    timezone: string;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: RolaDostepuDashboardu;
    status: "active" | "invited" | "disabled";
  }>;
  policies: Array<{
    key: string;
    label: string;
    enabled: boolean;
  }>;
};

export type AktualizacjaUstawienOrganizacjiDashboardu = {
  organization?: {
    name?: string;
    timezone?: string;
    logoUrl?: string | null;
  };
  memberRoles?: Array<{
    memberId: string;
    role: RolaDostepuDashboardu;
  }>;
  policies?: Array<{
    key: string;
    enabled: boolean;
  }>;
};

export type WidokUstawienWorkspaceDashboardu = {
  access: KontekstDostepuDashboardu;
  workspace: {
    id: string;
    name: string;
    currency: "PLN" | "EUR" | "USD";
    timezone: string;
    locale: "pl-PL" | "en-US";
  };
  notifications: {
    dailyDigest: boolean;
    weeklySummary: boolean;
    criticalAlerts: boolean;
  };
  preferences: {
    defaultRange: ZakresCzasuDashboardu;
    compactMode: boolean;
  };
};

export type AktualizacjaUstawienWorkspaceDashboardu = {
  workspace?: {
    name?: string;
    currency?: "PLN" | "EUR" | "USD";
    timezone?: string;
    locale?: "pl-PL" | "en-US";
  };
  notifications?: Partial<WidokUstawienWorkspaceDashboardu["notifications"]>;
  preferences?: Partial<WidokUstawienWorkspaceDashboardu["preferences"]>;
};

export type ZdarzenieCzatuGuardiana =
  | { type: "thinking"; payload: { text: string } }
  | { type: "analysis"; payload: { facts: string[]; confidence: PoziomPewnosci } }
  | { type: "recommendations"; payload: { items: string[] } }
  | { type: "simulation"; payload: { impactPln: number; horizonDays: ZakresSymulacji } };

export type OdpowiedzWysylkiCzatu = {
  threadId: string;
  events: ZdarzenieCzatuGuardiana[];
};

export type BlokWiadomosciCzatu =
  | { type: "text"; payload: { text: string } }
  | { type: "kpi"; payload: { label: string; value: string } }
  | { type: "chart"; payload: { label: string; values: number[] } }
  | { type: "list"; payload: { title: string; items: string[] } };

export type WatekCzatuGuardiana = {
  threadId: string;
  messages: Array<{
    role: "user" | "assistant";
    blocks: BlokWiadomosciCzatu[];
    createdAt: string;
  }>;
};

export type WejscieWiadomosciGuardiana = {
  threadId?: string;
  message: string;
  context?: {
    alertId?: string;
    range?: ZakresCzasuDashboardu;
  };
};

export type BladDashboardu = {
  code: TypBleduDashboardu;
  message: string;
  details?: string;
  retryable: boolean;
};
