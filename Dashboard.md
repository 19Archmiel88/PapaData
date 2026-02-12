# Dashboard Runtime PapaData (DEMO + TENANT)

## Status dokumentu
- Data aktualizacji: 2026-02-11
- Typ dokumentu: docelowa specyfikacja projektowo-architektoniczno-wdrozeniowa
- Zakres: Dashboard Runtime jako core produktu (landing DEMO + aplikacja TENANT)

## Status realizacji (aktualny na 2026-02-11)

### Zrealizowane
- P0.1 Fundament danych:
  - dodany kontrakt `DashboardApi`
  - dodany `DashboardDataProvider` + `useDashboardApi()`
  - dodane adaptery `demoAdapter` i `tenantAdapter`
- P0.2 Shell runtime:
  - wdrozona sekcja runtime dashboardu w dedykowanym widoku `/dashboard` (poza landingiem)
  - jeden UI dla `DEMO` i `TENANT` (przelaczanie adapterem)
  - topbar przebudowany pod model enterprise:
    - logo klienta zamiast naglowka "Papa Guardian - DEMO/TENANT"
    - menu konta (ustawienia org/workspace, integracje, wyloguj)
    - przelacznik trybu jasny/ciemny
    - statusy runtime: swiezosc danych, readiness, role/access, online/offline
  - sidebar przebudowany pod czytelna nawigacje:
    - grupowanie sekcji: Operacyjne / Analityka / Ustawienia
    - pin/unpin z auto-rozwijaniem na hover przy odpieciu
    - stale "Wyloguj" w stopce sidebara
- P0.3 Stany globalne:
  - stany `loading/empty/error/offline` wdrozone w runtime sekcji
- P0.4 Core sekcje:
  - wdrozone: `Overview`, `Alerts`, `Guardian`, `Integracje`, `P&L`
- P1.1 Sekcje operacyjne:
  - wdrozone: `Ads`, `Products`, `Customers`, `Pipeline`
  - kontrakt API i adaptery rozszerzone o metody dla tych sekcji
- P1.2 Sekcje runtime i kontrakty:
  - wdrozone: `Reports`, `Analytics`, `Knowledge`
  - kontrakt API + adaptery DEMO/TENANT rozszerzone o metody:
    - `getReportsView`
    - `getAnalyticsView`
    - `getKnowledgeView`
- P1.3 Ustawienia i access-control:
  - wdrozone: `Settings Org`, `Settings Workspace`
  - access-control role/read-only/write wdrozony w runtime oraz endpointach backendu
- Backend TENANT:
  - wystawiony komplet endpointow dashboardu:
    - `/dashboard/ads`, `/dashboard/products`, `/dashboard/customers`, `/dashboard/pipeline`
    - plus caly zestaw endpointow core (`meta`, `overview`, `alerts`, `integrations`, `pandl`, `reports`, `guardian/chat`, `analytics`, `knowledge`, `settings`)
- P2 (etap po routerze i endpointach):
  - dodane endpointy platformowe: billing, callbacki, observability
  - dodane testy E2E API flow DEMO->TENANT (`apps/api/src/e2e/DemoTenantFlow.e2e.test.ts`)
- Optymalizacja bundla:
  - lazy-load sekcji runtime (`React.lazy` + `Suspense`)
  - `manualChunks` w Vite (`vendor-react`, `vendor-firebase`, `vendor`)
  - usuniety warning o nadmiernym rozmiarze glownego chunka
- Walidacja techniczna:
  - `pnpm -C apps/web lint` - OK
  - `pnpm -C apps/web build` - OK

### W toku / otwarte
- P2.2 pelne podpienie frontend routerow TENANT do nowych endpointow billing/integracje/callback/observability
- P2.3 testy end-to-end DEMO -> TENANT na poziomie przegladarki (Playwright) po stronie `apps/web`
- P2.4 przejscie z danych przykładowych backendu na finalne zasilanie produkcyjne

## Założenia nienegocjowalne
- Dashboard jest jednym modułem runtime, a nie osobną biblioteką UI.
- Ten sam UI działa w dwóch trybach: `DEMO` i `TENANT`.
- Przełączanie trybu realizuje warstwa adaptera danych, nie warstwa komponentów.
- Widoki dashboardu nie importują bezpośrednio `data/*` i nie wykonują bezpośrednich `fetch`.
- Mocki istnieją wyłącznie w `demoAdapter` i `demoFixtures`.
- W trybie `TENANT` nie ma żadnych fallbacków demo.
- Każdy widok ma stany: `loading`, `empty`, `error`, `offline`, `no-integration`.
- Brak `console.*`, `window.prompt`, `TODO/FIXME` w warstwie UI produkcyjnego dashboardu.

## Architektura runtime

### Warstwa UI
- Jeden zestaw widoków i prymitywów dashboardu.
- Wspólne komponenty: karty KPI, wykresy, tabele, listy alertów, banery gotowości danych, panele akcji.
- Brak logiki źródeł danych w komponentach wizualnych.

