export type KategoriaIntegracji =
  | "ads"
  | "store"
  | "hub"
  | "crm"
  | "ops";
export type JezykUiIntegracji = "pl" | "en";

export type StatusIntegracji = "live" | "beta" | "wkrotce";
export type StanPolaczeniaIntegracji = "connected" | "available";

export type IntegracjaKatalogu = {
  id: string;
  nazwa: string;
  kategoria: KategoriaIntegracji;
  status: StatusIntegracji;
  stanPolaczenia: StanPolaczeniaIntegracji;
  opis: string;
  typAutoryzacji: "oauth2" | "api_key";
  kolor: string;
  ikonaSkrot: string;
  metryki?: string;
};

export const KATEGORIE_INTEGRACJI: Array<{ id: KategoriaIntegracji; etykieta: string }> = [
  { id: "ads", etykieta: "Płatny ruch" },
  { id: "store", etykieta: "Platformy" },
  { id: "hub", etykieta: "Marketplace" },
  { id: "crm", etykieta: "Automatyzacja" },
  { id: "ops", etykieta: "Operacje" },
];

export const INTEGRACJE_KATALOG: IntegracjaKatalogu[] = [
  // odpowiada za integracje platnego ruchu i atrybucji kosztow kampanii
  {
    id: "google-ads",
    nazwa: "Google Ads",
    kategoria: "ads",
    status: "live",
    stanPolaczenia: "connected",
    opis: "Kampanie, koszty i konwersje z pełną atrybucją ROAS.",
    typAutoryzacji: "oauth2",
    kolor: "#4285F4",
    ikonaSkrot: "G",
    metryki: "2.4k kliknięć",
  },
  {
    id: "meta-ads",
    nazwa: "Meta Ads",
    kategoria: "ads",
    status: "live",
    stanPolaczenia: "connected",
    opis: "Zestawy reklam i koszty mediowe dla Facebook oraz Instagram.",
    typAutoryzacji: "oauth2",
    kolor: "#1877F2",
    ikonaSkrot: "M",
    metryki: "15 kampanii",
  },
  {
    id: "allegro-ads",
    nazwa: "Allegro Ads",
    kategoria: "ads",
    status: "beta",
    stanPolaczenia: "available",
    opis: "Efektywność promowanych ofert i koszt reklamy marketplace.",
    typAutoryzacji: "oauth2",
    kolor: "#FF5A00",
    ikonaSkrot: "AL",
  },
  {
    id: "tiktok-ads",
    nazwa: "TikTok Ads",
    kategoria: "ads",
    status: "beta",
    stanPolaczenia: "available",
    opis: "Wyniki kampanii wideo i sygnały konwersji e-commerce.",
    typAutoryzacji: "oauth2",
    kolor: "#00F2EA",
    ikonaSkrot: "TT",
  },
  {
    id: "ceneo",
    nazwa: "Ceneo",
    kategoria: "ads",
    status: "live",
    stanPolaczenia: "available",
    opis: "Porównywarka ofert z monitoringiem kosztu kliknięć i marży.",
    typAutoryzacji: "api_key",
    kolor: "#FF7F00",
    ikonaSkrot: "CN",
  },

  // odpowiada za platformy sklepowe i zasilanie modelu zamowieniami
  {
    id: "shopify",
    nazwa: "Shopify",
    kategoria: "store",
    status: "live",
    stanPolaczenia: "available",
    opis: "Synchronizacja zamówień, produktów, marży i danych klienta.",
    typAutoryzacji: "oauth2",
    kolor: "#95BF47",
    ikonaSkrot: "SH",
  },
  {
    id: "woocommerce",
    nazwa: "WooCommerce",
    kategoria: "store",
    status: "live",
    stanPolaczenia: "available",
    opis: "Import zamówień i produktów przez API sklepu WordPress.",
    typAutoryzacji: "api_key",
    kolor: "#96588A",
    ikonaSkrot: "WC",
  },
  {
    id: "shoper",
    nazwa: "Shoper",
    kategoria: "store",
    status: "live",
    stanPolaczenia: "available",
    opis: "Automatyczny import sprzedaży i kosztów transakcyjnych.",
    typAutoryzacji: "api_key",
    kolor: "#0082FA",
    ikonaSkrot: "SP",
  },
  {
    id: "prestashop",
    nazwa: "PrestaShop",
    kategoria: "store",
    status: "beta",
    stanPolaczenia: "available",
    opis: "Połączenie katalogu, koszyka i transakcji sklepowych.",
    typAutoryzacji: "api_key",
    kolor: "#DF0067",
    ikonaSkrot: "PS",
  },
  {
    id: "idosell",
    nazwa: "IdoSell",
    kategoria: "store",
    status: "beta",
    stanPolaczenia: "available",
    opis: "Sprzedaż, zwroty i koszty logistyczne w jednym modelu KPI.",
    typAutoryzacji: "api_key",
    kolor: "#0066CC",
    ikonaSkrot: "IS",
  },
  {
    id: "magento",
    nazwa: "Magento",
    kategoria: "store",
    status: "wkrotce",
    stanPolaczenia: "available",
    opis: "Planowany konektor dla Magento Open Source i Commerce.",
    typAutoryzacji: "oauth2",
    kolor: "#EC6726",
    ikonaSkrot: "MG",
  },

  // odpowiada za marketplace i warstwe hubow zamowien
  {
    id: "baselinker",
    nazwa: "BaseLinker",
    kategoria: "hub",
    status: "live",
    stanPolaczenia: "connected",
    opis: "Hub zamówień, oferty i logistyka wielokanałowa.",
    typAutoryzacji: "api_key",
    kolor: "#5D3FD3",
    ikonaSkrot: "BL",
    metryki: "Synchronizacja",
  },
  {
    id: "allegro",
    nazwa: "Allegro",
    kategoria: "hub",
    status: "live",
    stanPolaczenia: "available",
    opis: "Import sprzedaży marketplace i prowizji Allegro.",
    typAutoryzacji: "oauth2",
    kolor: "#FF5A00",
    ikonaSkrot: "AL",
  },
  {
    id: "amazon",
    nazwa: "Amazon",
    kategoria: "hub",
    status: "wkrotce",
    stanPolaczenia: "available",
    opis: "Planowany konektor marketplacowy dla eksportu danych sprzedaży.",
    typAutoryzacji: "oauth2",
    kolor: "#FF9900",
    ikonaSkrot: "AZ",
  },

  // odpowiada za CRM i automatyzacje marketingowe
  {
    id: "salesmanago",
    nazwa: "Salesmanago",
    kategoria: "crm",
    status: "beta",
    stanPolaczenia: "available",
    opis: "Segmenty, scenariusze i skuteczność kampanii email marketingu.",
    typAutoryzacji: "api_key",
    kolor: "#00AEEF",
    ikonaSkrot: "SM",
  },
  {
    id: "klaviyo",
    nazwa: "Klaviyo",
    kategoria: "crm",
    status: "live",
    stanPolaczenia: "available",
    opis: "Performance flow email/SMS i wartość klienta w czasie.",
    typAutoryzacji: "api_key",
    kolor: "#FFB888",
    ikonaSkrot: "KL",
  },

  // odpowiada za operacje, logistyczne SLA i analityke produktowa
  {
    id: "inpost",
    nazwa: "InPost",
    kategoria: "ops",
    status: "live",
    stanPolaczenia: "connected",
    opis: "Statusy dostaw i SLA logistyczne dla pełnego łańcucha zamówień.",
    typAutoryzacji: "api_key",
    kolor: "#FFCC00",
    ikonaSkrot: "IP",
    metryki: "API OK",
  },
  {
    id: "ga4",
    nazwa: "Google Analytics 4",
    kategoria: "ops",
    status: "live",
    stanPolaczenia: "connected",
    opis: "Zdarzenia, sesje i lejki konwersji w czasie rzeczywistym.",
    typAutoryzacji: "oauth2",
    kolor: "#F9AB00",
    ikonaSkrot: "G4",
    metryki: "Live data",
  },
];

