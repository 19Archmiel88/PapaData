import { useState } from "react";
import { useUI } from "../../context/useUI";

type PytanieFaq = {
  id: string;
  pytanie: string;
  odpowiedz: string;
};

type TekstyFaq = {
  kicker: string;
  tytul: string;
  cta: string;
  ctaOpis: string;
  pytania: PytanieFaq[];
};

const TEKSTY_FAQ: Record<"pl" | "en", TekstyFaq> = {
  pl: {
    kicker: "FAQ",
    tytul: "Czyste odpowiedzi na najczęstsze obiekcje przed wdrożeniem.",
    cta: "Zobacz cennik",
    ctaOpis: "Masz więcej pytań? Sprawdź plan i uruchom 14-dniowy trial.",
    pytania: [
      {
        id: "dane-bezpieczne",
        pytanie: "Czy moje dane są bezpieczne w PapaData?",
        odpowiedz:
          "Tak. Używamy standardowego szyfrowania i przechowujemy dane wyłącznie w europejskich regionach Google Cloud. Jesteśmy zgodni z RODO i oferujemy automatyczne maskowanie PII.",
      },
      {
        id: "dane",
        pytanie: "Gdzie przetwarzane są dane?",
        odpowiedz:
          "Dane są utrzymywane w infrastrukturze UE. W raportach i eksportach możesz ustawić dodatkowe maskowanie pól wrażliwych.",
      },
      {
        id: "integracje",
        pytanie: "Ile trwa podłączenie ekosystemu sklepu?",
        odpowiedz:
          "Dla gotowych konektorów zwykle od kilku minut do jednego dnia roboczego, zależnie od liczby źródeł i poprawności uprawnień.",
      },
      {
        id: "analityk",
        pytanie: "Czy potrzebuję analityka do obsługi platformy?",
        odpowiedz:
          "Nie. Nasz Asystent AI działa jak wirtualny analityk danych: odpowiada na pytania i wykrywa anomalie w języku naturalnym.",
      },
      {
        id: "bigquery",
        pytanie: "Czy wymagamy wiedzy SQL i BigQuery?",
        odpowiedz:
          "Nie. Raporty i rekomendacje są gotowe operacyjnie. Dostęp SQL jest opcjonalny dla zespołów data.",
      },
      {
        id: "koszty-po-trialu",
        pytanie: "Jakie są koszty po darmowym okresie próbnym?",
        odpowiedz:
          "Po 14-dniowym okresie próbnym wybierasz plan dopasowany do skali Twoich danych. Ceny zaczynają się od 199 PLN netto miesięcznie lub 159 PLN netto miesięcznie przy wyborze rozliczenia rocznego.",
      },
      {
        id: "trial",
        pytanie: "Co dzieje się po okresie próbnym?",
        odpowiedz:
          "Możesz przejść na plan płatny lub zakończyć test bez zobowiązań. Brak automatycznego obciążenia bez potwierdzenia.",
      },
    ],
  },
  en: {
    kicker: "FAQ",
    tytul: "Clear answers to the most common objections before implementation.",
    cta: "View pricing",
    ctaOpis: "Need more details? Check plans and start a 14-day trial.",
    pytania: [
      {
        id: "dane-bezpieczne",
        pytanie: "Is my data secure in PapaData?",
        odpowiedz:
          "Yes. We use industry-standard encryption and store data only in European Google Cloud regions. We are GDPR-compliant and provide automatic PII masking.",
      },
      {
        id: "dane",
        pytanie: "Where is data processed?",
        odpowiedz:
          "Data is hosted in EU infrastructure. In reports and exports you can enable additional masking of sensitive fields.",
      },
      {
        id: "integracje",
        pytanie: "How long does store ecosystem integration take?",
        odpowiedz:
          "For ready connectors, it usually takes from a few minutes up to one business day, depending on number of data sources and access setup.",
      },
      {
        id: "analityk",
        pytanie: "Do I need a data analyst to run the platform?",
        odpowiedz:
          "No. Our AI Assistant works like a virtual analyst: it answers questions and detects anomalies in natural language.",
      },
      {
        id: "bigquery",
        pytanie: "Do we require SQL and BigQuery knowledge?",
        odpowiedz:
          "No. Reports and recommendations are operationally ready. SQL access is optional for data teams.",
      },
      {
        id: "koszty-po-trialu",
        pytanie: "What are the costs after the free trial?",
        odpowiedz:
          "After the 14-day trial, you choose a plan matching your data scale. Pricing starts at PLN 199 net monthly, or PLN 159 net monthly with annual billing.",
      },
      {
        id: "trial",
        pytanie: "What happens after the trial period?",
        odpowiedz:
          "You can switch to a paid plan or end the test without obligations. No automatic charge is made without confirmation.",
      },
    ],
  },
};

const DOMYSLNIE_OTWARTE_ID = "dane-bezpieczne";

export function SekcjaFaq() {
  const { jezyk } = useUI();
  const tekst = TEKSTY_FAQ[jezyk];
  const [otwarteId, setOtwarteId] = useState<string>(DOMYSLNIE_OTWARTE_ID);

  return (
    <section
      className="pd-container pd-reveal py-12 md:py-16"
      aria-labelledby="faq-tytul"
      data-pd-reveal="faq"
    >
      <div className="pd-glass glass-panel pd-edge pd-innerglow pd-glass-soft pd-section-shell border border-black/10 dark:border-white/10">
        {/* odpowiada za naglowek sekcji FAQ */}
        <header className="max-w-[70ch]">
          <p className="pd-section-kicker">{tekst.kicker}</p>
          <h2 id="faq-tytul" className="pd-section-title">
            {tekst.tytul}
          </h2>
        </header>

        {/* odpowiada za akordeon pytan i odpowiedzi */}
        <div className="mt-8 space-y-3">
          {tekst.pytania.map((pytanie) => {
            const otwarte = otwarteId === pytanie.id;
            const panelId = `faq-panel-${pytanie.id}`;
            const buttonId = `faq-button-${pytanie.id}`;

            return (
              <article
                key={pytanie.id}
                className="pd-enterprise-card-muted rounded-2xl"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={otwarte}
                    aria-controls={panelId}
                    onClick={() => setOtwarteId(pytanie.id)}
                    className="pd-focus-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-900 transition hover:bg-white/30 dark:text-slate-100 dark:hover:bg-white/10"
                  >
                    {pytanie.pytanie}
                    <span
                      className={[
                        "inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-base dark:border-white/10",
                        otwarte ? "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      {otwarte ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!otwarte}
                  className="px-5 pb-5 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  {pytanie.odpowiedz}
                </div>
              </article>
            );
          })}
        </div>

        {/* odpowiada za domkniecie sekcji FAQ i przejscie do decyzji zakupowej */}
        <footer className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <a
            href="#pricing"
            className="pd-btn-secondary pd-focus-ring inline-flex h-11 items-center rounded-2xl px-5 text-sm font-extrabold tracking-[0.08em] uppercase text-slate-900 dark:text-slate-100"
          >
            {tekst.cta}
          </a>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {tekst.ctaOpis}
          </p>
        </footer>
      </div>
    </section>
  );
}

export default SekcjaFaq;