### Warstwa danych
- `DashboardDataProvider` wybiera adapter na podstawie trybu:
  - `mode=DEMO` -> `demoAdapter`
  - `mode=TENANT` -> `tenantAdapter`
- Dostęp do danych wyłącznie przez `useDashboardApi()`.

### Minimalny kontrakt API (MUST-HAVE)
- `getMeta()`
- `getDataReadiness()`
- `getOverview(range)`
- `getAlerts(range)`
- `getAlertDetails(id)`
- `getAdsView(range)`
- `getProductsView(range)`
- `getCustomersView(range)`
- `getPipelineView()`
- `getIntegrations()`
- `startIntegrationConnect(key)` (TENANT write-action)
- `getPandL(range)`
- `getReports()`
- `requestReport(type)` (TENANT write-action)
- `guardianChatSend(input)`
- `guardianChatGetThread(threadId)`

---

## Część 1 - Kompletny layout systemu

### 1.1 Layout desktop

#### Topbar
- Rola: globalna orientacja, kontekst trybu, szybkie akcje użytkownika.
- Zawartość:
  - logo klienta (branding runtime) + nazwa organizacji/workspace
  - statusy runtime: freshness, readiness, access role, online/offline
  - akcje globalne: menu konta, wylogowanie, przełącznik motywu jasny/ciemny
  - menu konta: "Settings Org", "Settings Workspace", "Integracje", "Wyloguj"
- Stany:
  - loading skeleton
  - degraded/offline badge
  - read-only badge (np. brak uprawnień)
- Zachowanie:
  - sticky na scrollu
  - dropdown konta zamykany ESC i kliknieciem poza obszarem
  - pelna obsluga klawiatury

#### Sidebar
- Rola: nawigacja po sekcjach biznesowych dashboardu.
- Zawartość:
  - grupy sekcji: Operacyjne, Analityka, Ustawienia
  - wskaźnik aktywnej sekcji
  - stale akcje dolne: "Wyloguj", informacje o koncie/trybie
- Stany:
  - collapsed / expanded
  - loading (jeśli konfiguracja menu zależna od roli)
  - disabled item (brak dostępu lub brak integracji)
- Zachowanie:
  - pin/unpin sidebara
  - auto-rozwijanie na hover, gdy sidebar jest odpiety
  - tooltipy/etykiety w trybie collapsed

#### Content area
- Rola: główny obszar pracy analitycznej.
- Zawartość:
  - nagłówek widoku (tytuł, opis, akcje)
  - sekcje danych (karty KPI, wykresy, listy)
  - panel insightów i rekomendacji
- Stany:
  - loading (skeleton per widget)
  - empty (brak danych)
  - error (komunikat + retry)
  - offline (dane cache + znacznik nieaktualności)
- Zachowanie:
  - responsywna siatka 12 kolumn
  - sekcje reflow bez nakładania komponentów
  - zachowanie wysokości kart dla stabilności odczytu

#### Right rail (kontekstowy)
- Rola: pomoc kontekstowa i akcje wspierające decyzję.
- Zawartość:
  - skrót Papa Guardian
  - kontekstowy Papa AI chat
  - checklista gotowości danych
- Stany:
  - docked / hidden
  - minimized
  - notification dot dla nowych insightów
- Zachowanie:
  - pozostaje w kontekście aktywnej sekcji
  - dostępny skrótem klawiaturowym

### 1.2 Layout mobile

#### Górny pasek mobile
- Rola: szybki dostęp do zakresu danych i kluczowych akcji.
- Zawartość: hamburger, tytuł sekcji, zakres dat, avatar.
- Stany: compact, loading, offline.

#### Nawigacja mobile
- Model:
  - sidebar jako drawer z focus trap
  - opcjonalny bottom nav dla 4-5 najczęstszych sekcji
- Zachowanie:
  - pełna dostępność klawiaturowa i czytnikowa
  - zamykanie ESC i kliknięciem overlay
  - brak utraty kontekstu po zamknięciu

#### Content mobile
- Jedna kolumna z priorytetem informacji:
  - KPI -> alerty -> wykresy -> listy
- Wykresy:
  - uproszczone osie i skrócone legendy
  - przełączenie na tabelę, gdy wykres jest nieczytelny

### 1.3 Zachowanie w DEMO (landing)
- Dashboard działa jako preview runtime:
  - może być overlay/fullscreen
  - zawiera realistyczne dane przykładowej firmy
- Akcje write:
  - symulowane
  - kończą się CTA do rejestracji
- Topbar i sidebar:
  - pokazują badge DEMO
  - podkreślają zakres „na danych demonstracyjnych”

### 1.4 Zachowanie w TENANT (po loginie)
- Ten sam layout i komponenty.
- Źródłem danych jest wyłącznie `tenantAdapter`.
- Brak badge DEMO, pojawia się nazwa workspace.
- Akcje write są realne (integracje, raporty, ustawienia).
- Jeśli integracje niepodłączone:
  - dashboard pokazuje onboarding readiness, bez mocków.

---

## Część 2 - Sidebar (bardzo szczegółowo)

