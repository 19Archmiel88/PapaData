import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  czyEmailPoprawny,
  zalogujEmailHaslo,
  zalogujGoogle,
  zalogujMicrosoft,
} from "../../services/auth";

// odpowiada za props logowania
export type LogowanieProps = {
  onSukces: () => void;
};

// odpowiada za formularz logowania
export function Logowanie({ onSukces }: LogowanieProps) {
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");

  const [loading, setLoading] = useState(false);
  const [blad, setBlad] = useState<string | null>(null);

  /* walidacja */
  const emailOk = useMemo(() => czyEmailPoprawny(email), [email]);
  const hasloOk = useMemo(() => haslo.trim().length > 0, [haslo]);

  const busy = loading;
  const bladId = "logowanie-blad";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    setBlad(null);

    if (!emailOk) {
      setBlad("Podaj poprawny adres e-mail.");
      return;
    }
    if (!hasloOk) {
      setBlad("Wpisz hasło.");
      return;
    }

    setLoading(true);
    try {
      await zalogujEmailHaslo(email, haslo);
      onSukces();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nie udalo sie zalogowac.";
      setBlad(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    if (busy) return;
    setBlad(null);
    setLoading(true);
    try {
      await zalogujGoogle();
      onSukces();
    } catch {
      setBlad("Nie udało się zalogować przez Google. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  async function onMicrosoft() {
    if (busy) return;
    setBlad(null);
    setLoading(true);
    try {
      await zalogujMicrosoft();
      onSukces();
    } catch {
      setBlad("Nie udało się zalogować przez Microsoft. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* komunikat błędu */}
      {blad && (
        <div
          id={bladId}
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm text-black/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80"
        >
          <span className="font-semibold">Błąd:</span> {blad}
        </div>
      )}

      {/* SSO */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          aria-busy={busy}
          className="pd-focus-ring h-11 rounded-xl border border-black/10 bg-white/70 text-sm font-semibold text-black/90 transition hover:bg-white/90 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
        >
          Kontynuuj z Google
        </button>

        <button
          type="button"
          onClick={onMicrosoft}
          disabled={busy}
          aria-busy={busy}
          className="pd-focus-ring h-11 rounded-xl border border-black/10 bg-white/70 text-sm font-semibold text-black/90 transition hover:bg-white/90 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
        >
          Kontynuuj z Microsoft
        </button>
      </div>

      {/* separator */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40 dark:text-white/40">
          lub
        </div>
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      {/* formularz e-mail / hasło */}
      <form onSubmit={onSubmit} className="space-y-3" aria-busy={busy} noValidate>
        <div className="space-y-1">
          <label
            htmlFor="login-email"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 dark:text-white/50"
          >
            E-mail
          </label>
          <input
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={!emailOk && email.length > 0}
            aria-describedby={blad ? bladId : undefined}
            disabled={busy}
            className="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-sm text-black/90 outline-none transition placeholder:text-black/40 focus:border-black/20 focus:ring-4 focus:ring-indigo-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:ring-indigo-400/25"
            placeholder="np. jan@firma.pl"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="login-password"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 dark:text-white/50"
          >
            Hasło
          </label>
          <input
            id="login-password"
            value={haslo}
            onChange={(e) => setHaslo(e.target.value)}
            type="password"
            autoComplete="current-password"
            aria-invalid={!hasloOk && haslo.length > 0}
            aria-describedby={blad ? bladId : undefined}
            disabled={busy}
            className="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-sm text-black/90 outline-none transition placeholder:text-black/40 focus:border-black/20 focus:ring-4 focus:ring-indigo-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:ring-indigo-400/25"
            placeholder="Twoje hasło"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="pd-btn-primary pd-focus-ring h-11 w-full rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
        >
          {busy ? "Przetwarzanie…" : "Zaloguj się"}
        </button>

      </form>
    </div>
  );
}

export default Logowanie;
