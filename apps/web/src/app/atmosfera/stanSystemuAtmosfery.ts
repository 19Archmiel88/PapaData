export type StanSystemuAtmosfery =
  | "brak_danych"
  | "ladowanie"
  | "przetwarzanie"
  | "gotowe"
  | "blad"
  | "brak_integracji";

type BackendStatus = "ladowanie" | "ok" | "blad";
type AktywnoscGuardiana = "bezczynny" | "przetwarzanie";

export type WejscieStanuAtmosfery = {
  backendStatus: BackendStatus;
  aktywnoscGuardiana: AktywnoscGuardiana;
  maSesje: boolean;
  maIntegracje: boolean;
};

/**
 * odpowiada za priorytetyzacje stanu systemu
 * - bledy i ladowanie sa wazniejsze od pozostalych sygnalow
 * - przetwarzanie Guardiana podbija intensywnosc tla
 * - brak integracji jest sygnalem "ciszy operacyjnej"
 */
export function wyliczStanSystemuAtmosfery({
  backendStatus,
  aktywnoscGuardiana,
  maSesje,
  maIntegracje,
}: WejscieStanuAtmosfery): StanSystemuAtmosfery {
  if (backendStatus === "blad") return "blad";
  if (backendStatus === "ladowanie") return "ladowanie";
  if (aktywnoscGuardiana === "przetwarzanie") return "przetwarzanie";
  if (maSesje && !maIntegracje) return "brak_integracji";
  if (!maSesje) return "brak_danych";
  return "gotowe";
}

const KLUCZ_INTEGRACJI = "papadata_integracje_podlaczone";

/**
 * odpowiada za odczyt sygnalu integracji z localStorage
 * - warstwa integracji backend/frontend nadpisze ten klucz po rzeczywistym podlaczeniu
 */
export function pobierzCzySaIntegracje(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KLUCZ_INTEGRACJI) === "true";
}

