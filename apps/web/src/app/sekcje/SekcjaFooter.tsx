type SekcjaFooterProps = {
  onOpenCookieSettings: () => void;
  onOpenContact: () => void;
};

export function SekcjaFooter({ onOpenCookieSettings, onOpenContact }: SekcjaFooterProps) {
  return (
    <footer
      className="pd-container pd-reveal pb-16 pt-12 md:pb-20"
      aria-labelledby="footer-tytul"
      data-pd-reveal="footer"
    >
      <div className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft pd-section-shell border border-black/10 dark:border-white/10">
        {/* odpowiada za naglowek stopki i kontekst formalny */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="pd-section-kicker">
              PapaData Intelligence
            </p>
            <h2 id="footer-tytul" className="pd-section-title text-[clamp(1.6rem,1.1rem+1.2vw,2.3rem)]">
              Gotowosc enterprise dla danych, decyzji i compliance.
            </h2>
            <p className="pd-section-lead mt-3 max-w-[62ch] text-sm">
              Region danych: UE. Dostep oparty o role. Integracje zabezpieczone tokenami i
              audytowalnym przeplywem sesji.
            </p>
          </div>

          {/* odpowiada za skrzynke szybkich linkow */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <nav aria-label="Produkt" className="pd-enterprise-card-muted space-y-2 rounded-2xl p-4">
              <p className="font-black text-slate-900 dark:text-slate-100">Produkt</p>
              <a href="#features" className="block font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                Funkcje
              </a>
              <a href="#pricing" className="block font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                Cennik
              </a>
              <a href="#integrations" className="block font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                Integracje
              </a>
            </nav>

            <nav aria-label="Wsparcie" className="pd-enterprise-card-muted space-y-2 rounded-2xl p-4">
              <p className="font-black text-slate-900 dark:text-slate-100">Wsparcie</p>
              <a href="#knowledge" className="block font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                Baza wiedzy
              </a>
              <button
                type="button"
                onClick={onOpenCookieSettings}
                className="pd-focus-ring block rounded-md font-semibold text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                Ustawienia cookies
              </button>
              <a href="#knowledge" className="block font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                FAQ
              </a>
              <button
                type="button"
                onClick={onOpenContact}
                className="pd-focus-ring block rounded-md text-left font-semibold text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                Kontakt
              </button>
            </nav>
          </div>
        </div>

        {/* odpowiada za dolna belke formalna */}
        <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href="/legal/regulamin.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Regulamin
            </a>
            <a
              href="/legal/prywatnosc.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Prywatnosc
            </a>
            <a
              href="/legal/dpa.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-100"
            >
              DPA
            </a>
            <a
              href="/legal/podwykonawcy.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Podwykonawcy
            </a>
          </div>
          <p>© {new Date().getFullYear()} PapaData. Wszystkie prawa zastrzezone.</p>
        </div>
      </div>
    </footer>
  );
}

export default SekcjaFooter;
