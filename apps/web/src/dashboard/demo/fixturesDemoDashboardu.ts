import type {
  WidokAnalitykiDashboardu,
  WidokRaportowDashboardu,
  WidokUstawienOrganizacjiDashboardu,
  WidokUstawienWorkspaceDashboardu,
  WidokWiedzyDashboardu,
  AlertDashboardu,
  GotowoscDanychDashboardu,
  IntegracjaDashboardu,
  MetaDashboardu,
  OdpowiedzWysylkiCzatu,
  PrzegladDashboardu,
  RaportDashboardu,
  SzczegolyAlertuDashboardu,
  WidokKlientowDashboardu,
  WidokPipelineDashboardu,
  WidokProduktowDashboardu,
  WidokReklamDashboardu,
  WatekCzatuGuardiana,
  WynikPandLDashboardu,
} from "../api/typyDashboardApi";

const DZIS_UTC = new Date();

function dataMinusGodziny(godziny: number): string {
  return new Date(DZIS_UTC.getTime() - godziny * 60 * 60 * 1000).toISOString();
}

function dataMinusDni(dni: number): string {
  return new Date(DZIS_UTC.getTime() - dni * 24 * 60 * 60 * 1000).toISOString();
}

export const META_DEMO_DASHBOARDU: MetaDashboardu = {
  mode: "DEMO",
  generatedAt: DZIS_UTC.toISOString(),
  dataFreshness: "fresh",
  sources: [
    { key: "shop", status: "connected", label: "Sklep (demo)" },
    { key: "ads_meta", status: "connected", label: "Meta Ads (demo)" },
    { key: "ads_google", status: "missing", label: "Google Ads (niepodlaczone w demo)" },
    { key: "costs", status: "connected", label: "Koszty i marza (demo)" },
  ],
  capabilities: {
    canWriteActions: false,
    canManageIntegrations: false,
    canExport: true,
    canUseGuardianChat: true,
  },
};

export const GOTOWOSC_DANYCH_DEMO: GotowoscDanychDashboardu = {
  score: 82,
  issues: [
    {
      id: "ga4-missing",
      title: "Brak pelnej integracji GA4",
      severity: "med",
      description: "Model rekomendacji UX bedzie dokladniejszy po podpieciu GA4.",
    },
    {
      id: "google-ads-missing",
      title: "Brak Google Ads",
      severity: "high",
      description: "Czesc atrybucji przychodu jest niedoszacowana.",
    },
  ],
};

export const PRZEGLAD_DEMO_30D: PrzegladDashboardu = {
  kpis: [
    { key: "revenue", label: "Przychod", value: 1_280_000, deltaPct: 11.2 },
    { key: "net_margin", label: "Marza netto", value: 18.6, deltaPct: 2.8 },
    { key: "roas", label: "ROAS", value: 4.2, deltaPct: -6.1 },
    { key: "aov", label: "AOV", value: 286, deltaPct: 3.4 },
  ],
  highlights: [
    {
      id: "retargeting-shift",
      title: "Przesun 18% budzetu do retargetingu premium",
      impactPln: 38_400,
      priority: "high",
    },
    {
      id: "checkout-fix",
      title: "Uprosc checkout mobile (1 krok mniej)",
      impactPln: 22_700,
      priority: "med",
    },
    {
      id: "price-guard",
      title: "Skoryguj rabaty dla SKU premium",
      impactPln: 14_300,
      priority: "opportunity",
    },
  ],
};