### 2.1 Overview
- Cel biznesowy: szybki dzienny obraz kondycji biznesu.
- Dane: KPI, highlights, data freshness.
- Akcje: zmiana zakresu dat, drill-down do alertów.
- Stany: loading, empty, error, offline.
- DEMO vs TENANT:
  - DEMO: przykładowe KPI i insighty.
  - TENANT: KPI klienta i realne trendy.

### 2.2 Alerts
- Cel biznesowy: kolejka priorytetów do działania.
- Dane: alert feed, priorytet, obszar, metryka, czas.
- Akcje: otwarcie detalu, oznaczenie jako done/snooze (TENANT).
- Stany: loading, empty (brak alertów), error.
- DEMO vs TENANT:
  - DEMO: akcje edukacyjne/symulowane.
  - TENANT: akcje operacyjne zapisują status.

### 2.3 Guardian
- Cel biznesowy: decyzje wspierane analizą przyczyn i symulacją.
- Dane: analizy, rekomendacje, confidence, impact.
- Akcje: otwarcie scenariusza, porównanie symulacji, przekazanie zadania.
- Stany: loading, no-data (brak integracji), error.
- DEMO vs TENANT:
  - DEMO: scenariusze demonstracyjne.
  - TENANT: scenariusze na danych klienta.

### 2.4 Ads
- Cel biznesowy: kontrola efektywności budżetu reklam.
- Dane: ROAS, CPA, spend, revenue by channel.
- Akcje: filtrowanie kampanii, przejście do rekomendacji budżetu.
- Stany: no-integration, loading, empty, error.
- DEMO vs TENANT:
  - DEMO: modelowe kampanie.
  - TENANT: realne konta reklamowe.

### 2.5 Products
- Cel biznesowy: decyzje asortymentowe i marżowe.
- Dane: top/worst produkty, marża, stock risk, velocity.
- Akcje: filtrowanie po kategorii, drill-down produktu.
- Stany: loading, empty, error, stale.
- DEMO vs TENANT:
  - DEMO: przykładowy katalog.
  - TENANT: produkty klienta.

### 2.6 Customers
- Cel biznesowy: monitorowanie jakości i wartości bazy klientów.
- Dane: LTV, cohorty, retencja, segmenty.
- Akcje: segment drill-down, eksport listy (TENANT).
- Stany: loading, empty, error.
- DEMO vs TENANT:
  - DEMO: syntetyczne cohorty.
  - TENANT: realna historia zakupów.

### 2.7 P&L
- Cel biznesowy: kontrola rentowności i marży.
- Dane: revenue, COGS, ads cost, gross/net profit, margin.
- Akcje: zmiana zakresu, analiza kanałów, eksport.
- Stany: loading, no-costs-data, error.
- DEMO vs TENANT:
  - DEMO: przykładowy model finansowy.
  - TENANT: realne koszty i przychody.

### 2.8 Pipeline
- Cel biznesowy: śledzenie działań i ich statusu wykonania.
- Dane: tasks, owner, due date, priority.
- Akcje: create/update task (TENANT), przypięcie alertu.
- Stany: loading, empty, error.
- DEMO vs TENANT:
  - DEMO: read-only showcase.
  - TENANT: pełna operacyjność.

### 2.9 Integrations
- Cel biznesowy: podłączenie źródeł danych.
- Dane: status konektorów, last sync, health.
- Akcje: connect/reconnect, test sync.
- Stany: loading, missing, error.
- DEMO vs TENANT:
  - DEMO: listowanie i symulowane flow.
  - TENANT: realny OAuth/klucze.

### 2.10 Reports
- Cel biznesowy: dystrybucja raportów do zespołu.
- Dane: lista raportów, format, data.
- Akcje: preview, download, request new report.
- Stany: loading, empty, error.
- DEMO vs TENANT:
  - DEMO: predefiniowane raporty.
  - TENANT: raporty generowane z danych klienta.

### 2.11 Analytics
- Cel biznesowy: analiza trendów i anomalii.
- Dane: time-series KPI, channel split, anomaly markers.
- Akcje: zakres dat, porównanie okresów.
- Stany: loading, empty, error.
- DEMO vs TENANT:
  - DEMO: reprezentatywne trendy.
  - TENANT: faktyczne trendy klienta.

### 2.12 Knowledge
- Cel biznesowy: baza wiedzy i playbook działań.
- Dane: artykuły, procedury, checklisty.
- Akcje: wyszukiwanie, filtrowanie, zapis do ulubionych.
- Stany: loading, empty, error.
- DEMO vs TENANT:
  - DEMO: publiczny zestaw wiedzy.
  - TENANT: rozszerzenia per plan/rola.

### 2.13 Settings Org
- Cel biznesowy: konfiguracja organizacji i uprawnień.
- Dane: członkowie, role, polityki.
- Akcje: invite, role change, policy update.
- Stany: loading, empty, error, forbidden.
- DEMO vs TENANT:
  - DEMO: read-only preview.
  - TENANT: realne zmiany.

