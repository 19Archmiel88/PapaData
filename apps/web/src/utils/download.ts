export function saveBlob(blob: Blob, nazwaPliku: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = nazwaPliku;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default saveBlob;
