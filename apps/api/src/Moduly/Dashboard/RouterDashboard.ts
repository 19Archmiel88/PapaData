import type { FastifyPluginAsync } from "fastify";

type Role = "owner" | "admin" | "manager" | "analyst" | "viewer";
type Access = "write" | "read_only";

function isoMinusHours(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function isoMinusDays(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function resolveAccess(tenantId?: string): { role: Role; access: Access; canManageUsers: boolean; canManageWorkspace: boolean } {
  const value = (tenantId ?? "").toLowerCase();
  if (value.includes("viewer") || value.includes("readonly")) {
    return { role: "viewer", access: "read_only", canManageUsers: false, canManageWorkspace: false };
  }
  if (value.includes("analyst")) {
    return { role: "analyst", access: "read_only", canManageUsers: false, canManageWorkspace: false };
  }
  if (value.includes("manager")) {
    return { role: "manager", access: "write", canManageUsers: false, canManageWorkspace: true };
  }
  return { role: "owner", access: "write", canManageUsers: true, canManageWorkspace: true };
}

const alerts = [
  {
    id: "alert-checkout-mobile",
    title: "Spadek konwersji mobile na kroku platnosci",
    priority: "high",
    area: "ux",
    metricLabel: "CVR mobile",
    metricValue: "-0.7 pp",
    createdAt: isoMinusHours(3),
  },
  {
    id: "alert-roas-prospecting",
    title: "Prospecting traci marze netto",
    priority: "high",
    area: "ads",
    metricLabel: "ROAS prospecting",
    metricValue: "-18%",
    createdAt: isoMinusHours(9),
  },
  {
    id: "alert-discount-margin",
    title: "Rabat premium redukuje marze bez wzrostu wolumenu",
    priority: "med",
    area: "pricing",
    metricLabel: "Marza premium",
    metricValue: "-3.1 pp",
    createdAt: isoMinusHours(18),
  },
] as const;

const alertDetails: Record<string, unknown> = {
  "alert-checkout-mobile": {
    id: "alert-checkout-mobile",
    analysis: {
      facts: ["Wzrost porzucen checkout mobile po ostatnim deployu.", "Najwiekszy spadek dla iOS 17."],
      causes: ["Spowolnienie checkout o ~500ms.", "Brak autouzupelniania danych adresowych."],
      confidence: "high",
    },
    recommendations: [
      {
        id: "rec-checkout-rollback",
        title: "Rollback checkout mobile i monitor 48h",
        steps: ["Przywroc poprzedni wariant checkout.", "Uruchom monitoring CVR co 30 minut."],
        effort: "low",
      },
    ],
    simulation: {
      rangeDays: 30,
      withChange: [312000, 324000, 331000, 338000, 344000],
      withoutChange: [312000, 308000, 303000, 299000, 294000],
      unit: "PLN",
    },
  },
};

let reports: Array<{ id: string; title: string; createdAt: string; format: "pdf" | "link"; url?: string }> = [
  { id: "report-weekly-1", title: "Weekly Growth Summary", createdAt: isoMinusDays(2), format: "pdf", url: "https://app.papadata.pl/reports/weekly-growth-summary" },
  { id: "report-margin-1", title: "Analiza marzy netto (30 dni)", createdAt: isoMinusDays(5), format: "link", url: "https://app.papadata.pl/reports/margin-30d" },
];

let settingsOrgState = {
  organization: {
    id: "org-tenant-1",
    name: "PapaData Tenant Sp. z o.o.",
    logoUrl: "/branding/logo-klienta-demo.svg" as string | null,
    plan: "professional",
    timezone: "Europe/Warsaw",
  },
  members: [
    { id: "member-1", name: "Owner Tenant", email: "owner@tenant.test", role: "owner", status: "active" },
    { id: "member-2", name: "Growth Manager", email: "manager@tenant.test", role: "manager", status: "active" },
    { id: "member-3", name: "Analyst", email: "analyst@tenant.test", role: "analyst", status: "active" },
  ],
  policies: [
    { key: "mfa_required", label: "Wymagaj MFA", enabled: true },
    { key: "export_guard", label: "Wymagaj roli manager+ dla eksportu", enabled: true },
    { key: "session_12h", label: "Maksymalna sesja 12h", enabled: false },
  ],
};

let settingsWorkspaceState = {
  workspace: { id: "workspace-tenant-1", name: "Workspace Tenant Retail", currency: "PLN", timezone: "Europe/Warsaw", locale: "pl-PL" },
  notifications: { dailyDigest: true, weeklySummary: true, criticalAlerts: true },
  preferences: { defaultRange: "30d", compactMode: false },
};

const threads = new Map<string, { threadId: string; messages: Array<{ role: "user" | "assistant"; blocks: Array<{ type: string; payload: unknown }>; createdAt: string }> }>();

export const RouterDashboard: FastifyPluginAsync = async (app) => {
  app.get("/dashboard/meta", async (req) => {
    const query = (req.query ?? {}) as { tenantId?: string };
    const access = resolveAccess(query.tenantId);
    return {
      mode: "TENANT",
      tenantId: query.tenantId,
      generatedAt: new Date().toISOString(),
      dataFreshness: "fresh",
      sources: [
        { key: "shop", status: "connected", label: "Sklep" },
        { key: "ads_meta", status: "connected", label: "Meta Ads" },
        { key: "ads_google", status: "connected", label: "Google Ads" },
        { key: "costs", status: "connected", label: "Koszty i marza" },
      ],
      capabilities: {
        canWriteActions: access.access === "write",
        canManageIntegrations: access.canManageWorkspace,
        canExport: true,
        canUseGuardianChat: true,
      },
    };
  });

  app.get("/dashboard/data-readiness", async () => ({
    score: 93,
    issues: [{ id: "ga4-audience-lag", title: "Lag segmentow GA4", severity: "low", description: "Segmenty odbiorcow odswiezane co 6h." }],
  }));

  app.get("/dashboard/overview", async () => ({
    kpis: [
      { key: "revenue", label: "Przychod", value: 1530000, deltaPct: 8.3 },
      { key: "net_margin", label: "Marza netto", value: 19.8, deltaPct: 1.4 },
      { key: "roas", label: "ROAS", value: 4.1, deltaPct: -2.2 },
      { key: "aov", label: "AOV", value: 301, deltaPct: 2.1 },
    ],
    highlights: [{ id: "retargeting-shift", title: "Przesun 12% budzetu do retargetingu premium", impactPln: 26400, priority: "high" }],
  }));

  app.get("/dashboard/alerts", async () => alerts);
  app.get("/dashboard/alerts/:id", async (req, reply) => {
    const params = req.params as { id: string };
    const details = alertDetails[params.id];
    if (!details) return reply.code(404).send({ message: "Alert not found." });
    return details;
  });

  app.get("/dashboard/ads", async () => ({
    kpis: [
      { key: "spend", label: "Wydatki reklamowe", value: 308000, deltaPct: 3.5 },
      { key: "revenue", label: "Przychod atrib.", value: 1120000, deltaPct: 6.4 },
      { key: "roas", label: "ROAS", value: 3.64, deltaPct: -2.6 },
      { key: "cpa", label: "CPA", value: 59, deltaPct: 4.2 },
    ],
    campaigns: [
      { id: "meta-retargeting", name: "Meta Retargeting", channel: "meta", spend: 71000, revenue: 326000, roas: 4.59, status: "active" },
      { id: "google-shopping", name: "Google Shopping", channel: "google", spend: 92000, revenue: 364000, roas: 3.96, status: "learning" },
      { id: "tiktok-prospecting", name: "TikTok Prospecting", channel: "tiktok", spend: 52000, revenue: 143000, roas: 2.75, status: "paused" },
    ],
  }));

  app.get("/dashboard/products", async () => ({
    products: [
      { id: "sku-100", name: "Butelka termiczna Pro 750ml", category: "Akcesoria", stock: 460, marginPct: 31.9, velocity: 18.4, trend: "up" },
      { id: "sku-245", name: "Plecak miejski X2", category: "Outdoor", stock: 104, marginPct: 22.4, velocity: 10.9, trend: "stable" },
      { id: "sku-410", name: "Koszulka sportowa DryLite", category: "Odziez", stock: 53, marginPct: 15.1, velocity: 8.7, trend: "down" },
    ],
  }));

  app.get("/dashboard/customers", async () => ({
    kpis: [
      { key: "ltv", label: "Sredni LTV", value: 846, deltaPct: 2.7 },
      { key: "repeat_rate", label: "Repeat rate", value: 32.8, deltaPct: 1.2 },
      { key: "cohort_retention", label: "Retencja 30d", value: 43.6, deltaPct: 0.8 },
    ],
    segments: [
      { id: "segment-vip", name: "VIP 90d", customers: 402, ltv: 2480, repeatRatePct: 65.8 },
      { id: "segment-core", name: "Returning core", customers: 1520, ltv: 1180, repeatRatePct: 47.2 },
    ],
  }));

  app.get("/dashboard/pipeline", async () => ({
    tasks: [
      { id: "task-1", title: "Przesun 12% budzetu do retargetingu premium", owner: "Growth Lead", dueDate: isoMinusDays(-1), priority: "high", status: "in_progress" },
      { id: "task-2", title: "Rollback checkout mobile na 48h", owner: "E-commerce Manager", dueDate: isoMinusDays(-2), priority: "high", status: "todo" },
    ],
  }));

  app.get("/dashboard/integrations", async () => [
    { key: "woocommerce", label: "WooCommerce", category: "store", status: "connected", lastSyncAt: isoMinusHours(2) },
    { key: "allegro", label: "Allegro", category: "marketplace", status: "connected", lastSyncAt: isoMinusHours(4) },
    { key: "meta-ads", label: "Meta Ads", category: "ads", status: "connected", lastSyncAt: isoMinusHours(1) },
    { key: "ga4", label: "Google Analytics 4", category: "analytics", status: "available" },
  ]);

  app.post("/dashboard/integrations/:key/connect", async (req) => {
    const params = req.params as { key: string };
    const body = (req.body ?? {}) as { tenantId?: string };
    return { url: `https://app.papadata.pl/integracje/${encodeURIComponent(params.key)}/callback?tenantId=${encodeURIComponent(body.tenantId ?? "tenant-demo")}` };
  });

  app.get("/dashboard/pandl", async () => ({
    revenue: 1530000,
    cogs: 728000,
    adsCost: 308000,
    grossProfit: 802000,
    netProfit: 302000,
    marginPct: 19.8,
    byChannel: [
      { key: "meta", label: "Meta Ads", profit: 132000, marginPct: 18.1 },
      { key: "organic", label: "Organic", profit: 114000, marginPct: 31.4 },
      { key: "marketplace", label: "Marketplace", profit: 56000, marginPct: 14.2 },
    ],
  }));

  app.get("/dashboard/reports", async (req) => {
    const query = (req.query ?? {}) as { tenantId?: string };
    const access = resolveAccess(query.tenantId);
    return { reports, availableTypes: ["weekly", "monthly"], canRequest: access.access === "write" };
  });

  app.post("/dashboard/reports/request", async (req, reply) => {
    const body = (req.body ?? {}) as { type?: "weekly" | "monthly"; tenantId?: string };
    const access = resolveAccess(body.tenantId);
    if (access.access !== "write") return reply.code(403).send({ message: "Brak uprawnien do zlecania raportow." });
    const id = `report-${body.type ?? "weekly"}-${Date.now()}`;
    reports = [{ id, title: `Raport ${body.type ?? "weekly"} (w przygotowaniu)`, createdAt: new Date().toISOString(), format: "pdf" }, ...reports];
    return { id };
  });

  app.get("/dashboard/analytics", async () => ({
    metricKey: "net_profit",
    metricLabel: "Zysk netto",
    summary: { growthPct: 9.1, volatility: 0.18, anomalyCount: 2 },
    series: [
      { date: isoMinusDays(30), value: 244000, compareValue: 229000 },
      { date: isoMinusDays(20), value: 261000, compareValue: 236000 },
      { date: isoMinusDays(10), value: 279000, compareValue: 248000, anomaly: true },
      { date: isoMinusDays(1), value: 302000, compareValue: 259000, anomaly: true },
    ],
    channelSplit: [{ key: "paid", label: "Platne", value: 152000, deltaPct: 5.8 }, { key: "organic", label: "Organic", value: 108000, deltaPct: 11.9 }],
    anomalies: [{ id: "anomaly-checkout", title: "Spadek finalizacji checkout mobile", date: isoMinusDays(10), severity: "high", impact: -17300 }],
  }));

  app.get("/dashboard/knowledge", async (req) => {
    const q = ((req.query ?? {}) as { q?: string }).q?.trim().toLowerCase();
    const playbooks = [
      { id: "playbook-checkout-mobile", title: "Playbook: Stabilizacja checkout mobile", area: "analytics", level: "advanced", updatedAt: isoMinusDays(4), summary: "Jak szybciej zdiagnozowac i naprawic spadek finalizacji na mobile.", tags: ["checkout", "mobile"], steps: ["Zweryfikuj speed i eventy finalizacji.", "Uruchom rollback i monitoruj roznice 24h."] },
      { id: "playbook-roas-budget", title: "Playbook: Korekta budzetu przy spadku ROAS", area: "ads", level: "basic", updatedAt: isoMinusDays(7), summary: "Standardowy plan dzialania dla utraty marzy na prospectingu.", tags: ["roas", "budzet"], steps: ["Podziel kampanie na retargeting i prospecting.", "Przesun 10-20% budzetu do segmentu o najwyzszej marzy."] },
    ];
    return { query: q, playbooks: q ? playbooks.filter((p) => `${p.title} ${p.summary} ${p.tags.join(" ")}`.toLowerCase().includes(q)) : playbooks };
  });

  app.get("/dashboard/settings/org", async (req) => {
    const tenantId = ((req.query ?? {}) as { tenantId?: string }).tenantId;
    return { ...settingsOrgState, access: resolveAccess(tenantId) };
  });

  app.patch("/dashboard/settings/org", async (req, reply) => {
    const body = (req.body ?? {}) as {
      tenantId?: string;
      organization?: { name?: string; timezone?: string; logoUrl?: string | null };
      policies?: Array<{ key: string; enabled: boolean }>;
    };
    const access = resolveAccess(body.tenantId);
    if (access.access !== "write") return reply.code(403).send({ message: "Brak uprawnien do zapisu ustawien organizacji." });
    settingsOrgState = {
      ...settingsOrgState,
      organization: { ...settingsOrgState.organization, ...body.organization },
      policies: body.policies
        ? settingsOrgState.policies.map((policy) => {
            const incoming = body.policies?.find((item) => item.key === policy.key);
            return incoming ? { ...policy, enabled: incoming.enabled } : policy;
          })
        : settingsOrgState.policies,
    };
    return { ...settingsOrgState, access };
  });

  app.get("/dashboard/settings/workspace", async (req) => {
    const tenantId = ((req.query ?? {}) as { tenantId?: string }).tenantId;
    return { ...settingsWorkspaceState, access: resolveAccess(tenantId) };
  });

  app.patch("/dashboard/settings/workspace", async (req, reply) => {
    const body = (req.body ?? {}) as { tenantId?: string; notifications?: Partial<typeof settingsWorkspaceState.notifications>; preferences?: Partial<typeof settingsWorkspaceState.preferences> };
    const access = resolveAccess(body.tenantId);
    if (access.access !== "write") return reply.code(403).send({ message: "Brak uprawnien do zapisu ustawien workspace." });
    settingsWorkspaceState = {
      ...settingsWorkspaceState,
      notifications: { ...settingsWorkspaceState.notifications, ...body.notifications },
      preferences: { ...settingsWorkspaceState.preferences, ...body.preferences },
    };
    return { ...settingsWorkspaceState, access };
  });

  app.post("/dashboard/guardian/chat/send", async (req) => {
    const body = (req.body ?? {}) as { threadId?: string; message?: string };
    const threadId = body.threadId?.trim() || `thread-${Date.now()}`;
    const now = new Date().toISOString();
    const thread = threads.get(threadId) ?? { threadId, messages: [] };
    if (body.message?.trim()) {
      thread.messages.push({ role: "user", blocks: [{ type: "text", payload: { text: body.message } }], createdAt: now });
    }
    thread.messages.push({
      role: "assistant",
      blocks: [
        { type: "text", payload: { text: "Najwiekszy wplyw ma checkout mobile i spadek ROAS prospectingu." } },
        { type: "kpi", payload: { label: "Szacowany impact", value: "38 400 PLN / 30 dni" } },
      ],
      createdAt: now,
    });
    threads.set(threadId, thread);
    return {
      threadId,
      events: [
        { type: "thinking", payload: { text: "Analizuje sygnaly z kampanii i checkout..." } },
        { type: "analysis", payload: { facts: ["Spadek konwersji mobile odpowiada za ~41% utraconej marzy."], confidence: "high" } },
        { type: "recommendations", payload: { items: ["Przywroc poprzedni checkout mobile.", "Przesun 12% budzetu do retargetingu."] } },
        { type: "simulation", payload: { impactPln: 38400, horizonDays: 30 } },
      ],
    };
  });

  app.get("/dashboard/guardian/chat/thread/:threadId", async (req) => {
    const params = req.params as { threadId: string };
    return threads.get(params.threadId) ?? { threadId: params.threadId, messages: [] };
  });
};

export default RouterDashboard;