### 2.14 Settings Workspace
- Cel biznesowy: ustawienia workspace i preferencji.
- Dane: profile, notyfikacje, timezone, jednostki.
- Akcje: update settings.
- Stany: loading, error, saved.
- DEMO vs TENANT:
  - DEMO: read-only.
  - TENANT: pełna edycja.

---

## Część 3 - Dokładny opis każdej sekcji

### 3.1 Overview
- Struktura layoutu:
  - rząd KPI (4-6 kart)
  - sekcja highlights (top 3 priorytety)
  - trend line i porównanie okresów
- Komponenty:
  - `KartaKpi`, `ListaHighlights`, `WykresTrendow`, `BadgeSwiezosci`
- Kolejność:
  - KPI -> highlights -> trend -> quick actions
- Metryki:
  - revenue, marża, ROAS, conversion rate, AOV
- Interakcje:
  - zakres dat
  - drill-down z KPI do odpowiedniej sekcji
- Papa Guardian:
  - generuje priorytet dnia i zalecenie pierwszej akcji
- Papa AI chat:
  - starter prompts typu "Dlaczego marża spadła w tym tygodniu?"
- Edge-case:
  - brak danych -> checklista integracji + jasny komunikat bez mock fallback

### 3.2 Alerts
- Struktura:
  - filtr priorytetu
  - lista alertów
  - panel detalu (modal/split pane)
- Komponenty:
  - `ListaAlertow`, `KartaPriorytetu`, `ModalSzczegolyAlertu`
- Metryki:
  - impact PLN, confidence, czas wykrycia
- Interakcje:
  - sortowanie, filtrowanie, oznaczanie statusu
- Papa Guardian:
  - detale: fakty -> przyczyny -> rekomendacje -> symulacja
- Papa AI chat:
  - dopytanie o ryzyko i scenariusze alternatywne
- Edge-case:
  - duża liczba alertów -> paginacja/virtualizacja

### 3.3 Guardian
- Struktura:
  - lista rekomendacji
  - panel symulacji "z działaniem / bez działania"
  - panel ryzyk
- Komponenty:
  - `KartaRekomendacji`, `WykresSymulacji`, `TagConfidence`
- Metryki:
  - prognozowany impact, effort, risk score
- Interakcje:
  - porównanie scenariuszy 30/60/90 dni
- Papa Guardian:
  - centralna funkcja sekcji
- Papa AI chat:
  - uzasadnianie rekomendacji i generowanie planu wykonania
- Edge-case:
  - niska pewność modelu -> ostrzeżenie + rekomendacja walidacji

### 3.4 Ads
- Struktura:
  - KPI reklamowe
  - tabela kampanii
  - trendy kosztów/przychodów
- Komponenty:
  - `KartaAdsKpi`, `TabelaKampanii`, `WykresRoas`
- Metryki:
  - spend, ROAS, CPA, CTR, revenue attributed
- Interakcje:
  - filtrowanie kanałów i kampanii
- Papa Guardian:
  - rekomendacje alokacji budżetu
- Papa AI chat:
  - pytania o przyczynę spadku ROAS
- Edge-case:
  - brak integracji Ads -> no-integration CTA

### 3.5 Products
- Struktura:
  - top/worst performers
  - marża per kategoria
  - ryzyko stockout
- Komponenty:
  - `TabelaProduktow`, `WykresMarzy`, `BadgeRyzyka`
- Metryki:
  - unit margin, sell-through, stock coverage
- Interakcje:
  - filtrowanie kategorii, sortowanie po marży
- Papa Guardian:
  - rekomendacje cen/promocji/stock
- Papa AI chat:
  - "Które SKU wyłączyć z kampanii?"
- Edge-case:
  - brak kosztów COGS -> banner "uzupełnij koszty"

### 3.6 Customers
- Struktura:
  - KPI customer health
  - cohorty i retencja
  - segmenty klientów
- Komponenty:
  - `KartaLtv`, `WykresCohort`, `SegmentList`
- Metryki:
  - LTV, repeat rate, churn proxy
- Interakcje:
  - segment drill-down, porównania okresów
- Papa Guardian:
  - wskazanie segmentu o najwyższym potencjale
- Papa AI chat:
  - sugestie akcji retencyjnych
- Edge-case:
  - mały wolumen danych -> komunikat o ograniczonej wiarygodności

### 3.7 P&L
- Struktura:
  - karta wyniku netto
  - rozbicie kosztów
  - kanały rentowności
- Komponenty:
  - `KartaPandL`, `WykresKosztow`, `TabelaKanaly`
- Metryki:
  - gross profit, net profit, margin, COGS ratio
- Interakcje:
  - zakres 30/90 dni, eksport
- Papa Guardian:
  - alerty rentowności per kanał
- Papa AI chat:
  - "Co najbardziej obniża marżę netto?"
- Edge-case:
  - brak kosztów operacyjnych -> status "partial P&L"

### 3.8 Pipeline
- Struktura:
  - tablica działań
  - statusy i odpowiedzialni
- Komponenty:
  - `ListaZadan`, `TagStatusu`, `FiltryOwner`
- Metryki:
  - liczba otwartych, overdue, completion rate