export const ALERTY_DEMO_30D: AlertDashboardu[] = [
  {
    id: "alert-checkout-mobile",
    title: "Spadek konwersji mobile na kroku platnosci",
    priority: "high",
    area: "ux",
    metricLabel: "CVR mobile",
    metricValue: "-0.7 pp",
    createdAt: dataMinusGodziny(5),
  },
  {
    id: "alert-roas-prospecting",
    title: "Prospecting traci marze netto",
    priority: "high",
    area: "ads",
    metricLabel: "ROAS prospecting",
    metricValue: "-18%",
    createdAt: dataMinusGodziny(12),
  },
  {
    id: "alert-discount-margin",
    title: "Rabat premium redukuje marze bez wzrostu wolumenu",
    priority: "med",
    area: "pricing",
    metricLabel: "Marza premium",
    metricValue: "-3.1 pp",
    createdAt: dataMinusGodziny(30),
  },
  {
    id: "alert-cross-sell-opportunity",
    title: "Szansa wzrostu AOV przez cross-sell po zakupie",
    priority: "opportunity",
    area: "store",
    metricLabel: "AOV returning",
    metricValue: "+5.4%",
    createdAt: dataMinusGodziny(48),
  },
];

export const SZCZEGOLY_ALERTOW_DEMO: Record<string, SzczegolyAlertuDashboardu> = {
  "alert-checkout-mobile": {
    id: "alert-checkout-mobile",
    analysis: {
      facts: [
        "Ruch mobile stabilny, ale finalizacja platnosci spadla po wdrozeniu nowego checkout.",
        "Wzrost porzucen koszyka wystepuje glownie na iOS.",
      ],
      causes: [
        "Nowy layout checkout wydluzyl czas ladowania o 620ms.",
        "Brak autouzupełniania danych adresowych na 2. kroku.",
      ],
      confidence: "high",
    },
    recommendations: [
      {
        id: "rec-rollback-checkout",
        title: "Przywroc wariant checkout z poprzedniej wersji",
        steps: [
          "Wlacz poprzedni wariant dla 100% ruchu mobile.",
          "Monitoruj finalizacje i porzucenia przez 48h.",
          "Przeprowadz test A/B z nowa wersja po optymalizacji.",
        ],
        effort: "low",
      },
      {
        id: "rec-alert-finalization",
        title: "Dodaj alert finalizacji checkout co 30 minut",
        steps: [
          "Ustaw prog alarmu na spadek > 0.4 pp.",
          "Wysylaj alert do wlasciciela growth.",
        ],
        effort: "low",
      },
    ],
    simulation: {
      rangeDays: 30,
      withChange: [312000, 324000, 331000, 338000, 344000, 349000],
      withoutChange: [312000, 308000, 303000, 299000, 294000, 291000],
      unit: "PLN",
    },
  },
};

export const INTEGRACJE_DEMO: IntegracjaDashboardu[] = [
  { key: "woocommerce", label: "WooCommerce", category: "store", status: "connected", lastSyncAt: dataMinusGodziny(2) },
  { key: "allegro", label: "Allegro", category: "marketplace", status: "connected", lastSyncAt: dataMinusGodziny(3) },
  { key: "meta-ads", label: "Meta Ads", category: "ads", status: "connected", lastSyncAt: dataMinusGodziny(1) },
  { key: "google-ads", label: "Google Ads", category: "ads", status: "missing" },
  { key: "ga4", label: "Google Analytics 4", category: "analytics", status: "available" },
  { key: "erp-costs", label: "Koszty ERP", category: "costs", status: "error", lastSyncAt: dataMinusDni(1) },
];

export const REKLAMY_DEMO_30D: WidokReklamDashboardu = {
  kpis: [
    { key: "spend", label: "Wydatki reklamowe", value: 288_000, deltaPct: 5.1 },
    { key: "revenue", label: "Przychod atrib.", value: 1_054_000, deltaPct: 8.9 },
    { key: "roas", label: "ROAS", value: 3.66, deltaPct: -4.2 },
    { key: "cpa", label: "CPA", value: 56, deltaPct: 6.3 },
  ],
  campaigns: [
    {
      id: "meta-retargeting-1",
      name: "Meta Retargeting Premium",
      channel: "meta",
      spend: 67_000,
      revenue: 306_000,
      roas: 4.57,
      status: "active",
    },
    {
      id: "meta-prospecting-1",
      name: "Meta Prospecting Broad",
      channel: "meta",
      spend: 92_000,
      revenue: 281_000,
      roas: 3.05,
      status: "active",
    },
    {
      id: "google-shopping-1",
      name: "Google Shopping Core",
      channel: "google",
      spend: 84_000,
      revenue: 342_000,
      roas: 4.07,
      status: "learning",
    },
    {
      id: "tiktok-prospecting-1",
      name: "TikTok Prospecting",
      channel: "tiktok",
      spend: 45_000,
      revenue: 125_000,
      roas: 2.78,
      status: "paused",
    },
  ],
};

