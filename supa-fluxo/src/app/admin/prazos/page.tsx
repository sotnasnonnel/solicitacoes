"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/app/admin/AdminGuard";
import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/app/components/StatusBadge";


type Row = {
  id: number;
  requester: string | null;
  needed_date: string | null;
  admin_deadline: string | null;
  status: string;
  assets?: { code?: string | null; title?: string | null } | null;
};

function formatDateBR(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export default function AdminPrazosPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}

function Inner() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      setLoading(true);

      const { data, error } = await supabase
        .from("surveys")
        .select("id, requester, needed_date, admin_deadline, status, assets(code,title)")
        .order("needed_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      setLoading(false);

      if (error) {
        setErr(error.message);
        setRows([]);
        return;
      }

      setRows((data as any) || []);
    })();
  }, []);

  const updateDeadline = async (id: number, date: string) => {
    const { data: updatedRows, error } = await supabase
      .from("surveys")
      .update({ admin_deadline: date || null })
      .eq("id", id)
      .select("id, admin_deadline");

    const updated = updatedRows?.[0];
    if (error || !updated) {
      alert("Erro ao salvar prazo: " + (error?.message || "Sem permissão (RLS)"));
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, admin_deadline: updated.admin_deadline } : r)));
  };

  if (loading) return <div className="card"><div className="small">Carregando...</div></div>;

  return (
    <div className="card">
      <div className="cardTitle">Prazos (Admin)</div>
      <div className="small">
      </div>

      {err ? (
        <div className="small" style={{ color: "#b85236", fontWeight: 900, marginTop: 10 }}>
          {err}
        </div>
      ) : null}

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Empresa</th>
              <th>Solicitante</th>
              <th>Necessidade</th>
              <th>Entrega (Admin)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.assets?.code ?? "—"}</td>
                <td>{r.assets?.title ?? "—"}</td>
                <td>{r.requester ?? "—"}</td>
                <td>{formatDateBR(r.needed_date)}</td>
                <td>
                  <input
                    type="date"
                    defaultValue={r.admin_deadline ?? ""}
                    onBlur={(e) => updateDeadline(r.id, e.target.value)}
                  />
                </td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="small">Nenhuma solicitação.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
