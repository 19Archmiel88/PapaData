import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Logowanie } from "./Login";
import { Rejestracja } from "./Register";

type TrybAutoryzacji = "logowanie" | "rejestracja";

export type ModalAutoryzacjiProps = {
  otwarty: boolean;
  startowyTryb?: TrybAutoryzacji;
  onZamknij: () => void;
};

function pobierzElementyFokusowalne(kontener: HTMLElement): HTMLElement[] {
  const selektor =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  return Array.from(kontener.querySelectorAll(selektor)).filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement &&
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true"
  );
}

export function ModalAutoryzacji({
  otwarty,
  startowyTryb = "logowanie",
  onZamknij,
}: ModalAutoryzacjiProps) {
  // override ustawiany TYLKO przez użytkownika
  const [trybUzytkownika, setTrybUzytkownika] =
    useState<TrybAutoryzacji | null>(null);

  const [resetKey, setResetKey] = useState(0);

  const tryb: TrybAutoryzacji = useMemo(
    () => trybUzytkownika ?? startowyTryb,
    [trybUzytkownika, startowyTryb]
  );

  const tytulId = useId();
  const opisId = useId();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const ostatniFokusRef = useRef<HTMLElement | null>(null);

  const ustawTryb = useCallback((nowy: TrybAutoryzacji) => {
    setTrybUzytkownika(nowy);
    setResetKey((k) => k + 1);
  }, []);

  const zamknijBezpiecznie = useCallback(() => {
    setTrybUzytkownika(null);
    setResetKey((k) => k + 1);
    onZamknij();
  }, [onZamknij]);

  /* BODY SCROLL LOCK */
  useEffect(() => {
    if (!otwarty) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [otwarty]);

  /* FOCUS + ESC + TAB TRAP */
  useEffect(() => {
    if (!otwarty) return;

    ostatniFokusRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (panel) {
      const fokusowalne = pobierzElementyFokusowalne(panel);
      (fokusowalne[0] ?? panel).focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      const root = panelRef.current;
      if (!root) return;

      if (e.key === "Escape") {
        e.preventDefault();
        zamknijBezpiecznie();
        return;
      }

      if (e.key !== "Tab") return;

      const fokusowalne = pobierzElementyFokusowalne(root);
      if (fokusowalne.length === 0) return;

      const first = fokusowalne[0];
      const last = fokusowalne[fokusowalne.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      ostatniFokusRef.current?.focus();
    };
  }, [otwarty, zamknijBezpiecznie]);

  if (!otwarty) return null;

  return (
    <div className="fixed inset-0 z-(--z-overlay)">
      <button
        type="button"
        aria-label="Zamknij okno autoryzacji"
        className="absolute inset-0 h-full w-full bg-black/40 dark:bg-black/60"
        onClick={zamknijBezpiecznie}
      />

      <div className="relative z-(--z-floating) flex min-h-screen items-center justify-center px-4 py-10">
        <div
          key={`${startowyTryb}:${resetKey}`}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={tytulId}
          aria-describedby={opisId}
          tabIndex={-1}
          className="
            pd-glass pd-edge pd-innerglow pd-glass-soft
            w-full max-w-[520px]
            rounded-[28px]
            outline-none
          "
        >
          <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 pb-4 pt-6 dark:border-white/10">
            <div className="min-w-0">
              <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-black/50 dark:text-white/50">
                PapaData
              </div>
              <h2
                id={tytulId}
                className="mt-1 text-2xl font-black tracking-tight text-black dark:text-white"
              >
                Autoryzacja
              </h2>
              <p
                id={opisId}
                className="mt-1 text-sm font-semibold text-black/60 dark:text-white/60"
              >
                Zaloguj się lub utwórz konto, aby kontynuować.
              </p>
            </div>

            <button
              type="button"
              onClick={zamknijBezpiecznie}
              className="
                pd-focus-ring
                h-10 w-10 rounded-[14px]
                border border-black/10 dark:border-white/10
                bg-white/60 dark:bg-white/5
                hover:bg-white/85 dark:hover:bg-white/10
                transition
              "
              aria-label="Zamknij"
            >
              <span className="text-lg leading-none text-black/70 dark:text-white/70">
                ×
              </span>
            </button>
          </div>

          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-black/10 bg-white/50 p-1 dark:border-white/10 dark:bg-white/5">
              {(["logowanie", "rejestracja"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => ustawTryb(k)}
                  aria-pressed={tryb === k}
                  className={[
                    "pd-focus-ring h-11 rounded-[14px] text-sm font-semibold transition",
                    tryb === k
                      ? "bg-white text-black shadow-sm dark:bg-white/10 dark:text-white"
                      : "text-black/70 hover:bg-white/60 dark:text-white/70 dark:hover:bg-white/5",
                  ].join(" ")}
                >
                  {k === "logowanie" ? "Logowanie" : "Rejestracja"}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6 pt-4">
            {tryb === "logowanie" ? (
              <Logowanie
                key={`logowanie:${resetKey}`}
                onSukces={zamknijBezpiecznie}
              />
            ) : (
              <Rejestracja
                key={`rejestracja:${resetKey}`}
                onSukces={zamknijBezpiecznie}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalAutoryzacji;
