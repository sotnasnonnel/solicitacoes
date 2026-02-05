// src/lib/date.ts
export function formatDateBR(value?: string | null) {
  if (!value) return "—";

  // Se vier DATE ou timestamp, usa só YYYY-MM-DD
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  }

  return "—";
}
