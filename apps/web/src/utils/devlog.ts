export type PoziomDevLogu = "info" | "warn" | "error";

type SzczegolyDevLogu = {
  poziom: PoziomDevLogu;
  komunikat: string;
  dodatkowe?: unknown;
};

export function devLog(poziom: PoziomDevLogu, komunikat: string, dodatkowe?: unknown) {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;

  const szczegoly: SzczegolyDevLogu = { poziom, komunikat, dodatkowe };
  window.dispatchEvent(new CustomEvent("papadata:devlog", { detail: szczegoly }));
}

export default devLog;
