import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import {
  useBlokadaScrollaWDialogu,
  usePulapkaFokusuWDialogu,
} from "./narzedziaModala";

type ModalKontaktowyProps = {
  otwarty: boolean;
  onZamknij: () => void;
};

function czyPoprawnyEmail(wartosc: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wartosc.trim());
}

export function ModalKontaktowy({ otwarty, onZamknij }: ModalKontaktowyProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ostatniFokusRef = useRef<HTMLElement | null>(null);
  const idTytulu = useId();
  const idOpisu = useId();
  const idBledu = useId();

  const [nazwa, setNazwa] = useState("");
  const [email, setEmail] = useState("");
  const [wiadomosc, setWiadomosc] = useState("");
  const [blad, setBlad] = useState<string | null>(null);

  const nazwaOk = nazwa.trim().length >= 2;
  const emailOk = czyPoprawnyEmail(email);
  const wiadomoscOk = wiadomosc.trim().length >= 10;
  const formularzOk = useMemo(() => nazwaOk && emailOk && wiadomoscOk, [emailOk, nazwaOk, wiadomoscOk]);

  useBlokadaScrollaWDialogu(otwarty);
  usePulapkaFokusuWDialogu({
    otwarty,
    panelRef,
    ostatniFokusRef,
    onEscape: onZamknij,
  });

  if (!otwarty) return null;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formularzOk) {
      setBlad("Uzupelnij poprawnie wszystkie pola formularza.");
      return;
    }

    setBlad(null);
    const temat = encodeURIComponent("Kontakt z landing page PapaData");
    const body = encodeURIComponent(
      `Imie i nazwisko: ${nazwa.trim()}\nEmail: ${email.trim()}\n\nWiadomosc:\n${wiadomosc.trim()}`
    );
    window.location.href = `mailto:sales@papadata.pl?subject=${temat}&body=${body}`;
    onZamknij();
  };

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)]">
      <button
        type="button"
        onClick={onZamknij}
        className="absolute inset-0 h-full w-full bg-slate-950/65 backdrop-blur-[2px]"
        aria-label="Zamknij okno kontaktowe"
      />

      <div className="relative z-[var(--z-floating)] flex min-h-screen items-center justify-center px-4 py-8">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTytulu}
          aria-describedby={idOpisu}
          tabIndex={-1}
          className="pd-glass glass-panel pd-edge pd-innerglow w-full max-w-[720px] rounded-[28px] p-6 outline-none md:p-7"
        >
          {/* odpowiada za naglowek formularza kontaktowego */}
          <header className="flex items-start justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                Kontakt enterprise
              </p>
              <h3
                id={idTytulu}
                className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50"
              >
                Opisz potrzeby wdrozenia i integracji.
              </h3>
              <p
                id={idOpisu}
                className="mt-2 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
              >
                Zespol odpowiada mailowo i wraca z planem wdrozenia opartym o Twoj stack.
              </p>
            </div>
            <button
              type="button"
              onClick={onZamknij}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-black/10 bg-white/70 text-lg font-black text-slate-800 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              aria-label="Zamknij modal"
            >
              ×
            </button>
          </header>

          {/* odpowiada za walidowany formularz kontaktu */}
          <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
            {blad && (
              <p
                id={idBledu}
                role="alert"
                className="rounded-2xl border border-rose-300/60 bg-rose-100/70 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200"
              >
                {blad}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-extrabold tracking-[0.12em] uppercase text-slate-600 dark:text-slate-400">
                  Imie i nazwisko
                </span>
                <input
                  type="text"
                  value={nazwa}
                  onChange={(event) => setNazwa(event.target.value)}
                  aria-invalid={nazwa.length > 0 && !nazwaOk}
                  aria-describedby={blad ? idBledu : undefined}
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-300/35 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
                  placeholder="np. Jan Kowalski"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-extrabold tracking-[0.12em] uppercase text-slate-600 dark:text-slate-400">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={email.length > 0 && !emailOk}
                  aria-describedby={blad ? idBledu : undefined}
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-300/35 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
                  placeholder="np. jan@firma.pl"
                />
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-xs font-extrabold tracking-[0.12em] uppercase text-slate-600 dark:text-slate-400">
                Wiadomosc
              </span>
              <textarea
                value={wiadomosc}
                onChange={(event) => setWiadomosc(event.target.value)}
                aria-invalid={wiadomosc.length > 0 && !wiadomoscOk}
                aria-describedby={blad ? idBledu : undefined}
                className="min-h-[130px] w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-300/35 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
                placeholder="Napisz, jakie integracje i cele biznesowe chcesz osiagnac."
              />
            </label>

            <footer className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end dark:border-white/10">
              <button
                type="submit"
                className="pd-btn-primary h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Wyslij wiadomosc
              </button>
              <button
                type="button"
                onClick={onZamknij}
                className="pd-btn-secondary h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:text-slate-100"
              >
                Zamknij
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalKontaktowy;
