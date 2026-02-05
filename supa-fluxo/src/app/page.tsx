"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateBR } from "@/lib/date";
import { StatusBadge } from "@/app/components/StatusBadge";

type Row = {
  id: number;
  asset_id: number;
  requester: string | null;
  needed_date: string | null;
  admin_deadline: string | null;
  status: string;
  urgent?: boolean | null;
  request_text: string | null;
  name: string | null;
  created_by: string | null;
  assets: { code: string; title: string } | null | any;
};

export default function Home() {
  const [role, setRole] = useState<"admin" | "user">("user");
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [openRow, setOpenRow] = useState<Row | null>(null);

  // ✅ para destacar as solicitações do usuário logado
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setErr(null);

      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;
      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);

      const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      const isAdmin = p?.role === "admin";
      setRole(isAdmin ? "admin" : "user");

      const { data, error } = await supabase
        .from("surveys")
        .select(
          "id, asset_id, requester, needed_date, admin_deadline, status, urgent, created_by, request_text, name, assets(code,title)"
        )

        .order("created_at", { ascending: false });

      if (error) return setErr(error.message);
      
      const arr = Array.isArray(data) ? (data as Row[]) : [];
      
      // ✅ Ordena por Prazo (Admin) (nulls por último)
      // - quem tem admin_deadline vem primeiro (mais cedo primeiro)
      // - quem não tem prazo fica no final
      arr.sort((a, b) => {
        const ad = a.admin_deadline ? new Date(a.admin_deadline).getTime() : Number.POSITIVE_INFINITY;
        const bd = b.admin_deadline ? new Date(b.admin_deadline).getTime() : Number.POSITIVE_INFINITY;
        if (ad !== bd) return ad - bd;
      
        // fallback: mais recente primeiro
        const ac = new Date((a as any).created_at ?? 0).getTime();
        const bc = new Date((b as any).created_at ?? 0).getTime();
        return bc - ac;
      });
      
      setRows(arr);


  const isAdmin = role === "admin";

  const columns = useMemo(
    () => [
      { key: "code", label: "Código da Empresa", width: 260, nowrap: true },
      { key: "title", label: "Nome da Empresa", width: 260, nowrap: true },
      { key: "requester", label: "Solicitante", width: 260, nowrap: true },
      { key: "needed", label: "Necessidade", width: 130, nowrap: true },
      { key: "deadline", label: "Prazo (Admin)", width: 130, nowrap: true },
      { key: "status", label: "Status", width: 160, nowrap: true },
      { key: "request", label: "Solicitação", width: 560 },
    ],
    []
  );

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 1180, margin: "0 auto", width: "100%" }}>

      {err && (
        <div className="card">
          <div className="small" style={{ color: "#b85236", fontWeight: 900 }}>
            {err}
          </div>
        </div>
      )}

      {isAdmin ? (
        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>Área Administrativa</div>
          <div className="small" style={{ marginBottom: 10 }}>
            Você pode definir prazos e mover status das solicitações (Kanban).
          </div>
          <a href="/admin/prazos">Ir para Prazos</a>
        </div>
      ) : null}

      <div className="card">
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
          {isAdmin ? "Solicitações (todas)" : "Solicitações"}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      width: c.width,
                      whiteSpace: c.nowrap ? "nowrap" : "normal",
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const full = (r.request_text || r.name || "—").trim();
                const hasText = full && full !== "—";
                const mine = userId && r.created_by === userId;

                return (
                  <tr
                    key={r.id}
                    // ✅ destaque do usuário logado (igual dashboard)
                    style={{
                      background: mine ? "rgba(79,140,255,0.08)" : undefined,
                      outline: mine ? "1px solid rgba(79,140,255,0.25)" : undefined,
                    }}
                  >

                    {/* ✅ Código da Empresa SEM QUEBRAR */}
                    <td
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 260,
                        fontWeight: 800,
                        color: "#26405d",
                      }}
                      title={r.assets?.code ?? ""}
                    >
                      {r.assets?.code ?? "-"}
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>{r.assets?.title ?? "-"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{r.requester ?? "-"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateBR(r.needed_date)}</td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <b>{formatDateBR(r.admin_deadline)}</b>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <StatusBadge status={r.status} urgent={r.urgent} />
                    </td>

                    {/* Solicitação: preview + botão "Ver" */}
                    <td style={{ minWidth: 420, maxWidth: 720 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div
                          style={{
                            flex: 1,
                            fontWeight: 650,
                            color: "#26405d",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            lineHeight: "1.25rem",
                            whiteSpace: "pre-wrap",
                          }}
                          title={full}
                        >
                          {full}
                        </div>

                        <button
                          type="button"
                          onClick={() => setOpenRow(r)}
                          disabled={!hasText}
                          style={{
                            height: 34,
                            padding: "0 12px",
                            borderRadius: 10,
                            border: "1px solid rgba(38,64,93,0.25)",
                            background: "#fff",
                            cursor: hasText ? "pointer" : "not-allowed",
                            fontWeight: 900,
                            color: "#26405d",
                            opacity: hasText ? 1 : 0.55,
                          }}
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="small">
                    {isAdmin ? "Nenhuma solicitação ainda." : "Nenhuma solicitação ainda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isAdmin && (
          <div style={{ marginTop: 12 }}>
            <a href="/surveys/new">Criar Solicitação</a>
          </div>
        )}
      </div>

      {/* MODAL: texto inteiro */}
      {openRow ? (
        <div
          onClick={() => setOpenRow(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(860px, 100%)",
              background: "#fff",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.10)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ display: "grid" }}>
                <div style={{ fontWeight: 950, color: "#26405d" }}>
                  Solicitação #{openRow.id} — {openRow.assets?.code ?? "-"}
                </div>
                <div className="small" style={{ opacity: 0.8 }}>
                  {openRow.assets?.title ?? "-"} • Solicitante: {openRow.requester ?? "-"} • Necessidade:{" "}
                  {formatDateBR(openRow.needed_date)} • Entrega: {formatDateBR(openRow.admin_deadline)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenRow(null)}
                style={{
                  height: 36,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Fechar
              </button>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 10 }}>
                {/* ✅ mostra urgente no modal também */}
                <StatusBadge status={openRow.status} urgent={openRow.urgent} />
              </div>

              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5rem",
                  color: "#26405d",
                  fontWeight: 650,
                }}
              >
                {(openRow.request_text || openRow.name || "—").trim()}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
