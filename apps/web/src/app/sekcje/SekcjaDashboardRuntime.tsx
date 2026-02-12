import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardDataProvider } from "../../dashboard/api/DashboardDataProvider";
import { useDashboardApi } from "../../dashboard/api/useDashboardApi";
import type {
  IntegracjaDashboardu,
  OdpowiedzWysylkiCzatu,
  TrybDashboardu,
  TypRaportuDashboardu,
  ZakresCzasuDashboardu,
} from "../../dashboard/api/typyDashboardApi";
import { useZasobDashboardu } from "../../dashboard/hooks/useZasobDashboardu";
import { formatCompactCurrencyPln, formatPercentValue } from "../../utils/formatters";
import { safeLocalStorage } from "../../utils/safeLocalStorage";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { normalizeApiError } from "../../hooks/useApiError";
import LogoPapaData from "../../components/branding/LogoPapaData";
import { pobierzSesje as pobierzSesjeAuth, wyloguj as wylogujSesjeAuth } from "../../services/auth";
import { pobierzPreferowanyMotyw, zastosujMotywDokumentu, type TrybMotywu } from "../motyw/motyw";
import { useUI } from "../../context/useUI";
import { czyBladApi } from "../../uslugi/api/bledyApi";
import { wyslijZdarzeniaObservability } from "../../uslugi/api/platformaApi";
import { TabelaRuntime } from "../../components/dashboard/PrymitywyTabel";
import {
  WykresLiniowy,
  WykresSlupkowy,
  type PunktWykresuLiniowego,
  type PunktWykresuSlupkowego,
} from "../../components/dashboard/PrymitywyWizualizacji";

type ZakladkaDashboardu =
  | "overview"
  | "alerts"
  | "guardian"
  | "ads"
  | "products"
  | "customers"
  | "pipeline"
  | "integracje"
  | "reports"
  | "analytics"
  | "knowledge"
  | "settings_org"
  | "settings_workspace"
  | "pandl";

type Props = {
  tryb: TrybDashboardu;
  tenantId?: string;
  onPrimaryCta: () => void;
  pelnyEkran?: boolean;
};

function Blad({ opis, onRetry }: { opis: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-800 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-200">
      <p className="font-semibold">{opis}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-rose-700"
        >
          Odswiez
        </button>
      )}
    </div>
  );
}

function Pusto({ opis }: { opis: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm font-semibold text-slate-700 dark:border-white/20 dark:bg-slate-900/45 dark:text-slate-200">
      {opis}
    </div>
  );
}

function Ladowanie() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/70" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/70" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/70" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/70" />
    </div>
  );
}

function etykietaSwiezosci(status: "fresh" | "stale" | "unknown", jezyk: "pl" | "en" = "pl") {
  if (status === "fresh") return jezyk === "en" ? "Fresh data" : "Swieze dane";
  if (status === "stale") return jezyk === "en" ? "Refresh needed" : "Dane wymagaja odswiezenia";
  return jezyk === "en" ? "Unknown data status" : "Status danych nieznany";
}

function inicjalyLogo(etykieta: string) {
  const czesci = etykieta.trim().split(/\s+/).filter(Boolean);
  if (czesci.length === 0) return "PD";
  if (czesci.length === 1) return czesci[0].slice(0, 2).toUpperCase();
  return `${czesci[0][0] ?? ""}${czesci[1][0] ?? ""}`.toUpperCase();
}

function kluczZapisuPaneluBocznego(identyfikatorKonta: string) {
  return `papadata_dashboard_sidebar_pin_${identyfikatorKonta}`;
}