- Interakcje:
  - przypisanie właściciela, zmiana statusu (TENANT)
- Papa Guardian:
  - proponuje zadania na podstawie alertów
- Papa AI chat:
  - generuje plan realizacji działań
- Edge-case:
  - brak uprawnień -> read-only z jasnym komunikatem

### 3.9 Integrations
- Struktura:
  - lista konektorów
  - status sync
  - panel akcji connect/reconnect
- Komponenty:
  - `KartaIntegracji`, `StatusSync`, `PrzyciskPolacz`
- Metryki:
  - connected count, error count, last sync age
- Interakcje:
  - rozpoczęcie flow integracji
- Papa Guardian:
  - wskazuje brakujące źródła blokujące insighty
- Papa AI chat:
  - tłumaczy wpływ każdej integracji na jakość rekomendacji
- Edge-case:
  - API timeout -> retry + obsługa rate limit

### 3.10 Reports
- Struktura:
  - lista raportów
  - status generowania
  - akcje preview/download
- Komponenty:
  - `ListaRaportow`, `StatusGeneracji`, `AkcjeRaportu`
- Metryki:
  - liczba raportów, czas generowania
- Interakcje:
  - request weekly/monthly (TENANT)
- Papa Guardian:
  - sugeruje raport przy krytycznym alertcie
- Papa AI chat:
  - tworzy podsumowanie raportu w języku biznesowym
- Edge-case:
  - brak uprawnień eksportu -> disable + wyjaśnienie

### 3.11 Analytics
- Struktura:
  - wykres główny trendu
  - porównania okresów
  - detektor anomalii
- Komponenty:
  - `WykresTrendow`, `PanelPorownan`, `ListaAnomalii`
- Metryki:
  - growth rate, volatility, anomaly count
- Interakcje:
  - select metric, compare previous period
- Papa Guardian:
  - automatyczne oznaczanie punktów krytycznych
- Papa AI chat:
  - interpretacja anomalii i wpływu na decyzje
- Edge-case:
  - bardzo duży zakres -> agregacja tygodniowa/miesięczna

### 3.12 Knowledge
- Struktura:
  - wyszukiwarka
  - lista playbooków
  - panel szczegółu
- Komponenty:
  - `WyszukiwarkaWiedzy`, `KartaPlaybook`, `SzczegolyPlaybooka`
- Metryki:
  - brak metryk finansowych, metryki użycia wiedzy
- Interakcje:
  - filtrowanie po roli/obszarze
- Papa Guardian:
  - rekomenduje playbook powiązany z alertem
- Papa AI chat:
  - odpowiada na pytania operacyjne na podstawie playbooka
- Edge-case:
  - brak wyników wyszukiwania -> sugestie zapytań

### 3.13 Settings Org
- Struktura:
  - członkowie
  - role i polityki dostępu
- Komponenty:
  - `TabelaUzytkownikow`, `SelectorRoli`, `Polityki`
- Metryki:
  - liczba aktywnych użytkowników, role coverage
- Interakcje:
  - invite, role change, deactivate user (TENANT)
- Papa Guardian:
  - brak bezpośredniej roli decyzyjnej, tylko status compliance
- Papa AI chat:
  - pomoc w wyborze modelu uprawnień
- Edge-case:
  - konflikty uprawnień -> jasny błąd i rollback UI

### 3.14 Settings Workspace
- Struktura:
  - preferencje konta i workspace
  - notyfikacje, strefa czasowa, waluta
- Komponenty:
  - `FormUstawien`, `PrzelacznikiNotyfikacji`, `SelectorWaluty`
- Metryki:
  - brak metryk finansowych
- Interakcje:
  - zapis ustawień (TENANT)
- Papa Guardian:
  - wpływ ustawień na prezentację rekomendacji
- Papa AI chat:
  - wskazówki konfiguracji
- Edge-case:
  - błąd zapisu -> retry + zachowanie zmian lokalnych

---

## Część 4 - DEMO vs TENANT (różnice sekcja po sekcji)

| Sekcja | DEMO - co widać | DEMO - klik akcji | TENANT - co się zmienia | Dane podmieniane na realne |
|---|---|---|---|---|
| Overview | KPI i highlights firmy referencyjnej | drill-down działa, write prowadzi do CTA trial | KPI klienta, realne trendy | overview, freshness, highlights |
| Alerts | przykładowe alerty i priorytety | otwarcie detalu + symulacja demo | status alertów i akcje operacyjne | alert feed, detail, simulation |
| Guardian | przykładowe rekomendacje | scenariusze edukacyjne | rekomendacje na danych klienta | recommendations, confidence, impact |
| Ads | modelowe kampanie i ROAS | filtrowanie lokalne | kampanie z realnych kanałów | spend, revenue, ROAS, CPA |
| Products | katalog demo i marże | drill-down demo | katalog i marże klienta | sku metrics, stock, margin |
| Customers | syntetyczne cohorty | segmentacja demo | cohorty i LTV klienta | retention, LTV, segments |
| P&L | modelowy P&L | eksport demo/report sample | realny wynik netto i kanały | revenue, costs, profit |
| Pipeline | lista przykładowych zadań | read-only / CTA rejestracji | realne zadania i statusy | tasks, owners, due dates |
| Integrations | statusy demonstracyjne | pseudo-flow connect | realny OAuth i sync | connector status, lastSync |
| Reports | predefiniowane raporty | download sample | generowanie i pobieranie raportów klienta | reports list, report jobs |
| Analytics | trendy referencyjne | filtry demo | realne analizy i anomalie | time-series i anomaly markers |
| Knowledge | ogólne playbooki | dostęp pełny demo | personalizacja wg roli/planu | knowledge feed i access scope |
| Settings Org | read-only podgląd | brak write | pełna administracja organizacją | users, roles, policies |
| Settings Workspace | read-only podgląd | brak write | realny zapis preferencji | settings i notifications |

