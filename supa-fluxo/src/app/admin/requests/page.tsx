"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateBR } from "@/lib/date";

type Row = {
  id: number;
  requester: string | null;
  needed_date: string | null;
  admin_deadline: string | null;
  status: string;
  urgent: boolean;
  created_at: string;
  assets: { code: string; title: string } | null;
};

export default function AdminRequestsPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [savingId, setSavingId] = useState<number | null>(null);
  const [deadlineById, setDeadlineById] = useState<Record<number, string>>({});

  const load = async () => {
    setErr(null);

    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const ok = p?.role === "admin";
    setIsAdmin(ok);
    setChecking(false);

    if (!ok) {
      window.location.href = "/";
      return;
    }

    const { data, error } = await supabase
      .from("surveys")
      .select("id, requester, needed_date, admin_deadline, status, urgent, created_at, assets:assets(code,title)")
      .order("created_at", { ascending: false });

    if (error) return setErr(error.message);

    const list = (data as any[]) as Row[];
    setRows(list);

    // preencher inputs com o valor atual
    const map: Record<number, string> = {};
    for (const r of list) {
      if (r.admin_deadline) map[r.id] = r.admin_deadline;
    }
    setDeadlineById(map);
  };

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(() => rows.filter(r => !r.admin_deadline), [rows]);
  const withDeadline = useMemo(() => rows.filter(r => !!r.admin_deadline), [rows]);

  const saveDeadline = async (id: number) => {
    setErr(null);
    const value = deadlineById[id];
    if (!value) return setErr("Selecione uma data de prazo.");

    setSavingId(id);

    // quando admin define prazo, vira SCHEDULED (padrão)
    const { error } = await supabase
      .from("surveys")
      .update({ admin_deadline: value, status: "SCHEDULED" })
      .eq("id", id);

    setSavingId(null);

    if (error) return setErr(error.message);

    await load();
  };

  if (checking) {
    return (
      <div className="card">
        <div className="small">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card">
        <div style={{ fontSize: 16, fontWeight: 900 }}>Admin — Definir prazo das solicitações</div>
        <div className="small">Solicitações sem prazo: <b>{pending.length}</b> • Com prazo: <b>{withDeadline.length}</b></div>
      </div>

      {err && (
        <div className="card">
          <div className="small" style={{ color: "#ff4f6d" }}>{err}</div>
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Sem prazo (definir agora)</div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Empresa</th>
              <th>Solicitante</th>
              <th>Necessidade</th>
              <th>Prazo (Admin)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pending.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.assets?.code ?? "-"}</td>
                <td>{r.assets?.title ?? "-"}</td>
                <td>{r.requester ?? "-"}</td>
                <td>{formatDateBR(r.needed_date)}</td>
                <td>
                  <input
                    type="date"
                    value={deadlineById[r.id] ?? ""}
                    onChange={(e) => setDeadlineById((m) => ({ ...m, [r.id]: e.target.value }))}
                  />
                </td>
                <td style={{ width: 140 }}>
                  <button className="primary" disabled={savingId === r.id} onClick={() => saveDeadline(r.id)}>
                    {savingId === r.id ? "Salvando..." : "Salvar prazo"}
                  </button>
                </td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr>
                <td colSpan={7} className="small">Nenhuma pendente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Com prazo</div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Empresa</th>
              <th>Solicitante</th>
              <th>Necessidade</th>
              <th>Prazo (Admin)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {withDeadline.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.assets?.code ?? "-"}</td>
                <td>{r.assets?.title ?? "-"}</td>
                <td>{r.requester ?? "-"}</td>
                <td>{formatDateBR(r.needed_date)}</td>
                <td><b>{formatDateBR(r.admin_deadline)}</b></td>
                <td>{r.status}</td>
              </tr>
            ))}
            {withDeadline.length === 0 && (
              <tr>
                <td colSpan={7} className="small">Nenhuma com prazo ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