export const PRODUKTY_DEMO_30D: WidokProduktowDashboardu = {
  products: [
    {
      id: "sku-100",
      name: "Butelka termiczna Pro 750ml",
      category: "Akcesoria",
      stock: 480,
      marginPct: 32.4,
      velocity: 18.2,
      trend: "up",
    },
    {
      id: "sku-245",
      name: "Plecak miejski X2",
      category: "Outdoor",
      stock: 112,
      marginPct: 21.1,
      velocity: 11.4,
      trend: "stable",
    },
    {
      id: "sku-410",
      name: "Koszulka sportowa DryLite",
      category: "Odziez",
      stock: 58,
      marginPct: 14.6,
      velocity: 9.1,
      trend: "down",
    },
    {
      id: "sku-599",
      name: "Opaska fitness S3",
      category: "Elektronika",
      stock: 34,
      marginPct: 26.8,
      velocity: 15.7,
      trend: "up",
    },
  ],
};

export const KLIENCI_DEMO_30D: WidokKlientowDashboardu = {
  kpis: [
    { key: "ltv", label: "Sredni LTV", value: 812, deltaPct: 3.2 },
    { key: "repeat_rate", label: "Repeat rate", value: 31.4, deltaPct: 1.8 },
    { key: "cohort_retention", label: "Retencja 30d", value: 42.7, deltaPct: 0.9 },
  ],
  segments: [
    {
      id: "segment-vip",
      name: "VIP 90d",
      customers: 382,
      ltv: 2_440,
      repeatRatePct: 64.2,
    },
    {
      id: "segment-returning",
      name: "Returning core",
      customers: 1_460,
      ltv: 1_120,
      repeatRatePct: 46.1,
    },
    {
      id: "segment-new",
      name: "Nowi 30d",
      customers: 2_840,
      ltv: 418,
      repeatRatePct: 17.3,
    },
  ],
};

export const PIPELINE_DEMO: WidokPipelineDashboardu = {
  tasks: [
    {
      id: "task-1",
      title: "Przesun 18% budzetu do retargetingu premium",
      owner: "Growth Lead",
      dueDate: dataMinusDni(-2),
      priority: "high",
      status: "in_progress",
    },
    {
      id: "task-2",
      title: "Wdroz rollback checkout mobile na 48h",
      owner: "E-commerce Manager",
      dueDate: dataMinusDni(-1),
      priority: "high",
      status: "todo",
    },
    {
      id: "task-3",
      title: "Skoryguj rabaty SKU premium do 4%",
      owner: "Pricing Owner",
      dueDate: dataMinusDni(-4),
      priority: "med",
      status: "todo",
    },
    {
      id: "task-4",
      title: "Przygotuj raport tygodniowy dla zarzadu",
      owner: "Analityk",
      dueDate: dataMinusDni(-6),
      priority: "opportunity",
      status: "done",
    },
  ],
};