---

## Część 5 - Luki techniczne do zamknięcia

### 5.0 Status luk po wdrozeniu P0 + P1.1
- Zamkniete:
  - kontrakt danych + provider + adaptery DEMO/TENANT
  - brak bezposrednich fetchy w nowej sekcji runtime
  - stany `loading/empty/error/offline` w sekcji runtime
  - podstawowy split bundla i lazy-load runtime
  - sekcje P1.2 (`Reports`, `Analytics`, `Knowledge`)
  - sekcje P1.3 (`Settings Org`, `Settings Workspace`, role read-only/write)
  - backendowe endpointy TENANT dla dashboard runtime
- Otwarte:
  - pelna migracja wszystkich historycznych widokow dashboardu do nowego runtime API
  - frontendowy router i scenariusze ekranowe dla billing/callback/observability (P2)
  - finalne dane produkcyjne zamiast zestawu referencyjnego w backendzie

### 5.1 Warstwa danych i adaptery
- Bezpośrednie importy `data/*` w widokach dashboardu.
- Brak pełnego `DashboardDataProvider` jako jedynego punktu wejścia.
- Konieczność spięcia metod kontraktu z `demoAdapter` i `tenantAdapter`.

### 5.2 Mocki i fallbacki
- Część mocków/fallbacków osadzona w widokach.
- Konieczne przeniesienie mocków do `demoFixtures`.

### 5.3 Production clean
- Wystąpienia `console.error` w widokach.
- Wystąpienia `window.prompt` w ustawieniach.
- Do zastąpienia: kontrolowanymi stanami UI i modalami.

### 5.4 Duplikacje komponentów
- Duplikowanie prymitywów (`DataReadinessBanner` vs wspólne dashboard primitives).
- Potrzebna konsolidacja do jednego źródła komponentów.

### 5.5 Nazewnictwo i struktura
- Niezgodność z docelowym standardem nazewnictwa PL.
- Potrzebna migracja nazw i porządkowanie katalogów.

### 5.6 A11y i stany
- Ujednolicenie focus ring, aria-label/aria-controls/aria-expanded.
- Ujednolicenie `loading/empty/error/offline/no-integration` we wszystkich sekcjach.

### 5.7 Zależności i wydajność
- Dopięcie zależności (np. motion/chart libs) zgodnie z finalnym UI.
- Optymalizacja renderu ciężkich widoków i wykresów (memoizacja, lazy load).

### 5.8 Offline i observability
- Spójna warstwa błędów sieciowych i retry.
- Integracja telemetry/observability dla krytycznych ścieżek.

---

## Część 6 - Flow użytkownika end-to-end

### Krok 1: Wejście na landing i DEMO dashboard
- Użytkownik widzi hero + runtime DEMO dashboard.
- W topbarze i/lub banerze informacja o trybie DEMO.
- Może eksplorować wszystkie kluczowe sekcje.

### Krok 2: Kliknięcie w analizę i insight
- Użytkownik otwiera alert/rekomendację.
- Widzi fakty, możliwe przyczyny i wpływ biznesowy.

### Krok 3: Papa Guardian modal
- Modal pokazuje:
  - analizę
  - rekomendacje
  - symulację "z działaniem / bez działania"
- Akcja końcowa prowadzi do CTA uruchomienia na własnych danych.

### Krok 4: CTA i rejestracja
- Użytkownik klika trial.
- Przechodzi przez auth.
- Otrzymuje workspace i uprawnienia startowe.

### Krok 5: Onboarding integracji
- Dashboard przełącza się na TENANT.
- DataReadiness pokazuje czego brakuje.
- Użytkownik łączy źródła danych przez realny flow.

### Krok 6: Pierwsza synchronizacja
- Status "sync in progress".
- Widoki pokazują loading/partial data bez fallbacku DEMO.

### Krok 7: Pierwsze realne insighty
- Po sync pojawiają się realne KPI i alerty klienta.
- Guardian i AI chat działają na rzeczywistych danych.
- Użytkownik przechodzi do wykonania pierwszej rekomendacji.

---

## Część 7 - Ostateczna wizja UX

### Wrażenie w DEMO
- "To jest gotowy produkt, a nie slajd sprzedażowy."
- Użytkownik rozumie wartość i sposób działania w mniej niż 3 minuty.

