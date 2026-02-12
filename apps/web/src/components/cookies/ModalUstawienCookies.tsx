import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  type PreferencjeCookies,
  utworzPreferencjeCookies,
} from "./zgodaCookies";

type WidokModalaCookies = "szybki" | "ustawienia";

type ModalUstawienCookiesProps = {
  otwarty: boolean;
  wymaganaDecyzja: boolean;
  preferencjePoczatkowe: PreferencjeCookies | null;
  startowyWidok?: WidokModalaCookies;
  onZapisz: (preferencje: PreferencjeCookies) => void;
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

function KlawiszPrzelacznika({
  wlaczone,
  onToggle,
  disabled,
  label,
}: {
  wlaczone: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={wlaczone}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={[
        "relative h-7 w-12 rounded-full border transition",
        wlaczone
          ? "border-sky-600 bg-sky-500/90 dark:border-sky-400 dark:bg-sky-400/70"
          : "border-black/20 bg-white dark:border-white/20 dark:bg-white/5",
        disabled ? "cursor-not-allowed opacity-60" : "hover:brightness-105",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition",
          wlaczone ? "left-[24px]" : "left-1",
        ].join(" ")}
        aria-hidden="true"
      />
    </button>
  );
}

export function ModalUstawienCookies({
  otwarty,
  wymaganaDecyzja,
  preferencjePoczatkowe,
  startowyWidok = "szybki",
  onZapisz,
  onZamknij,
}: ModalUstawienCookiesProps) {
  const sourcePoczatkowy = preferencjePoczatkowe ?? utworzPreferencjeCookies(true, true);
  const [widok, setWidok] = useState<WidokModalaCookies>(startowyWidok);
  const [analityczne, setAnalityczne] = useState<boolean>(sourcePoczatkowy.analityczne);
  const [marketingowe, setMarketingowe] = useState<boolean>(sourcePoczatkowy.marketingowe);
  const [poczatkowe] = useState({
    analityczne: sourcePoczatkowy.analityczne,
    marketingowe: sourcePoczatkowy.marketingowe,
  });

  const tytulId = useId();
  const opisId = useId();
  const kontenerRef = useRef<HTMLDivElement | null>(null);
  const ostatniFokusRef = useRef<HTMLElement | null>(null);

  const maNiezapisaneZmiany = useMemo(
    () =>
      analityczne !== poczatkowe.analityczne || marketingowe !== poczatkowe.marketingowe,
    [analityczne, marketingowe, poczatkowe.analityczne, poczatkowe.marketingowe]
  );

  const zapisz = useCallback(
    (analityka: boolean, marketing: boolean) => {
      onZapisz(utworzPreferencjeCookies(analityka, marketing));
    },
    [onZapisz]
  );

  const obsluzProbeZamkniecia = useCallback(() => {
    if (widok === "ustawienia" && maNiezapisaneZmiany) {
      setWidok("szybki");
      return;
    }

    if (wymaganaDecyzja) {
      zapisz(false, false);
      return;
    }

    onZamknij();
  }, [maNiezapisaneZmiany, onZamknij, widok, wymaganaDecyzja, zapisz]);

  useEffect(() => {
    if (!otwarty) return;

    const poprzedniOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ostatniFokusRef.current = document.activeElement as HTMLElement | null;

    const kontener = kontenerRef.current;
    if (kontener) {
      const fokusowalne = pobierzElementyFokusowalne(kontener);
      (fokusowalne[0] ?? kontener).focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const root = kontenerRef.current;
      if (!root) return;

      if (event.key === "Escape") {
        event.preventDefault();
        obsluzProbeZamkniecia();
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
      document.body.style.overflow = poprzedniOverflow;
      ostatniFokusRef.current?.focus();
    };
  }, [obsluzProbeZamkniecia, otwarty]);

  if (!otwarty) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)]">
      <button
        type="button"
        onClick={obsluzProbeZamkniecia}
        className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
        aria-label="Zamknij modal cookies"
      />

      <div className="relative z-[var(--z-floating)] flex min-h-screen items-center justify-center p-4">
        <div
          ref={kontenerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={tytulId}
          aria-describedby={opisId}
          tabIndex={-1}
          className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft w-full max-w-[640px] rounded-[22px] border border-black/15 p-6 outline-none dark:border-white/15 md:p-7"
        >
          {/* odpowiada za naglowek i przycisk zamkniecia */}
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                Ustawienia cookies
              </p>
              <h2
                id={tytulId}
                className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50"
              >
                {widok === "szybki" ? "Dbamy o Twoją prywatność." : "Wybierz zakres zgody."}
              </h2>
            </div>

            <button
              type="button"
              onClick={obsluzProbeZamkniecia}
              className="pd-focus-ring grid h-11 w-11 place-items-center rounded-2xl border border-black/15 bg-white/80 text-lg font-black text-slate-800 transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              aria-label="Zamknij ustawienia cookies"
            >
              ×
            </button>
          </header>

          {/* odpowiada za tresc opisowa i link polityki */}
          <p
            id={opisId}
            className="mt-4 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
          >
            Niezbędne cookies są zawsze aktywne. Kategorie opcjonalne pomagają nam poprawiać
            analitykę i komunikację marketingową.
          </p>

          <a
            href="/legal/polityka-cookies.html"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-sky-700 underline-offset-2 transition hover:underline dark:text-sky-300"
          >
            Polityka cookies
            <span aria-hidden="true">↗</span>
          </a>

          {widok === "szybki" ? (
            <>
              <ul className="mt-5 space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <li>Niezbędne: wymagane do działania platformy.</li>
                <li>Analityczne: pomagają rozwijać raporty i funkcje.</li>
                <li>Marketingowe: wspierają personalizację komunikacji.</li>
              </ul>

              {/* odpowiada za trzy glowne sciezki decyzji */}
              <div className="mt-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={() => zapisz(true, true)}
                    className="pd-btn-primary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
                  >
                    Akceptuj wszystkie
                  </button>
                  <button
                    type="button"
                    onClick={() => zapisz(false, false)}
                    className="pd-btn-secondary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 dark:text-slate-100"
                  >
                    Odrzuć opcjonalne
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setWidok("ustawienia")}
                  className="pd-focus-ring mt-2 inline-flex h-10 items-center rounded-xl px-1 text-sm font-bold text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  Ustawienia szczegółowe
                </button>
              </div>
            </>
          ) : (
            <>
              {/* odpowiada za granularne ustawienia kategorii cookies */}
              <div className="mt-5 space-y-3">
                <article className="flex items-start justify-between gap-3 rounded-2xl border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      Niezbędne
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Wymagane do działania aplikacji, logowania i bezpieczeństwa sesji.
                    </p>
                  </div>
                  <KlawiszPrzelacznika
                    wlaczone={true}
                    disabled={true}
                    onToggle={() => undefined}
                    label="Niezbędne cookies są zawsze aktywne"
                  />
                </article>

                <article className="flex items-start justify-between gap-3 rounded-2xl border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      Analityczne
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Pomagają mierzyć skuteczność raportów i jakość rekomendacji AI.
                    </p>
                  </div>
                  <KlawiszPrzelacznika
                    wlaczone={analityczne}
                    onToggle={() => setAnalityczne((prev) => !prev)}
                    label="Przełącz cookies analityczne"
                  />
                </article>

                <article className="flex items-start justify-between gap-3 rounded-2xl border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      Marketingowe
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Umożliwiają personalizację komunikacji i pomiar kampanii.
                    </p>
                  </div>
                  <KlawiszPrzelacznika
                    wlaczone={marketingowe}
                    onToggle={() => setMarketingowe((prev) => !prev)}
                    label="Przełącz cookies marketingowe"
                  />
                </article>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => zapisz(analityczne, marketingowe)}
                  className="pd-btn-primary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
                >
                  Zapisz wybór
                </button>
                <button
                  type="button"
                  onClick={() => setWidok("szybki")}
                  className="pd-btn-secondary pd-focus-ring h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 dark:text-slate-100"
                >
                  Wróć
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalUstawienCookies;
