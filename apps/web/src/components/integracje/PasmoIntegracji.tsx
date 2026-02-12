import { useMemo } from "react";
import { IkonaIntegracji } from "./IkonaIntegracji";
import { INTEGRACJE_KATALOG, type KategoriaIntegracji } from "./katalogIntegracji";

type PasmoIntegracjiProps = {
  pozycje: string[];
  etykieta: string;
  id?: string;
};

function normalizujTekst(wartosc: string) {
  return wartosc
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

type PozycjaPasma = {
  nazwa: string;
  kategoria: KategoriaIntegracji;
  kolor?: string;
  ikonaSkrot?: string;
};

export function PasmoIntegracji({ pozycje, etykieta, id }: PasmoIntegracjiProps) {
  // odpowiada za mapowanie nazw z pasma na dane integracji z katalogu
  const pozycjePasma = useMemo<PozycjaPasma[]>(() => {
    const mapaKatalogu = new Map(
      INTEGRACJE_KATALOG.map((integracja) => [normalizujTekst(integracja.nazwa), integracja])
    );
    const unikalne = Array.from(new Map(pozycje.map((p) => [normalizujTekst(p), p])).values());

    return unikalne.map((nazwa) => {
      const wpis = mapaKatalogu.get(normalizujTekst(nazwa));
      return {
        nazwa,
        kategoria: wpis?.kategoria ?? "hub",
        kolor: wpis?.kolor,
        ikonaSkrot: wpis?.ikonaSkrot,
      };
    });
  }, [pozycje]);

  if (!pozycjePasma.length) return null;

  const renderLista = (prefiks: string, ariaHidden: boolean) => (
    <ul
      key={prefiks}
      aria-hidden={ariaHidden}
      className="flex min-w-full shrink-0 items-center justify-center gap-6 px-4 sm:gap-10 sm:px-8"
    >
      {pozycjePasma.map((integracja, index) => (
        <li key={`${prefiks}-${integracja.nazwa}-${index}`} className="shrink-0">
          <span className="pd-marquee-item inline-flex items-center gap-2 text-sm font-bold whitespace-nowrap sm:text-base">
            <IkonaIntegracji
              nazwa={integracja.nazwa}
              kategoria={integracja.kategoria}
              kolor={integracja.kolor}
              skrotNadpisany={integracja.ikonaSkrot}
              rozmiar="sm"
              className="pd-marquee-item-icon"
            />
            {integracja.nazwa}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      id={id}
      role="region"
      aria-label={etykieta}
      className="pd-marquee-strip relative isolate mt-7 overflow-hidden rounded-2xl border border-violet-300/25"
    >
      <div className="pd-marquee-mask pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      <p className="px-4 pt-4 pb-3 text-center text-[11px] font-extrabold tracking-[0.2em] uppercase text-slate-600 dark:text-slate-400">
        {etykieta}
      </p>
      <div className="pb-4">
        <div className="group relative mx-auto w-full overflow-hidden">
          <div className="pd-marquee-track motion-safe:animate-pd-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
            {renderLista("a", false)}
            {renderLista("b", true)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PasmoIntegracji;