### Wrażenie po rejestracji
- "Nic nie uczę się od nowa, ten sam interfejs działa na moich danych."
- Płynne przejście z preview do operacyjnej pracy.

### Wrażenie po pierwszym insight
- "Dostałem konkretną decyzję z uzasadnieniem i wpływem finansowym."
- Narzędzie buduje zaufanie przez przejrzystość, nie przez marketing.

### Wrażenie po 30 dniach
- "Dashboard to codzienny pulpit decyzyjny, nie raport miesięczny."
- Wysoka przewidywalność działania, stabilność i czytelność.

---

## Roadmapa wdrożenia - podział na epiki i elementy UI (DEMO/TENANT)

## Założenia roadmapy
- Kolejność wdrożenia minimalizuje ryzyko regresji produkcji.
- Najpierw stabilizujemy kontrakt danych i stany globalne, potem skalujemy sekcje.
- Każdy epik ma osobny Definition of Done dla DEMO i TENANT.

### Epik P0.1 - Fundament danych i przełączanie trybów [ZREALIZOWANE]
- Cel: zamknąć warstwę adapterów i kontrakt API.
- Elementy UI:
  - wszystkie widoki dashboardu (pośrednio przez provider)
  - topbar badge mode/data freshness
- Zakres DEMO:
  - `demoAdapter` implementuje 100% kontraktu
  - mocki tylko w `demoFixtures`
- Zakres TENANT:
  - `tenantAdapter` + minimalny zestaw endpointów MVP
- DoD:
  - brak importów `data/*` w widokach
  - `useDashboardApi()` jedynym punktem dostępu

### Epik P0.2 - Shell, layout i nawigacja runtime [ZREALIZOWANE]
- Cel: stabilny layout desktop/mobile i spójna nawigacja.
- Elementy UI:
  - topbar (logo klienta, menu konta, przelacznik motywu, statusy runtime)
  - sidebar (grupy sekcji, pin/unpin, hover-expand, wyloguj w stopce)
  - content shell
  - right rail
- Zakres DEMO:
  - fullscreen preview z oznaczeniem trybu DEMO i read-only
- Zakres TENANT:
  - osadzenie jako główny widok po auth
- DoD:
  - brak nakładania elementów
  - topbar nie zawiera technicznego naglowka trybu; ma branding klienta i menu konta
  - sidebar ma dzialajacy tryb przypiety/odpiety i akcje wylogowania
  - pełna responsywność i a11y focus flow

### Epik P0.3 - Stany globalne i production clean [ZREALIZOWANE - zakres runtime]
- Cel: ujednolicenie stanów loading/empty/error/offline/no-integration.
- Elementy UI:
  - banery stanu danych
  - komponenty błędów i retry
  - fallback empty state
- Zakres DEMO:
  - stany pokazują brak write i CTA trial
- Zakres TENANT:
  - stany odzwierciedlają realne błędy backend/integracji
- DoD:
  - brak `console.*`, `prompt`, TODO/FIXME w UI

### Epik P0.4 - Core sekcje decyzyjne [ZREALIZOWANE]
- Cel: uruchomić najważniejsze sekcje biznesowe end-to-end.
- Elementy UI:
  - Overview
  - Alerts + AlertDetails modal
  - Guardian
  - Integrations
  - P&L
- Zakres DEMO:
  - pełne scenariusze demonstracyjne bez write
- Zakres TENANT:
  - realne dane i realne akcje
- DoD:
  - flow insight -> akcja działa w obu trybach

### Epik P1.1 - Sekcje operacyjne commerce [ZREALIZOWANE]
- Cel: rozbudować część operacyjną codziennej pracy.
- Elementy UI:
  - Ads
  - Products
  - Customers
  - Pipeline
- Zakres DEMO:
  - reprezentatywne dane branżowe
- Zakres TENANT:
  - dane klienta i zapisy działań (gdzie dotyczy)
- DoD:
  - każdy widok ma stabilne KPI + przynajmniej jedną akcję biznesową

### Epik P1.2 - Wiedza, raporty i warstwa wsparcia [ZREALIZOWANE]
- Cel: domknąć ścieżkę informacyjną i raportową.
- Elementy UI:
  - Reports
  - Analytics
  - Knowledge
  - right-rail Papa AI chat
- Zakres DEMO:
  - sample reports + edukacyjne playbooki
- Zakres TENANT:
  - generowanie raportów i personalizowana baza wiedzy
- DoD:
  - użytkownik może przejść od insightu do raportu i planu działania

### Epik P1.3 - Ustawienia i access control [ZREALIZOWANE]
- Cel: domknąć część administracyjną i role.
- Elementy UI:
  - Settings Org
  - Settings Workspace
  - access gates
- Zakres DEMO:
  - read-only preview i komunikacja korzyści planu
- Zakres TENANT:
  - pełne zarządzanie uprawnieniami i preferencjami
- DoD:
  - brak akcji administracyjnych realizowanych przez prompt; tylko kontrolowane modale/formy

