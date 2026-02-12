import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { JezykUI } from "../../context/ui-context";
import { useUI } from "../../context/useUI";

type AutorWiadomosci = "uzytkownik" | "papai";
type TonUzytkownika = "neutralny" | "luzny" | "formalny" | "sceptyczny" | "agresywny";
type Intencja =
  | "PRODUKT_OGOLNIE"
  | "CENNIK_PAKIETY"
  | "DZIALANIE_AI"
  | "ROI"
  | "INTEGRACJE"
  | "BEZPIECZENSTWO"
  | "TECH"
  | "CTA_TRIAL"
  | "POTWIERDZENIE"
  | "ODMOWA"
  | "DOPYTANIE"
  | "SCEPTYCYZM"
  | "POROWNANIE"
  | "NIEZROZUMIALY_INPUT";

type KontekstRozmowy = {
  temat: "cennik" | "integracje" | "roi" | "bezpieczenstwo" | "tech" | "dzialanie_ai" | "produkt" | "nieznany";
  plan: "Starter" | "Professional" | "Enterprise" | "nieznany";
  etap: "intro" | "analiza" | "rekomendacje" | "symulacja" | "trial";
  tonUzytkownika: TonUzytkownika;
  zainteresowanieTrial: "tak" | "nie" | "niepewne";
};

type WiadomoscCzatu = {
  id: string;
  autor: AutorWiadomosci;
  typ: "wiadomosc" | "status";
  tresc: string;
  ts: number;
};

type WidgetCzatuPapaAiProps = {
  onOpenTrial: () => void;
  onZmianaOtwarcia?: (otwarty: boolean) => void;
};

type SzybkaPodpowiedz = { etykieta: string; tresc: string };

type TekstyCzatu = {
  ariaOtworz: string;
  ariaZamknij: string;
  ariaZamknijPanel: string;
  kicker: string;
  tytul: string;
  opis: string;
  inputLabel: string;
  inputPlaceholder: string;
  przyciskWyslij: string;
  przyciskTrial: string;
  wiadomoscStartowa: string;
  prefixMikroCta: string;
  podpowiedzi: SzybkaPodpowiedz[];
};

const TEKSTY_CZATU: Record<JezykUI, TekstyCzatu> = {
  pl: {
    ariaOtworz: "Otwórz czat Papa AI",
    ariaZamknij: "Zamknij czat Papa AI",
    ariaZamknijPanel: "Zamknij panel czatu",
    kicker: "Papa AI",
    tytul: "Asystent marketingowy",
    opis: "Zadaj pytanie o cennik, integracje, ROI, bezpieczeństwo lub aspekty techniczne.",
    inputLabel: "Wpisz wiadomość do Papa AI",
    inputPlaceholder: "Napisz wiadomość...",
    przyciskWyslij: "Wyślij",
    przyciskTrial: "Rozpocznij 14-dniowy trial",
    wiadomoscStartowa:
      "Papa AI gotowy. Zapytaj o cennik, integracje, ROI, bezpieczeństwo albo technikalia (API/SSO/SLA).",
    prefixMikroCta: "Następny krok:",
    podpowiedzi: [
      { etykieta: "Cennik", tresc: "Ile kosztuje i jaki plan ma sens przy 10k zamówień miesięcznie?" },
      { etykieta: "Integracje", tresc: "Czy integrujecie się z Shopify i Google Ads?" },
      { etykieta: "ROI", tresc: "Policz ROI: co tracę, jeśli nie optymalizuję pod marżę netto?" },
      { etykieta: "Bezpieczeństwo", tresc: "RODO/UE - jak wygląda izolacja danych i szyfrowanie?" },
      { etykieta: "Tech", tresc: "API/SSO/SLA - co jest dostępne w Enterprise?" },
    ],
  },
  en: {
    ariaOtworz: "Open Papa AI chat",
    ariaZamknij: "Close Papa AI chat",
    ariaZamknijPanel: "Close chat panel",
    kicker: "Papa AI",
    tytul: "Marketing assistant",
    opis: "Ask about pricing, integrations, ROI, security, or technical scope.",
    inputLabel: "Type a message to Papa AI",
    inputPlaceholder: "Type your message...",
    przyciskWyslij: "Send",
    przyciskTrial: "Start 14-day trial",
    wiadomoscStartowa:
      "Papa AI is ready. Ask about pricing, integrations, ROI, security, or technical scope (API/SSO/SLA).",
    prefixMikroCta: "Next step:",
    podpowiedzi: [
      { etykieta: "Pricing", tresc: "What plan makes sense for about 10k orders per month?" },
      { etykieta: "Integrations", tresc: "Do you integrate with Shopify and Google Ads?" },
      { etykieta: "ROI", tresc: "Calculate ROI: what do I lose if I do not optimize for net margin?" },
      { etykieta: "Security", tresc: "How do GDPR/EU data isolation and encryption work?" },
      { etykieta: "Tech", tresc: "What is available in Enterprise: API, SSO, and SLA?" },
    ],
  },
};

