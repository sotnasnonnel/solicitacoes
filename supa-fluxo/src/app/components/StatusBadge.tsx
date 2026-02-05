"use client";

type SurveyStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "URGENT_REVIEW"
  | "SCHEDULING"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

function statusMeta(status: SurveyStatus) {
  switch (status) {
    case "DRAFT":
      return { label: "Rascunho", bg: "rgba(38,64,93,0.10)", border: "rgba(38,64,93,0.35)", color: "#26405d" };
    case "SUBMITTED":
      return { label: "Aberta", bg: "rgba(38,64,93,0.10)", border: "rgba(38,64,93,0.35)", color: "#26405d" };
    case "URGENT_REVIEW":
      return { label: "Aberta", bg: "rgba(38,64,93,0.10)", border: "rgba(38,64,93,0.35)", color: "#26405d" };

    case "SCHEDULING":
    case "SCHEDULED":
    case "IN_PROGRESS":
      return { label: "Em andamento", bg: "rgba(195,94,30,0.10)", border: "rgba(195,94,30,0.35)", color: "#c35e1e" };

    case "COMPLETED":
      return { label: "Concluída", bg: "rgba(0,164,154,0.10)", border: "rgba(0,164,154,0.35)", color: "#00a49a" };

    case "CANCELLED":
      return { label: "Cancelada", bg: "rgba(184,82,54,0.10)", border: "rgba(184,82,54,0.35)", color: "#b85236" };

    default:
      return { label: status, bg: "rgba(0,0,0,0.06)", border: "rgba(0,0,0,0.14)", color: "#111827" };
  }
}

export function StatusBadge({
  status,
  urgent,
  showUrgentText = true,
}: {
  status: string;
  urgent?: boolean | null;
  showUrgentText?: boolean;
}) {
  const m = statusMeta(status as SurveyStatus);
  const isUrgent = Boolean(urgent) || status === "URGENT_REVIEW";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${m.border}`,
        background: m.bg,
        color: m.color,
        fontWeight: 900,
        fontSize: 12,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}
      title={isUrgent ? `${m.label} • Urgente` : m.label}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</span>

      {isUrgent ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span aria-label="Urgente" title="Urgente" style={{ lineHeight: 1 }}>
            🔥
          </span>

          {showUrgentText ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 950,
                color: "#b85236",
                border: "1px solid rgba(184,82,54,0.25)",
                background: "rgba(184,82,54,0.08)",
                padding: "2px 8px",
                borderRadius: 999,
                letterSpacing: "0.03em",
              }}
            >
              URGENTE
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
