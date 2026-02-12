import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

// odpowiada za odczyt konfiguracji z ENV (Vite)
function wezEnv(nazwa: string): string {
  const v = import.meta.env[nazwa] as string | undefined;
  if (!v || !String(v).trim()) {
    throw new Error(`Brak zmiennej środowiskowej: ${nazwa} (sprawdź apps/web/.env.local)`);
  }
  return v;
}

// odpowiada za konfigurację Firebase Web SDK
const firebaseConfig = {
  apiKey: wezEnv("VITE_FIREBASE_API_KEY"),
  authDomain: wezEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: wezEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: wezEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: wezEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: wezEnv("VITE_FIREBASE_APP_ID"),
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) ?? undefined
};

// odpowiada za inicjalizację aplikacji Firebase
const app = initializeApp(firebaseConfig);

// odpowiada za uwierzytelnianie Firebase
export const uwierzytelnianieFirebase = getAuth(app);

// odpowiada za provider Google
export const dostawcaGoogle = new GoogleAuthProvider();

// odpowiada za provider Microsoft (OAuth)
export const dostawcaMicrosoft = new OAuthProvider("microsoft.com");