export const ANALITYKA_DEMO_30D: WidokAnalitykiDashboardu = {
  metricKey: "net_profit",
  metricLabel: "Zysk netto",
  summary: {
    growthPct: 9.4,
    volatility: 0.21,
    anomalyCount: 2,
  },
  series: [
    { date: dataMinusDni(30), value: 218_000, compareValue: 203_000 },
    { date: dataMinusDni(25), value: 224_000, compareValue: 207_000 },
    { date: dataMinusDni(20), value: 236_000, compareValue: 211_000 },
    { date: dataMinusDni(15), value: 219_000, compareValue: 214_000, anomaly: true },
    { date: dataMinusDni(10), value: 241_000, compareValue: 217_000 },
    { date: dataMinusDni(7), value: 248_000, compareValue: 222_000 },
    { date: dataMinusDni(3), value: 253_000, compareValue: 229_000 },
    { date: dataMinusDni(1), value: 268_000, compareValue: 235_000, anomaly: true },
  ],
  channelSplit: [
    { key: "paid", label: "Platne", value: 132_000, deltaPct: 6.1 },
    { key: "organic", label: "Organic", value: 96_000, deltaPct: 12.3 },
    { key: "marketplace", label: "Marketplace", value: 40_000, deltaPct: -2.8 },
  ],
  anomalies: [
    {
      id: "anomalia-checkout",
      title: "Spadek finalizacji checkout mobile",
      date: dataMinusDni(15),
      severity: "high",
      impact: -17_300,
    },
    {
      id: "anomalia-cpc",
      title: "Wzrost CPC w kampanii prospecting",
      date: dataMinusDni(1),
      severity: "med",
      impact: -6_400,
    },
  ],
};

export const WIEDZA_DEMO: WidokWiedzyDashboardu = {
  playbooks: [
    {
      id: "playbook-checkout-mobile",
      title: "Playbook: Stabilizacja checkout mobile",
      area: "analytics",
      level: "advanced",
      updatedAt: dataMinusDni(4),
      summary: "Jak szybciej zdiagnozowac i naprawic spadek finalizacji na mobile.",
      tags: ["checkout", "mobile", "konwersja"],
      steps: [
        "Zweryfikuj speed i eventy finalizacji per urzadzenie.",
        "Uruchom rollback i monitoruj roznice 24h.",
        "Wprowadz alert 30-minutowy dla CVR checkout.",
      ],
    },
    {
      id: "playbook-roas-budget",
      title: "Playbook: Korekta budzetu przy spadku ROAS",
      area: "ads",
      level: "basic",
      updatedAt: dataMinusDni(7),
      summary: "Standardowy plan dzialania dla utraty marzy na prospectingu.",
      tags: ["roas", "budzet", "kampanie"],
      steps: [
        "Podziel kampanie na retargeting i prospecting.",
        "Przesun 10-20% budzetu do segmentu o najwyzszej marzy.",
        "Ocen ROAS i CPA po 72 godzinach.",
      ],
    },
    {
      id: "playbook-margin-pricing",
      title: "Playbook: Odbudowa marzy dla SKU premium",
      area: "pricing",
      level: "advanced",
      updatedAt: dataMinusDni(10),
      summary: "Jak ograniczyc utrate marzy przy kampaniach rabatowych.",
      tags: ["marza", "pricing", "sku"],
      steps: [
        "Wylacz rabaty >5% dla top SKU premium.",
        "Dodaj cross-sell zamiast dodatkowego rabatu.",
        "Monitoruj marze netto i wolumen dzienny.",
      ],
    },
  ],
};

export const PANDL_DEMO_30D: WynikPandLDashboardu = {
  revenue: 1_280_000,
  cogs: 612_000,
  adsCost: 288_000,
  grossProfit: 668_000,
  netProfit: 268_000,
  marginPct: 20.9,
  byChannel: [
    { key: "meta", label: "Meta Ads", profit: 123_000, marginPct: 17.2 },
    { key: "organic", label: "Organic", profit: 98_000, marginPct: 29.8 },
    { key: "allegro", label: "Allegro", profit: 47_000, marginPct: 13.6 },
  ],
};

export const RAPORTY_DEMO: RaportDashboardu[] = [
  {
    id: "report-weekly-1",
    title: "Weekly Growth Summary",
    createdAt: dataMinusDni(2),
    format: "pdf",
    url: "/legal/polityka-cookies",
  },
  {
    id: "report-margin-1",
    title: "Analiza marzy netto (30 dni)",
    createdAt: dataMinusDni(5),
    format: "link",
    url: "/legal/regulamin",
  },
];

