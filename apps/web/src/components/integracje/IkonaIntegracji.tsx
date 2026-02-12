import type { KategoriaIntegracji } from "./katalogIntegracji";

type RozmiarIkony = "sm" | "md" | "lg";

type IkonaIntegracjiProps = {
  nazwa: string;
  kategoria: KategoriaIntegracji;
  rozmiar?: RozmiarIkony;
  aktywna?: boolean;
  kolor?: string;
  skrotNadpisany?: string;
  className?: string;
};

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

// odpowiada za mapowanie integracji na klasy ikon Font Awesome
const MAPA_KLAS_IKON: Record<string, string> = {
  shopify: "fa-brands fa-shopify",
  allegro: "fa-solid fa-basket-shopping",
  "google ads": "fa-brands fa-google",
  "meta ads": "fa-brands fa-facebook",
  magento: "fa-brands fa-magento",
  woocommerce: "fa-brands fa-wordpress",
  prestashop: "fa-solid fa-store",
  ga4: "fa-solid fa-chart-simple",
  "google analytics 4": "fa-solid fa-chart-simple",
  tiktok: "fa-brands fa-tiktok",
  "tiktok ads": "fa-brands fa-tiktok",
  baselinker: "fa-solid fa-link",
  amazon: "fa-brands fa-amazon",
  salesmanago: "fa-solid fa-paper-plane",
  klaviyo: "fa-solid fa-envelope-open-text",
  inpost: "fa-solid fa-truck-fast",
  shoper: "fa-solid fa-shop",
  idosell: "fa-solid fa-server",
  ceneo: "fa-solid fa-magnifying-glass-dollar",
  "allegro ads": "fa-solid fa-basket-shopping",
};

const TON_KATEGORII: Record<
  KategoriaIntegracji,
  { obrys: string; tlo: string; tekst: string }
> = {
  ads: {
    obrys: "border-cyan-500/35",
    tlo: "bg-cyan-500/14",
    tekst: "text-cyan-700 dark:text-cyan-300",
  },
  store: {
    obrys: "border-fuchsia-500/35",
    tlo: "bg-fuchsia-500/14",
    tekst: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  hub: {
    obrys: "border-amber-500/35",
    tlo: "bg-amber-500/12",
    tekst: "text-amber-700 dark:text-amber-300",
  },
  crm: {
    obrys: "border-emerald-500/35",
    tlo: "bg-emerald-500/12",
    tekst: "text-emerald-700 dark:text-emerald-300",
  },
  ops: {
    obrys: "border-violet-500/35",
    tlo: "bg-violet-500/12",
    tekst: "text-violet-700 dark:text-violet-300",
  },
};

const ROZMIAR: Record<RozmiarIkony, string> = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

const ROZMIAR_IKONY_FA: Record<RozmiarIkony, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

function etykietaSkrotu(nazwa: string) {
  const slowa = nazwa
    .split(/[\s-]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (slowa.length === 0) return "PD";
  if (slowa.length === 1) return slowa[0].slice(0, 2).toUpperCase();
  return `${slowa[0][0] ?? ""}${slowa[1][0] ?? ""}`.toUpperCase();
}

function normalizujKluczIkony(nazwa: string) {
  return nazwa.trim().toLowerCase().replace(/\s+/g, " ");
}

function pobierzKlaseIkony(nazwa: string) {
  return MAPA_KLAS_IKON[normalizujKluczIkony(nazwa)] ?? null;
}

export function IkonaIntegracji({
  nazwa,
  kategoria,
  rozmiar = "md",
  aktywna = false,
  kolor,
  skrotNadpisany,
  className,
}: IkonaIntegracjiProps) {
  const ton = TON_KATEGORII[kategoria];
  const skrot = skrotNadpisany || etykietaSkrotu(nazwa);
  const klasaIkony = pobierzKlaseIkony(nazwa);
  const stylKoloru = kolor
    ? ({
        borderColor: `${kolor}66`,
        backgroundColor: `${kolor}1F`,
        color: kolor,
      } as const)
    : undefined;

  return (
    <span
      aria-hidden="true"
      style={stylKoloru}
      className={cx(
        "inline-flex select-none items-center justify-center rounded-xl border font-black tracking-[0.08em]",
        ROZMIAR[rozmiar],
        !kolor && ton.obrys,
        !kolor && ton.tlo,
        !kolor && ton.tekst,
        aktywna &&
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_14px_28px_-24px_rgba(14,116,144,0.7)]",
        className
      )}
      title={nazwa}
    >
      {klasaIkony ? <i className={cx(klasaIkony, ROZMIAR_IKONY_FA[rozmiar])} /> : skrot}
    </span>
  );
}

export default IkonaIntegracji;
