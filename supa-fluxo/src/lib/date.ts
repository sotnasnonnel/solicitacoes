export function formatDateBR(iso: string | null | undefined) {
  if (!iso) return "-";
  // iso pode vir como "YYYY-MM-DD" (date) ou "YYYY-MM-DDTHH:mm:ss..." (timestamp)
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return "-";
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export function formatDateTimeBR(iso: string | null | undefined) {
  if (!iso) return "-";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("pt-BR");
}