function formatujDateShort(iso: string, locale: "pl-PL" | "en-US" = "pl-PL") {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function etykietaPriorytetu(priorytet: string) {
  if (priorytet === "high") return "Wysoki";
  if (priorytet === "med") return "Sredni";
  if (priorytet === "opportunity") return "Szansa";
  return priorytet;
}

function etykietaStatusuZadania(status: "todo" | "in_progress" | "done") {
  if (status === "todo") return "Do zrobienia";
  if (status === "in_progress") return "W toku";
  return "Zakonczone";
}

function etykietaStatusuIntegracji(status: IntegracjaDashboardu["status"]) {
  if (status === "connected") return "Polaczona";
  if (status === "available") return "Dostepna";
  if (status === "missing") return "Brak";
  return "Blad";
}

function etykietaObszaruWiedzy(obszar: "ads" | "pricing" | "inventory" | "retention" | "analytics") {
  if (obszar === "ads") return "Ads";
  if (obszar === "pricing") return "Pricing";
  if (obszar === "inventory") return "Inventory";
  if (obszar === "retention") return "Retention";
  return "Analytics";
}

function etykietaPoziomuWiedzy(poziom: "basic" | "advanced") {
  return poziom === "advanced" ? "Advanced" : "Basic";
}

function etykietaRoliDostepu(rola: "owner" | "admin" | "manager" | "analyst" | "viewer") {
  if (rola === "owner") return "Owner";
  if (rola === "admin") return "Admin";
  if (rola === "manager") return "Manager";
  if (rola === "analyst") return "Analyst";
  return "Viewer";
}

function etykietaStatusuCzlonka(status: "active" | "invited" | "disabled") {
  if (status === "active") return "Aktywny";
  if (status === "invited") return "Zaproszony";
  return "Wylaczony";
}

function etykietaZdarzeniaGuardiana(
  typ: OdpowiedzWysylkiCzatu["events"][number]["type"],
  jezyk: "pl" | "en" = "pl"
) {
  if (typ === "thinking") return jezyk === "en" ? "Thinking" : "Myslenie";
  if (typ === "analysis") return jezyk === "en" ? "Analysis" : "Analiza";
  if (typ === "recommendations") return jezyk === "en" ? "Recommendations" : "Rekomendacje";
  return jezyk === "en" ? "Simulation" : "Symulacja";
}

function streszczenieZdarzeniaGuardiana(
  zdarzenie: OdpowiedzWysylkiCzatu["events"][number],
  locale: "pl-PL" | "en-US" = "pl-PL",
  jezyk: "pl" | "en" = "pl"
) {
  if (zdarzenie.type === "thinking") return zdarzenie.payload.text;
  if (zdarzenie.type === "analysis") {
    return jezyk === "en"
      ? `Facts: ${zdarzenie.payload.facts.length}, confidence: ${zdarzenie.payload.confidence}`
      : `Fakty: ${zdarzenie.payload.facts.length}, pewnosc: ${zdarzenie.payload.confidence}`;
  }
  if (zdarzenie.type === "recommendations") {
    return jezyk === "en"
      ? `Recommendations: ${zdarzenie.payload.items.length}`
      : `Rekomendacje: ${zdarzenie.payload.items.length}`;
  }
  return jezyk === "en"
    ? `Simulation: ${formatCompactCurrencyPln(zdarzenie.payload.impactPln, locale, 1)} / ${zdarzenie.payload.horizonDays} days`
    : `Symulacja: ${formatCompactCurrencyPln(zdarzenie.payload.impactPln, locale, 1)} / ${zdarzenie.payload.horizonDays} dni`;
}

function SekcjaWew({
  onPrimaryCta,
  pelnyEkran = false,
}: {
  onPrimaryCta: () => void;
  pelnyEkran?: boolean;
}) {
  const { api, tryb } = useDashboardApi();
  const { jezyk } = useUI();
  const czyEn = jezyk === "en";
  const online = useOnlineStatus();
  const [zakladka, setZakladka] = useState<ZakladkaDashboardu>("overview");
  const [alertId, setAlertId] = useState<string | null>(null);
  const [wiadomosc, setWiadomosc] = useState("");
  const [chat, setChat] = useState<OdpowiedzWysylkiCzatu | null>(null);
  const [chatBlad, setChatBlad] = useState<string | null>(null);
  const [laczy, setLaczy] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState<TypRaportuDashboardu | null>(null);
  const [queryWiedzy, setQueryWiedzy] = useState("");
  const [orgStatus, setOrgStatus] = useState<string | null>(null);
  const [workspaceStatus, setWorkspaceStatus] = useState<string | null>(null);
  const [orgForm, setOrgForm] = useState({ name: "", timezone: "", logoUrl: "" });
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    currency: "PLN" as "PLN" | "EUR" | "USD",
    timezone: "",
    locale: (czyEn ? "en-US" : "pl-PL") as "pl-PL" | "en-US",
    defaultRange: "30d" as ZakresCzasuDashboardu,
    compactMode: false,
  });
  const [sesja, setSesja] = useState(() => pobierzSesjeAuth());
  const [trwaWylogowanie, setTrwaWylogowanie] = useState(false);
  const [menuKontaOtwarte, setMenuKontaOtwarte] = useState(false);
  const [panelBocznyPrzypiety, setPanelBocznyPrzypiety] = useState(true);
  const [panelBocznyHover, setPanelBocznyHover] = useState(false);
  const [motyw, setMotyw] = useState<TrybMotywu>(() => pobierzPreferowanyMotyw());
  const [zakres, setZakres] = useState<ZakresCzasuDashboardu>("30d");
  const menuKontaRef = useRef<HTMLDivElement | null>(null);
  const bledyKrytyczneRef = useRef<Set<string>>(new Set());

  // odpowiada za zamkniecie dropdownu konta po kliknieciu poza panelem i po ESC
  useEffect(() => {
    if (!menuKontaOtwarte) return;

    const onDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!menuKontaRef.current?.contains(target)) {
        setMenuKontaOtwarte(false);
      }
    };

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuKontaOtwarte(false);
      }
    };

    window.addEventListener("mousedown", onDocumentMouseDown);
    window.addEventListener("keydown", onDocumentKeyDown);

    return () => {
      window.removeEventListener("mousedown", onDocumentMouseDown);
      window.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [menuKontaOtwarte]);

  const localeFormatowania: "pl-PL" | "en-US" = czyEn ? "en-US" : "pl-PL";
  const zakresAlertow = zakres === "7d" ? "7d" : "30d";
  const aktywnaZakladkaOperacyjna =
    zakladka === "overview" ||
    zakladka === "alerts" ||
    zakladka === "guardian" ||
    zakladka === "ads" ||
    zakladka === "products" ||
    zakladka === "customers" ||
    zakladka === "pipeline" ||
    zakladka === "integracje";

  // odpowiada za pobranie danych runtime tylko dla potrzebnych obszarow
  const meta = useZasobDashboardu(useCallback(() => api.getMeta(), [api]));
  const gotowosc = useZasobDashboardu(useCallback(() => api.getDataReadiness(), [api]), {
    aktywne: aktywnaZakladkaOperacyjna || zakladka === "pandl",
  });
  const overview = useZasobDashboardu(useCallback(() => api.getOverview(zakres), [api, zakres]), {
    aktywne: zakladka === "overview",
  });
  const alerts = useZasobDashboardu(useCallback(() => api.getAlerts(zakresAlertow), [api, zakresAlertow]), {
    aktywne: zakladka === "alerts" || zakladka === "guardian",
  });
  const ads = useZasobDashboardu(useCallback(() => api.getAdsView(zakres), [api, zakres]), {
    aktywne: zakladka === "ads" || zakladka === "overview",
  });
  const products = useZasobDashboardu(useCallback(() => api.getProductsView(zakres), [api, zakres]), {
    aktywne: zakladka === "products",
  });
  const customers = useZasobDashboardu(useCallback(() => api.getCustomersView(zakres), [api, zakres]), {
    aktywne: zakladka === "customers",
  });
  const pipeline = useZasobDashboardu(useCallback(() => api.getPipelineView(), [api]), {
    aktywne: zakladka === "pipeline",
  });
  const integrations = useZasobDashboardu(useCallback(() => api.getIntegrations(), [api]), {
    aktywne: zakladka === "integracje",
  });
  const pandl = useZasobDashboardu(useCallback(() => api.getPandL(zakres === "90d" ? "90d" : "30d"), [api, zakres]), {
    aktywne: zakladka === "pandl",
  });
  const reports = useZasobDashboardu(useCallback(() => api.getReportsView(), [api]), {
    aktywne: zakladka === "reports",
  });
  const analytics = useZasobDashboardu(useCallback(() => api.getAnalyticsView(zakres), [api, zakres]), {
    aktywne: zakladka === "analytics" || zakladka === "overview",
  });
  const knowledge = useZasobDashboardu(
    useCallback(() => api.getKnowledgeView(queryWiedzy.trim() || undefined), [api, queryWiedzy]),
    {
      aktywne: zakladka === "knowledge",
    }
  );
  const settingsOrg = useZasobDashboardu(useCallback(() => api.getSettingsOrgView(), [api]), {
    aktywne: zakladka === "settings_org" || zakladka === "settings_workspace",
  });
  const settingsWorkspace = useZasobDashboardu(useCallback(() => api.getSettingsWorkspaceView(), [api]), {
    aktywne: zakladka === "settings_org" || zakladka === "settings_workspace",
  });
  const aktywnyAlertId = useMemo(() => alertId ?? alerts.dane?.[0]?.id ?? null, [alertId, alerts.dane]);
  const alertDetails = useZasobDashboardu(
    useCallback(() => (aktywnyAlertId ? api.getAlertDetails(aktywnyAlertId) : Promise.resolve(null)), [api, aktywnyAlertId]),
    {
      aktywne: zakladka === "alerts" && Boolean(aktywnyAlertId),
    }
  );

  const dostep = settingsOrg.dane?.access ?? settingsWorkspace.dane?.access;
  const czyWrite = dostep?.access === "write";
  const panelBocznyRozwiniety = panelBocznyPrzypiety || panelBocznyHover;
  const nazwaMarki = "PapaData";
  const identyfikatorKonta = sesja?.userId ?? meta.dane?.tenantId ?? (czyEn ? "none" : "brak");
  const inicjalyKonta = useMemo(() => inicjalyLogo(identyfikatorKonta), [identyfikatorKonta]);
  const formatujDate = useCallback((iso: string) => formatujDateShort(iso, localeFormatowania), [localeFormatowania]);
  const formatujWalute = useCallback(
    (wartosc: number, precyzja = 1) => formatCompactCurrencyPln(wartosc, localeFormatowania, precyzja),
    [localeFormatowania]
  );
  const formatujProcent = useCallback(
    (wartosc: number, precyzja = 1) => formatPercentValue(wartosc, localeFormatowania, precyzja),
    [localeFormatowania]
  );
  const etykietyUi = czyEn
    ? {
        runtime: "Runtime dashboard",
        lightMode: "Light mode",
        darkMode: "Dark mode",
        zakresAria: "Dashboard time range",
        orgSettings: "Organization settings",
        workspaceSettings: "Workspace settings",
        integrations: "Integrations",
        logout: "Log out",
        loggingOut: "Logging out...",
        loadingMeta: "Loading metadata",
        readiness: "Readiness",
        online: "Online",
        offline: "Offline",
        navigation: "Navigation",
        unpin: "Unpin",
        pin: "Pin",
        account: "Account",
        demoMode: "Demo mode - no session",
        offlineHint: "You are offline. Data may be stale.",
      }
    : {
        runtime: "Dashboard runtime",
        lightMode: "Tryb jasny",
        darkMode: "Tryb ciemny",
        zakresAria: "Zakres czasu dashboardu",
        orgSettings: "Ustawienia organizacji",
        workspaceSettings: "Ustawienia workspace",
        integrations: "Integracje",
        logout: "Wyloguj",
        loggingOut: "Wylogowywanie...",
        loadingMeta: "Ladowanie metadanych",
        readiness: "Gotowosc",
        online: "Online",
        offline: "Offline",
        navigation: "Nawigacja",
        unpin: "Odepnij",
        pin: "Przypnij",
        account: "Konto",
        demoMode: "Tryb demo - bez sesji",
        offlineHint: "Jestes offline. Dane moga byc nieaktualne.",
      };
  const kluczPaneluBocznego = useMemo(
    () => kluczZapisuPaneluBocznego(identyfikatorKonta),
    [identyfikatorKonta]
  );

  // odpowiada za odczyt preferencji przypiecia sidebara per konto
  useEffect(() => {
    const zapisany = safeLocalStorage.getItem(kluczPaneluBocznego);
    if (zapisany === "0") {
      setPanelBocznyPrzypiety(false);
      return;
    }
    if (zapisany === "1") {
      setPanelBocznyPrzypiety(true);
      return;
    }
    setPanelBocznyPrzypiety(true);
  }, [kluczPaneluBocznego]);

  // odpowiada za synchronizacje formularza organizacji z aktualnym stanem backendu
  useEffect(() => {
    if (!settingsOrg.dane) return;
    setOrgForm({
      name: settingsOrg.dane.organization.name,
      timezone: settingsOrg.dane.organization.timezone,
      logoUrl: settingsOrg.dane.organization.logoUrl ?? "",
    });
  }, [settingsOrg.dane]);

  // odpowiada za synchronizacje formularza workspace z aktualnym stanem backendu
  useEffect(() => {
    if (!settingsWorkspace.dane) return;
    setWorkspaceForm({
      name: settingsWorkspace.dane.workspace.name,
      currency: settingsWorkspace.dane.workspace.currency,
      timezone: settingsWorkspace.dane.workspace.timezone,
      locale: settingsWorkspace.dane.workspace.locale,
      defaultRange: settingsWorkspace.dane.preferences.defaultRange,
      compactMode: settingsWorkspace.dane.preferences.compactMode,
    });
    setZakres(settingsWorkspace.dane.preferences.defaultRange);
  }, [settingsWorkspace.dane]);

  // odpowiada za wysylke pojedynczego zdarzenia observability z runtime dashboardu
  const zarejestrujZdarzenieObservability = useCallback(
    (name: string, level: "info" | "warning" | "error", context?: Record<string, unknown>) => {
      void wyslijZdarzeniaObservability([
        {
          name,
          level,
          source: "dashboard-runtime",
          occurredAt: new Date().toISOString(),
          context: {
            tryb,
            zakladka,
            tenantId: meta.dane?.tenantId ?? identyfikatorKonta,
            ...context,
          },
        },
      ]).catch(() => undefined);
    },
    [identyfikatorKonta, meta.dane?.tenantId, tryb, zakladka]
  );

  // odpowiada za raportowanie krytycznych bledow endpointow dashboardu
  useEffect(() => {
    const zasoby = [
      { klucz: "meta", status: meta.status, blad: meta.blad },
      { klucz: "gotowosc", status: gotowosc.status, blad: gotowosc.blad },
      { klucz: "overview", status: overview.status, blad: overview.blad },
      { klucz: "alerts", status: alerts.status, blad: alerts.blad },
      { klucz: "alertDetails", status: alertDetails.status, blad: alertDetails.blad },
      { klucz: "ads", status: ads.status, blad: ads.blad },
      { klucz: "products", status: products.status, blad: products.blad },
      { klucz: "customers", status: customers.status, blad: customers.blad },
      { klucz: "pipeline", status: pipeline.status, blad: pipeline.blad },
      { klucz: "integrations", status: integrations.status, blad: integrations.blad },
      { klucz: "reports", status: reports.status, blad: reports.blad },
      { klucz: "analytics", status: analytics.status, blad: analytics.blad },
      { klucz: "knowledge", status: knowledge.status, blad: knowledge.blad },
      { klucz: "pandl", status: pandl.status, blad: pandl.blad },
      { klucz: "settingsOrg", status: settingsOrg.status, blad: settingsOrg.blad },
      { klucz: "settingsWorkspace", status: settingsWorkspace.status, blad: settingsWorkspace.blad },
    ] as const;

    zasoby.forEach((zasob) => {
      if (zasob.status === "blad") {
        if (!bledyKrytyczneRef.current.has(zasob.klucz)) {
          bledyKrytyczneRef.current.add(zasob.klucz);
          zarejestrujZdarzenieObservability("dashboard_endpoint_error", "error", {
            zasob: zasob.klucz,
            blad: normalizeApiError(zasob.blad, "Nieznany blad endpointu."),
          });
        }
        return;
      }
      bledyKrytyczneRef.current.delete(zasob.klucz);
    });
  }, [
    meta.status,
    meta.blad,
    gotowosc.status,
    gotowosc.blad,
    overview.status,
    overview.blad,
    alerts.status,
    alerts.blad,
    alertDetails.status,
    alertDetails.blad,
    ads.status,
    ads.blad,
    products.status,
    products.blad,
    customers.status,
    customers.blad,
    pipeline.status,
    pipeline.blad,
    integrations.status,
    integrations.blad,
    reports.status,
    reports.blad,
    analytics.status,
    analytics.blad,
    knowledge.status,
    knowledge.blad,
    pandl.status,
    pandl.blad,
    settingsOrg.status,
    settingsOrg.blad,
    settingsWorkspace.status,
    settingsWorkspace.blad,
    zarejestrujZdarzenieObservability,
  ]);

  // odpowiada za interakcje papa ai i laczenie integracji
  const onSend = useCallback(async () => {
    if (!wiadomosc.trim()) return;
    setChatBlad(null);
    try {
      const out = await api.guardianChatSend({ message: wiadomosc, context: { alertId: aktywnyAlertId ?? undefined, range: "30d" } });
      setChat(out);
      setWiadomosc("");
    } catch (e) {
      setChatBlad(normalizeApiError(e, "Nie udalo sie wyslac pytania do Papa AI."));
    }
  }, [api, wiadomosc, aktywnyAlertId]);

  const onConnect = useCallback(
    async (integracja: IntegracjaDashboardu) => {
      try {
        const out = await api.startIntegrationConnect(integracja.key);
        if (tryb === "TENANT") window.open(out.url, "_blank", "noopener,noreferrer");
        setLaczy(`Polaczenie uruchomione: ${integracja.label}`);
      } catch (e) {
        if (czyBladApi(e) && e.status === 403) {
          zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
            akcja: "startIntegrationConnect",
            integracja: integracja.key,
          });
        }
        setLaczy(normalizeApiError(e, `Nie udalo sie uruchomic ${integracja.label}.`));
      }
    },
    [api, tryb, zarejestrujZdarzenieObservability]
  );

  const onRequestReport = useCallback(
    async (type: TypRaportuDashboardu) => {
      setReportStatus(null);
      setReportLoading(type);
      try {
        const out = await api.requestReport(type);
        setReportStatus(`Raport ${type} zlecony. ID: ${out.id}`);
        await reports.odswiez();
      } catch (e) {
        if (czyBladApi(e) && e.status === 403) {
          zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
            akcja: "requestReport",
            typRaportu: type,
          });
        }
        setReportStatus(normalizeApiError(e, "Nie udalo sie zlecic raportu."));
      } finally {
        setReportLoading(null);
      }
    },
    [api, reports, zarejestrujZdarzenieObservability]
  );

  const onTogglePolicy = useCallback(
    async (key: string, enabled: boolean) => {
      if (!czyWrite) {
        setOrgStatus("Brak uprawnien do zapisu ustawien organizacji.");
        zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
          akcja: "updateSettingsOrg",
          policyKey: key,
          powod: "read_only",
        });
        return;
      }
      try {
        await api.updateSettingsOrg({ policies: [{ key, enabled }] });
        setOrgStatus("Ustawienia organizacji zapisane.");
        await settingsOrg.odswiez();
      } catch (e) {
        if (czyBladApi(e) && e.status === 403) {
          zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
            akcja: "updateSettingsOrg",
            policyKey: key,
          });
        }
        setOrgStatus(normalizeApiError(e, "Nie udalo sie zapisac ustawien organizacji."));
      }
    },
    [api, czyWrite, settingsOrg, zarejestrujZdarzenieObservability]
  );

  const onToggleWorkspace = useCallback(
    async (key: "dailyDigest" | "weeklySummary" | "criticalAlerts", enabled: boolean) => {
      if (!czyWrite) {
        setWorkspaceStatus("Brak uprawnien do zapisu ustawien workspace.");
        zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
          akcja: "updateSettingsWorkspace",
          notificationKey: key,
          powod: "read_only",
        });
        return;
      }
      try {
        await api.updateSettingsWorkspace({ notifications: { [key]: enabled } });
        setWorkspaceStatus("Ustawienia workspace zapisane.");
        await settingsWorkspace.odswiez();
      } catch (e) {
        if (czyBladApi(e) && e.status === 403) {
          zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
            akcja: "updateSettingsWorkspace",
            notificationKey: key,
          });
        }
        setWorkspaceStatus(normalizeApiError(e, "Nie udalo sie zapisac ustawien workspace."));
      }
    },
    [api, czyWrite, settingsWorkspace, zarejestrujZdarzenieObservability]
  );

  // odpowiada za zapis podstawowych ustawien organizacji (nazwa, timezone, logo)
  const onZapiszOrganizacje = useCallback(async () => {
    if (!czyWrite) {
      setOrgStatus("Brak uprawnien do zapisu ustawien organizacji.");
      zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
        akcja: "updateSettingsOrgProfile",
        powod: "read_only",
      });
      return;
    }
    try {
      await api.updateSettingsOrg({
        organization: {
          name: orgForm.name.trim() || undefined,
          timezone: orgForm.timezone.trim() || undefined,
          logoUrl: orgForm.logoUrl.trim() || null,
        },
      });
      setOrgStatus("Ustawienia organizacji zapisane.");
      await settingsOrg.odswiez();
    } catch (e) {
      if (czyBladApi(e) && e.status === 403) {
        zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
          akcja: "updateSettingsOrgProfile",
        });
      }
      setOrgStatus(normalizeApiError(e, "Nie udalo sie zapisac ustawien organizacji."));
    }
  }, [api, czyWrite, orgForm.logoUrl, orgForm.name, orgForm.timezone, settingsOrg, zarejestrujZdarzenieObservability]);

  // odpowiada za zapis ustawien workspace (profil + preferencje)
  const onZapiszWorkspace = useCallback(async () => {
    if (!czyWrite) {
      setWorkspaceStatus("Brak uprawnien do zapisu ustawien workspace.");
      zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
        akcja: "updateSettingsWorkspaceProfile",
        powod: "read_only",
      });
      return;
    }
    try {
      await api.updateSettingsWorkspace({
        workspace: {
          name: workspaceForm.name.trim() || undefined,
          currency: workspaceForm.currency,
          timezone: workspaceForm.timezone.trim() || undefined,
          locale: workspaceForm.locale,
        },
        preferences: {
          defaultRange: workspaceForm.defaultRange,
          compactMode: workspaceForm.compactMode,
        },
      });
      setWorkspaceStatus("Ustawienia workspace zapisane.");
      await settingsWorkspace.odswiez();
    } catch (e) {
      if (czyBladApi(e) && e.status === 403) {
        zarejestrujZdarzenieObservability("dashboard_write_action_denied", "warning", {
          akcja: "updateSettingsWorkspaceProfile",
        });
      }
      setWorkspaceStatus(normalizeApiError(e, "Nie udalo sie zapisac ustawien workspace."));
    }
  }, [
    api,
    czyWrite,
    settingsWorkspace,
    workspaceForm.compactMode,
    workspaceForm.currency,
    workspaceForm.defaultRange,
    workspaceForm.locale,
    workspaceForm.name,
    workspaceForm.timezone,
    zarejestrujZdarzenieObservability,
  ]);

  // odpowiada za szybkie przejscia z menu konta do kluczowych zakladek
  const onPrzejdzDoZakladki = useCallback((id: ZakladkaDashboardu) => {
    setZakladka(id);
    setMenuKontaOtwarte(false);
  }, []);

  // odpowiada za zmiane motywu jasny/ciemny w runtime dashboardzie
  const onPrzelaczMotyw = useCallback(() => {
    setMotyw((poprzedni) => {
      const nastepny: TrybMotywu = poprzedni === "dark" ? "light" : "dark";
      zastosujMotywDokumentu(nastepny);
      return nastepny;
    });
  }, []);

  // odpowiada za wylogowanie z poziomu menu i sidebara
  const onWyloguj = useCallback(async () => {
    if (!sesja?.token || trwaWylogowanie) return;
    setTrwaWylogowanie(true);
    try {
      await wylogujSesjeAuth();
      setSesja(null);
      zarejestrujZdarzenieObservability("dashboard_logout_success", "info");
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new Event("popstate"));
    } catch (e) {
      zarejestrujZdarzenieObservability("dashboard_logout_error", "error", {
        blad: normalizeApiError(e, "Nie udalo sie wylogowac."),
      });
      setLaczy(normalizeApiError(e, "Nie udalo sie wylogowac."));
    } finally {
      setTrwaWylogowanie(false);
      setMenuKontaOtwarte(false);
    }
  }, [sesja?.token, trwaWylogowanie, zarejestrujZdarzenieObservability]);

  const renderKpis = (items: Array<{ key: string; label: string; value: number }>, percentKeys: string[] = []) => (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <article key={kpi.key} className="pd-enterprise-card rounded-2xl p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{kpi.label}</p>
          <p className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">
            {percentKeys.some((element) => kpi.key.includes(element))
              ? formatujProcent(kpi.value, 1)
              : formatujWalute(kpi.value, 1)}
          </p>
        </article>
      ))}
    </div>
  );

  const widok = () => {
    if (zakladka === "overview") {
      if (overview.status === "ladowanie") return <Ladowanie />;
      if (overview.status === "blad") {
        return <Blad opis={normalizeApiError(overview.blad, "Nie udalo sie pobrac overview.")} onRetry={overview.odswiez} />;
      }
      if (!overview.dane) return <Pusto opis="Brak danych overview." />;
      const kartyKpi = overview.dane.kpis.slice(0, 4);
      const topKampanie = [...(ads.dane?.campaigns ?? [])].sort((a, b) => b.revenue - a.revenue).slice(0, 4);
      const monitorSync = (meta.dane?.sources ?? []).slice(0, 4);
      const punktyTrendu: PunktWykresuLiniowego[] =
        analytics.dane?.series?.length
          ? analytics.dane.series.map((punkt, index) => ({
              etykieta: `T${index + 1}`,
              wartosc: punkt.value,
              wartoscPorownawcza: punkt.compareValue,
            }))
          : overview.dane.highlights.map((highlight, index) => ({
              etykieta: `T${index + 1}`,
              wartosc: highlight.impactPln,
              wartoscPorownawcza: highlight.impactPln * 0.82,
            }));

      const formatujWartoscKpiOverview = (key: string, label: string, value: number) => {
        const token = `${key} ${label}`.toLowerCase();
        const czyProcent = token.includes("margin") || token.includes("marza") || token.includes("rate") || token.includes("retencja");
        const czyMnoznik = token.includes("roas") || token.includes("mer");
        if (czyMnoznik) return `${value.toFixed(2)}x`;
        if (czyProcent) return formatujProcent(value, 1);
        return formatujWalute(value, 1);
      };

      const formatujDelteKpiOverview = (deltaPct?: number) => {
        if (deltaPct === undefined) return null;
        const bezwzgledna = Math.abs(deltaPct).toLocaleString(localeFormatowania, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
        if (deltaPct > 0) return `+${bezwzgledna}%`;
        if (deltaPct < 0) return `-${bezwzgledna}%`;
        return `0,0%`;
      };

      const klasaPriorytetu = (priorytet: string) => {
        if (priorytet === "high") {
          return {
            obwodka: "border-rose-300/60 bg-rose-50/60 dark:border-rose-500/35 dark:bg-rose-500/10",
            kropka: "bg-rose-500",
            tekst: "text-rose-700 dark:text-rose-200",
          };
        }
        if (priorytet === "med") {
          return {
            obwodka: "border-amber-300/60 bg-amber-50/60 dark:border-amber-500/35 dark:bg-amber-500/10",
            kropka: "bg-amber-500",
            tekst: "text-amber-700 dark:text-amber-200",
          };
        }
        return {
          obwodka: "border-sky-300/60 bg-sky-50/70 dark:border-sky-500/35 dark:bg-sky-500/10",
          kropka: "bg-sky-500",
          tekst: "text-sky-700 dark:text-sky-200",
        };
      };

      const statusZrodla = (status: "connected" | "missing" | "error") => {
        if (status === "connected") {
          return {
            etykieta: czyEn ? "Healthy" : "Zdrowe",
            opoznienie: "< 2 min",
            klasa: "text-emerald-600 dark:text-emerald-300",
            kropka: "bg-emerald-500",
          };
        }
        if (status === "missing") {
          return {
            etykieta: czyEn ? "Delayed" : "Opoznione",
            opoznienie: czyEn ? "No stream" : "Brak strumienia",
            klasa: "text-amber-600 dark:text-amber-300",
            kropka: "bg-amber-500",
          };
        }
        return {
          etykieta: czyEn ? "Error" : "Blad",
          opoznienie: "> 60 min",
          klasa: "text-rose-600 dark:text-rose-300",
          kropka: "bg-rose-500",
        };
      };

      const etykietaSynchronizacji = meta.dane?.generatedAt
        ? `${czyEn ? "SYNCED" : "SYNC"}: ${formatujDate(meta.dane.generatedAt)}`
        : czyEn
          ? "SYNCED: --"
          : "SYNC: --";

      return (
        <div className="space-y-6">
          {/* odpowiada za hero overview w stylu enterprise active */}
          <section className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 p-6 text-slate-100 shadow-2xl shadow-indigo-900/25">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2.5">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-300/90">Papa Guardian</p>
                <h3 className="text-2xl font-black text-white">
                  {czyEn ? "Papa Guardian" : "Papa Guardian"}{" "}
                  <span className="ml-2 inline-flex rounded-full border border-indigo-500/35 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-200">
                    NEURAL ACTIVE
                  </span>
                </h3>
                <p className="max-w-2xl text-sm font-semibold text-slate-300">
                  {czyEn
                    ? "Papa Guardian scans signals, flags risk, and leads your team to profitable decisions."
                    : "Papa Guardian skanuje sygnaly, wskazuje ryzyka i prowadzi zespol do decyzji zwiekszajacych wynik."}
                </p>
              </div>
              <div className="flex gap-5 border-l border-slate-700/60 pl-5">
                <div className="text-center min-w-[84px]">
                  <p className="text-xl font-black text-emerald-300">{gotowosc.dane?.score ?? "--"}%</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {czyEn ? "Signal" : "Sila sygnalu"}
                  </p>
                </div>
                <div className="text-center min-w-[84px]">
                  <p className="text-xl font-black text-sky-300">{czyEn ? "320 ms" : "320 ms"}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {czyEn ? "Latency" : "Latencja"}
                  </p>
                </div>
                <div className="text-center min-w-[84px]">
                  <p className="text-xl font-black text-indigo-300">4/4</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {czyEn ? "AI agents" : "Agenci AI"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* odpowiada za pasek komunikatu AI z akcja uruchomienia symulacji */}
          <section className="flex flex-col gap-3 rounded-xl border border-indigo-500/30 bg-slate-900/70 p-4 shadow-lg shadow-indigo-900/20 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/20 text-xs font-black text-indigo-200">
                AI
              </span>
              <p className="text-sm font-semibold text-slate-300">
                <span className="font-black text-white">
                  {czyEn ? "AI scans the dashboard..." : "AI skanuje dashboard..."}
                </span>{" "}
                {czyEn
                  ? "Ready for today insight? Start simulation and Papa Guardian will build ROI prediction."
                  : "Gotowy na dzisiejszy insight? Uruchom symulacje, a Papa Guardian zbuduje predykcje ROI."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setZakladka("guardian")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              {czyEn ? "Simulation" : "Symulacja"}
            </button>
          </section>

          {/* odpowiada za executive summary z KPI */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {czyEn ? "Executive Summary" : "Podsumowanie zarzadcze"}
              </h4>
              <button
                type="button"
                onClick={() => setZakladka("guardian")}
                className="text-xs font-black uppercase tracking-[0.12em] text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                {czyEn ? "Explain with AI" : "Wyjasnij przez AI"}
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {kartyKpi.map((kpi) => {
                const delta = formatujDelteKpiOverview(kpi.deltaPct);
                const spadek = (kpi.deltaPct ?? 0) < 0;
                const wzrost = (kpi.deltaPct ?? 0) > 0;
                return (
                  <article
                    key={kpi.key}
                    className="rounded-xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-slate-600"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-400">{kpi.label}</p>
                      {delta && (
                        <span
                          className={[
                            "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                            spadek
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                              : wzrost
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                : "bg-slate-500/10 text-slate-600 dark:text-slate-300",
                          ].join(" ")}
                        >
                          {delta}
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-black text-white">
                      {formatujWartoscKpiOverview(kpi.key, kpi.label, kpi.value)}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* odpowiada za glowny obszar: priorytety oraz trend */}
          <section className="grid gap-4 xl:grid-cols-[1fr_1.6fr]">
            <article className="rounded-xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur">
              <h4 className="text-base font-black text-white">
                {czyEn ? "AI Priorities" : "Priorytety AI"}
              </h4>
              <div className="mt-3 space-y-2.5">
                {overview.dane.highlights.map((highlight) => {
                  const styl = klasaPriorytetu(highlight.priority);
                  return (
                    <button
                      key={highlight.id}
                      type="button"
                      onClick={() => setZakladka("alerts")}
                      className={[
                        "w-full rounded-lg border p-3 text-left transition",
                        styl.obwodka,
                        "hover:brightness-[1.04]",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className={["text-sm font-black", styl.tekst].join(" ")}>{highlight.title}</p>
                          <p className="text-[11px] font-semibold text-slate-400">
                            {czyEn ? "Priority" : "Priorytet"}: {etykietaPriorytetu(highlight.priority)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Impact</p>
                          <p className="text-sm font-black text-slate-100">{formatujWalute(highlight.impactPln, 1)}</p>
                        </div>
                      </div>
                      <span className={["mt-2 inline-flex h-2.5 w-2.5 rounded-full", styl.kropka].join(" ")} />
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-black text-white">
                    {czyEn ? "Revenue vs Spend signal" : "Przychod vs wydatki"}
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {czyEn ? "Trend range 30 days (metric with baseline)" : "Trend zakresu 30 dni (metryka z porownaniem)"}
                  </p>
                </div>
                <span className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-300">
                  {etykietaSynchronizacji}
                </span>
              </div>
              <WykresLiniowy punkty={punktyTrendu} ariaLabel="Wykres trendu overview dashboardu" wysokosc={220} />
            </article>
          </section>

          {/* odpowiada za sekcje tabelaryczne: top kampanie i monitor synchronizacji */}
          <section className="grid gap-4 pb-2 xl:grid-cols-2">
            <article className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/35 px-4 py-3">
                <h4 className="text-sm font-black text-white">
                  {czyEn ? "Top campaigns" : "Top kampanie"}
                </h4>
                <button
                  type="button"
                  onClick={() => setZakladka("ads")}
                  className="text-[11px] font-black uppercase tracking-[0.12em] text-indigo-300 hover:text-indigo-200"
                >
                  {czyEn ? "AI insight" : "AI insight"}
                </button>
              </div>
              {ads.status === "ladowanie" && <div className="p-4"><Ladowanie /></div>}
              {ads.status === "blad" && (
                <div className="p-4">
                  <Blad opis={normalizeApiError(ads.blad, "Nie udalo sie pobrac kampanii.")} />
                </div>
              )}
              {ads.status !== "ladowanie" && ads.status !== "blad" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-900/85 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      <tr>
                        <th className="px-4 py-2.5 font-bold">{czyEn ? "Campaign" : "Kampania"}</th>
                        <th className="px-4 py-2.5 text-right font-bold">Revenue</th>
                        <th className="px-4 py-2.5 text-center font-bold">ROAS</th>
                        <th className="px-4 py-2.5 text-right font-bold">{czyEn ? "Spend" : "Wydatki"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {topKampanie.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-xs font-semibold text-slate-400">
                            {czyEn ? "No campaign data." : "Brak danych kampanii."}
                          </td>
                        </tr>
                      )}
                      {topKampanie.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-semibold text-slate-100">{campaign.name}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-200">
                            {formatujWalute(campaign.revenue, 1)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                              {campaign.roas.toFixed(2)}x
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">{formatujWalute(campaign.spend, 1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/35 px-4 py-3">
                <h4 className="text-sm font-black text-white">
                  {czyEn ? "Sync monitor" : "Monitor synchronizacji"}
                </h4>
                <span className="rounded-md border border-emerald-400/35 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-300">
                  {czyEn ? "Health: very good" : "Zdrowie: bardzo dobre"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-900/85 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">{czyEn ? "Source" : "Zrodlo"}</th>
                      <th className="px-4 py-2.5 font-bold">Status</th>
                      <th className="px-4 py-2.5 font-bold">{czyEn ? "Delay" : "Opoznienie"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {monitorSync.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-xs font-semibold text-slate-400">
                          {czyEn ? "No source status." : "Brak statusu zrodel."}
                        </td>
                      </tr>
                    )}
                    {monitorSync.map((source) => {
                      const status = statusZrodla(source.status);
                      return (
                        <tr key={source.key} className="hover:bg-slate-800/50">
                          <td className="px-4 py-2.5 font-semibold text-slate-100">{source.label}</td>
                          <td className="px-4 py-2.5">
                            <span className={["inline-flex items-center gap-1.5 font-semibold", status.klasa].join(" ")}>
                              <span className={["h-2 w-2 rounded-full", status.kropka].join(" ")} />
                              {status.etykieta}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">{status.opoznienie}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </div>
      );
    }
    if (zakladka === "ads") {
      if (ads.status === "ladowanie") return <Ladowanie />;
      if (ads.status === "blad") return <Blad opis={normalizeApiError(ads.blad, "Nie udalo sie pobrac danych Ads.")} onRetry={ads.odswiez} />;
      if (!ads.dane) return <Pusto opis="Brak danych Ads." />;
      const slupkiAds: PunktWykresuSlupkowego[] = ads.dane.campaigns.map((campaign) => ({
        etykieta: campaign.channel.toUpperCase(),
        wartosc: campaign.roas,
      }));
      return (
        <div className="space-y-4">
          {renderKpis(ads.dane.kpis)}
          <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Kampanie
              </h4>
              <div className="mt-3">
                <TabelaRuntime
                  ariaLabel="Tabela kampanii reklamowych"
                  wiersze={ads.dane.campaigns}
                  kluczWiersza={(w) => w.id}
                  kolumny={[
                    { id: "name", naglowek: "Kampania", render: (w) => <span className="font-black">{w.name}</span> },
                    { id: "channel", naglowek: "Kanal", render: (w) => w.channel.toUpperCase() },
                    { id: "spend", naglowek: "Spend", render: (w) => formatujWalute(w.spend, 1) },
                    { id: "revenue", naglowek: "Revenue", render: (w) => formatujWalute(w.revenue, 1) },
                    { id: "roas", naglowek: "ROAS", render: (w) => w.roas.toFixed(2) },
                    {
                      id: "status",
                      naglowek: "Status",
                      render: (w) => (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase dark:bg-slate-800/70">
                          {w.status}
                        </span>
                      ),
                    },
                  ]}
                />
              </div>
            </article>
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">ROAS per kanal</h4>
              <div className="mt-3">
                <WykresSlupkowy punkty={slupkiAds} ariaLabel="Wykres ROAS per kanal" />
              </div>
            </article>
          </div>
        </div>
      );
    }
    if (zakladka === "customers") {
      if (customers.status === "ladowanie") return <Ladowanie />;
      if (customers.status === "blad") return <Blad opis={normalizeApiError(customers.blad, "Nie udalo sie pobrac klientow.")} onRetry={customers.odswiez} />;
      if (!customers.dane) return <Pusto opis="Brak danych klientow." />;
      const slupkiSegmentow: PunktWykresuSlupkowego[] = customers.dane.segments.map((segment) => ({
        etykieta: segment.name,
        wartosc: segment.customers,
      }));
      return (
        <div className="space-y-4">
          {renderKpis(customers.dane.kpis, ["rate"])}
          <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Segmenty klientow</h4>
              <div className="mt-3">
                <TabelaRuntime
                  ariaLabel="Tabela segmentow klientow"
                  wiersze={customers.dane.segments}
                  kluczWiersza={(w) => w.id}
                  kolumny={[
                    { id: "name", naglowek: "Segment", render: (w) => <span className="font-black">{w.name}</span> },
                    { id: "customers", naglowek: "Klienci", render: (w) => w.customers.toLocaleString(localeFormatowania) },
                    { id: "ltv", naglowek: "LTV", render: (w) => formatujWalute(w.ltv, 1) },
                    {
                      id: "repeat",
                      naglowek: "Repeat rate",
                      render: (w) => formatujProcent(w.repeatRatePct, 1),
                    },
                  ]}
                />
              </div>
            </article>
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Wolumen segmentow</h4>
              <div className="mt-3">
                <WykresSlupkowy punkty={slupkiSegmentow} ariaLabel="Wykres wolumenu segmentow klientow" />
              </div>
            </article>
          </div>
        </div>
      );
    }
    if (zakladka === "alerts") {
      if (alerts.status === "ladowanie") return <Ladowanie />;
      if (alerts.status === "blad") return <Blad opis={normalizeApiError(alerts.blad, "Nie udalo sie pobrac alertow.")} onRetry={alerts.odswiez} />;
      if (!alerts.dane?.length) return <Pusto opis="Brak alertow." />;
      const alertyPosortowane = [...alerts.dane].sort((a, b) => {
        const ranking: Record<string, number> = { high: 0, med: 1, opportunity: 2 };
        const porownaniePriorytetu = (ranking[a.priority] ?? 3) - (ranking[b.priority] ?? 3);
        if (porownaniePriorytetu !== 0) return porownaniePriorytetu;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const stylAlertu = (priorytet: string) => {
        if (priorytet === "high") {
          return {
            obwodka: "border-l-rose-500",
            badge: "border-rose-500/30 bg-rose-500/10 text-rose-300",
            etykieta: czyEn ? "CRITICAL" : "KRYTYCZNY",
            metryka: "text-rose-300",
          };
        }
        if (priorytet === "med") {
          return {
            obwodka: "border-l-amber-500",
            badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
            etykieta: czyEn ? "WARNING" : "OSTRZEZENIE",
            metryka: "text-amber-300",
          };
        }
        return {
          obwodka: "border-l-sky-500",
          badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
          etykieta: czyEn ? "INFO" : "INFO",
          metryka: "text-sky-300",
        };
      };

      const etykietaObszaruAlertu = (obszar: string) => {
        if (obszar === "ads") return czyEn ? "Marketing" : "Marketing";
        if (obszar === "store") return czyEn ? "Sales" : "Sprzedaz";
        if (obszar === "pricing") return czyEn ? "Pricing" : "Cennik";
        if (obszar === "inventory") return czyEn ? "Inventory" : "Magazyn";
        if (obszar === "ux") return czyEn ? "UX" : "UX";
        return obszar;
      };

      const liczbaKrytycznych = alertyPosortowane.filter((alert) => alert.priority === "high").length;

      return (
        <div className="space-y-4 pb-2">
          {/* odpowiada za naglowek i filtry strumienia alertow */}
          <section className="sticky top-0 z-10 rounded-xl border border-white/15 bg-slate-900/85 p-4 shadow-xl backdrop-blur">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-lg font-black text-white">
                  {czyEn ? "Response center" : "Centrum reagowania"}{" "}
                  <span className="ml-1 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-extrabold text-white">
                    {liczbaKrytycznych} {czyEn ? "CRITICAL" : "KRYTYCZNE"}
                  </span>
                </h4>
                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {czyEn ? "Anomaly stream and detected risks." : "Strumien anomalii i wykrytych ryzyk."}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500"
              >
                {czyEn ? "Mark all" : "Oznacz wszystkie"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-300">
              <span className="rounded-md border border-white/15 bg-slate-800/80 px-2.5 py-1">{czyEn ? "Severity: all" : "Poziom: wszystkie"}</span>
              <span className="rounded-md border border-white/15 bg-slate-800/80 px-2.5 py-1">{czyEn ? "Impact: all" : "Impact: wszystkie"}</span>
              <span className="rounded-md border border-white/15 bg-slate-800/80 px-2.5 py-1">{czyEn ? "Domain: all" : "Domena: wszystkie"}</span>
              <span className="rounded-md border border-white/15 bg-slate-800/80 px-2.5 py-1">{czyEn ? "Source: all" : "Zrodlo: wszystkie"}</span>
            </div>
          </section>

          {/* odpowiada za liste alertow w formie kart enterprise */}
          <section className="space-y-3">
            {alertyPosortowane.map((alert) => {
              const styl = stylAlertu(alert.priority);
              return (
                <article
                  key={alert.id}
                  className={[
                    "rounded-lg border border-white/10 bg-slate-900/70 p-4 backdrop-blur transition hover:bg-slate-900/90",
                    "border-l-4",
                    styl.obwodka,
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <p className="text-base font-black text-white">{alert.title}</p>
                        <span className="rounded border border-white/10 bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
                          {formatujDate(alert.createdAt)}
                        </span>
                        <span className={["rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]", styl.badge].join(" ")}>
                          {styl.etykieta}
                        </span>
                      </div>

                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-[11px] font-semibold text-slate-300">
                          {etykietaObszaruAlertu(alert.area)}
                        </span>
                        <span className="rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-[11px] font-semibold text-slate-300">
                          {alert.metricLabel}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {czyEn ? "Scope:" : "Zakres:"} <span className="text-slate-200">{czyEn ? "Global" : "Globalny"}</span>
                        </span>
                      </div>

                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-400">{czyEn ? "Recommendation:" : "Rekomendacja:"}</span>{" "}
                        {czyEn
                          ? "Check logs, validate source, and run guided simulation."
                          : "Sprawdz logi, zweryfikuj zrodlo i uruchom symulacje Guardiana."}
                      </p>
                    </div>

                    <div className="flex min-w-[180px] flex-row items-end justify-between gap-3 md:flex-col md:items-end">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Impact</p>
                        <p className={["text-lg font-black", styl.metryka].join(" ")}>{alert.metricValue}</p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {czyEn ? "Priority:" : "Priorytet:"}{" "}
                          <span className="text-slate-200">{etykietaPriorytetu(alert.priority)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-md bg-slate-800 p-1.5 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          aria-label={czyEn ? "Acknowledge alert" : "Potwierdz alert"}
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-slate-800 p-1.5 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          aria-label={czyEn ? "Mute alert" : "Wycisz alert"}
                        >
                          M
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAlertId(alert.id);
                            setZakladka("guardian");
                          }}
                          className="rounded-md border border-indigo-400/35 bg-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/35"
                        >
                          {czyEn ? "Explain" : "Wyjasnij"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      );
    }
    if (zakladka === "products") {
      if (products.status === "ladowanie") return <Ladowanie />;
      if (products.status === "blad") return <Blad opis={normalizeApiError(products.blad, "Nie udalo sie pobrac produktow.")} onRetry={products.odswiez} />;
      if (!products.dane?.products.length) return <Pusto opis="Brak danych produktow." />;
      const slupkiMarzy: PunktWykresuSlupkowego[] = products.dane.products.map((p) => ({
        etykieta: p.name.length > 18 ? `${p.name.slice(0, 18)}...` : p.name,
        wartosc: p.marginPct,
      }));
      return (
        <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Produkty i marza</h4>
            <div className="mt-3">
              <TabelaRuntime
                ariaLabel="Tabela produktow"
                wiersze={products.dane.products}
                kluczWiersza={(w) => w.id}
                kolumny={[
                  { id: "name", naglowek: "Produkt", render: (w) => <span className="font-black">{w.name}</span> },
                  { id: "category", naglowek: "Kategoria", render: (w) => w.category },
                  { id: "stock", naglowek: "Stock", render: (w) => w.stock.toString() },
                  { id: "margin", naglowek: "Marza", render: (w) => formatujProcent(w.marginPct, 1) },
                  { id: "velocity", naglowek: "Velocity", render: (w) => w.velocity.toFixed(1) },
                  { id: "trend", naglowek: "Trend", render: (w) => w.trend },
                ]}
              />
            </div>
          </article>
          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Marza SKU</h4>
            <div className="mt-3">
              <WykresSlupkowy punkty={slupkiMarzy} ariaLabel="Wykres marzy produktow" />
            </div>
          </article>
        </div>
      );
    }
    if (zakladka === "pipeline") {
      if (pipeline.status === "ladowanie") return <Ladowanie />;
      if (pipeline.status === "blad") return <Blad opis={normalizeApiError(pipeline.blad, "Nie udalo sie pobrac pipeline.")} onRetry={pipeline.odswiez} />;
      if (!pipeline.dane?.tasks.length) return <Pusto opis="Brak zadan pipeline." />;
      const licznikStatusow = {
        todo: pipeline.dane.tasks.filter((t) => t.status === "todo").length,
        in_progress: pipeline.dane.tasks.filter((t) => t.status === "in_progress").length,
        done: pipeline.dane.tasks.filter((t) => t.status === "done").length,
      };
      return (
        <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Zadania pipeline</h4>
            <div className="mt-3">
              <TabelaRuntime
                ariaLabel="Tabela zadan pipeline"
                wiersze={pipeline.dane.tasks}
                kluczWiersza={(w) => w.id}
                kolumny={[
                  { id: "title", naglowek: "Zadanie", render: (w) => <span className="font-black">{w.title}</span> },
                  { id: "owner", naglowek: "Owner", render: (w) => w.owner },
                  { id: "date", naglowek: "Due", render: (w) => formatujDate(w.dueDate) },
                  { id: "priority", naglowek: "Priorytet", render: (w) => etykietaPriorytetu(w.priority) },
                  { id: "status", naglowek: "Status", render: (w) => etykietaStatusuZadania(w.status) },
                ]}
              />
            </div>
          </article>
          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Status realizacji</h4>
            <div className="mt-3">
              <WykresSlupkowy
                punkty={[
                  { etykieta: czyEn ? "TO DO" : "DO ZROBIENIA", wartosc: licznikStatusow.todo },
                  { etykieta: czyEn ? "IN PROGRESS" : "W TOKU", wartosc: licznikStatusow.in_progress },
                  { etykieta: czyEn ? "DONE" : "GOTOWE", wartosc: licznikStatusow.done },
                ]}
                ariaLabel="Wykres statusow zadan pipeline"
              />
            </div>
          </article>
        </div>
      );
    }
    if (zakladka === "integracje") {
      if (integrations.status === "ladowanie") return <Ladowanie />;
      if (integrations.status === "blad") return <Blad opis={normalizeApiError(integrations.blad, "Nie udalo sie pobrac integracji.")} onRetry={integrations.odswiez} />;
      if (!integrations.dane?.length) return <Pusto opis="Brak integracji." />;
      const statusCount = integrations.dane.reduce<Record<string, number>>((acc, element) => {
        acc[element.status] = (acc[element.status] ?? 0) + 1;
        return acc;
      }, {});
      return (
        <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Stan konektorow</h4>
            <div className="mt-3">
              <TabelaRuntime
                ariaLabel="Tabela integracji dashboardu"
                wiersze={integrations.dane}
                kluczWiersza={(w) => w.key}
                kolumny={[
                  { id: "name", naglowek: "Integracja", render: (w) => <span className="font-black">{w.label}</span> },
                  { id: "category", naglowek: "Kategoria", render: (w) => w.category },
                  { id: "status", naglowek: "Status", render: (w) => etykietaStatusuIntegracji(w.status) },
                  { id: "sync", naglowek: "Last sync", render: (w) => (w.lastSyncAt ? formatujDate(w.lastSyncAt) : "brak") },
                  {
                    id: "action",
                    naglowek: "Akcja",
                    render: (w) =>
                      w.status === "missing" || w.status === "available" ? (
                        <button
                          type="button"
                          onClick={() => onConnect(w)}
                          className="pd-btn-secondary h-8 rounded-lg px-2 text-[11px] font-extrabold uppercase tracking-[0.1em]"
                        >
                          Polacz
                        </button>
                      ) : (
                        "-"
                      ),
                  },
                ]}
              />
            </div>
          </article>
          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Rozklad statusow</h4>
            <div className="mt-3">
              <WykresSlupkowy
                punkty={Object.entries(statusCount).map(([key, value]) => ({
                  etykieta: etykietaStatusuIntegracji(key as IntegracjaDashboardu["status"]),
                  wartosc: value,
                }))}
                ariaLabel="Wykres rozkladu statusow integracji"
              />
            </div>
          </article>
        </div>
      );
    }
    if (zakladka === "reports") {
      if (reports.status === "ladowanie") return <Ladowanie />;
      if (reports.status === "blad") return <Blad opis={normalizeApiError(reports.blad, "Nie udalo sie pobrac raportow.")} onRetry={reports.odswiez} />;
      if (!reports.dane?.reports.length) return <Pusto opis="Brak raportow." />;
      const countFormat = reports.dane.reports.reduce<Record<string, number>>((acc, report) => {
        acc[report.format] = (acc[report.format] ?? 0) + 1;
        return acc;
      }, {});
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {reports.dane.availableTypes.map((t) => (
              <button
                key={t}
                type="button"
                disabled={reportLoading !== null}
                onClick={() => onRequestReport(t)}
                className="pd-btn-secondary h-10 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.1em] disabled:opacity-60"
              >
                {reportLoading === t ? "Zlecanie..." : `Zlec ${t}`}
              </button>
            ))}
          </div>
          {reportStatus && <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{reportStatus}</p>}
          <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Historia raportow</h4>
              <div className="mt-3">
                <TabelaRuntime
                  ariaLabel="Tabela raportow"
                  wiersze={reports.dane.reports}
                  kluczWiersza={(w) => w.id}
                  kolumny={[
                    { id: "title", naglowek: "Raport", render: (w) => <span className="font-black">{w.title}</span> },
                    { id: "date", naglowek: "Data", render: (w) => formatujDate(w.createdAt) },
                    { id: "format", naglowek: "Format", render: (w) => w.format.toUpperCase() },
                    {
                      id: "url",
                      naglowek: "Plik",
                      render: (w) =>
                        w.url ? (
                          <a href={w.url} target="_blank" rel="noreferrer" className="text-sky-700 underline dark:text-sky-300">
                            Otworz
                          </a>
                        ) : (
                          "-"
                        ),
                    },
                  ]}
                />
              </div>
            </article>
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Formaty raportow</h4>
              <div className="mt-3">
                <WykresSlupkowy
                  punkty={Object.entries(countFormat).map(([format, value]) => ({
                    etykieta: format.toUpperCase(),
                    wartosc: value,
                  }))}
                  ariaLabel="Wykres formatow raportow"
                />
              </div>
            </article>
          </div>
        </div>
      );
    }
    if (zakladka === "analytics") {
      if (analytics.status === "ladowanie") return <Ladowanie />;
      if (analytics.status === "blad") return <Blad opis={normalizeApiError(analytics.blad, "Nie udalo sie pobrac analityki.")} onRetry={analytics.odswiez} />;
      if (!analytics.dane) return <Pusto opis="Brak danych analitycznych." />;
      const punktyTrend: PunktWykresuLiniowego[] = analytics.dane.series.map((point) => ({
        etykieta: point.date.slice(0, 10),
        wartosc: point.value,
        wartoscPorownawcza: point.compareValue,
      }));
      const slupkiSplit: PunktWykresuSlupkowego[] = analytics.dane.channelSplit.map((split) => ({
        etykieta: split.label,
        wartosc: split.value,
      }));
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Growth</p>
              <p className="mt-2 text-xl font-black text-emerald-700 dark:text-emerald-300">
                {formatujProcent(analytics.dane.summary.growthPct, 1)}
              </p>
            </article>
            <article className="pd-enterprise-card rounded-2xl p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Volatility</p>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">{analytics.dane.summary.volatility.toFixed(2)}</p>
            </article>
            <article className="pd-enterprise-card rounded-2xl p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Anomalies</p>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">{analytics.dane.summary.anomalyCount}</p>
            </article>
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Trend metryki</h4>
              <div className="mt-3">
                <WykresLiniowy punkty={punktyTrend} ariaLabel="Wykres trendu analitycznego" />
              </div>
            </article>
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Channel split</h4>
              <div className="mt-3">
                <WykresSlupkowy punkty={slupkiSplit} ariaLabel="Wykres podzialu kanalow" />
              </div>
            </article>
          </div>
          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Anomalie</h4>
            <div className="mt-3">
              <TabelaRuntime
                ariaLabel="Tabela anomalii analitycznych"
                wiersze={analytics.dane.anomalies}
                kluczWiersza={(w) => w.id}
                kolumny={[
                  { id: "title", naglowek: "Anomalia", render: (w) => <span className="font-black">{w.title}</span> },
                  { id: "date", naglowek: "Data", render: (w) => formatujDate(w.date) },
                  { id: "severity", naglowek: "Poziom", render: (w) => w.severity.toUpperCase() },
                  { id: "impact", naglowek: "Impact", render: (w) => formatujWalute(w.impact, 1) },
                ]}
              />
            </div>
          </article>
        </div>
      );
    }
    if (zakladka === "knowledge") {
      if (knowledge.status === "ladowanie") return <Ladowanie />;
      if (knowledge.status === "blad") {
        return <Blad opis={normalizeApiError(knowledge.blad, "Nie udalo sie pobrac bazy wiedzy.")} onRetry={knowledge.odswiez} />;
      }
      if (!knowledge.dane) return <Pusto opis="Brak danych knowledge." />;

      const licznikObszarow = knowledge.dane.playbooks.reduce<Record<string, number>>((acc, playbook) => {
        acc[playbook.area] = (acc[playbook.area] ?? 0) + 1;
        return acc;
      }, {});
      const slupkiObszarow: PunktWykresuSlupkowego[] = Object.entries(licznikObszarow).map(([obszar, liczba]) => ({
        etykieta: etykietaObszaruWiedzy(obszar as "ads" | "pricing" | "inventory" | "retention" | "analytics"),
        wartosc: liczba,
      }));

      return (
        <div className="space-y-4">
          <article className="pd-enterprise-card rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Wyszukiwarka playbookow
                </h4>
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Wyniki: {knowledge.dane.playbooks.length}
                  {knowledge.dane.query ? ` | fraza: ${knowledge.dane.query}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
                Knowledge base
              </span>
            </div>
            <input
              value={queryWiedzy}
              onChange={(e) => setQueryWiedzy(e.target.value)}
              placeholder="Szukaj playbooka..."
              className="mt-3 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
            />
          </article>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Rozklad obszarow</h4>
              <div className="mt-3">
                <WykresSlupkowy punkty={slupkiObszarow} ariaLabel="Wykres rozkladu playbookow po obszarach" />
              </div>
            </article>

            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Lista playbookow</h4>
              <div className="mt-3">
                <TabelaRuntime
                  ariaLabel="Tabela playbookow knowledge"
                  wiersze={knowledge.dane.playbooks}
                  kluczWiersza={(wiersz) => wiersz.id}
                  pustyStan="Brak playbookow dla zapytania."
                  kolumny={[
                    {
                      id: "title",
                      naglowek: "Playbook",
                      render: (wiersz) => (
                        <div className="space-y-1">
                          <p className="font-black">{wiersz.title}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">{wiersz.summary}</p>
                        </div>
                      ),
                    },
                    { id: "area", naglowek: "Obszar", render: (wiersz) => etykietaObszaruWiedzy(wiersz.area) },
                    { id: "level", naglowek: "Poziom", render: (wiersz) => etykietaPoziomuWiedzy(wiersz.level) },
                    { id: "updated", naglowek: "Aktualizacja", render: (wiersz) => formatujDate(wiersz.updatedAt) },
                    {
                      id: "tags",
                      naglowek: "Tagi",
                      render: (wiersz) => (
                        <span className="inline-block max-w-[230px] truncate text-xs font-semibold" title={wiersz.tags.join(", ")}>
                          {wiersz.tags.join(", ")}
                        </span>
                      ),
                    },
                  ]}
                />
              </div>
            </article>
          </div>

          {!!knowledge.dane.playbooks.length && (
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Kroki wdrozeniowe</h4>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {knowledge.dane.playbooks.slice(0, 4).map((playbook) => (
                  <section key={playbook.id} className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/50">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{playbook.title}</p>
                    <ol className="mt-2 space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {playbook.steps.slice(0, 3).map((krok, index) => (
                        <li key={`${playbook.id}-krok-${index}`}>{index + 1}. {krok}</li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            </article>
          )}
        </div>
      );
    }
    if (zakladka === "settings_org") {
      if (settingsOrg.status === "ladowanie") return <Ladowanie />;
      if (settingsOrg.status === "blad") {
        return <Blad opis={normalizeApiError(settingsOrg.blad, "Nie udalo sie pobrac ustawien organizacji.")} onRetry={settingsOrg.odswiez} />;
      }
      if (!settingsOrg.dane) return <Pusto opis="Brak ustawien organizacji." />;

      const rozkladRoli = settingsOrg.dane.members.reduce<Record<string, number>>((acc, member) => {
        acc[member.role] = (acc[member.role] ?? 0) + 1;
        return acc;
      }, {});
      const slupkiRoli: PunktWykresuSlupkowego[] = Object.entries(rozkladRoli).map(([rola, liczba]) => ({
        etykieta: etykietaRoliDostepu(rola as "owner" | "admin" | "manager" | "analyst" | "viewer"),
        wartosc: liczba,
      }));

      return (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Profil organizacji</h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Nazwa
                  <input
                    value={orgForm.name}
                    onChange={(e) => setOrgForm((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!czyWrite}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Timezone
                  <input
                    value={orgForm.timezone}
                    onChange={(e) => setOrgForm((prev) => ({ ...prev, timezone: e.target.value }))}
                    disabled={!czyWrite}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Logo URL
                <input
                  value={orgForm.logoUrl}
                  onChange={(e) => setOrgForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  disabled={!czyWrite}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                  placeholder="https://..."
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-700 dark:bg-slate-700/70 dark:text-slate-100">
                  Plan {settingsOrg.dane.organization.plan}
                </span>
                <button
                  type="button"
                  onClick={onZapiszOrganizacje}
                  disabled={!czyWrite}
                  className="pd-btn-primary h-10 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Zapisz organizacje
                </button>
              </div>
            </article>

            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Rozklad rol</h4>
              <div className="mt-3">
                <WykresSlupkowy punkty={slupkiRoli} ariaLabel="Wykres rozkladu rol uzytkownikow organizacji" />
              </div>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Czlonkowie</h4>
              <div className="mt-3">
                <TabelaRuntime
                  ariaLabel="Tabela czlonkow organizacji"
                  wiersze={settingsOrg.dane.members}
                  kluczWiersza={(wiersz) => wiersz.id}
                  kolumny={[
                    { id: "name", naglowek: "Uzytkownik", render: (wiersz) => <span className="font-black">{wiersz.name}</span> },
                    { id: "email", naglowek: "Email", render: (wiersz) => wiersz.email },
                    { id: "role", naglowek: "Rola", render: (wiersz) => etykietaRoliDostepu(wiersz.role) },
                    { id: "status", naglowek: "Status", render: (wiersz) => etykietaStatusuCzlonka(wiersz.status) },
                  ]}
                />
              </div>
            </article>

            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Polityki</h4>
              <div className="mt-3">
                <TabelaRuntime
                  ariaLabel="Tabela polityk organizacji"
                  wiersze={settingsOrg.dane.policies}
                  kluczWiersza={(wiersz) => wiersz.key}
                  kolumny={[
                    { id: "label", naglowek: "Polityka", render: (wiersz) => <span className="font-black">{wiersz.label}</span> },
                    { id: "state", naglowek: "Stan", render: (wiersz) => (wiersz.enabled ? "Wlaczona" : "Wylaczona") },
                    {
                      id: "action",
                      naglowek: "Akcja",
                      render: (wiersz) => (
                        <button
                          type="button"
                          onClick={() => onTogglePolicy(wiersz.key, !wiersz.enabled)}
                          disabled={!czyWrite}
                          className="pd-btn-secondary h-8 rounded-lg px-2.5 text-[11px] font-extrabold uppercase tracking-[0.1em] disabled:opacity-60"
                        >
                          {wiersz.enabled ? "Wylacz" : "Wlacz"}
                        </button>
                      ),
                    },
                  ]}
                />
              </div>
            </article>
          </div>

          {orgStatus && <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{orgStatus}</p>}
        </div>
      );
    }
    if (zakladka === "settings_workspace") {
      if (settingsWorkspace.status === "ladowanie") return <Ladowanie />;
      if (settingsWorkspace.status === "blad") {
        return (
          <Blad
            opis={normalizeApiError(settingsWorkspace.blad, "Nie udalo sie pobrac ustawien workspace.")}
            onRetry={settingsWorkspace.odswiez}
          />
        );
      }
      if (!settingsWorkspace.dane) return <Pusto opis="Brak ustawien workspace." />;

      const powiadomienia: Array<{
        key: "dailyDigest" | "weeklySummary" | "criticalAlerts";
        label: string;
        enabled: boolean;
      }> = [
        { key: "dailyDigest", label: "Daily digest", enabled: settingsWorkspace.dane.notifications.dailyDigest },
        { key: "weeklySummary", label: "Weekly summary", enabled: settingsWorkspace.dane.notifications.weeklySummary },
        { key: "criticalAlerts", label: "Critical alerts", enabled: settingsWorkspace.dane.notifications.criticalAlerts },
      ];
      const slupkiPowiadomien: PunktWykresuSlupkowego[] = powiadomienia.map((powiadomienie) => ({
        etykieta: powiadomienie.label,
        wartosc: powiadomienie.enabled ? 100 : 0,
      }));

      return (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Profil workspace</h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Nazwa
                  <input
                    value={workspaceForm.name}
                    onChange={(e) => setWorkspaceForm((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!czyWrite}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Timezone
                  <input
                    value={workspaceForm.timezone}
                    onChange={(e) => setWorkspaceForm((prev) => ({ ...prev, timezone: e.target.value }))}
                    disabled={!czyWrite}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Waluta
                  <select
                    value={workspaceForm.currency}
                    onChange={(e) =>
                      setWorkspaceForm((prev) => ({ ...prev, currency: e.target.value as "PLN" | "EUR" | "USD" }))
                    }
                    disabled={!czyWrite}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                  >
                    <option value="PLN">PLN</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Locale
                  <select
                    value={workspaceForm.locale}
                    onChange={(e) => setWorkspaceForm((prev) => ({ ...prev, locale: e.target.value as "pl-PL" | "en-US" }))}
                    disabled={!czyWrite}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                  >
                    <option value="pl-PL">pl-PL</option>
                    <option value="en-US">en-US</option>
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Domyslny zakres
                  <select
                    value={workspaceForm.defaultRange}
                    onChange={(e) =>
                      setWorkspaceForm((prev) => ({ ...prev, defaultRange: e.target.value as ZakresCzasuDashboardu }))
                    }
                    disabled={!czyWrite}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                  >
                    <option value="7d">7 dni</option>
                    <option value="30d">30 dni</option>
                    <option value="90d">90 dni</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={workspaceForm.compactMode}
                    onChange={(e) => setWorkspaceForm((prev) => ({ ...prev, compactMode: e.target.checked }))}
                    disabled={!czyWrite}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                  Compact mode
                </label>
              </div>
              <button
                type="button"
                onClick={onZapiszWorkspace}
                disabled={!czyWrite}
                className="pd-btn-primary mt-3 h-10 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Zapisz workspace
              </button>
            </article>

            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Aktywne powiadomienia</h4>
              <div className="mt-3">
                <WykresSlupkowy punkty={slupkiPowiadomien} ariaLabel="Wykres aktywnosci powiadomien workspace" />
              </div>
            </article>
          </div>

          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Notyfikacje</h4>
            <div className="mt-3">
              <TabelaRuntime
                ariaLabel="Tabela notyfikacji workspace"
                wiersze={powiadomienia}
                kluczWiersza={(wiersz) => wiersz.key}
                kolumny={[
                  { id: "label", naglowek: "Typ", render: (wiersz) => <span className="font-black">{wiersz.label}</span> },
                  { id: "status", naglowek: "Status", render: (wiersz) => (wiersz.enabled ? "ON" : "OFF") },
                  {
                    id: "action",
                    naglowek: "Akcja",
                    render: (wiersz) => (
                      <button
                        type="button"
                        onClick={() => onToggleWorkspace(wiersz.key, !wiersz.enabled)}
                        disabled={!czyWrite}
                        className="pd-btn-secondary h-8 rounded-lg px-2.5 text-[11px] font-extrabold uppercase tracking-[0.1em] disabled:opacity-60"
                      >
                        {wiersz.enabled ? "Wylacz" : "Wlacz"}
                      </button>
                    ),
                  },
                ]}
              />
            </div>
          </article>

          {workspaceStatus && <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{workspaceStatus}</p>}
        </div>
      );
    }
    if (zakladka === "guardian") {
      const alertyGuardiana = alerts.dane ?? [];
      const rozkladPriorytetow = alertyGuardiana.reduce<Record<string, number>>((acc, alert) => {
        acc[alert.priority] = (acc[alert.priority] ?? 0) + 1;
        return acc;
      }, {});
      const slupkiPriorytetow: PunktWykresuSlupkowego[] = Object.entries(rozkladPriorytetow).map(([priorytet, liczba]) => ({
        etykieta: etykietaPriorytetu(priorytet),
        wartosc: liczba,
      }));
      const zdarzeniaCzatu = (chat?.events ?? []).map((event, index) => ({
        id: `${event.type}-${index}`,
        typ: etykietaZdarzeniaGuardiana(event.type),
        opis: streszczenieZdarzeniaGuardiana(event),
      }));

      return (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">Papa Guardian</h4>
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Analiza i rekomendacje na bazie aktywnych sygnalow. Zasilane tym samym kontraktem dla DEMO i TENANT.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-700 dark:bg-slate-700/70 dark:text-slate-100">
                  Alerty: {alertyGuardiana.length}
                </span>
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
                  Thread {chat?.threadId ?? "brak"}
                </span>
              </div>
              <button
                type="button"
                onClick={onPrimaryCta}
                className="pd-btn-primary mt-4 h-11 rounded-2xl px-4 text-xs font-extrabold uppercase tracking-[0.1em] text-white"
              >
                {tryb === "DEMO" ? "Uruchom na swoich danych" : "Przejdz do wdrozenia"}
              </button>
            </article>

            <article className="pd-enterprise-card-muted rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Chat operacyjny</h4>
              <textarea
                value={wiadomosc}
                onChange={(e) => setWiadomosc(e.target.value)}
                className="mt-3 h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100"
                placeholder="Zapytaj Papa AI o rekomendacje dla aktywnych alertow..."
              />
              <button
                type="button"
                onClick={onSend}
                className="pd-btn-secondary mt-3 h-10 rounded-xl px-4 text-xs font-extrabold uppercase tracking-[0.1em]"
              >
                Wyslij
              </button>
              {chatBlad && <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{chatBlad}</p>}
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Priorytety alertow</h4>
              <div className="mt-3">
                <WykresSlupkowy punkty={slupkiPriorytetow} ariaLabel="Wykres priorytetow alertow guardiana" />
              </div>
            </article>

            <article className="pd-enterprise-card rounded-2xl p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Aktywne alerty</h4>
              <div className="mt-3">
                <TabelaRuntime
                  ariaLabel="Tabela alertow guardiana"
                  wiersze={alertyGuardiana}
                  kluczWiersza={(wiersz) => wiersz.id}
                  pustyStan="Brak aktywnych alertow."
                  kolumny={[
                    { id: "title", naglowek: "Alert", render: (wiersz) => <span className="font-black">{wiersz.title}</span> },
                    { id: "priority", naglowek: "Priorytet", render: (wiersz) => etykietaPriorytetu(wiersz.priority) },
                    { id: "area", naglowek: "Obszar", render: (wiersz) => wiersz.area.toUpperCase() },
                    { id: "metric", naglowek: "Metryka", render: (wiersz) => `${wiersz.metricLabel}: ${wiersz.metricValue}` },
                  ]}
                />
              </div>
            </article>
          </div>

          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Zdarzenia czatu</h4>
            <div className="mt-3">
              <TabelaRuntime
                ariaLabel="Tabela zdarzen czatu guardiana"
                wiersze={zdarzeniaCzatu}
                kluczWiersza={(wiersz) => wiersz.id}
                pustyStan="Brak zdarzen. Wyslij pytanie do Papa AI."
                kolumny={[
                  { id: "typ", naglowek: "Typ", render: (wiersz) => <span className="font-black">{wiersz.typ}</span> },
                  { id: "opis", naglowek: "Szczegoly", render: (wiersz) => wiersz.opis },
                ]}
              />
            </div>
          </article>
        </div>
      );
    }
    if (pandl.status === "ladowanie") return <Ladowanie />;
    if (pandl.status === "blad") return <Blad opis={normalizeApiError(pandl.blad, "Nie udalo sie pobrac P&L.")} onRetry={pandl.odswiez} />;
    if (!pandl.dane) return <Pusto opis="Brak danych P&L." />;

    const punktyMarzyKanalu: PunktWykresuLiniowego[] = pandl.dane.byChannel.map((kanal) => ({
      etykieta: kanal.label,
      wartosc: kanal.marginPct,
    }));
    const slupkiKosztow: PunktWykresuSlupkowego[] = [
      { etykieta: "Revenue", wartosc: pandl.dane.revenue },
      { etykieta: "COGS", wartosc: pandl.dane.cogs },
      { etykieta: "Ads", wartosc: pandl.dane.adsCost },
    ];

    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="pd-enterprise-card rounded-2xl p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Revenue</p>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">
              {formatujWalute(pandl.dane.revenue, 1)}
            </p>
          </article>
          <article className="pd-enterprise-card rounded-2xl p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Gross profit</p>
            <p className="mt-2 text-xl font-black text-emerald-700 dark:text-emerald-300">
              {formatujWalute(pandl.dane.grossProfit, 1)}
            </p>
          </article>
          <article className="pd-enterprise-card rounded-2xl p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Net profit</p>
            <p className="mt-2 text-xl font-black text-emerald-700 dark:text-emerald-300">
              {formatujWalute(pandl.dane.netProfit, 1)}
            </p>
          </article>
          <article className="pd-enterprise-card rounded-2xl p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Marza netto</p>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">
              {formatujProcent(pandl.dane.marginPct, 1)}
            </p>
          </article>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Struktura kosztow</h4>
            <div className="mt-3">
              <WykresSlupkowy punkty={slupkiKosztow} ariaLabel="Wykres struktury kosztow i przychodu P&L" />
            </div>
          </article>

          <article className="pd-enterprise-card rounded-2xl p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Marza per kanal</h4>
            <div className="mt-3">
              <WykresLiniowy punkty={punktyMarzyKanalu} ariaLabel="Wykres marzy netto po kanalach" />
            </div>
          </article>
        </div>

        <article className="pd-enterprise-card rounded-2xl p-4">
          <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Kanały P&L</h4>
          <div className="mt-3">
            <TabelaRuntime
              ariaLabel="Tabela kanalow P&L"
              wiersze={pandl.dane.byChannel}
              kluczWiersza={(wiersz) => wiersz.key}
              kolumny={[
                { id: "label", naglowek: "Kanal", render: (wiersz) => <span className="font-black">{wiersz.label}</span> },
                { id: "profit", naglowek: "Profit", render: (wiersz) => formatujWalute(wiersz.profit, 1) },
                { id: "margin", naglowek: "Marza", render: (wiersz) => formatujProcent(wiersz.marginPct, 1) },
              ]}
            />
          </div>
        </article>
      </div>
    );
  };

  const sekcjeMenu: Array<{ naglowek: string; elementy: Array<{ id: ZakladkaDashboardu; etykieta: string }> }> = [
    {
      naglowek: czyEn ? "Operations" : "Operacyjne",
      elementy: [
        { id: "overview", etykieta: "Overview" },
        { id: "alerts", etykieta: czyEn ? "Alerts" : "Alerty" },
        { id: "guardian", etykieta: "Guardian" },
        { id: "ads", etykieta: "Ads" },
        { id: "products", etykieta: czyEn ? "Products" : "Produkty" },
        { id: "customers", etykieta: czyEn ? "Customers" : "Klienci" },
        { id: "pipeline", etykieta: "Pipeline" },
        { id: "integracje", etykieta: czyEn ? "Integrations" : "Integracje" },
      ],
    },
    {
      naglowek: czyEn ? "Analytics" : "Analityka",
      elementy: [
        { id: "reports", etykieta: "Reports" },
        { id: "analytics", etykieta: "Analytics" },
        { id: "knowledge", etykieta: "Knowledge" },
        { id: "pandl", etykieta: "P&L" },
      ],
    },
    {
      naglowek: czyEn ? "Settings" : "Ustawienia",
      elementy: [
        { id: "settings_org", etykieta: czyEn ? "Org settings" : "Ustawienia organizacji" },
        { id: "settings_workspace", etykieta: czyEn ? "Workspace settings" : "Ustawienia workspace" },
      ],
    },
  ];

  return (
    <div
      className={
        pelnyEkran
          ? "min-h-screen w-full p-0"
          : "pd-glass pd-edge pd-innerglow rounded-[30px] border border-black/10 p-4 md:p-6 dark:border-white/10"
      }
    >
      {/* odpowiada za topbar i status runtime dashboardu */}
      <header
        className={
          pelnyEkran
            ? "border-b border-slate-200 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-slate-900/60"
            : "rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-slate-900/60"
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-800 shadow-sm dark:border-white/20 dark:bg-slate-900/70 dark:text-slate-100">
              <LogoPapaData size={26} ariaLabel="Logo PapaData Intelligence" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {etykietyUi.runtime}
              </p>
              <p className="truncate text-sm font-black text-slate-900 dark:text-slate-100">
                {nazwaMarki} <span className="text-slate-500 dark:text-slate-400">Intelligence</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPrzelaczMotyw}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:border-white/20 dark:bg-slate-900/65 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {motyw === "dark" ? etykietyUi.lightMode : etykietyUi.darkMode}
            </button>

            <div
              className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white p-1 dark:border-white/20 dark:bg-slate-900/65"
              role="group"
              aria-label={etykietyUi.zakresAria}
            >
              {(["7d", "30d", "90d"] as const).map((zakresOpcji) => (
                <button
                  key={zakresOpcji}
                  type="button"
                  onClick={() => setZakres(zakresOpcji)}
                  className={[
                    "h-8 rounded-lg px-2.5 text-[11px] font-black uppercase tracking-[0.1em] transition",
                    zakres === zakresOpcji
                      ? "bg-sky-100 text-sky-800 dark:bg-sky-500/25 dark:text-sky-200"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  ].join(" ")}
                  aria-pressed={zakres === zakresOpcji}
                >
                  {zakresOpcji}
                </button>
              ))}
            </div>

            <div ref={menuKontaRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuKontaOtwarte((poprzedni) => !poprzedni)}
                aria-haspopup="menu"
                aria-expanded={menuKontaOtwarte}
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-2.5 text-left transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:border-white/20 dark:bg-slate-900/65 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[11px] font-black text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
                  {inicjalyKonta}
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block max-w-[160px] truncate text-xs font-black text-slate-900 dark:text-slate-100">{identyfikatorKonta}</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{meta.dane?.mode ?? tryb}</span>
                </span>
                <span aria-hidden="true" className="text-[11px] font-black text-slate-600 dark:text-slate-300">
                  {menuKontaOtwarte ? "^" : "v"}
                </span>
              </button>

              {menuKontaOtwarte && (
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-[250px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/15 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onPrzejdzDoZakladki("settings_org")}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {etykietyUi.orgSettings}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onPrzejdzDoZakladki("settings_workspace")}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {etykietyUi.workspaceSettings}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onPrzejdzDoZakladki("integracje")}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {etykietyUi.integrations}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={onWyloguj}
                    disabled={!sesja?.token || trwaWylogowanie}
                    className="mt-2 w-full rounded-xl border border-rose-200 px-3 py-2 text-left text-sm font-extrabold uppercase tracking-[0.08em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/40 dark:text-rose-200 dark:hover:bg-rose-500/20"
                  >
                    {trwaWylogowanie ? etykietyUi.loggingOut : etykietyUi.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-700 dark:bg-slate-700/70 dark:text-slate-100">
            {meta.dane ? etykietaSwiezosci(meta.dane.dataFreshness, jezyk) : etykietyUi.loadingMeta}
          </span>
          {gotowosc.dane && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
              {etykietyUi.readiness} {gotowosc.dane.score}%
            </span>
          )}
          {dostep && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
              {dostep.role} | {dostep.access}
            </span>
          )}
          <span
            className={[
              "rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]",
              online
                ? "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200"
                : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
            ].join(" ")}
          >
            {online ? etykietyUi.online : etykietyUi.offline}
          </span>
        </div>
      </header>
      <div className={pelnyEkran ? "grid min-h-[calc(100vh-88px)] gap-0 lg:grid-cols-[auto_1fr]" : "mt-3 grid gap-3 lg:grid-cols-[auto_1fr]"}>
        <nav
          className={[
            pelnyEkran
              ? "border-r border-slate-200 bg-white/85 dark:border-white/10 dark:bg-slate-900/60"
              : "rounded-2xl border border-slate-200 bg-white/85 dark:border-white/10 dark:bg-slate-900/60",
            "flex min-h-0 flex-col p-3 transition-[width] duration-200",
            panelBocznyRozwiniety ? "lg:w-[272px]" : "lg:w-[86px]",
          ].join(" ")}
          aria-label="Nawigacja dashboardu runtime"
          onMouseEnter={() => {
            if (!panelBocznyPrzypiety) setPanelBocznyHover(true);
          }}
          onMouseLeave={() => {
            if (!panelBocznyPrzypiety) setPanelBocznyHover(false);
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p
              className={[
                "text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400",
                panelBocznyRozwiniety ? "opacity-100" : "opacity-0 lg:pointer-events-none",
              ].join(" ")}
            >
              {etykietyUi.navigation}
            </p>
            <button
              type="button"
              onClick={() => {
                setPanelBocznyPrzypiety((poprzedni) => {
                  const nastepny = !poprzedni;
                  safeLocalStorage.setItem(kluczPaneluBocznego, nastepny ? "1" : "0");
                  return nastepny;
                });
                setPanelBocznyHover(false);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {panelBocznyPrzypiety ? etykietyUi.unpin : etykietyUi.pin}
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {sekcjeMenu.map((sekcja) => (
              <section key={sekcja.naglowek}>
                <p
                  className={[
                    "px-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400",
                    panelBocznyRozwiniety ? "opacity-100" : "opacity-0 lg:pointer-events-none",
                  ].join(" ")}
                >
                  {sekcja.naglowek}
                </p>
                <ul className="mt-1 space-y-1">
                  {sekcja.elementy.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setZakladka(m.id)}
                        aria-current={zakladka === m.id ? "page" : undefined}
                        aria-label={m.etykieta}
                        title={!panelBocznyRozwiniety ? m.etykieta : undefined}
                        className={[
                          "w-full rounded-xl py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                          panelBocznyRozwiniety ? "px-3 text-left" : "px-0 text-center",
                          zakladka === m.id
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80",
                        ].join(" ")}
                      >
                        {panelBocznyRozwiniety ? m.etykieta : m.etykieta.slice(0, 1)}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
            <button
              type="button"
              onClick={onWyloguj}
              disabled={!sesja?.token || trwaWylogowanie}
              className={[
                "w-full rounded-xl border px-3 py-2 text-sm font-extrabold uppercase tracking-[0.1em] transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
                "border-rose-200 text-rose-700 hover:bg-rose-50",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "dark:border-rose-400/40 dark:text-rose-200 dark:hover:bg-rose-500/20",
              ].join(" ")}
            >
              {trwaWylogowanie ? etykietyUi.loggingOut : etykietyUi.logout}
            </button>
            <p
              className={[
                "mt-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300",
                panelBocznyRozwiniety ? "block" : "hidden lg:block lg:text-center",
              ].join(" ")}
            >
              {sesja?.token ? `${etykietyUi.account}: ${identyfikatorKonta}` : etykietyUi.demoMode}
            </p>
          </div>
        </nav>
        <section
          className={
            pelnyEkran
              ? "bg-white/90 p-4 dark:bg-slate-900/60"
              : "rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-white/10 dark:bg-slate-900/60"
          }
        >
          {!online && <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-300/30 dark:bg-amber-500/15 dark:text-amber-200">{etykietyUi.offlineHint}</div>}
          {widok()}
          {laczy && <p className="mt-4 text-xs font-semibold text-slate-700 dark:text-slate-200">{laczy}</p>}
        </section>
      </div>
    </div>
  );
}

export function SekcjaDashboardRuntime({
  tryb,
  tenantId,
  onPrimaryCta,
  pelnyEkran = false,
}: Props) {
  return (
    <section
      className={pelnyEkran ? "relative w-full min-h-screen" : "pd-container py-12 md:py-16"}
      aria-label="Sekcja dashboardu runtime"
    >
      <DashboardDataProvider tryb={tryb} tenantId={tenantId}>
        <SekcjaWew onPrimaryCta={onPrimaryCta} pelnyEkran={pelnyEkran} />
      </DashboardDataProvider>
    </section>
  );
}

export default SekcjaDashboardRuntime;
