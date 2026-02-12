import { useUI } from "../../context/useUI";

type StandardBezpieczenstwa = {
  etykieta: string;
  nazwa: string;
  opis: string;
};

type TekstySekcjiStandardow = {
  kicker: string;
  tytul: string;
  whitepaperCta: string;
  whitepaperAria: string;
  whitepaperOpis: string;
  standardy: StandardBezpieczenstwa[];
};

const TEKSTY_SEKCJI_STANDARDOW: Record<"pl" | "en", TekstySekcjiStandardow> = {
  pl: {
    kicker: "Standardy Klasy Enterprise",
    tytul: "Bezpieczeństwo wbudowane w produkt: dostęp, izolacja i szyfrowanie.",
    whitepaperCta: "Zobacz whitepaper",
    whitepaperAria: "Zobacz whitepaper o bezpieczeństwie (otwiera nową kartę)",
    whitepaperOpis: "Gotowy materiał dla security review i compliance.",
    standardy: [
      {
        etykieta: "Uprawnienia",
        nazwa: "Granularny dostęp",
        opis: "Kontrola dostępu zapewnia, że tylko upoważniony personel widzi konkretne dane i raporty.",
      },
      {
        etykieta: "Izolacja",
        nazwa: "Izolacja danych",
        opis: "Środowisko każdego klienta jest izolowane na poziomie danych - brak mieszania danych.",
      },
      {
        etykieta: "Maskowanie",
        nazwa: "Maskowanie danych",
        opis: "Dane PII są automatycznie maskowane przed analizą, aby ograniczyć ekspozycję danych wrażliwych.",
      },
      {
        etykieta: "Szyfrowanie",
        nazwa: "Bezpieczne połączenia",
        opis: "Połączenia zewnętrzne są szyfrowane, a dane są chronione podczas przesyłania i w spoczynku.",
      },
    ],
  },
  en: {
    kicker: "Enterprise-Class Standards",
    tytul: "Security built into the product: access control, isolation, and encryption.",
    whitepaperCta: "View whitepaper",
    whitepaperAria: "View security whitepaper (opens in a new tab)",
    whitepaperOpis: "Ready material for security review and compliance.",
    standardy: [
      {
        etykieta: "Permissions",
        nazwa: "Granular access",
        opis: "Access control ensures that only authorized personnel can view specific data and reports.",
      },
      {
        etykieta: "Isolation",
        nazwa: "Data isolation",
        opis: "Each customer environment is isolated at data level - no data mixing between tenants.",
      },
      {
        etykieta: "Masking",
        nazwa: "Data masking",
        opis: "PII fields are automatically masked before analysis to reduce sensitive-data exposure.",
      },
      {
        etykieta: "Encryption",
        nazwa: "Secure connections",
        opis: "External connections are encrypted and data is protected both in transit and at rest.",
      },
    ],
  },
};

export function SekcjaStandardy() {
  const { jezyk } = useUI();
  const tekst = TEKSTY_SEKCJI_STANDARDOW[jezyk];

  return (
    <section
      className="pd-container pd-reveal py-12 md:py-16"
      aria-labelledby="standardy-tytul"
      data-pd-reveal="standardy"
    >
      <div className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft pd-section-shell border border-black/10 dark:border-white/10">
        {/* odpowiada za sekcje zaufania enterprise */}
        <header className="max-w-[72ch]">
          <p className="pd-section-kicker">{tekst.kicker}</p>
          <h2 id="standardy-tytul" className="pd-section-title">
            {tekst.tytul}
          </h2>
        </header>

        {/* odpowiada za liste mechanizmow bezpieczenstwa */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {tekst.standardy.map((standard) => (
            <article
              key={`${standard.etykieta}-${standard.nazwa}`}
              className="pd-enterprise-card-muted rounded-2xl p-5"
            >
              <p className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-slate-500 dark:text-slate-400">
                {standard.etykieta}
              </p>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {standard.nazwa}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                {standard.opis}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <a
            href="/legal/whitepaper-bezpieczenstwo.html"
            target="_blank"
            rel="noreferrer"
            aria-label={tekst.whitepaperAria}
            className="pd-btn-primary pd-focus-ring inline-flex h-11 items-center rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-white"
          >
            {tekst.whitepaperCta}
          </a>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {tekst.whitepaperOpis}
          </p>
        </div>
      </div>
    </section>
  );
}

export default SekcjaStandardy;
