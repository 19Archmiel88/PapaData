import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PowodZmiany = "auto" | "manual" | "next" | "prev" | "reset" | "clamp";

type AutoRotateOptions = {
  itemCount: number;
  intervalMs: number;
  isDisabled?: boolean;
  lockOnUserInteraction?: boolean;
  onChange?: (index: number, meta: { reason: PowodZmiany }) => void;
};

export function useVertexAutoRotate({
  itemCount,
  intervalMs,
  isDisabled,
  lockOnUserInteraction = true,
  onChange,
}: AutoRotateOptions) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserControlled, setIsUserControlled] = useState(false);
  const timerRef = useRef<number | null>(null);

  const hasItems = itemCount > 0;

  const canAutoRotate = useMemo(() => {
    if (isDisabled) return false;
    if (isPaused) return false;
    if (!hasItems || itemCount <= 1) return false;
    if (intervalMs <= 0) return false;
    if (lockOnUserInteraction && isUserControlled) return false;
    return true;
  }, [hasItems, intervalMs, isDisabled, isPaused, isUserControlled, itemCount, lockOnUserInteraction]);

  const clampIndex = useCallback(
    (value: number) => {
      if (!hasItems) return 0;
      const max = itemCount - 1;
      if (value < 0) return 0;
      if (value > max) return max;
      return value;
    },
    [hasItems, itemCount]
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setIndexWithMeta = useCallback(
    (nextIndex: number, reason: PowodZmiany) => {
      setIndex((prev) => {
        const clamped = clampIndex(nextIndex);
        if (clamped !== prev) onChange?.(clamped, { reason });
        return clamped;
      });
    },
    [clampIndex, onChange]
  );

  useEffect(() => {
    clearTimer();
    if (!canAutoRotate) return;

    const tick = () => {
      timerRef.current = window.setTimeout(() => {
        setIndex((prev) => {
          const next = hasItems ? (prev + 1) % itemCount : 0;
          if (next !== prev) onChange?.(next, { reason: "auto" });
          return next;
        });
        tick();
      }, intervalMs);
    };

    tick();
    return () => clearTimer();
  }, [canAutoRotate, clearTimer, hasItems, intervalMs, itemCount, onChange]);

  const setManualIndex = useCallback(
    (nextIndex: number) => {
      setIsUserControlled(true);
      setIndexWithMeta(nextIndex, "manual");
    },
    [setIndexWithMeta]
  );

  const next = useCallback(() => {
    setIsUserControlled(true);
    setIndex((prev) => {
      const nextIndex = hasItems ? (prev + 1) % itemCount : 0;
      if (nextIndex !== prev) onChange?.(nextIndex, { reason: "next" });
      return nextIndex;
    });
  }, [hasItems, itemCount, onChange]);

  const prev = useCallback(() => {
    setIsUserControlled(true);
    setIndex((prevValue) => {
      if (!hasItems) return 0;
      const nextIndex = (prevValue - 1 + itemCount) % itemCount;
      if (nextIndex !== prevValue) onChange?.(nextIndex, { reason: "prev" });
      return nextIndex;
    });
  }, [hasItems, itemCount, onChange]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const setAuto = useCallback(() => setIsUserControlled(false), []);
  const reset = useCallback(() => {
    setIsPaused(false);
    setIsUserControlled(false);
    setIndexWithMeta(0, "reset");
  }, [setIndexWithMeta]);

  const indexWidoku = useMemo(() => clampIndex(index), [clampIndex, index]);

  return {
    index: indexWidoku,
    setManualIndex,
    next,
    prev,
    pause,
    resume,
    setAuto,
    reset,
    isUserControlled,
    isPaused,
    canAutoRotate,
  };
}

export default useVertexAutoRotate;
