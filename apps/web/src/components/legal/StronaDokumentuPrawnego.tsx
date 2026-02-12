import { useMemo } from "react";

type StronaDokumentuPrawnegoProps = {
  tytul: string;
  trescHtml: string;
  urlZrodla: string;
  onPowrot: () => void;
};

function bezpiecznyUrl(url: string) {
  const wartosc = (url ?? "").trim();
  if (!wartosc) return "#";
  if (
    wartosc.startsWith("/") ||
    wartosc.startsWith("./") ||
    wartosc.startsWith("../") ||
    wartosc.startsWith("#")
  ) {
    return wartosc;
  }

  try {
    const parsed = new URL(wartosc);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return "#";
  }

  return "#";
}

function sanitizujHtml(html: string) {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const dokument = parser.parseFromString(html, "text/html");

  // odpowiada za usuniecie niebezpiecznych elementow osadzanych
  dokument.querySelectorAll("script, iframe, object, embed, style, link").forEach((element) => {
    element.remove();
  });

  // odpowiada za hardening linkow i obrazow
  dokument.querySelectorAll("a").forEach((anchor) => {
    const href = bezpiecznyUrl(anchor.getAttribute("href") ?? "");
    anchor.setAttribute("href", href);
    anchor.setAttribute("rel", "noopener noreferrer");
  });

  dokument.querySelectorAll("img").forEach((img) => {
    const src = bezpiecznyUrl(img.getAttribute("src") ?? "");
    img.setAttribute("src", src);
    if (!img.hasAttribute("alt")) img.setAttribute("alt", "");
    img.setAttribute("loading", "lazy");
  });

  return dokument.body.innerHTML;
}

export function StronaDokumentuPrawnego({
  tytul,
  trescHtml,
  urlZrodla,
  onPowrot,
}: StronaDokumentuPrawnegoProps) {
  const html = useMemo(() => sanitizujHtml(trescHtml), [trescHtml]);
  const url = useMemo(() => bezpiecznyUrl(urlZrodla), [urlZrodla]);

  return (
    <main className="relative z-[var(--z-content)] min-h-screen px-6 py-10">
      <section className="pd-container">
        <article className="pd-glass pd-edge pd-innerglow mx-auto max-w-[920px] rounded-[30px] border border-black/10 p-7 dark:border-white/10 md:p-10">
          {/* odpowiada za naglowek strony dokumentu prawnego */}
          <header className="flex flex-col gap-3 border-b border-black/10 pb-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                Dokument prawny
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                {tytul}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onPowrot}
                className="pd-btn-secondary h-10 rounded-2xl px-4 text-xs font-extrabold tracking-[0.1em] uppercase text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:text-slate-100"
              >
                Wroc
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="pd-btn-primary inline-flex h-10 items-center rounded-2xl px-4 text-xs font-extrabold tracking-[0.1em] uppercase text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Otworz zrodlo
              </a>
            </div>
          </header>

          {/* odpowiada za render tresci dokumentu po sanitizacji */}
          <div
            className="prose prose-slate mt-6 max-w-none text-sm leading-relaxed dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </section>
    </main>
  );
}

export default StronaDokumentuPrawnego;
