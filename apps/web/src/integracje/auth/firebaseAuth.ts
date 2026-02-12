import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";
import type { DaneSesjiAuth, ZrodloLogowania } from "../../kontrakty/Auth";
import { dostawcaGoogle, dostawcaMicrosoft, uwierzytelnianieFirebase } from "../../services/firebase";

type DostawcaSso = "google" | "microsoft";

function mapujBladFirebase(error: unknown, fallback: string): Error {
  if (!(error instanceof Error)) return new Error(fallback);

  const kod = (error as { code?: string }).code ?? "";
  if (kod === "auth/invalid-credential" || kod === "auth/wrong-password") {
    return new Error("Niepoprawny email lub haslo.");
  }
  if (kod === "auth/user-not-found") {
    return new Error("Nie znaleziono konta dla podanego emaila.");
  }
  if (kod === "auth/too-many-requests") {
    return new Error("Za duzo prob logowania. Sprobuj ponownie za chwile.");
  }
  if (kod === "auth/email-already-in-use") {
    return new Error("Podany email jest juz zajety.");
  }
  if (kod === "auth/weak-password") {
    return new Error("Haslo jest zbyt slabe.");
  }
  if (kod === "auth/popup-closed-by-user") {
    return new Error("Okno logowania zostalo zamkniete przed zakonczeniem.");
  }

  return new Error(fallback);
}

async function mapujCredentialNaSesje(
  credential: UserCredential,
  zrodlo: ZrodloLogowania
): Promise<DaneSesjiAuth> {
  const user = credential.user;
  if (!user) throw new Error("Brak uzytkownika po stronie Firebase.");

  const token = await user.getIdToken();
  return {
    token,
    userId: user.uid,
    role: [],
    zrodlo,
    wygasaUtc: null,
  };
}

export async function zalogujFirebaseEmailHaslo(email: string, haslo: string): Promise<DaneSesjiAuth> {
  try {
    const credential = await signInWithEmailAndPassword(uwierzytelnianieFirebase, email, haslo);
    return mapujCredentialNaSesje(credential, "email_haslo");
  } catch (error) {
    throw mapujBladFirebase(error, "Logowanie e-mail / haslo nie powiodlo sie.");
  }
}

export async function zarejestrujFirebaseEmailHaslo(
  email: string,
  haslo: string
): Promise<DaneSesjiAuth> {
  try {
    const credential = await createUserWithEmailAndPassword(uwierzytelnianieFirebase, email, haslo);
    return mapujCredentialNaSesje(credential, "email_haslo");
  } catch (error) {
    throw mapujBladFirebase(error, "Rejestracja e-mail / haslo nie powiodla sie.");
  }
}

export async function zalogujFirebaseSso(provider: DostawcaSso): Promise<DaneSesjiAuth> {
  const dostawca = provider === "google" ? dostawcaGoogle : dostawcaMicrosoft;
  try {
    const credential = await signInWithPopup(uwierzytelnianieFirebase, dostawca);
    return mapujCredentialNaSesje(credential, provider);
  } catch (error) {
    const komunikat =
      provider === "google"
        ? "Logowanie przez Google nie powiodlo sie."
        : "Logowanie przez Microsoft nie powiodlo sie.";
    throw mapujBladFirebase(error, komunikat);
  }
}

export async function wylogujFirebase() {
  await signOut(uwierzytelnianieFirebase);
}
