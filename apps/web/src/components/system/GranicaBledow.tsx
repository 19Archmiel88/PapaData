import { Component, type ErrorInfo, type ReactNode } from "react";

type GranicaBledowProps = {
  children: ReactNode;
};

type GranicaBledowState = {
  maBlad: boolean;
  komunikat: string | null;
};

export class GranicaBledow extends Component<GranicaBledowProps, GranicaBledowState> {
  state: GranicaBledowState = {
    maBlad: false,
    komunikat: null,
  };

  static getDerivedStateFromError(error: unknown): GranicaBledowState {
    const komunikat = error instanceof Error ? error.message : "Nieznany blad aplikacji";
    return { maBlad: true, komunikat };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // odpowiada za bezpieczne logowanie bledu bez przerywania fallbacku UI
    const komunikat = error instanceof Error ? error.message : String(error);
    const stackKomponentu = info.componentStack?.trim();
    const tekstDebug = stackKomponentu
      ? `${komunikat}\n\nComponent stack:\n${stackKomponentu}`
      : komunikat;

    try {
      window.sessionStorage.setItem("papadata_last_error", tekstDebug);
    } catch {
      // ignorujemy blad zapisu debug information
    }
  }

  private odswiezAplikacje = () => {
    window.location.reload();
  };

  private przejdzDoStronyGlownej = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.maBlad) return this.props.children;

    return (
      <main className="relative z-[var(--z-content)] min-h-screen px-6 py-10">
        <section className="pd-container">
          <div className="mx-auto max-w-[680px]">
            <article className="pd-glass pd-edge pd-innerglow rounded-[28px] border border-black/10 p-7 dark:border-white/10 md:p-9">
              {/* odpowiada za komunikat awarii i jasna sciezke wyjscia */}
              <header className="text-center">
                <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-rose-700 dark:text-rose-300">
                  Error boundary
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                  Wystapil blad krytyczny interfejsu.
                </h1>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                  Mozesz odswiezyc aplikacje lub wrocic do strony glownej. Dane sesji nie zostaly
                  usuniete.
                </p>
              </header>

              {/* odpowiada za techniczny kontekst bledu dla wsparcia */}
              {this.state.komunikat && (
                <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {this.state.komunikat}
                </div>
              )}

              {/* odpowiada za akcje naprawcze */}
              <footer className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <button
                  type="button"
                  onClick={this.odswiezAplikacje}
                  className="pd-btn-primary h-11 rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  Odswiez aplikacje
                </button>
                <button
                  type="button"
                  onClick={this.przejdzDoStronyGlownej}
                  className="pd-btn-secondary h-11 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:text-slate-100"
                >
                  Przejdz do home
                </button>
              </footer>
            </article>
          </div>
        </section>
      </main>
    );
  }
}

export default GranicaBledow;
