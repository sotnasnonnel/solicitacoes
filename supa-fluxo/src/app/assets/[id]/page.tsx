"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AdminKanbanBoard, type SurveyLite, type SurveyStatus } from "../../components/AdminKanbanBoard";

const ADMIN_EMAILS = new Set([
  "milena.neves@phdengenharia.eng.br",
  "vinicius.costa@phdengenharia.eng.br",
  "lennon.santos@phdengenharia.eng.br",
]);

function formatDateBR(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

const OPEN_STATUSES: SurveyStatus[] = ["DRAFT", "SUBMITTED", "URGENT_REVIEW"];
const INPROG_STATUSES: SurveyStatus[] = ["SCHEDULING", "SCHEDULED", "IN_PROGRESS"];

export default function AssetDashboardPage() {
  const params = useParams();
  const contractId = String((params as any)?.id || "");

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [surveys, setSurveys] = useState<SurveyLite[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      setLoading(true);

      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);
      const email = (user.email || "").toLowerCase();
      setIsAdmin(ADMIN_EMAILS.has(email));

      const { data, error } = await supabase
        .from("surveys")
        .select("id, status, created_by, requester, needed_date, admin_deadline, assets (code, title)")
        .eq("asset_id", contractId)
        .order("needed_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        setErr(error.message);
        setSurveys([]);
        setLoading(false);
        return;
      }

      setSurveys((data as any) || []);
      setLoading(false);
    })();
  }, [contractId]);

  const counts = useMemo(() => {
    const abertas = surveys.filter((s) => OPEN_STATUSES.includes(s.status as SurveyStatus)).length;
    const andamento = surveys.filter((s) => INPROG_STATUSES.includes(s.status as SurveyStatus)).length;
    const concluidas = surveys.filter((s) => (s.status as SurveyStatus) === "COMPLETED").length;
    const canceladas = surveys.filter((s) => (s.status as SurveyStatus) === "CANCELLED").length;
    return { abertas, andamento, concluidas, canceladas };
  }, [surveys]);

  const myCount = useMemo(() => {
    if (!userId) return 0;
    return surveys.filter((s) => s.created_by === userId).length;
  }, [surveys, userId]);

  if (loading) {
    return (
      <div className="card">
        <div className="small">Carregando...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card">
        <div className="cardTitle">Dashboard</div>
        <div className="small">
          {isAdmin
            ? "Admin: você pode arrastar cards no Kanban para mudar o status."
            : "Você pode acompanhar todas as solicitações. A sua fica destacada."}
        </div>
        {err ? (
          <div className="small" style={{ color: "#b85236", fontWeight: 900, marginTop: 8 }}>
            {err}
          </div>
        ) : null}
      </div>

      {/* contadores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        <div className="card">
          <div className="small"><b>Abertas</b></div>
          <div style={{ fontWeight: 900, fontSize: 26, color: "#26405d" }}>{counts.abertas}</div>
        </div>
        <div className="card">
          <div className="small"><b>Em andamento</b></div>
          <div style={{ fontWeight: 900, fontSize: 26, color: "#c35e1e" }}>{counts.andamento}</div>
        </div>
        <div className="card">
          <div className="small"><b>Concluídas</b></div>
          <div style={{ fontWeight: 900, fontSize: 26, color: "#00a49a" }}>{counts.concluidas}</div>
        </div>
        <div className="card">
          <div className="small"><b>Canceladas</b></div>
          <div style={{ fontWeight: 900, fontSize: 26, color: "#b85236" }}>{counts.canceladas}</div>
        </div>
        <div className="card">
          <div className="small"><b>Minhas</b></div>
          <div style={{ fontWeight: 900, fontSize: 26, color: "#4f8cff" }}>{myCount}</div>
        </div>
      </div>

      <div className="card">
        <div className="cardTitle">Kanban</div>
        <div className="small">{isAdmin ? "Arraste os cards para mudar o status." : "Somente admin pode mover status."}</div>
      </div>

      <AdminKanbanBoard surveys={surveys} setSurveys={setSurveys} userId={userId} isAdmin={isAdmin} />

      {/* tabela */}
      <div className="card">
        <div className="cardTitle">Solicitações</div>
        <div className="small">Todas as solicitações do contrato. As suas ficam destacadas.</div>

        <div style={{ marginTop: 10, overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código da Empresa</th>
                <th>Solicitante</th>
                <th>Necessidade</th>
                <th>Entrega</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((s) => {
                const mine = userId && s.created_by === userId;
                return (
                  <tr key={s.id} style={mine ? { background: "rgba(79,140,255,0.08)" } : undefined}>
                    <td><a href={`/surveys/${s.id}`}>{s.id}</a></td>
                    <td>{(s as any).assets?.code ?? "—"}</td>
                    <td>{s.requester ?? "—"}</td>
                    <td>{formatDateBR(s.needed_date)}</td>
                    <td>{formatDateBR(s.admin_deadline)}</td>
                    <td>{s.status}</td>
                  </tr>
                );
              })}
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="small">Nenhuma solicitação.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
