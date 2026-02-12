export type WebVitalName = "CLS" | "LCP" | "INP" | "TTFB";

export type WebVitalMetric = {
  name: WebVitalName;
  value: number;
};

type ReportFn = (metric: WebVitalMetric) => void;

type LayoutShiftEntry = PerformanceEntry & {
  value?: number;
  hadRecentInput?: boolean;
};

type LcpEntry = PerformanceEntry & {
  startTime: number;
};

type EventTimingEntry = PerformanceEntry & {
  duration?: number;
  interactionId?: number;
};

let czyZainicjalizowano = false;

function utworzAkumulatorCls() {
  let wartoscSesji = 0;
  let startSesji = 0;
  let ostatni = 0;
  let maksimum = 0;

  return {
    push(entry: LayoutShiftEntry) {
      const wartosc = entry.value ?? 0;
      const czas = entry.startTime ?? 0;
      const nowaSesja =
        startSesji === 0 || czas - ostatni > 1000 || czas - startSesji > 5000;

      if (nowaSesja) {
        wartoscSesji = wartosc;
        startSesji = czas;
        ostatni = czas;
      } else {
        wartoscSesji += wartosc;
        ostatni = czas;
      }

      if (wartoscSesji > maksimum) maksimum = wartoscSesji;
    },
    get() {
      return maksimum;
    },
  };
}

function utworzAkumulatorInp() {
  let maksimum = 0;
  return {
    push(entry: EventTimingEntry) {
      const id = entry.interactionId ?? 0;
      const duration = entry.duration ?? 0;
      if (id > 0 && duration > maksimum) maksimum = duration;
    },
    get() {
      return maksimum;
    },
  };
}

export function initWebVitals(report: ReportFn) {
  if (czyZainicjalizowano) return;
  czyZainicjalizowano = true;

  if (
    typeof window === "undefined" ||
    typeof PerformanceObserver === "undefined" ||
    typeof performance === "undefined"
  ) {
    return;
  }

  const cls = utworzAkumulatorCls();
  const inp = utworzAkumulatorInp();
  let lcp = 0;

  const observerLcp = new PerformanceObserver((list) => {
    const entries = list.getEntries() as LcpEntry[];
    const last = entries[entries.length - 1];
    if (last) lcp = last.startTime;
  });
  const observerCls = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) cls.push(entry);
    }
  });
  const observerInp = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as EventTimingEntry[]) inp.push(entry);
  });

  try {
    observerLcp.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    observerLcp.disconnect();
  }
  try {
    observerCls.observe({ type: "layout-shift", buffered: true });
  } catch {
    observerCls.disconnect();
  }
  try {
    observerInp.observe({
      type: "event",
      buffered: true,
      durationThreshold: 40,
    } as PerformanceObserverInit);
  } catch {
    observerInp.disconnect();
  }

  const flush = () => {
    if (lcp > 0) report({ name: "LCP", value: Math.round(lcp) });

    const clsVal = cls.get();
    if (clsVal > 0) report({ name: "CLS", value: Number(clsVal.toFixed(4)) });

    const inpVal = inp.get();
    if (inpVal > 0) report({ name: "INP", value: Math.round(inpVal) });

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      if (Number.isFinite(ttfb) && ttfb >= 0) {
        report({ name: "TTFB", value: Math.round(ttfb) });
      }
    }

    observerLcp.disconnect();
    observerCls.disconnect();
    observerInp.disconnect();
    window.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
  };

  const onVisibility = () => {
    if (document.visibilityState === "hidden") flush();
  };
  const onPageHide = () => {
    flush();
  };

  window.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);
}

export default initWebVitals;
