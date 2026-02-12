import { useContext } from "react";
import { KontekstUi } from "./ui-context";

export function useUI() {
  const context = useContext(KontekstUi);
  if (!context) throw new Error("useUI musi byc uzywany wewnatrz UIProvider.");
  return context;
}

export default useUI;
