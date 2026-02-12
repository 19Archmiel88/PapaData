export type WariantKartyRaportu = "standard" | "szeroka";

export type ModelKartyRaportu = {
  problem: string;
  decyzja: string;
  efekt: string;
};

export type DefinicjaFunkcjiRaportowej = {
  id: string;
  nazwa: string;
  opis: string;
  zastosowania: [string, string, ...string[]];
  daneWejsciowe: string;
  wariantKarty: WariantKartyRaportu;
  modelKarty: ModelKartyRaportu;
};

type LokalizacjaFunkcjiRaportowej = Pick<
  DefinicjaFunkcjiRaportowej,
  "nazwa" | "opis" | "zastosowania" | "daneWejsciowe" | "modelKarty"
>;

const LOKALIZACJE_EN: Record<string, LokalizacjaFunkcjiRaportowej> = {
  "wyniki-kampanii": {
    nazwa: "Campaign performance",
    opis: "Compares cost, revenue, and margin by campaign, ad set, and creative.",
    zastosowania: [
      "Detects budget waste by channel and creative.",
      "Shows true ROAS after product and logistics costs.",
      "Flags campaigns with margin-loss risk.",
    ],
    daneWejsciowe: "Meta Ads, Google Ads, product cost, shipping cost, orders.",
    modelKarty: {
      problem: "Campaign spend grows faster than net revenue.",
      decyzja: "Reallocate budget to creatives with stable post-cost margin.",
      efekt: "Higher ROAS quality and fewer low-margin conversions.",
    },
  },
  "asystent-marketingowy-ai": {
    nazwa: "AI marketing assistant",
    opis: "Explains KPI deviations and prioritizes actions by financial impact.",
    zastosowania: [
      "Prioritizes tasks by opportunity cost.",
      "Sends critical alerts for KPI deviations.",
      "Builds an execution-ready daily action plan.",
    ],
    daneWejsciowe: "Traffic, conversions, campaign cost, net margin, returns.",
    modelKarty: {
      problem: "Team spends too much time deciding what to fix first.",
      decyzja: "Guardian ranks tasks by expected profit and risk.",
      efekt: "Faster execution with better day-to-day decision quality.",
    },
  },
  "rekomendacje-wzrostu": {
    nazwa: "Growth recommendations",
    opis: "Builds action scenarios and estimates impact on margin and revenue.",
    zastosowania: [
      "30/60/90-day simulations for budget and margin.",
      "Deployment plan without guessing priorities.",
      "Risk checks for discount and bid changes.",
    ],
    daneWejsciowe: "Sales history, media spend, inventory levels, attribution.",
    modelKarty: {
      problem: "Growth ideas are discussed without hard impact estimates.",
      decyzja: "Model simulates scenarios before budget commitment.",
      efekt: "Safer growth moves with clearer financial upside.",
    },
  },
  "wplyw-rabatow": {
    nazwa: "Discount impact",
    opis: "Checks whether discounts improve profit or only low-margin volume.",
    zastosowania: [
      "Controls profitability thresholds per SKU.",
      "Protects product margin during promotions.",
      "Finds segments where discounts are unnecessary.",
    ],
    daneWejsciowe: "Base price, discount level, SKU margin, campaign and logistics costs.",
    modelKarty: {
      problem: "Discounts boost sales volume but weaken unit economics.",
      decyzja: "Model validates discount threshold per product and segment.",
      efekt: "Promotions stay competitive without margin leakage.",
    },
  },
  "analityka-produktow": {
    nazwa: "Product analytics",
    opis: "Combines demand, margin, and returns to show what to scale or phase out.",
    zastosowania: [
      "Opportunity map for high-potential SKUs.",
      "Inventory risk and stockout watchlist.",
      "Replenishment priority by net margin.",
    ],
    daneWejsciowe: "SKU data, inventory levels, rotation, returns, revenue, unit cost.",
    modelKarty: {
      problem: "Portfolio decisions ignore full profit and inventory context.",
      decyzja: "Connect demand, margin, and stock risk in one ranking.",
      efekt: "Better SKU mix with fewer stockout-driven losses.",
    },
  },
  "automatyczne-raporty": {
    nazwa: "Automated reports",
    opis: "Delivers daily and weekly reporting without manual team effort.",
    zastosowania: [
      "Morning report for leadership and marketing.",
      "Alerts for KPI and margin deviations.",
      "Ready outputs for weekly business review.",
    ],
    daneWejsciowe: "All active data sources connected to the PapaData model.",
    modelKarty: {
      problem: "Reporting is delayed and manually assembled from many tools.",
      decyzja: "Automate recurring reports and exception alerts.",
      efekt: "Reliable reporting rhythm with less analyst workload.",
    },
  },
  "lejek-zakupowy": {
    nazwa: "Purchase funnel",
    opis: "Shows where the buying journey loses the most revenue.",
    zastosowania: [
      "Detects friction from product page to payment confirmation.",
      "Segments cart abandonment by device and traffic source.",
      "Suggests checkout recovery tests with business priority.",
    ],
    daneWejsciowe: "Page views, cart events, checkout data, traffic source, device.",
    modelKarty: {
      problem: "Revenue leaks are visible too late in the purchase path.",
      decyzja: "Pinpoint drop-off step and segment causing loss.",
      efekt: "Higher conversion rate and lower checkout abandonment.",
    },
  },
  "sciezka-konwersji": {
    nazwa: "Conversion path",
    opis: "Analyzes touchpoint sequences that actually close revenue.",
    zastosowania: [
      "Compares first-touch and last-touch paths.",
      "Quantifies assist-channel contribution.",
      "Improves awareness vs closing budget split.",
    ],
    daneWejsciowe: "User sessions, campaign touchpoints, transactions, attribution model.",
    modelKarty: {
      problem: "Attribution hides channels that support final conversion.",
      decyzja: "Evaluate complete path, not only last click.",
      efekt: "Smarter media split across awareness and performance.",
    },
  },
  "analiza-klientow": {
    nazwa: "Customer analytics",
    opis: "Combines behavior, margin, and retention to find highest-value segments.",
    zastosowania: [
      "Identifies segments with top LTV and margin.",
      "Detects churn risk and purchase-frequency drops.",
      "Recommends retention and cross-sell plays.",
    ],
    daneWejsciowe: "Order history, customer segments, margin, discounts, CRM activity.",
    modelKarty: {
      problem: "High-value customers are mixed with low-profit segments.",
      decyzja: "Segment users by LTV, margin, and churn probability.",
      efekt: "Better retention focus and more profitable CRM actions.",
    },
  },
};

