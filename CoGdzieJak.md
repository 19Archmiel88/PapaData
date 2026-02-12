# CoGdzieJak

## 1) Co to jest?
PapaData to monorepo (`pnpm workspace`) z:
- frontendem React/Vite (`apps/web`) dla landingu + dashboardu runtime,
- backendem Fastify (`apps/api`) z endpointami dashboardu, integracji i płatności,
- warstwą kontraktów/adaptacji (frontend) dla auth/integracji/płatności.

Projekt jest aktualnie mocno zorientowany na UI/UX landingu i dashboardu typu "enterprise".

## 2) Gdzie co jest?
- `apps/web/src/app/`:
  - główne widoki: landing, dashboard, płatności, integracje, observability,
  - sekcje landingu i runtime dashboardu.
- `apps/web/src/components/`:
  - komponenty UI, header, modale, branding.
- `apps/web/src/kontrakty/`:
  - kontrakty domenowe (`Auth`, `Integracje`, `Platnosci`).
- `apps/web/src/integracje/`:
  - adaptery auth/firebase, allegro, woocommerce, płatności.
- `apps/web/src/uslugi/api/`:
  - klient API, błędy, adaptery autoryzacji/platformy.
- `apps/api/src/Moduly/`:
  - `Dashboard`, `Platform`, `Auth` (routery backendowe).
- `apps/api/prisma/`:
  - schema Prisma + migracje.

## 3) Stack technologiczny
- Frontend: React 19, Vite 7, TypeScript, Tailwind, Firebase Auth.
- Backend: Fastify 5, TypeScript, Prisma 7, SQLite.
- Workspace: pnpm.

## 4) Wymagania lokalne
- Node.js 22+ (w repo używany był `v22.12.0`).
- pnpm (w `package.json` ustawione `pnpm@10.28.1`).
- Windows/macOS/Linux (instrukcje poniżej są neutralne, przykłady pod Windows).

## 5) Instalacja po pobraniu repo
1. Sklonuj repo i wejdź do katalogu:
```bash
git clone <URL_REPO>
cd PapaData.pl
```

2. Zainstaluj zależności:
```bash
pnpm install
```

3. (Opcjonalnie) Jeśli nie masz pnpm:
```bash
corepack enable
corepack prepare pnpm@10.28.1 --activate
```

## 6) Konfiguracja ENV

### 6.1 Frontend (`apps/web/.env.local`)
Minimalnie (opcjonalne, bo dev proxy działa bez `VITE_API_URL`):
```env
VITE_API_URL=http://127.0.0.1:3001
```

Dla logowania Firebase (wymagane do SSO i email/hasło po stronie Firebase):
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...   # opcjonalne
```

Dla consent/marketing (opcjonalne):
```env
VITE_GTM_ID=...
VITE_GA4_ID=...
VITE_GOOGLE_ADS_ID=...
VITE_META_PIXEL_ID=...
```

### 6.2 Backend (`apps/api/.env`)
Backend używa:
```env
PORT=3001
HOST=127.0.0.1
DATABASE_URL=file:./dev.db

SMTP_HOST=...
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...

KOD_TTL_MINUTY=10
MAX_PROB_KODU=5
```

Uwaga:
- endpointy dashboard/platform działają bez pełnego modułu auth,
- moduł auth/mail wymaga poprawnych zmiennych SMTP i bazy.

## 7) Uruchomienie lokalne

### 7.1 Backend API
```bash
pnpm api:dev
```
API słucha domyślnie na `http://127.0.0.1:3001`.

### 7.2 Frontend WEB
W drugim terminalu:
```bash
pnpm dev
```
Frontend domyślnie na `http://127.0.0.1:5173`.

### 7.3 Dev proxy
W `apps/web/vite.config.ts` jest proxy:
- `/api/*` -> `http://127.0.0.1:3001/*`.

## 8) Komendy robocze

### 8.1 Root
```bash
pnpm dev            # web dev
pnpm build          # web build
pnpm api:dev
pnpm api:build
pnpm api:start
```

### 8.2 Web
```bash
pnpm -C apps/web lint
pnpm -C apps/web build
pnpm -C apps/web preview
```

### 8.3 API
```bash
pnpm -C apps/api build
pnpm -C apps/api test:e2e
```

### 8.4 Prisma (API)
Generowanie klienta Prisma:
```bash
cd apps/api
node_modules/.bin/prisma.cmd generate
```

## 9) Najważniejsze ścieżki aplikacji
- `/` -> landing.
- `/dashboard` -> runtime dashboard.
- `/platnosci` -> widoki płatności.
- `/integracje` -> widoki integracji.
- `/integracje/callback/:provider` -> callback integracji.
- `/observability` -> strona observability.