### Epik P2.1 - Integracje rozszerzone i endpointy pełne [W TOKU]
- Warunek startu: gotowy router i komplet endpointów backendowych.
- Elementy UI:
  - Integrations advanced states
  - Billing/paywall flow
  - rozbudowane raportowanie
- Zakres DEMO:
  - symulacja ścieżek enterprise
- Zakres TENANT:
  - pełna operacyjność z billingiem i callbackami
- DoD:
  - zero blokad manualnych; wszystkie ścieżki API dostępne

### Epik P2.2 - Skalowanie jakości i performance enterprise [OTWARTE]
- Cel: przygotowanie pod większy wolumen klientów.
- Elementy UI:
  - ciężkie wykresy i tabele
  - telemetry dashboard
  - observability panel
- Zakres DEMO:
  - utrzymanie płynności preview
- Zakres TENANT:
  - stabilność przy dużych datasetach
- DoD:
  - spełnione budżety wydajności i stabilności

## Mapa epik -> elementy UI -> tryb DEMO/TENANT

| Epik | Elementy UI | DEMO | TENANT | Priorytet |
|---|---|---|---|---|
| P0.1 | provider, topbar mode badge | adapter fixtures | adapter endpointy MVP | Krytyczny |
| P0.2 | topbar klienta + menu konta, sidebar pin/unpin, shell, right rail | fullscreen preview | app shell po auth | Krytyczny |
| P0.3 | global states, error/empty/offline | CTA trial + read-only | retry i obsługa błędów backendu | Krytyczny |
| P0.4 | Overview, Alerts, Guardian, Integrations, P&L | pełna demonstracja wartości | realne insighty i akcje | Krytyczny |
| P1.1 | Ads, Products, Customers, Pipeline | dane referencyjne | dane operacyjne klienta | Wysoki |
| P1.2 | Reports, Analytics, Knowledge, AI rail | sample + edukacja | raporty i wiedza personalizowana | Wysoki |
| P1.3 | Settings Org, Settings Workspace | read-only | pełna administracja | Wysoki |
| P2.1 | billing/integracje rozszerzone | symulacja enterprise | pełny backend flow | Średni |
| P2.2 | performance/observability | płynne demo | skalowalny tenant runtime | Średni |

## Kryteria wejścia i wyjścia dla faz

### Wejście do P0
- Zatwierdzony kontrakt `DashboardApi`.
- Potwierdzona lista sekcji sidebaru i ról użytkownika.

### Wyjście z P0
- Core flow DEMO -> TENANT działa bez miksu danych.
- Najważniejsze sekcje decyzyjne produkcyjnie stabilne.

### Wyjście z P1
- Dashboard kompletny funkcjonalnie dla codziennej pracy zespołu klienta.
- Ustawienia i raportowanie bez luk UX/technicznych.

### Wyjście z P2
- Pełna gotowość enterprise: skala, billing, observability, odporność.

## Ryzyka wdrożenia i kontrola
- Ryzyko: mieszanie danych demo i tenant.
  - Kontrola: twarde rozdzielenie adapterów + testy integracyjne kontraktu.
- Ryzyko: regresje wizualne przy migracji sekcji.
  - Kontrola: snapshoty UI i scenariusze regresyjne.
- Ryzyko: opóźnienie backend endpointów.
  - Kontrola: uruchomienie P2 dopiero po gotowym routerze i API.

## Finalny cel wdrożenia
- Jeden spójny dashboard runtime, który:
  - przekonuje w DEMO,
  - działa operacyjnie w TENANT,
  - skaluje się do standardu enterprise bez przebudowy UI.

---

## Następne kroki (priorytet po aktualnym wdrożeniu)

### Krok 0 - Domkniecie shell runtime po ostatnich zmianach
- Dodac w kontrakcie backend pole logo klienta (`organization.logoUrl`) i podpiac je w topbarze zamiast fallbacku.
- Zapamietywac stan pin/unpin sidebara per user (localStorage + klucz userId).
- Rozszerzyc menu konta o profil i bezpieczniejsza obsluge wylogowania bez pelnego reloadu strony.

### Krok 1 - P2 routery frontendowe
- Podpiac widoki i trasy frontendowe do endpointow:
  - `/platnosci/*`
  - `/integracje/*`
  - `/integracje/callback/:provider`
  - `/observability/events`
- Potwierdzic obsluge sukces/anulowanie checkout i powroty callback.

### Krok 2 - P2 observability runtime
- Podpiac wysylke eventow runtime dashboardu do `/observability/events`.
- Dodac mapowanie zdarzen krytycznych:
  - bledy endpointow dashboardu
  - write-action denied (read-only)
  - kluczowe akcje (`requestReport`, `startIntegrationConnect`).

### Krok 3 - P2 testy E2E przegladarkowe
- Dolozyc testy Playwright dla pelnego flow:
  - DEMO -> CTA -> TENANT
  - read-only vs write dla `Settings Org/Workspace`
  - raporty i integracje po stronie UI.
- Utrzymac API E2E jako warstwe kontraktowa (`apps/api/src/e2e/DemoTenantFlow.e2e.test.ts`).
