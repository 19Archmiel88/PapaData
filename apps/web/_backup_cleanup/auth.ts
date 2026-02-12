import {
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";
import {
  dostawcaGoogle,
  dostawcaMicrosoft,
  uwierzytelnianieFirebase,
} from "./firebase";

/* ============================================================================
   AUTH STORAGE (single source of truth)
   ============================================================================ */

const KLUCZE = {
  token: "papadata_auth_token",
  userId: "papadata_user_id",
  role: "papadata_user_roles",
} as const;

type SesjaAuth = {
  token: string;
  userId: string;
  role: string[];
};

/* ============================================================================
   STORAGE HELPERS (safe)
   ============================================================================ */

function storageAvailable(): boolean {
  try {
    const t = "__test__";
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

function zapiszSesje(credential: UserCredential, token: string): void {
  if (!storageAvailable()) return;

  const uid = credential.user?.uid;
  if (!uid || !token) return;

  const sesja: SesjaAuth = {
    token,
    userId: uid,
    role: [],
  };

  localStorage.setItem(KLUCZE.token, sesja.token);
  localStorage.setItem(KLUCZE.userId, sesja.userId);
  localStorage.setItem(KLUCZE.role, JSON.stringify(sesja.role));
}

export function pobierzSesje(): SesjaAuth | null {
  if (!storageAvailable()) return null;

  const token = localStorage.getItem(KLUCZE.token);
  const userId = localStorage.getItem(KLUCZE.userId);
  const roleRaw = localStorage.getItem(KLUCZE.role);

  if (!token || !userId) return null;

  try {
    const role = roleRaw ? (JSON.parse(roleRaw) as string[]) : [];
    return { token, userId, role };
  } catch {
    return { token, userId, role: [] };
  }
}

export function wyczyscSesje(): void {
  if (!storageAvailable()) return;

  localStorage.removeItem(KLUCZE.token);
  localStorage.removeItem(KLUCZE.userId);
  localStorage.removeItem(KLUCZE.role);
}

/* ============================================================================
   AUTH FLOWS (Firebase)
   ============================================================================ */

async function zakonczLogowanie(credential: UserCredential): Promise<void> {
  const user = credential.user;
  if (!user) {
    throw new Error("Brak użytkownika po stronie Firebase.");
  }

  const token = await user.getIdToken();
  zapiszSesje(credential, token);
}

// Google
export async function zalogujGoogle(): Promise<void> {
  try {
    const credential = await signInWithPopup(
      uwierzytelnianieFirebase,
      dostawcaGoogle
    );
    await zakonczLogowanie(credential);
  } catch {
    throw new Error("Logowanie przez Google nie powiodło się.");
  }
}

// Microsoft
export async function zalogujMicrosoft(): Promise<void> {
  try {
    const credential = await signInWithPopup(
      uwierzytelnianieFirebase,
      dostawcaMicrosoft
    );
    await zakonczLogowanie(credential);
  } catch {
    throw new Error("Logowanie przez Microsoft nie powiodło się.");
  }
}

// Wylogowanie
export async function wyloguj(): Promise<void> {
  try {
    await signOut(uwierzytelnianieFirebase);
  } finally {
    wyczyscSesje();
  }
}

/* ============================================================================
   VALIDATION (pure, deterministic)
   ============================================================================ */

export function czyEmailPoprawny(email: string): boolean {
  const v = email.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function czyHasloPoprawne(
  haslo: string
): { ok: boolean; powod?: string } {
  const v = haslo ?? "";

  if (v.length < 8)
    return { ok: false, powod: "Hasło musi mieć minimum 8 znaków." };
  if (!/[A-Z]/.test(v))
    return {
      ok: false,
      powod: "Hasło musi zawierać co najmniej 1 wielką literę.",
    };
  if (!/[0-9]/.test(v))
    return { ok: false, powod: "Hasło musi zawierać co najmniej 1 cyfrę." };
  if (!/[^\w\s]/.test(v))
    return {
      ok: false,
      powod: "Hasło musi zawierać co najmniej 1 znak specjalny.",
    };

  return { ok: true };
}