export const WIDOK_RAPORTOW_DEMO: WidokRaportowDashboardu = {
  reports: RAPORTY_DEMO,
  availableTypes: ["weekly", "monthly"],
  canRequest: true,
};

export const USTAWIENIA_ORG_DEMO: WidokUstawienOrganizacjiDashboardu = {
  access: {
    role: "viewer",
    access: "read_only",
    canManageUsers: false,
    canManageWorkspace: false,
  },
  organization: {
    id: "org-demo-1",
    name: "PapaData Demo Sp. z o.o.",
    logoUrl: "/branding/logo-klienta-demo.svg",
    plan: "professional",
    timezone: "Europe/Warsaw",
  },
  members: [
    {
      id: "member-1",
      name: "Anna Kowalska",
      email: "anna@papadata.demo",
      role: "owner",
      status: "active",
    },
    {
      id: "member-2",
      name: "Pawel Nowak",
      email: "pawel@papadata.demo",
      role: "analyst",
      status: "active",
    },
    {
      id: "member-3",
      name: "Marta Zielinska",
      email: "marta@papadata.demo",
      role: "viewer",
      status: "invited",
    },
  ],
  policies: [
    { key: "mfa_required", label: "Wymagaj MFA", enabled: true },
    { key: "export_guard", label: "Wymagaj roli manager+ dla eksportu", enabled: true },
    { key: "session_12h", label: "Maksymalna sesja 12h", enabled: false },
  ],
};

export const USTAWIENIA_WORKSPACE_DEMO: WidokUstawienWorkspaceDashboardu = {
  access: {
    role: "viewer",
    access: "read_only",
    canManageUsers: false,
    canManageWorkspace: false,
  },
  workspace: {
    id: "workspace-demo-1",
    name: "Workspace Demo Retail",
    currency: "PLN",
    timezone: "Europe/Warsaw",
    locale: "pl-PL",
  },
  notifications: {
    dailyDigest: true,
    weeklySummary: true,
    criticalAlerts: true,
  },
  preferences: {
    defaultRange: "30d",
    compactMode: false,
  },
};

export const ODPOWIEDZ_CZATU_DEMO: OdpowiedzWysylkiCzatu = {
  threadId: "demo-thread-guardian-1",
  events: [
    { type: "thinking", payload: { text: "Analizuje sygnaly z kampanii i checkout..." } },
    {
      type: "analysis",
      payload: {
        facts: [
          "Spadek konwersji mobile odpowiada za ~41% utraconej marzy tygodniowej.",
          "Najwiekszy odplyw konwersji wystepuje na iOS.",
        ],
        confidence: "high",
      },
    },
    {
      type: "recommendations",
      payload: {
        items: [
          "Przywroc poprzedni checkout mobile na 48h.",
          "Przesun 18% budzetu do retargetingu premium.",
          "Wylacz rabat 10% na top 15 SKU premium.",
        ],
      },
    },
    {
      type: "simulation",
      payload: {
        impactPln: 38_400,
        horizonDays: 30,
      },
    },
  ],
};

export const WATEK_CZATU_DEMO: WatekCzatuGuardiana = {
  threadId: "demo-thread-guardian-1",
  messages: [
    {
      role: "user",
      createdAt: dataMinusGodziny(1),
      blocks: [{ type: "text", payload: { text: "Co najbardziej obniża marżę w tym tygodniu?" } }],
    },
    {
      role: "assistant",
      createdAt: dataMinusGodziny(1),
      blocks: [
        {
          type: "text",
          payload: {
            text: "Najwiekszy wplyw ma spadek konwersji mobile po zmianie checkout.",
          },
        },
        {
          type: "kpi",
          payload: {
            label: "Szacowana strata tygodniowa",
            value: "17 300 PLN",
          },
        },
      ],
    },
  ],
};
