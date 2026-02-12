import { safeLocalStorage } from "../../utils/safeLocalStorage";

export type TrybMotywu = "light" | "dark";

export const KLUCZ_MOTYWU = "papadata_theme";

function czyTrybMotywu(wartosc: string | null): wartosc is TrybMotywu {
  return wartosc === "light" || wartosc === "dark";
}

export function pobierzMotywSystemu(): TrybMotywu {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function pobierzPreferowanyMotyw(): TrybMotywu {
  if (typeof window === "undefined") return "dark";
  const zapisany = safeLocalStorage.getItem(KLUCZ_MOTYWU);
  if (czyTrybMotywu(zapisany)) return zapisany;
  return pobierzMotywSystemu();
}

export function zastosujMotywDokumentu(motyw: TrybMotywu) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.toggle("dark", motyw === "dark");
  root.setAttribute("data-pd-theme", motyw);

  if (typeof window !== "undefined") {
    safeLocalStorage.setItem(KLUCZ_MOTYWU, motyw);
  }
}
