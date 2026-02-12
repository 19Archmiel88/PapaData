import { useEffect } from "react";

type UseScrollRevealOptions = {
  selector?: string;
};

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { selector = "[data-pd-reveal]" } = options;

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (elements.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      elements.forEach((element) => {
        element.classList.add("pd-reveal-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.classList.add("pd-reveal-visible");
          observer.unobserve(target);
        });
      },
      {
        root: null,
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    elements.forEach((element, index) => {
      const delay = Math.min(index % 6, 5) * 70;
      element.style.setProperty("--pd-reveal-delay", `${delay}ms`);
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [selector]);
}

export default useScrollReveal;
