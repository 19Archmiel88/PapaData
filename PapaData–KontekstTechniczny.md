# PapaData – Kontekst techniczny

## Frontend
- React + Vite
- TypeScript
- Tailwind
- Brak alert/console w UI

## Auth
- Firebase Auth
- Email / Google / Microsoft
- Token JWT z Firebase → wysyłany do backendu w Authorization: Bearer

## Backend
- API base URL: VITE_API_URL
- Autoryzacja: Bearer JWT
- Przykładowe endpointy:
  - POST /auth/session
  - GET /integrations
  - POST /payments/checkout

## Integracje
### WooCommerce
- OAuth / API Key
- Endpointy backendu:
  - GET /integrations/woocommerce/status
  - POST /integrations/woocommerce/connect

### Allegro
- OAuth
- Endpointy backendu:
  - POST /integrations/allegro/connect

## Płatności
- Stripe / Przelewy24 (do decyzji backendu)
- Frontend używa tylko:
  - POST /payments/checkout
