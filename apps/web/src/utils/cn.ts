type ClassPrimitive = string | number | boolean | null | undefined;
type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassValue = ClassPrimitive | ClassDictionary | ClassValue[];

function flatten(wartosc: ClassValue, wynik: string[]) {
  if (!wartosc) return;

  if (typeof wartosc === "string" || typeof wartosc === "number") {
    wynik.push(String(wartosc));
    return;
  }

  if (Array.isArray(wartosc)) {
    wartosc.forEach((element) => flatten(element, wynik));
    return;
  }

  if (typeof wartosc === "object") {
    Object.entries(wartosc).forEach(([klucz, aktywne]) => {
      if (aktywne) wynik.push(klucz);
    });
  }
}

export function cn(...inputs: ClassValue[]): string {
  const klasy: string[] = [];
  inputs.forEach((input) => flatten(input, klasy));
  return klasy.join(" ");
}

export default cn;
