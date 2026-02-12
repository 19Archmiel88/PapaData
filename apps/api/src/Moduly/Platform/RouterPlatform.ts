import type { FastifyPluginAsync } from "fastify";

function generujStan() {
  return `state-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type StatusPolaczenia = "niepolaczona" | "wymaga_autoryzacji" | "polaczona" | "synchronizacja" | "blad";

const statusIntegracji: Record<"woocommerce" | "allegro", StatusPolaczenia> = {
  woocommerce: "polaczona",
  allegro: "wymaga_autoryzacji",
};

export const RouterPlatform: FastifyPluginAsync = async (app) => {
  // odpowiada za billing checkout i stan subskrypcji
  app.post("/platnosci/checkout", async (req) => {
    const body = (req.body ?? {}) as { plan?: string; okres?: string; successUrl?: string };
    const sessionId = `sess-${Date.now()}`;
    return {
      checkoutUrl: `${body.successUrl ?? "https://app.papadata.pl/billing/success"}?session_id=${sessionId}`,
      sessionId,
    };
  });

  app.get("/platnosci/subskrypcja", async () => ({
    plan: "Professional",
    status: "active",
    koniecTrialaUtc: null,
    koniecOkresuUtc: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  app.post("/platnosci/subskrypcja/anuluj", async (_req, reply) => reply.code(204).send());
  app.post("/platnosci/portal", async (req) => {
    const body = (req.body ?? {}) as { returnUrl?: string };
    return { urlPortalu: body.returnUrl ?? "https://billing.papadata.pl/portal" };
  });

  // odpowiada za callbacki billing i integracji (P2)
  app.post("/platnosci/callback/webhook", async () => ({ ok: true }));
  app.get("/integracje/callback/:provider", async (req) => {
    const params = req.params as { provider: string };
    return { ok: true, provider: params.provider };
  });

  // odpowiada za endpointy integracji kontraktowych
  app.get("/integracje/woocommerce/status", async () => ({
    idIntegracji: "woocommerce",
    status: statusIntegracji.woocommerce,
    typAutoryzacji: "oauth2",
    ostatniaSynchronizacjaUtc: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    komunikat: null,
  }));
  app.post("/integracje/woocommerce/autoryzacja", async (req) => {
    const body = (req.body ?? {}) as { callbackUrl?: string };
    return {
      urlAutoryzacji: `${body.callbackUrl ?? "https://app.papadata.pl"}/integracje/callback/woocommerce?state=${generujStan()}`,
      stan: generujStan(),
      wygasaUtc: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
  });
  app.post("/integracje/woocommerce/synchronizacja", async () => ({ idZadania: `sync-wc-${Date.now()}`, status: "uruchomione" }));
  app.delete("/integracje/woocommerce/polaczenie", async (_req, reply) => {
    statusIntegracji.woocommerce = "niepolaczona";
    return reply.code(204).send();
  });

  app.get("/integracje/allegro/status", async () => ({
    idIntegracji: "allegro",
    status: statusIntegracji.allegro,
    typAutoryzacji: "oauth2",
    ostatniaSynchronizacjaUtc: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    komunikat: statusIntegracji.allegro === "wymaga_autoryzacji" ? "Wymagana ponowna autoryzacja." : null,
  }));
  app.post("/integracje/allegro/autoryzacja", async (req) => {
    const body = (req.body ?? {}) as { callbackUrl?: string };
    return {
      urlAutoryzacji: `${body.callbackUrl ?? "https://app.papadata.pl"}/integracje/callback/allegro?state=${generujStan()}`,
      stan: generujStan(),
      wygasaUtc: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
  });
  app.post("/integracje/allegro/synchronizacja", async () => ({ idZadania: `sync-allegro-${Date.now()}`, status: "w_kolejce" }));
  app.delete("/integracje/allegro/polaczenie", async (_req, reply) => {
    statusIntegracji.allegro = "niepolaczona";
    return reply.code(204).send();
  });

  // odpowiada za kolejkowanie eventow observability (P2)
  app.post("/observability/events", async (req) => {
    const body = (req.body ?? {}) as { events?: unknown[] };
    return { ok: true, received: Array.isArray(body.events) ? body.events.length : 1 };
  });
};

export default RouterPlatform;