## 10) Najważniejsze endpointy backendu

### 10.1 Core
- `GET /health`

### 10.2 Dashboard
- `GET /dashboard/meta`
- `GET /dashboard/data-readiness`
- `GET /dashboard/overview`
- `GET /dashboard/alerts`
- `GET /dashboard/alerts/:id`
- `GET /dashboard/ads`
- `GET /dashboard/products`
- `GET /dashboard/customers`
- `GET /dashboard/pipeline`
- `GET /dashboard/integrations`
- `POST /dashboard/integrations/:key/connect`
- `GET /dashboard/pandl`
- `GET /dashboard/reports`
- `POST /dashboard/reports/request`
- `GET /dashboard/analytics`
- `GET /dashboard/knowledge`
- `GET /dashboard/settings/org`
- `PATCH /dashboard/settings/org`
- `GET /dashboard/settings/workspace`
- `PATCH /dashboard/settings/workspace`
- `POST /dashboard/guardian/chat/send`
- `GET /dashboard/guardian/chat/thread/:threadId`

### 10.3 Platform
- `POST /platnosci/checkout`
- `GET /platnosci/subskrypcja`
- `POST /platnosci/subskrypcja/anuluj`
- `POST /platnosci/portal`
- `POST /platnosci/callback/webhook`
- `GET /integracje/callback/:provider`
- `GET /integracje/woocommerce/status`
- `POST /integracje/woocommerce/autoryzacja`
- `POST /integracje/woocommerce/synchronizacja`
- `DELETE /integracje/woocommerce/polaczenie`
- `GET /integracje/allegro/status`
- `POST /integracje/allegro/autoryzacja`
- `POST /integracje/allegro/synchronizacja`
- `DELETE /integracje/allegro/polaczenie`
- `POST /observability/events`

### 10.4 Auth (moduł istnieje w kodzie)
- `POST /rejestracja`
- `POST /ponow-wyslij-kod`
- `POST /weryfikacja-kodu`
- `POST /logowanie`

## 11) Co jest najważniejsze funkcjonalnie
- Landing i sekcje marketingowe (hero, raporty, kalkulator, integracje, cennik, FAQ).
- Dashboard runtime z widokami: overview/alerts/guardian/ads/integracje/analytics itd.
- Integracje platformowe i płatności (API kontraktowe + callbacki).
- Auth po stronie frontu przez Firebase (Google/Microsoft/email+hasło).

## 12) Szybki checklist po odpaleniu
1. `GET /health` zwraca `{ ok: true }`.
2. `/` ładuje landing.
3. `/dashboard` ładuje runtime dashboard.
4. W `apps/web` działa przełączanie motywu i języka.
5. Nie ma błędów w konsoli przeglądarki dla podstawowego flow.

## 13) Wynik sprawdzenia repo (stan na 2026-02-12)

### 13.1 Komendy jakości
- `pnpm -C apps/web lint` -> OK.
- `pnpm -C apps/web build` -> OK.
- `pnpm -C apps/api build` -> OK.
- `pnpm -C apps/api test:e2e` -> OK (2/2 testów przeszło).

### 13.2 Kontrola konfliktów i placeholderów
- Brak markerów konfliktów merge: `<<<<<<<`, `>>>>>>>`.
- Brak `TODO` i `FIXME` w `apps/`.

### 13.3 Git
- Repo jest w stanie `dirty` (wiele plików `M` i `??`), czyli są lokalne zmiany niezatwierdzone.
- Przed deployem warto:
  - uporządkować zmiany,
  - podzielić na logiczne commity,
  - zweryfikować finalny `git diff`.

### 13.4 Ryzyka wykryte podczas przeglądu
- `RouterAuth` istnieje, ale nie jest aktualnie zarejestrowany w `apps/api/src/Serwer.ts`.
- Front ma adapter `autoryzacjaApi` pod endpointy `/auth/*`, a API obecnie publikuje auth w ścieżkach typu `/logowanie`, `/rejestracja` (i sam router auth nie jest podpięty).
- Warto ujednolicić kontrakt auth front<->back przed produkcyjnym użyciem email/hasło.
- W `apps/api/package.json` widoczne są tylko podstawowe zależności (`fastify`, `@fastify/cors`), a kod API importuje też `zod`, `nodemailer`, `@prisma/client`, `@prisma/adapter-better-sqlite3`.
- Lokalnie build przeszedł (pakiety są obecne w `apps/api/node_modules`), ale dla czystego środowiska CI/CD warto jawnie dopisać te zależności do `apps/api/package.json`.
- `prisma migrate status/deploy` w tym środowisku zwraca `Schema engine error`, więc proces migracji wymaga dodatkowej diagnostyki przed automatyzacją deployu.