function cls(...wartosci: Array<string | false | null | undefined>) {
  return wartosci.filter(Boolean).join(" ");
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replaceAll("ą", "a")
    .replaceAll("ć", "c")
    .replaceAll("ę", "e")
    .replaceAll("ł", "l")
    .replaceAll("ń", "n")
    .replaceAll("ó", "o")
    .replaceAll("ś", "s")
    .replaceAll("ż", "z")
    .replaceAll("ź", "z");
}

function pobierzElementyFokusowalne(kontener: HTMLElement): HTMLElement[] {
  const selektor =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(kontener.querySelectorAll(selektor)).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.getAttribute("aria-hidden") !== "true"
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-slate-600 dark:border-white/15 dark:bg-white/10 dark:text-slate-300">
      {children}
    </span>
  );
}

function Tail({ side, className }: { side: "left" | "right"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cls("absolute top-[14px] h-3 w-3 rotate-45 rounded-[3px]", side === "left" ? "-left-1" : "-right-1", className)}
    />
  );
}

function bezpiecznyLosowyHex(bytes: number) {
  try {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return Math.random().toString(16).slice(2).padEnd(bytes * 2, "0").slice(0, bytes * 2);
  }
}

function wykryjTon(wejscie: string): TonUzytkownika {
  const t = wejscie.trim();
  if (!t) return "neutralny";
  const n = normalize(t);

  if (/\b(kurw|chuj|pierdol|jeb|skurw|debil|idiot|spierdal|fuck|shit)\b/.test(n) || /[A-ZĄĆĘŁŃÓŚŻŹ]{6,}/.test(t)) {
    return "agresywny";
  }
  if (/\b(sciema|ściema|nie wierze|nie wierzę|fake|scam|bullshit|zmysla|zmyśla)\b/.test(n)) {
    return "sceptyczny";
  }
  if (/\b(prosze|proszę|uprzejmie|poprosze|poproszę|please)\b/.test(n)) return "formalny";
  if (/\b(dawaj|jedziemy|spoko|git|lol|lets go|let's go|ok|sure)\b/.test(n)) return "luzny";
  return "neutralny";
}

function klasyfikujIntencje(wejscie: string): Intencja {
  const raw = wejscie.trim();
  if (!raw) return "NIEZROZUMIALY_INPUT";
  const n = normalize(raw);

  if (/^(tak|ok|okej|yes|okay|sure|go ahead|dawaj|lets go|let's go)\b/.test(n)) return "POTWIERDZENIE";
  if (/^(nie|nie teraz|pozniej|później|nope|not now|later|no thanks)\b/.test(n)) return "ODMOWA";
  if (/\b(a co z|a jak|ile to trwa|co zawiera|dokladnie|dokładnie|what about|how long|details)\b/.test(n)) return "DOPYTANIE";
  if (/\b(vs|versus|porownaj|porównaj|compare|difference|konkurenc)\b/.test(n)) return "POROWNANIE";
  if (/\b(sciema|ściema|nie wierze|nie wierzę|fake|scam|bullshit)\b/.test(n)) return "SCEPTYCYZM";

  if (/\b(shopify|woocommerce|prestashop|shoper|idosell|baselinker|ga4|google ads|meta ads|facebook ads|tiktok|amazon|allegro|integracj|integration|connector|connect)\b/.test(n)) return "INTEGRACJE";
  if (/\b(rodo|gdpr|ue|eu|bezpieczenstw|security|szyfrowan|encrypt|izolacj|isolation|compliance|pii|tenant)\b/.test(n)) return "BEZPIECZENSTWO";
  if (/\b(roi|roas|zysk|profit|marza|marża|margin|rentownosc|rentowność|payback|ile zarobie|ile zarobię|ile strace|ile stracę)\b/.test(n)) return "ROI";
  if (/\b(bigquery|api|sso|sla|gcp|dataset|webhook|limity|limits|multi-?store|saml|oidc)\b/.test(n)) return "TECH";
  if (/\b(jak dziala|jak działa|skad dane|skąd dane|halucynac|hallucyn|how does it work|ai model)\b/.test(n)) return "DZIALANIE_AI";
  if (/\b(uruchom|zaloz konto|załóż konto|start trial|create account|sign up|aktywuj)\b/.test(n)) return "CTA_TRIAL";
  if (/\b(cena|koszt|pricing|price|cost|pakiet|plan|abonament|subscription|subskrypcj|billing|rozliczen)\b/.test(n)) return "CENNIK_PAKIETY";

  return "PRODUKT_OGOLNIE";
}

function mapujTemat(intencja: Intencja): KontekstRozmowy["temat"] {
  if (intencja === "CENNIK_PAKIETY") return "cennik";
  if (intencja === "INTEGRACJE") return "integracje";
  if (intencja === "ROI") return "roi";
  if (intencja === "BEZPIECZENSTWO") return "bezpieczenstwo";
  if (intencja === "TECH") return "tech";
  if (intencja === "DZIALANIE_AI") return "dzialanie_ai";
  if (intencja === "PRODUKT_OGOLNIE") return "produkt";
  return "nieznany";
}

function durationMsDlaIntencji(intencja: Intencja): number {
  if (intencja === "ROI") return 3200;
  if (intencja === "TECH") return 2400;
  if (intencja === "DZIALANIE_AI") return 2600;
  if (intencja === "CENNIK_PAKIETY" || intencja === "INTEGRACJE" || intencja === "BEZPIECZENSTWO") return 1900;
  return 1700;
}

function statusyDlaIntencji(intencja: Intencja, jezyk: JezykUI): string[] {
  if (jezyk === "en") {
    if (intencja === "ROI") return ["Analyzing your question...", "Simulating scenario...", "Building response..."];
    if (intencja === "TECH") return ["Analyzing requirements...", "Checking enterprise scope...", "Building response..."];
    if (intencja === "BEZPIECZENSTWO") return ["Analyzing your question...", "Verifying security scope...", "Building response..."];
    if (intencja === "INTEGRACJE") return ["Analyzing your question...", "Checking integrations...", "Building response..."];
    return ["Analyzing your question...", "Building response..."];
  }
  if (intencja === "ROI") return ["Analizuję pytanie...", "Symuluję scenariusz...", "Buduję odpowiedź..."];
  if (intencja === "TECH") return ["Analizuję wymagania...", "Weryfikuję zakres enterprise...", "Buduję odpowiedź..."];
  if (intencja === "BEZPIECZENSTWO") return ["Analizuję pytanie...", "Weryfikuję bezpieczeństwo...", "Buduję odpowiedź..."];
  if (intencja === "INTEGRACJE") return ["Analizuję pytanie...", "Sprawdzam integracje...", "Buduję odpowiedź..."];
  return ["Analizuję pytanie...", "Buduję odpowiedź..."];
}

function mikroCtaDlaIntencji(intencja: Intencja, jezyk: JezykUI): string {
  if (jezyk === "en") {
    if (intencja === "ROI") return "Do you want an estimate on your numbers?";
    if (intencja === "BEZPIECZENSTWO") return "Should I open the security whitepaper?";
    if (intencja === "INTEGRACJE") return "Should I verify integrations for your stack?";
    if (intencja === "TECH") return "Technical or business version?";
    if (intencja === "CENNIK_PAKIETY" || intencja === "CTA_TRIAL") return "Start a 14-day trial now?";
    return "Want a short action plan?";
  }
  if (intencja === "ROI") return "Policzyć to na Twoich danych?";
  if (intencja === "BEZPIECZENSTWO") return "Pobrać whitepaper bezpieczeństwa?";
  if (intencja === "INTEGRACJE") return "Sprawdzić listę integracji?";
  if (intencja === "TECH") return "Wersja techniczna czy biznesowa?";
  if (intencja === "CENNIK_PAKIETY" || intencja === "CTA_TRIAL") return "Aktywować 14-dniowy trial?";
  return "Chcesz krótką listę kolejnych kroków?";
}

function stylTonem(ton: TonUzytkownika, tresc: string, jezyk: JezykUI) {
  if (jezyk === "en") {
    if (ton === "agresywny") return `Understood. I will keep it short and specific.\n\n${tresc}`;
    if (ton === "sceptyczny") return `Fair point. No hype, only measurable steps.\n\n${tresc}`;
    if (ton === "formalny") return `Certainly. Structured answer below.\n\n${tresc}`;
    if (ton === "luzny") return `Sure, straight to the point:\n\n${tresc}`;
    return tresc;
  }
  if (ton === "agresywny") return `Rozumiem. Odpowiem krótko i rzeczowo.\n\n${tresc}`;
  if (ton === "sceptyczny") return `Jasne. Bez obietnic, tylko mierzalne kroki.\n\n${tresc}`;
  if (ton === "formalny") return `Oczywiście. Poniżej uporządkowana odpowiedź.\n\n${tresc}`;
  if (ton === "luzny") return `Okej, konkretnie:\n\n${tresc}`;
  return tresc;
}

function zbudujOdpowiedz(intencja: Intencja, wejscie: string, ton: TonUzytkownika, kontekst: KontekstRozmowy, jezyk: JezykUI) {
  const n = normalize(wejscie);
  const trescPL: Record<Intencja, string> = {
    ODMOWA: "Jasne, nie naciskam. Mogę zostawić tylko skrót cennika lub krótkie demo 60 sekund.",
    POTWIERDZENIE: "Najpierw cel, potem segment, na końcu test 72h i decyzja budżetowa. To daje najszybszą walidację.",
    SCEPTYCYZM: "Uzasadnione. Dlatego pracujemy na Twoich danych i jawnych założeniach, bez magicznych wyników.",
    CENNIK_PAKIETY: "Mamy trzy plany: Starter, Professional, Enterprise. Podaj SKU, platformę i budżet, a wskażę najlepszy.",
    INTEGRACJE: "Typowa kolejność: sklep, reklamy, analityka. Mogę od razu wskazać czas i kolejność wdrożenia.",
    BEZPIECZENSTWO: "Sprawdzamy 4 warstwy: rezydencja danych, szyfrowanie, izolacja tenantów i audyt operacyjny.",
    ROI: "ROI licz po spięciu marży i kosztów, nie po samym ROAS. Najszybszy test: 72h na jednym segmencie.",
    TECH: "Najważniejsze technikalia to API, BigQuery, SSO, SLA i limity. Dopasuję ścieżkę po 1-2 wymaganiach must-have.",
    DZIALANIE_AI: "To działa jako: intencja -> kontekst -> odpowiedź + następny krok. Mogę pokazać to na Twoim case.",
    CTA_TRIAL: "Jasne. Najpierw podłącz sklep i reklamy, potem uruchamiamy model marży dla pełnego P&L.",
    DOPYTANIE: "Doprecyzuję. Napisz, który obszar mam rozwinąć: cennik, ROI, integracje czy bezpieczeństwo.",
    POROWNANIE: "Mogę porównać warianty decyzji na tych samych metrykach: marża netto, koszt zwrotów i ROAS.",
    NIEZROZUMIALY_INPUT: "Jestem gotowy. Napisz proszę jedno konkretne pytanie o cennik, ROI, integracje lub bezpieczeństwo.",
    PRODUKT_OGOLNIE: `Pomogę Ci dojść do konkretu. Aktualny temat rozmowy: ${kontekst.temat === "nieznany" ? "-" : kontekst.temat}.`,
  };
  const trescEN: Record<Intencja, string> = {
    ODMOWA: "Understood. I will not push. I can leave a compact pricing summary or a 60-second demo.",
    POTWIERDZENIE: "Start with one goal, pick one segment, run a 72-hour test, then decide budget changes.",
    SCEPTYCYZM: "Fair concern. We use your real data and explicit assumptions, no magic outputs.",
    CENNIK_PAKIETY: "Three plans: Starter, Professional, Enterprise. Share SKU count, platform, and ad budget for best fit.",
    INTEGRACJE: "Typical order: store, ads, analytics. I can map timing and sequence for your stack.",
    BEZPIECZENSTWO: "Security is covered in four layers: residency, encryption, tenant isolation, and audit processes.",
    ROI: "Reliable ROI needs margin + costs, not ROAS alone. Fast validation is a 72-hour single-segment test.",
    TECH: "Key technical scope: API, BigQuery, SSO, SLA, and limits. Share 1-2 must-have requirements.",
    DZIALANIE_AI: "Flow is: intent -> context -> response + next action. I can show it on your case.",
    CTA_TRIAL: "Sure. First connect store and ads, then launch the margin model for full P&L visibility.",
    DOPYTANIE: "I can expand this. Tell me which area to detail: pricing, ROI, integrations, or security.",
    POROWNANIE: "I can compare options on the same metrics: net margin, return cost, and ROAS.",
    NIEZROZUMIALY_INPUT: "I am ready. Ask one specific question about pricing, ROI, integrations, or security.",
    PRODUKT_OGOLNIE: `I can help you move to concrete decisions. Current topic: ${kontekst.temat === "nieznany" ? "-" : kontekst.temat}.`,
  };

  if (n.includes("rabat") || n.includes("discount")) return stylTonem(ton, jezyk === "en" ? "Start from margin per SKU, test discount for 72h, and measure net profit." : "Zacznij od marży per SKU, testuj rabat 72h i mierz zysk netto.", jezyk);
  if (n.includes("roas") || n.includes("kampan") || n.includes("campaign")) return stylTonem(ton, jezyk === "en" ? "Compare ROAS with net margin and move budget to higher-profit channels." : "Porównaj ROAS z marżą netto i przenoś budżet do kanałów z wyższym zyskiem.", jezyk);

  const tresc = jezyk === "en" ? trescEN[intencja] : trescPL[intencja];
  return stylTonem(ton, tresc, jezyk);
}

function updateKontekst(prev: KontekstRozmowy, intencja: Intencja, ton: TonUzytkownika, wejscie: string): KontekstRozmowy {
  const next: KontekstRozmowy = { ...prev, tonUzytkownika: ton };
  const temat = mapujTemat(intencja);
  if (temat !== "nieznany") next.temat = temat;
  if (intencja === "ROI") next.etap = "symulacja";
  else if (["CENNIK_PAKIETY", "INTEGRACJE", "BEZPIECZENSTWO", "TECH", "DZIALANIE_AI"].includes(intencja)) next.etap = "analiza";
  else if (intencja === "CTA_TRIAL") next.etap = "trial";
  else if (intencja === "POTWIERDZENIE") next.etap = "rekomendacje";
  else if (intencja === "ODMOWA") next.etap = "intro";

  const n = normalize(wejscie);
  if (intencja === "CTA_TRIAL" || /\b(trial|zaloz konto|załóż konto|start trial|create account|sign up)\b/.test(n)) next.zainteresowanieTrial = "tak";
  if (intencja === "ODMOWA") next.zainteresowanieTrial = "nie";
  if (/\b(enterprise|sso|sla|saml|oidc)\b/.test(n)) next.plan = "Enterprise";
  else if (/\b(professional|pełny|pelny|full)\b/.test(n)) next.plan = "Professional";
  else if (/\b(starter|basic)\b/.test(n)) next.plan = "Starter";
  return next;
}

export function WidgetCzatuPapaAi({ onOpenTrial, onZmianaOtwarcia }: WidgetCzatuPapaAiProps) {
  const { jezyk } = useUI();
  const tekst = TEKSTY_CZATU[jezyk];
  const [otwarty, setOtwarty] = useState(false);
  const [wiadomosc, setWiadomosc] = useState("");
  const [czyWysylanie, setCzyWysylanie] = useState(false);
  const [kontekst, setKontekst] = useState<KontekstRozmowy>({
    temat: "nieznany",
    plan: "nieznany",
    etap: "intro",
    tonUzytkownika: "neutralny",
    zainteresowanieTrial: "niepewne",
  });
  const [wiadomosci, setWiadomosci] = useState<WiadomoscCzatu[]>(() => [
    { id: "start", autor: "papai", typ: "wiadomosc", tresc: TEKSTY_CZATU[jezyk].wiadomoscStartowa, ts: 0 },
  ]);

  const tytulId = useId();
  const opisId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listaRef = useRef<HTMLDivElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const ostatniFokusRef = useRef<HTMLElement | null>(null);
  const kontekstRef = useRef<KontekstRozmowy>(kontekst);
  const idCounterRef = useRef(0);
  const timers = useRef<{ rotate: number | null; finalize: number | null }>({ rotate: null, finalize: null });

  const uid = useCallback((prefix: string) => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}-${bezpiecznyLosowyHex(6)}`;
  }, []);

  const przewinDoKonca = useCallback(() => {
    if (!listaRef.current) return;
    listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, []);

  const bezpiecznieWyczyscTimery = useCallback(() => {
    if (timers.current.rotate !== null) window.clearInterval(timers.current.rotate);
    if (timers.current.finalize !== null) window.clearTimeout(timers.current.finalize);
    timers.current.rotate = null;
    timers.current.finalize = null;
  }, []);

  const zamknijCzat = useCallback(() => {
    bezpiecznieWyczyscTimery();
    setCzyWysylanie(false);
    setOtwarty(false);
  }, [bezpiecznieWyczyscTimery]);

  const dopiszStatusAnimowany = useCallback(
    (intencja: Intencja) => {
      const statusId = uid("status");
      const statusy = statusyDlaIntencji(intencja, jezyk);
      setWiadomosci((prev) => [
        ...prev,
        { id: statusId, autor: "papai", typ: "status", tresc: statusy[0], ts: Date.now() },
      ]);

      let idx = 0;
      bezpiecznieWyczyscTimery();
      timers.current.rotate = window.setInterval(() => {
        idx = (idx + 1) % statusy.length;
        setWiadomosci((prev) => prev.map((m) => (m.id === statusId ? { ...m, tresc: statusy[idx] } : m)));
      }, 820);
      return statusId;
    },
    [bezpiecznieWyczyscTimery, jezyk, uid]
  );

  const wyslijWiadomosc = useCallback(() => {
    const tresc = wiadomosc.trim();
    if (!tresc || czyWysylanie) return;

    const ton = wykryjTon(tresc);
    const intencja = klasyfikujIntencje(tresc);
    setCzyWysylanie(true);
    setWiadomosci((prev) => [...prev, { id: uid("u"), autor: "uzytkownik", typ: "wiadomosc", tresc, ts: Date.now() }]);
    setWiadomosc("");
    setKontekst((prev) => updateKontekst(prev, intencja, ton, tresc));

    const statusId = dopiszStatusAnimowany(intencja);
    timers.current.finalize = window.setTimeout(() => {
      bezpiecznieWyczyscTimery();
      setWiadomosci((prev) => prev.filter((m) => m.id !== statusId));
      const odpowiedz = zbudujOdpowiedz(intencja, tresc, ton, kontekstRef.current, jezyk);
      const cta = mikroCtaDlaIntencji(intencja, jezyk);
      setWiadomosci((prev) => [
        ...prev,
        { id: uid("a"), autor: "papai", typ: "wiadomosc", tresc: `${odpowiedz}\n\n${tekst.prefixMikroCta} ${cta}`, ts: Date.now() },
      ]);
      setCzyWysylanie(false);
    }, durationMsDlaIntencji(intencja));
  }, [bezpiecznieWyczyscTimery, czyWysylanie, dopiszStatusAnimowany, jezyk, tekst.prefixMikroCta, uid, wiadomosc]);

  // odpowiada za synchronizacje kontekstu dla asynchronicznych callbackow
  useEffect(() => {
    kontekstRef.current = kontekst;
  }, [kontekst]);

  // odpowiada za trap fokusu i obsluge ESC
  useEffect(() => {
    if (!otwarty) return;
    ostatniFokusRef.current = document.activeElement as HTMLElement | null;
    const root = panelRef.current;
    const launcherEl = launcherRef.current;
    const focusId = window.setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
      else if (root) (pobierzElementyFokusowalne(root)[0] ?? root).focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        zamknijCzat();
        return;
      }
      if (event.key !== "Tab" || !root) return;
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
      } else if (!aktywny || aktywny === ostatni) {
        event.preventDefault();
        pierwszy.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener("keydown", onKeyDown);
      window.setTimeout(() => (launcherEl ?? ostatniFokusRef.current)?.focus(), 0);
    };
  }, [otwarty, zamknijCzat]);

  // odpowiada za przewijanie listy wiadomosci do konca
  useEffect(() => {
    przewinDoKonca();
  }, [przewinDoKonca, wiadomosci]);

  // odpowiada za raportowanie stanu open/close do warstwy nadrzednej
  useEffect(() => {
    onZmianaOtwarcia?.(otwarty);
  }, [onZmianaOtwarcia, otwarty]);

  // odpowiada za czyszczenie timerow na odmontowaniu
  useEffect(() => () => bezpiecznieWyczyscTimery(), [bezpiecznieWyczyscTimery]);

  const czyMoznaWyslac = wiadomosc.trim().length > 0 && !czyWysylanie;

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          if (otwarty) {
            zamknijCzat();
            return;
          }
          setOtwarty(true);
        }}
        aria-expanded={otwarty}
        aria-controls="papadata-czat-ai"
        aria-pressed={otwarty}
        aria-label={otwarty ? tekst.ariaZamknij : tekst.ariaOtworz}
        className="pd-btn-primary pd-focus-ring fixed bottom-4 right-4 z-[var(--z-floating)] grid h-14 w-14 place-items-center rounded-2xl text-sm font-black tracking-[0.08em] text-white sm:bottom-5 sm:right-5"
      >
        AI
      </button>
      {otwarty && (
        <>
          {/* odpowiada za zamkniecie panelu po kliknieciu poza obszarem dialogu */}
          <button
            type="button"
            onClick={zamknijCzat}
            className="fixed inset-0 z-[calc(var(--z-floating)-2)] bg-slate-950/20 backdrop-blur-[1px]"
            aria-label={tekst.ariaZamknijPanel}
          />

          <section
            id="papadata-czat-ai"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tytulId}
            aria-describedby={opisId}
            tabIndex={-1}
            className={cls(
              "pd-glass pd-edge pd-innerglow pd-glass-soft !fixed bottom-[76px] right-4 z-[calc(var(--z-floating)-1)] w-[min(88vw,404px)] max-w-[404px] overflow-hidden rounded-[26px]",
              "border border-black/15 shadow-[0_30px_64px_-40px_rgba(2,6,23,0.82)] dark:border-white/15 sm:bottom-[80px] sm:right-5"
            )}
          >
            {/* odpowiada za naglowek i akcje zamkniecia */}
            <header className="border-b border-black/10 px-4 py-3 dark:border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400">
                    {tekst.kicker}
                  </p>
                  <h2 id={tytulId} className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {tekst.tytul}
                  </h2>
                  <p id={opisId} className="mt-1 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                    {tekst.opis}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge>{jezyk === "en" ? "Topic" : "Temat"}: {kontekst.temat}</Badge>
                    <Badge>{jezyk === "en" ? "Stage" : "Etap"}: {kontekst.etap}</Badge>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={zamknijCzat}
                  className="pd-focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/70 text-lg font-black text-slate-700 transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
                  aria-label={tekst.ariaZamknijPanel}
                >
                  ×
                </button>
              </div>
            </header>

            {/* odpowiada za liste dymkow rozmowy */}
            <div className="p-4">
              <div
                ref={listaRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
                className="max-h-[300px] space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10"
              >
                {wiadomosci.map((m) => {
                  const isUser = m.autor === "uzytkownik";
                  const isStatus = m.typ === "status";
                  const trescDoWyswietlenia = m.id === "start" ? tekst.wiadomoscStartowa : m.tresc;
                  return (
                    <div key={m.id} className={cls("flex", isUser ? "justify-end" : "justify-start")}>
                      <article
                        className={cls(
                          "relative max-w-[88%] whitespace-pre-wrap rounded-2xl border px-3.5 py-2.5 text-sm font-medium leading-relaxed",
                          isUser
                            ? "border-sky-300/35 bg-sky-500/14 text-slate-900 dark:text-slate-100"
                            : "border-black/10 bg-white/78 text-slate-800 dark:border-white/15 dark:bg-white/10 dark:text-slate-200",
                          isStatus && "opacity-90"
                        )}
                      >
                        {isUser ? (
                          <Tail side="right" className="border border-sky-300/35 bg-sky-500/14" />
                        ) : (
                          <Tail side="left" className="border border-black/10 bg-white/78 dark:border-white/15 dark:bg-white/10" />
                        )}
                        <div className="flex items-start gap-2">
                          {!isUser && (
                            <span
                              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-slate-900/5 text-[10px] font-black tracking-[0.12em] text-slate-700 dark:bg-white/10 dark:text-slate-200"
                              aria-hidden="true"
                            >
                              AI
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            {isStatus ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{trescDoWyswietlenia}</span>
                                <span className="inline-flex items-center gap-1" aria-hidden="true">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 motion-reduce:animate-none dark:bg-slate-500" />
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms] motion-reduce:animate-none dark:bg-slate-500" />
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms] motion-reduce:animate-none dark:bg-slate-500" />
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm font-medium">{trescDoWyswietlenia}</p>
                            )}
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>

              {/* odpowiada za szybkie podpowiedzi pytan */}
              <div className="mt-3 flex flex-wrap gap-2">
                {tekst.podpowiedzi.map((podpowiedz) => (
                  <button
                    key={podpowiedz.etykieta}
                    type="button"
                    onClick={() => setWiadomosc(podpowiedz.tresc)}
                    className="pd-focus-ring rounded-xl border border-black/10 bg-white/70 px-2.5 py-1.5 text-xs font-extrabold tracking-[0.08em] text-slate-700 transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                  >
                    {podpowiedz.etykieta}
                  </button>
                ))}
              </div>
            </div>

            {/* odpowiada za pole wpisu i cta trialowe */}
            <footer className="border-t border-black/10 p-4 dark:border-white/10">
              <div className="flex gap-2">
                <label htmlFor="papadata-czat-input" className="sr-only">
                  {tekst.inputLabel}
                </label>
                <input
                  id="papadata-czat-input"
                  ref={inputRef}
                  value={wiadomosc}
                  onChange={(event) => setWiadomosc(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") wyslijWiadomosc();
                  }}
                  placeholder={tekst.inputPlaceholder}
                  className="h-11 flex-1 rounded-xl border border-black/10 bg-white/85 px-3 text-sm font-medium text-slate-900 outline-none transition focus-visible:ring-2 focus-visible:ring-sky-300 dark:border-white/15 dark:bg-white/10 dark:text-slate-100"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={wyslijWiadomosc}
                  disabled={!czyMoznaWyslac}
                  className="pd-btn-secondary pd-focus-ring h-11 rounded-xl px-3 text-xs font-extrabold tracking-[0.1em] uppercase text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-100"
                >
                  {tekst.przyciskWyslij}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setKontekst((prev) => ({ ...prev, zainteresowanieTrial: "tak", etap: "trial" }));
                  onOpenTrial();
                  zamknijCzat();
                }}
                className="pd-focus-ring mt-3 w-full rounded-xl border border-sky-300/45 bg-sky-500/12 px-3 py-2 text-xs font-extrabold tracking-[0.1em] uppercase text-sky-900 transition hover:bg-sky-500/18 dark:text-sky-200"
              >
                {tekst.przyciskTrial}
              </button>
            </footer>
          </section>
        </>
      )}
    </>
  );
}

export default WidgetCzatuPapaAi;
