import { useEffect, useRef, useState, type RefObject } from "react";

export type InViewOptions = {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
  enabled?: boolean;
  initialInView?: boolean;
};

export function useInView<T extends Element = HTMLDivElement>(
  options: InViewOptions = {}
): [RefObject<T | null>, boolean] {
  const {
    threshold = 0.1,
    rootMargin = "200px",
    root = null,
    triggerOnce = true,
    enabled = true,
    initialInView = false,
  } = options;

  const [isInView, setIsInView] = useState(() => {
    if (typeof window !== "undefined" && !("IntersectionObserver" in window)) return true;
    return initialInView;
  });
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = Boolean(entry?.isIntersecting);
        setIsInView((prev) => (prev === next ? prev : next));
        if (next && triggerOnce) observer.unobserve(element);
      },
      { threshold, rootMargin, root }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, root, rootMargin, threshold, triggerOnce]);

  return [ref, isInView];
}

type IdleLoadOptions = {
  timeout?: number;
  fallbackDelay?: number;
  enabled?: boolean;
};

type IdleHandle = number;
type RequestIdleCallback = (
  callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
  options?: { timeout?: number }
) => IdleHandle;
type CancelIdleCallback = (handle: IdleHandle) => void;

export function useIdleLoad(callback: () => void, options: IdleLoadOptions = {}) {
  const { timeout = 2000, fallbackDelay = 1000, enabled = true } = options;
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const wykonanoRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    wykonanoRef.current = false;

    const runOnce = () => {
      if (wykonanoRef.current) return;
      wykonanoRef.current = true;
      callbackRef.current();
    };

    const idleWindow = window as unknown as {
      requestIdleCallback?: RequestIdleCallback;
      cancelIdleCallback?: CancelIdleCallback;
    };

    if (
      typeof idleWindow.requestIdleCallback === "function" &&
      typeof idleWindow.cancelIdleCallback === "function"
    ) {
      const handle = idleWindow.requestIdleCallback(() => runOnce(), { timeout });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const timeoutHandle = window.setTimeout(() => runOnce(), fallbackDelay);
    return () => window.clearTimeout(timeoutHandle);
  }, [enabled, fallbackDelay, timeout]);
}

export default useInView;