export const FUNKCJE_RAPORTOWE: DefinicjaFunkcjiRaportowej[] = [
  {
    id: "wyniki-kampanii",
    nazwa: "Wyniki kampanii",
    opis: "Porównuje koszty, przychód i marżę na poziomie kampanii, zestawu reklam i kreacji.",
    zastosowania: [
      "Wykrywa przepalenia budżetu po kanale i kreacji.",
      "Pokazuje realny ROAS po kosztach produktu i logistyki.",
      "Oznacza kampanie z ryzykiem utraty marży.",
    ],
    daneWejsciowe: "Meta Ads, Google Ads, koszt produktu, koszt dostawy, zamówienia.",
    wariantKarty: "szeroka",
    modelKarty: {
      problem: "Koszt kampanii rósł szybciej niż przychód netto.",
      decyzja: "Przesuń budżet do kreacji z najwyższą marżą po kosztach.",
      efekt: "Lepszy ROAS jakościowy i mniej niskomarżowych konwersji.",
    },
  },
  {
    id: "asystent-marketingowy-ai",
    nazwa: "Asystent marketingowy AI",
    opis: "Wyjaśnia odchylenia metryk i priorytetyzuje akcje po efekcie finansowym.",
    zastosowania: [
      "Priorytetyzuje zadania na podstawie straty alternatywnej.",
      "Wysyła alerty krytyczne dla odchyleń KPI.",
      "Buduje gotowy plan działań na dany dzień.",
    ],
    daneWejsciowe: "Ruch, konwersje, koszty kampanii, marża netto, dane o zwrotach.",
    wariantKarty: "szeroka",
    modelKarty: {
      problem: "Zespół traci czas na ustalanie, co poprawić najpierw.",
      decyzja: "Guardian szereguje zadania wg zysku i ryzyka.",
      efekt: "Szybsze wykonanie i wyższa jakość decyzji dziennych.",
    },
  },
  {
    id: "rekomendacje-wzrostu",
    nazwa: "Rekomendacje wzrostu",
    opis: "Buduje scenariusze działań i estymuje ich wpływ na marżę oraz przychód.",
    zastosowania: [
      "Symulacje 30/60/90 dni dla budżetu i marży.",
      "Plan wdrożenia bez zgadywania priorytetów.",
      "Ocena ryzyka przy zmianie rabatów i stawek.",
    ],
    daneWejsciowe: "Historia sprzedaży, koszty mediowe, stany magazynowe, atrybucja.",
    wariantKarty: "standard",
    modelKarty: {
      problem: "Pomysły wzrostu są omawiane bez twardych wyliczeń.",
      decyzja: "Model symuluje warianty przed decyzją budżetową.",
      efekt: "Bezpieczniejsze decyzje wzrostowe i czytelny upside.",
    },
  },
  {
    id: "wplyw-rabatow",
    nazwa: "Wpływ rabatów",
    opis: "Sprawdza, czy rabat zwiększa zysk, czy tylko wolumen niskomarżowy.",
    zastosowania: [
      "Kontrola progów rentowności per SKU.",
      "Ochrona marży produktowej przy promocjach.",
      "Wskazanie segmentów, gdzie rabat nie jest konieczny.",
    ],
    daneWejsciowe: "Ceny bazowe, rabaty, marża na SKU, koszty kampanii i logistyki.",
    wariantKarty: "standard",
    modelKarty: {
      problem: "Rabat podnosi sprzedaż, ale osłabia ekonomikę jednostki.",
      decyzja: "Model waliduje próg rabatu per produkt i segment.",
      efekt: "Promocje utrzymują konkurencyjność bez utraty marży.",
    },
  },
  {
    id: "analityka-produktow",
    nazwa: "Analityka produktów",
    opis: "Łączy popyt, marżę i zwroty, aby wskazać produkty do skali lub wygaszenia.",
    zastosowania: [
      "Mapa szans SKU i produktów z potencjałem wzrostu.",
      "Lista ryzyk magazynowych i stockout.",
      "Priorytet replenishment pod marżę netto.",
    ],
    daneWejsciowe: "SKU, stany magazynowe, rotacja, zwroty, przychód i koszt jednostkowy.",
    wariantKarty: "standard",
    modelKarty: {
      problem: "Decyzje asortymentowe pomijają pełny kontekst zysku i zapasu.",
      decyzja: "Połącz popyt, marżę i ryzyko stanu w jednym rankingu.",
      efekt: "Lepszy mix SKU i mniej strat przez braki magazynowe.",
    },
  },
  {
    id: "automatyczne-raporty",
    nazwa: "Automatyczne raporty",
    opis: "Dostarcza codzienne i tygodniowe raporty bez ręcznego składania danych.",
    zastosowania: [
      "Raport poranny dla zarządu i marketingu.",
      "Powiadomienia o odchyleniach KPI i marży.",
      "Gotowe zestawienia do weekly business review.",
    ],
    daneWejsciowe: "Wszystkie aktywne źródła danych podpięte do modelu PapaData.",
    wariantKarty: "standard",
    modelKarty: {
      problem: "Raportowanie jest opóźnione i składane ręcznie z wielu narzędzi.",
      decyzja: "Zautomatyzuj raporty cykliczne i alerty odchyleń.",
      efekt: "Stały rytm raportowy i mniejsze obciążenie analityków.",
    },
  },
  {
    id: "lejek-zakupowy",
    nazwa: "Lejek zakupowy",
    opis: "Pokazuje etap procesu zakupowego, na którym tracisz najwięcej przychodu.",
    zastosowania: [
      "Wykrywa punkty tarcia od karty produktu do finalizacji płatności.",
      "Segmentuje porzucenia koszyka po urządzeniu i źródle ruchu.",
      "Sugeruje testy naprawcze checkoutu z priorytetem biznesowym.",
    ],
    daneWejsciowe: "Widoki stron, zdarzenia koszyka, checkout, kanał pozyskania, urządzenie.",
    wariantKarty: "standard",
    modelKarty: {
      problem: "Utrata przychodu ujawnia się zbyt późno w lejku.",
      decyzja: "Wskaż krok i segment odpowiedzialny za spadek konwersji.",
      efekt: "Wyższy współczynnik konwersji i mniej porzuconych koszyków.",
    },
  },
  {
    id: "sciezka-konwersji",
    nazwa: "Ścieżka konwersji",
    opis: "Analizuje sekwencje touchpointów, które faktycznie domykają przychód.",
    zastosowania: [
      "Porównuje ścieżki pierwszego i ostatniego kontaktu.",
      "Wylicza udział kanałów wspierających konwersję.",
      "Pomaga dzielić budżet między awareness i domknięcie.",
    ],
    daneWejsciowe: "Sesje użytkowników, touchpointy kampanii, transakcje, model atrybucji.",
    wariantKarty: "standard",
    modelKarty: {
      problem: "Atrybucja nie pokazuje kanałów wspierających finalną sprzedaż.",
      decyzja: "Oceniaj całą ścieżkę zamiast samego last click.",
      efekt: "Lepszy podział budżetu między awareness i performance.",
    },
  },
  {
    id: "analiza-klientow",
    nazwa: "Analiza klientów",
    opis: "Łączy zachowanie klientów, marżę i retencję, aby wskazać segmenty najwyższej wartości.",
    zastosowania: [
      "Identyfikuje segmenty o najwyższym LTV i marży.",
      "Wykrywa ryzyko churnu i spadku częstotliwości zakupów.",
      "Podpowiada scenariusze retencji i cross-sell.",
    ],
    daneWejsciowe: "Historia zamówień, segmenty klientów, marża, rabaty, aktywność CRM.",
    wariantKarty: "standard",
    modelKarty: {
      problem: "Segmenty wysokiej wartości mieszają się z niskomarżowymi klientami.",
      decyzja: "Segmentuj po LTV, marży i prawdopodobieństwie churnu.",
      efekt: "Lepszy fokus retencji i bardziej rentowne akcje CRM.",
    },
  },
];

export function lokalizujFunkcjeRaportowa(
  funkcja: DefinicjaFunkcjiRaportowej,
  jezyk: "pl" | "en"
): DefinicjaFunkcjiRaportowej {
  if (jezyk === "pl") return funkcja;
  const lokalizacja = LOKALIZACJE_EN[funkcja.id];
  if (!lokalizacja) return funkcja;
  return {
    ...funkcja,
    nazwa: lokalizacja.nazwa,
    opis: lokalizacja.opis,
    zastosowania: lokalizacja.zastosowania,
    daneWejsciowe: lokalizacja.daneWejsciowe,
    modelKarty: lokalizacja.modelKarty,
  };
}
