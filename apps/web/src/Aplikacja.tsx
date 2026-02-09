import { useEffect, useMemo, useState } from "react";

// odpowiada za typografię i layout ekranu
export function Aplikacja() {
  const [status, setStatus] = useState<"ladowanie" | "ok" | "blad">("ladowanie");

  // odpowiada za adres API
  const adresApi = useMemo(() => "http://127.0.0.1:3001", []);

  // odpowiada za pobranie statusu backendu
  useEffect(() => {
    let aktywne = true;

    async function sprawdz() {
      try {
        const res = await fetch(`${adresApi}/health`);
        if (!res.ok) throw new Error("HTTP not ok");
        const data = (await res.json()) as { ok?: boolean };
        if (!data?.ok) throw new Error("Response not ok");
        if (aktywne) setStatus("ok");
      } catch {
        if (aktywne) setStatus("blad");
      }
    }

    sprawdz();

    return () => {
      aktywne = false;
    };
  }, [adresApi]);

  const tekstStatusu =
    status === "ladowanie" ? "Ładowanie…" : status === "ok" ? "OK" : "Błąd połączenia";

  return (
    <div style={{ fontFamily: "system-ui, Segoe UI, Arial, sans-serif", padding: 24, lineHeight: 1.4 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>PapaData</h1>

      <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12, maxWidth: 520 }}>
        <div style={{ fontSize: 14, opacity: 0.8 }}>Status backendu</div>
        <div style={{ marginTop: 6, fontSize: 18, fontWeight: 600 }}>{tekstStatusu}</div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
          Endpoint: <code>{adresApi}/health</code>
        </div>
      </div>
    </div>
  );
}