const KATEGORIE_INTEGRACJI_EN: Array<{ id: KategoriaIntegracji; etykieta: string }> = [
  { id: "ads", etykieta: "Paid traffic" },
  { id: "store", etykieta: "Platforms" },
  { id: "hub", etykieta: "Marketplace" },
  { id: "crm", etykieta: "Automation" },
  { id: "ops", etykieta: "Operations" },
];

type LokalizacjaIntegracji = Partial<Pick<IntegracjaKatalogu, "opis" | "metryki">>;

const LOKALIZACJE_INTEGRACJI_EN: Record<string, LokalizacjaIntegracji> = {
  "google-ads": {
    opis: "Campaigns, costs, and conversions with full ROAS attribution.",
    metryki: "2.4k clicks",
  },
  "meta-ads": {
    opis: "Ad sets and media costs for Facebook and Instagram.",
    metryki: "15 campaigns",
  },
  "allegro-ads": {
    opis: "Performance of promoted offers and marketplace ad cost.",
  },
  "tiktok-ads": {
    opis: "Video campaign performance and e-commerce conversion signals.",
  },
  ceneo: {
    opis: "Offer comparison feed with click-cost and margin monitoring.",
  },
  shopify: {
    opis: "Order, product, and margin synchronization with customer data.",
  },
  woocommerce: {
    opis: "Orders and products import through WordPress store API.",
  },
  shoper: {
    opis: "Automated import of sales and transaction costs.",
  },
  prestashop: {
    opis: "Catalog, cart, and store transactions integration.",
  },
  idosell: {
    opis: "Sales, returns, and logistics costs in one KPI model.",
  },
  magento: {
    opis: "Planned connector for Magento Open Source and Commerce.",
  },
  baselinker: {
    opis: "Order hub, listings, and multichannel logistics.",
    metryki: "Syncing",
  },
  allegro: {
    opis: "Marketplace sales import with Allegro commission data.",
  },
  amazon: {
    opis: "Planned marketplace connector for sales data export.",
  },
  salesmanago: {
    opis: "Segments, scenarios, and email marketing campaign performance.",
  },
  klaviyo: {
    opis: "Email/SMS flow performance and customer value over time.",
  },
  inpost: {
    opis: "Delivery statuses and logistics SLA across full order chain.",
    metryki: "API OK",
  },
  ga4: {
    opis: "Events, sessions, and conversion funnels in real time.",
    metryki: "Live data",
  },
};

export function pobierzKategorieIntegracji(
  jezyk: JezykUiIntegracji
): Array<{ id: KategoriaIntegracji; etykieta: string }> {
  return jezyk === "en" ? KATEGORIE_INTEGRACJI_EN : KATEGORIE_INTEGRACJI;
}

export function lokalizujIntegracjeKatalog(
  integracja: IntegracjaKatalogu,
  jezyk: JezykUiIntegracji
): IntegracjaKatalogu {
  if (jezyk === "pl") return integracja;
  const lokalizacja = LOKALIZACJE_INTEGRACJI_EN[integracja.id];
  if (!lokalizacja) return integracja;
  return {
    ...integracja,
    opis: lokalizacja.opis ?? integracja.opis,
    metryki: lokalizacja.metryki ?? integracja.metryki,
  };
}
