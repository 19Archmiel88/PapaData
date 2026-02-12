import {
  zalogujFirebaseEmailHaslo,
  zalogujFirebaseSso,
  zarejestrujFirebaseEmailHaslo,
  wylogujFirebase,
} from "../integracje/auth/firebaseAuth";
import {
  pobierzSesje as pobierzSesjeLokalna,
  zapiszSesje as zapiszSesjeLokalna,
  wyczyscSesje as wyczyscSesjeLokalna,
  type SesjaAuth,
} from "../integracje/auth/sesjaAuth";

export type { SesjaAuth };

export function pobierzSesje(): SesjaAuth | null {
  return pobierzSesjeLokalna();
}

export function wyczyscSesje(): void {
  wyczyscSesjeLokalna();
}

export async function zalogujGoogle(): Promise<void> {
  const sesja = await zalogujFirebaseSso("google");
  zapiszSesjeLokalna(sesja);
}

export async function zalogujMicrosoft(): Promise<void> {
  const sesja = await zalogujFirebaseSso("microsoft");
  zapiszSesjeLokalna(sesja);
}

export async function zalogujEmailHaslo(email: string, haslo: string): Promise<void> {
  const emailNorm = email.trim();
  if (!czyEmailPoprawny(emailNorm)) {
    throw new Error("Podaj poprawny adres e-mail.");
  }
  if (!haslo.trim()) {
    throw new Error("Wpisz haslo.");
  }

  const sesja = await zalogujFirebaseEmailHaslo(emailNorm, haslo);
  zapiszSesjeLokalna(sesja);
}

export async function zarejestrujEmailHaslo(email: string, haslo: string): Promise<void> {
  const emailNorm = email.trim();
  if (!czyEmailPoprawny(emailNorm)) {
    throw new Error("Podaj poprawny adres e-mail.");
  }

  const walidacjaHasla = czyHasloPoprawne(haslo);
  if (!walidacjaHasla.ok) {
    throw new Error(walidacjaHasla.powod ?? "Haslo nie spelnia polityki bezpieczenstwa.");
  }

  const sesja = await zarejestrujFirebaseEmailHaslo(emailNorm, haslo);
  zapiszSesjeLokalna(sesja);
}

export async function wyloguj(): Promise<void> {
  try {
    await wylogujFirebase();
  } finally {
    wyczyscSesjeLokalna();
  }
}

export function czyEmailPoprawny(email: string): boolean {
  const wartosc = email.trim();
  if (!wartosc) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wartosc);
}

export function czyHasloPoprawne(haslo: string): { ok: boolean; powod?: string } {
  if (haslo.length < 8) {
    return { ok: false, powod: "Haslo musi miec minimum 8 znakow." };
  }
  if (!/[A-Z]/.test(haslo)) {
    return { ok: false, powod: "Haslo musi zawierac co najmniej 1 wielka litere." };
  }
  if (!/[0-9]/.test(haslo)) {
    return { ok: false, powod: "Haslo musi zawierac co najmniej 1 cyfre." };
  }
  if (!/[^\w\s]/.test(haslo)) {
    return { ok: false, powod: "Haslo musi zawierac co najmniej 1 znak specjalny." };
  }

  return { ok: true };
}
