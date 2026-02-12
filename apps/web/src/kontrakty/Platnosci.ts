export type PlanPlatnosci = "Starter" | "Professional" | "Enterprise";
export type OkresRozliczeniowy = "miesiecznie" | "rocznie";

export type UtworzCheckoutWejscie = {
  plan: PlanPlatnosci;
  okres: OkresRozliczeniowy;
  successUrl: string;
  cancelUrl: string;
};

export type UtworzCheckoutWynik = {
  checkoutUrl: string;
  sessionId: string;
};

export type StatusSubskrypcji = "trial" | "active" | "past_due" | "canceled" | "incomplete";

export type DaneSubskrypcji = {
  plan: PlanPlatnosci;
  status: StatusSubskrypcji;
  koniecTrialaUtc?: string | null;
  koniecOkresuUtc?: string | null;
};

export type OtworzPortalKlientaWejscie = {
  returnUrl: string;
};

export type OtworzPortalKlientaWynik = {
  urlPortalu: string;
};

export interface KontraktPlatnosci {
  utworzCheckout: (wejscie: UtworzCheckoutWejscie) => Promise<UtworzCheckoutWynik>;
  pobierzSubskrypcje: () => Promise<DaneSubskrypcji>;
  anulujSubskrypcje: () => Promise<void>;
  otworzPortalKlienta: (
    wejscie: OtworzPortalKlientaWejscie
  ) => Promise<OtworzPortalKlientaWynik>;
}
