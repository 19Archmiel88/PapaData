import type { IntegracjaKatalogu } from "../integracje/katalogIntegracji";
import type { SzczegolyFunkcji } from "./ModalSzczegolowFunkcji";
import type { PropsModala } from "../../context/modal-context";

type TrybAuth = "logowanie" | "rejestracja";
type PotwierdzeniePolaczenia = (integracja: IntegracjaKatalogu) => Promise<void> | void;
type WyborIntegracji = (integracja: IntegracjaKatalogu) => void;

function czyObiekt(wartosc: unknown): wartosc is Record<string, unknown> {
  return typeof wartosc === "object" && wartosc !== null;
}

function czyFunkcja(wartosc: unknown): wartosc is (...args: unknown[]) => unknown {
  return typeof wartosc === "function";
}

function czyIntegracjaKatalogu(wartosc: unknown): wartosc is IntegracjaKatalogu {
  if (!czyObiekt(wartosc)) return false;
  return (
    typeof wartosc.id === "string" &&
    typeof wartosc.nazwa === "string" &&
    typeof wartosc.opis === "string" &&
    typeof wartosc.kategoria === "string" &&
    typeof wartosc.typAutoryzacji === "string" &&
    typeof wartosc.status === "string"
  );
}

function czySzczegolyFunkcji(wartosc: unknown): wartosc is SzczegolyFunkcji {
  if (!czyObiekt(wartosc)) return false;
  return (
    typeof wartosc.nazwa === "string" &&
    typeof wartosc.opis === "string" &&
    typeof wartosc.daneWejsciowe === "string" &&
    Array.isArray(wartosc.zastosowania)
  );
}

export function pobierzTrybAuth(props: PropsModala): TrybAuth {
  if (!czyObiekt(props)) return "logowanie";
  return props.startowyTryb === "rejestracja" ? "rejestracja" : "logowanie";
}

export function pobierzOnPrimaryDemo(props: PropsModala): (() => void) | null {
  if (!czyObiekt(props)) return null;
  const kandydat = props.onPrimary;
  return czyFunkcja(kandydat) ? (kandydat as () => void) : null;
}

export function pobierzKontekstWkrotce(props: PropsModala): string | undefined {
  if (!czyObiekt(props)) return undefined;
  return typeof props.kontekst === "string" ? props.kontekst : undefined;
}

export function pobierzIntegracjeDoPolaczenia(props: PropsModala): IntegracjaKatalogu | null {
  if (!czyObiekt(props)) return null;
  return czyIntegracjaKatalogu(props.integracja) ? props.integracja : null;
}

export function pobierzOnPotwierdzPolaczenie(props: PropsModala): PotwierdzeniePolaczenia | null {
  if (!czyObiekt(props)) return null;
  const kandydat = props.onPotwierdzPolaczenie;
  return czyFunkcja(kandydat) ? (kandydat as PotwierdzeniePolaczenia) : null;
}

export function pobierzOnWybierzIntegracje(props: PropsModala): WyborIntegracji | null {
  if (!czyObiekt(props)) return null;
  const kandydat = props.onWybierzIntegracje;
  return czyFunkcja(kandydat) ? (kandydat as WyborIntegracji) : null;
}

export function pobierzFunkcjeRaportu(props: PropsModala): SzczegolyFunkcji | null {
  if (!czyObiekt(props)) return null;
  return czySzczegolyFunkcji(props.funkcja) ? props.funkcja : null;
}
