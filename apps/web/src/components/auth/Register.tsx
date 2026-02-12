import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  czyEmailPoprawny,
  czyHasloPoprawne,
  zarejestrujEmailHaslo,
  zalogujGoogle,
  zalogujMicrosoft,
} from "../../services/auth";

// odpowiada za props rejestracji
export type RejestracjaProps = {
  onSukces: () => void;
};

// odpowiada za formularz rejestracji
export function Rejestracja({ onSukces }: RejestracjaProps) {
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [haslo2, setHaslo2] = useState("");

  const [loading, setLoading] = useState(false);
  const [blad, setBlad] = useState<string | null>(null);

  // walidacje
  const emailOk = useMemo(() => czyEmailPoprawny(email), [email]);
  const polityka = useMemo(() => czyHasloPoprawne(haslo), [haslo]);
  const haslaZgodne = useMemo(
    () => haslo.length > 0 && haslo === haslo2,
    [haslo, haslo2]
  );

  const canSubmit = emailOk && polityka.ok && haslaZgodne && !loading;

  const bladId = "rejestracja-blad";
  const opisHaslaId = "rejestracja-opis-hasla";

  const onGoogle = useCallback(async () => {
    if (loading) return;
    setBlad(null);
    setLoading(true);
    try {
      await zalogujGoogle();
      onSukces();
    } catch {
      setBlad("Nie udało się utworzyć konta przez Google. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }, [loading, onSukces]);

  const onMicrosoft = useCallback(async () => {
    if (loading) return;
    setBlad(null);
    setLoading(true);
    try {
      await zalogujMicrosoft();
      onSukces();
    } catch {
      setBlad("Nie udało się utworzyć konta przez Microsoft. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }, [loading, onSukces]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setBlad(null);

      if (!emailOk) {
        setBlad("Podaj poprawny adres e-mail.");
        return;
      }
      if (!polityka.ok) {
        setBlad(polityka.powod ?? "Hasło nie spełnia polityki.");
        return;
      }
      if (!haslaZgodne) {
        setBlad("Hasła nie są identyczne.");
        return;
      }

      setLoading(true);
      try {
        await zarejestrujEmailHaslo(email, haslo);
        onSukces();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Nie udalo sie utworzyc konta.";
        setBlad(msg);
      } finally {
        setLoading(false);
      }
    },
    [email, emailOk, haslaZgodne, haslo, onSukces, polityka]
  );

  return (
    <div className="space-y-4">
      {blad && (
        <div
          id={bladId}
          role="alert"
          className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm text-black/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80"
        >
          <span className="font-semibold">Błąd:</span> {blad}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onGoogle}
          disabled={loading}
          aria-busy={loading}
          className="pd-focus-ring h-11 rounded-xl border border-black/10 bg-white/70 text-sm font-semibold text-black/90 transition hover:bg-white/90 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
        >
          Kontynuuj z Google
        </button>
        <button
          type="button"
          onClick={onMicrosoft}
          disabled={loading}
          aria-busy={loading}
          className="pd-focus-ring h-11 rounded-xl border border-black/10 bg-white/70 text-sm font-semibold text-black/90 transition hover:bg-white/90 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
        >
          Kontynuuj z Microsoft
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40 dark:text-white/40">
          lub
        </div>
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <label className="sr-only" htmlFor="rejestracja-email">
          E-mail
        </label>
        <input
          id="rejestracja-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="E-mail"
          aria-invalid={email.length > 0 && !emailOk}
          aria-describedby={blad ? bladId : undefined}
          className="h-11 w-full rounded-xl border border-black/10 bg-white/70 px-4 text-sm text-black/90 outline-none transition placeholder:text-black/40 focus:border-black/20 focus:ring-4 focus:ring-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:ring-white/10"
        />

        <label className="sr-only" htmlFor="rejestracja-haslo">
          Hasło
        </label>
        <input
          id="rejestracja-haslo"
          value={haslo}
          onChange={(e) => setHaslo(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="Hasło"
          aria-invalid={haslo.length > 0 && !polityka.ok}
          aria-describedby={opisHaslaId}
          className="h-11 w-full rounded-xl border border-black/10 bg-white/70 px-4 text-sm text-black/90 outline-none transition placeholder:text-black/40 focus:border-black/20 focus:ring-4 focus:ring-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:ring-white/10"
        />

        <label className="sr-only" htmlFor="rejestracja-haslo2">
          Powtórz hasło
        </label>
        <input
          id="rejestracja-haslo2"
          value={haslo2}
          onChange={(e) => setHaslo2(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="Powtórz hasło"
          aria-invalid={haslo2.length > 0 && !haslaZgodne}
          aria-describedby={blad ? bladId : undefined}
          className="h-11 w-full rounded-xl border border-black/10 bg-white/70 px-4 text-sm text-black/90 outline-none transition placeholder:text-black/40 focus:border-black/20 focus:ring-4 focus:ring-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:ring-white/10"
        />

        <p id={opisHaslaId} className="text-xs text-black/50 dark:text-white/50">
          Minimum 8 znaków, 1 wielka litera, 1 cyfra i 1 znak specjalny.
        </p>

        <button
          type="submit"
          disabled={!canSubmit}
          aria-busy={loading}
          className="pd-btn-primary pd-focus-ring h-11 w-full rounded-xl font-semibold text-white transition disabled:opacity-60"
        >
          {loading ? "Przetwarzanie…" : "Utwórz konto"}
        </button>
      </form>
    </div>
  );
}
