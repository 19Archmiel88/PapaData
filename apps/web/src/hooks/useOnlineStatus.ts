import { useEffect, useState } from "react";

type NetworkInformationLite = {
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

function getConnection() {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInformationLite }).connection;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const documentRef = typeof document !== "undefined" ? document : null;

    const synchronizuj = () => {
      if (typeof navigator === "undefined") return;
      const next = navigator.onLine;
      setIsOnline((prev) => (prev === next ? prev : next));
    };

    const onVisibility = () => {
      if (!documentRef) return;
      if (documentRef.visibilityState === "visible") synchronizuj();
    };

    synchronizuj();

    window.addEventListener("online", synchronizuj);
    window.addEventListener("offline", synchronizuj);
    window.addEventListener("focus", synchronizuj);
    window.addEventListener("pageshow", synchronizuj);
    documentRef?.addEventListener("visibilitychange", onVisibility);

    const connection = getConnection();
    connection?.addEventListener?.("change", synchronizuj);

    return () => {
      window.removeEventListener("online", synchronizuj);
      window.removeEventListener("offline", synchronizuj);
      window.removeEventListener("focus", synchronizuj);
      window.removeEventListener("pageshow", synchronizuj);
      documentRef?.removeEventListener("visibilitychange", onVisibility);
      connection?.removeEventListener?.("change", synchronizuj);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;
