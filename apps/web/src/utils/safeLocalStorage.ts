type PamiecStorage = {
  [klucz: string]: string;
};

function utworzPamiecStorage(): Storage {
  let pamiec: PamiecStorage = {};

  return {
    get length() {
      return Object.keys(pamiec).length;
    },
    clear() {
      pamiec = {};
    },
    getItem(klucz: string) {
      return Object.prototype.hasOwnProperty.call(pamiec, klucz) ? pamiec[klucz] : null;
    },
    key(index: number) {
      const klucze = Object.keys(pamiec);
      return klucze[index] ?? null;
    },
    removeItem(klucz: string) {
      delete pamiec[klucz];
    },
    setItem(klucz: string, wartosc: string) {
      pamiec[klucz] = String(wartosc);
    },
  };
}

export const safeLocalStorage: Storage = (() => {
  if (typeof window === "undefined") return utworzPamiecStorage();

  try {
    const kluczTestowy = "__papadata_storage_test__";
    window.localStorage.setItem(kluczTestowy, "1");
    window.localStorage.removeItem(kluczTestowy);
    return window.localStorage;
  } catch {
    return utworzPamiecStorage();
  }
})();

export default safeLocalStorage;
