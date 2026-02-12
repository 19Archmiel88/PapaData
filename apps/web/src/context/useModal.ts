import { useContext } from "react";
import { KontekstModala } from "./modal-context";

export function useModal() {
  const context = useContext(KontekstModala);
  if (!context) throw new Error("useModal musi byc uzywany wewnatrz ModalProvider.");
  return context;
}

export default useModal;
