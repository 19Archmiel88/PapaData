import test from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { RouterDashboard } from "../Moduly/Dashboard/RouterDashboard.js";
import { RouterPlatform } from "../Moduly/Platform/RouterPlatform.js";

async function utworzAplikacjeTestowa() {
  const app = Fastify();
  await app.register(RouterDashboard);
  await app.register(RouterPlatform);
  return app;
}

test("TENANT flow: meta + reports + settings role gates", async () => {
  const app = await utworzAplikacjeTestowa();

  const metaWrite = await app.inject({ method: "GET", url: "/dashboard/meta?tenantId=tenant-owner" });
  assert.equal(metaWrite.statusCode, 200);
  const metaWriteJson = metaWrite.json();
  assert.equal(metaWriteJson.mode, "TENANT");
  assert.equal(metaWriteJson.capabilities.canWriteActions, true);

  const metaReadOnly = await app.inject({ method: "GET", url: "/dashboard/meta?tenantId=tenant-viewer" });
  assert.equal(metaReadOnly.statusCode, 200);
  const metaReadOnlyJson = metaReadOnly.json();
  assert.equal(metaReadOnlyJson.capabilities.canWriteActions, false);

  const patchReadOnly = await app.inject({
    method: "PATCH",
    url: "/dashboard/settings/org",
    payload: { tenantId: "tenant-viewer", policies: [{ key: "mfa_required", enabled: false }] },
  });
  assert.equal(patchReadOnly.statusCode, 403);

  const patchWrite = await app.inject({
    method: "PATCH",
    url: "/dashboard/settings/org",
    payload: { tenantId: "tenant-owner", policies: [{ key: "mfa_required", enabled: false }] },
  });
  assert.equal(patchWrite.statusCode, 200);
  const patchWriteJson = patchWrite.json();
  const policy = patchWriteJson.policies.find((item: { key: string }) => item.key === "mfa_required");
  assert.equal(policy.enabled, false);

  const requestReport = await app.inject({
    method: "POST",
    url: "/dashboard/reports/request",
    payload: { tenantId: "tenant-owner", type: "weekly" },
  });
  assert.equal(requestReport.statusCode, 200);
  const requestReportJson = requestReport.json();
  assert.ok(requestReportJson.id);

  const reports = await app.inject({ method: "GET", url: "/dashboard/reports?tenantId=tenant-owner" });
  assert.equal(reports.statusCode, 200);
  const reportsJson = reports.json();
  assert.ok(Array.isArray(reportsJson.reports));
  assert.equal(reportsJson.canRequest, true);

  await app.close();
});

test("Platform flow: billing + integration + observability", async () => {
  const app = await utworzAplikacjeTestowa();

  const checkout = await app.inject({
    method: "POST",
    url: "/platnosci/checkout",
    payload: { plan: "Professional", okres: "rocznie", successUrl: "https://app.papadata.pl/success" },
  });
  assert.equal(checkout.statusCode, 200);
  const checkoutJson = checkout.json();
  assert.ok(checkoutJson.sessionId);

  const callback = await app.inject({ method: "GET", url: "/integracje/callback/woocommerce" });
  assert.equal(callback.statusCode, 200);
  assert.equal(callback.json().ok, true);

  const obs = await app.inject({
    method: "POST",
    url: "/observability/events",
    payload: { events: [{ type: "page_view" }, { type: "cta_click" }] },
  });
  assert.equal(obs.statusCode, 200);
  assert.equal(obs.json().received, 2);

  await app.close();
});
