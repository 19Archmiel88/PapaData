import { useEffect, type RefObject } from "react";

export function pobierzElementyFokusowalne(kontener: HTMLElement): HTMLElement[] {
  const selektor =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  return Array.from(kontener.querySelectorAll(selektor)).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true"
  );
}

export function useBlokadaScrollaWDialogu(otwarty: boolean) {
  useEffect(() => {
    if (!otwarty) return;

    const poprzedniOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = poprzedniOverflow;
    };
  }, [otwarty]);
}

type PulapkaFokusuOpcje = {
  otwarty: boolean;
  panelRef: RefObject<HTMLElement | null>;
  ostatniFokusRef: RefObject<HTMLElement | null>;
  onEscape: () => void;
};

export function usePulapkaFokusuWDialogu({
  otwarty,
  panelRef,
  ostatniFokusRef,
  onEscape,
}: PulapkaFokusuOpcje) {
  useEffect(() => {
    if (!otwarty) return;

    ostatniFokusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) {
      const fokusowalne = pobierzElementyFokusowalne(panel);
      (fokusowalne[0] ?? panel).focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const root = panelRef.current;
      if (!root) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key !== "Tab") return;

      const fokusowalne = pobierzElementyFokusowalne(root);
      if (fokusowalne.length === 0) return;

      const pierwszy = fokusowalne[0];
      const ostatni = fokusowalne[fokusowalne.length - 1];
      const aktywny = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!aktywny || aktywny === pierwszy) {
          event.preventDefault();
          ostatni.focus();
        }
      } else if (aktywny === ostatni) {
        event.preventDefault();
        pierwszy.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      ostatniFokusRef.current?.focus();
    };
  }, [onEscape, otwarty, ostatniFokusRef, panelRef]);
}

// aliasy zachowane dla kompatybilnosci z istniejacym kodem
export const uzyjBlokadyScrollaWDialogu = useBlokadaScrollaWDialogu;
export const uzyjPulapkiFokusuWDialogu = usePulapkaFokusuWDialogu;
