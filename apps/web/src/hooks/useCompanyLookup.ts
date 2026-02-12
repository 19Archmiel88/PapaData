import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeApiError } from "./useApiError";
import { BladApi } from "../uslugi/api/bledyApi";
import {
  pobierzFirmePoNip,
  type OdpowiedzLookupFirmy,
} from "../uslugi/api/firmaPublicznaApi";

type CompanyLookupError = {
  message: string;
};

type CacheEntry = {
  data: OdpowiedzLookupFirmy | null;
  ts: number;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function czyNipPoprawny(nip: string) {
  return /^\d{10}$/.test(nip.trim());
}

export function useCompanyLookup(nip: string) {
  const normalizedNip = useMemo(() => nip.replace(/\D/g, "").trim(), [nip]);
  const [data, setData] = useState<OdpowiedzLookupFirmy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CompanyLookupError | null>(null);
  const [notFound, setNotFound] = useState(false);
  const latestNipRef = useRef<string>("");

  useEffect(() => {
    if (!czyNipPoprawny(normalizedNip)) {
      setLoading(false);
      setError(null);
      setNotFound(false);
      setData(null);
      latestNipRef.current = "";
      return;
    }

    const cached = cache.get(normalizedNip);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setData(cached.data);
      setNotFound(cached.data === null);
      setError(null);
      setLoading(false);
      latestNipRef.current = normalizedNip;
      return;
    }

    const controller = new AbortController();
    latestNipRef.current = normalizedNip;
    setError(null);
    setNotFound(false);
    setLoading(false);

    const timer = window.setTimeout(() => {
      const run = async (attempt: number) => {
        setLoading(true);
        try {
          const res = await pobierzFirmePoNip(normalizedNip, { signal: controller.signal });
          if (latestNipRef.current !== normalizedNip) return;
          cache.set(normalizedNip, { data: res, ts: Date.now() });
          setData(res);
          setNotFound(false);
          setError(null);
        } catch (err) {
          if ((err as { name?: string }).name === "AbortError") return;
          if (latestNipRef.current !== normalizedNip) return;

          if (err instanceof BladApi && err.status === 404) {
            cache.set(normalizedNip, { data: null, ts: Date.now() });
            setNotFound(true);
            setData(null);
            setError(null);
            return;
          }

          const retryable =
            err instanceof BladApi && (err.kod === "API_SIEC" || err.kod === "API_TIMEOUT");
          if (retryable && attempt === 0) {
            await new Promise((resolve) => window.setTimeout(resolve, 400));
            return run(1);
          }

          setError({
            message: normalizeApiError(err, "Nie udalo sie pobrac danych firmy."),
          });
          setData(null);
          setNotFound(false);
        } finally {
          if (latestNipRef.current === normalizedNip) {
            setLoading(false);
          }
        }
      };

      void run(0);
    }, 600);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedNip]);

  return { data, loading, error, notFound };
}

export default useCompanyLookup;
