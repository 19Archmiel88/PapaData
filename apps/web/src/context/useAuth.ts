import { useContext } from "react";
import { KontekstAuth } from "./auth-context";

export function useAuth() {
  const context = useContext(KontekstAuth);
  if (!context) throw new Error("useAuth musi byc uzywany wewnatrz AuthProvider.");
  return context;
}

export default useAuth;
