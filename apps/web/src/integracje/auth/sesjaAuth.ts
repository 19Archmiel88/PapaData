import type { DaneSesjiAuth } from "../../kontrakty/Auth";
import { safeLocalStorage } from "../../utils/safeLocalStorage";

const KLUCZE = {
  token: "papadata_auth_token",
  userId: "papadata_user_id",
  role: "papadata_user_roles",
  zrodlo: "papadata_auth_source",
  wygasaUtc: "papadata_auth_expires_utc",
} as const;

export type SesjaAuth = DaneSesjiAuth;

export function zapiszSesje(sesja: SesjaAuth) {
  safeLocalStorage.setItem(KLUCZE.token, sesja.token);
  safeLocalStorage.setItem(KLUCZE.userId, sesja.userId);
  safeLocalStorage.setItem(KLUCZE.role, JSON.stringify(sesja.role ?? []));
  safeLocalStorage.setItem(KLUCZE.zrodlo, sesja.zrodlo);
  if (sesja.wygasaUtc) {
    safeLocalStorage.setItem(KLUCZE.wygasaUtc, sesja.wygasaUtc);
  } else {
    safeLocalStorage.removeItem(KLUCZE.wygasaUtc);
  }
}

export function pobierzSesje(): SesjaAuth | null {
  const token = safeLocalStorage.getItem(KLUCZE.token);
  const userId = safeLocalStorage.getItem(KLUCZE.userId);
  if (!token || !userId) return null;

  const roleRaw = safeLocalStorage.getItem(KLUCZE.role);
  const zrodloRaw = safeLocalStorage.getItem(KLUCZE.zrodlo);
  const wygasaUtc = safeLocalStorage.getItem(KLUCZE.wygasaUtc);

  let role: string[] = [];
  try {
    const parsed = roleRaw ? JSON.parse(roleRaw) : [];
    role = Array.isArray(parsed) ? parsed.filter((element) => typeof element === "string") : [];
  } catch {
    role = [];
  }

  const zrodlo = zrodloRaw === "google" || zrodloRaw === "microsoft" ? zrodloRaw : "email_haslo";

  return {
    token,
    userId,
    role,
    zrodlo,
    wygasaUtc,
  };
}

export function wyczyscSesje() {
  safeLocalStorage.removeItem(KLUCZE.token);
  safeLocalStorage.removeItem(KLUCZE.userId);
  safeLocalStorage.removeItem(KLUCZE.role);
  safeLocalStorage.removeItem(KLUCZE.zrodlo);
  safeLocalStorage.removeItem(KLUCZE.wygasaUtc);
}
