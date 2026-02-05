"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AssetRow = { id: number; code: string; title: string };

export default function NewSurveyPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [assetId, setAssetId] = useState<number | null>(null);

  const [requester, setRequester] = useState("");
  const [neededDate, setNeededDate] = useState(""); // yyyy-mm-dd
  const [requestText, setRequestText] = useState("");
  const [urgent, setUrgent] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // contratos/empresas visíveis para todos
      const { data, error } = await supabase
        .from("assets")
        .select("id, code, title")
        .order("code", { ascending: true });

      if (error) {
        setErr(error.message);
        setAssets([]);
      } else {
        setAssets((data as AssetRow[]) || []);
      }

      // preencher solicitante do profiles.name
      const { data: prof } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      if (prof?.name) setRequester(prof.name);

      setLoading(false);
    })();
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!assetId) return setErr("Selecione um Código da Empresa.");
    if (!requester.trim()) return setErr("Informe o Solicitante.");
    if (!requestText.trim()) return setErr("Descreva a Solicitação.");
    if (!neededDate) return setErr("Selecione a Data de Necessidade.");

    setSaving(true);

    const payload = {
      asset_id: assetId,
      requester: requester.trim(),
      needed_date: neededDate,      // coluna no banco
      request_text: requestText.trim(), // coluna no banco
      status: urgent ? "URGENT_REVIEW" : "SUBMITTED",
      urgent: Boolean(urgent),      // ✅ novo campo
    };

    // ✅ "as any" para evitar travas de tipos do Supabase/TS
    const { error } = await supabase.from("surveys").insert(payload as any);

    setSaving(false);

    if (error) {
      setErr(error.message);
      return;
    }

    // Depois de criar, volta para Home (ou /dashboard se você preferir)
    router.push("/");
  };

  if (loading)
    return (
      <div className="card">
        <div className="small">Carregando...</div>
      </div>
    );

  return (
    <div className="card">
      <div className="cardTitle">Nova Solicitação</div>

      {err ? (
        <div className="small" style={{ color: "#b85236", fontWeight: 900, marginTop: 10 }}>
          {err}
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 14, maxWidth: 560 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label className="small">
            <b>Contrato (Código da Empresa)</b>
          </label>
          <select value={assetId ?? ""} onChange={(e) => setAssetId(Number(e.target.value) || null)}>
            <option value="">Selecione...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label className="small">
            <b>Solicitante</b>
          </label>
          <input value={requester} onChange={(e) => setRequester(e.target.value)} />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label className="small">
            <b>Data de Necessidade</b>
          </label>
          <input type="date" value={neededDate} onChange={(e) => setNeededDate(e.target.value)} />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label className="small">
            <b>Solicitação</b>
          </label>
          <textarea
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            placeholder="Descreva detalhadamente o que você precisa..."
            rows={5}
            style={{ resize: "vertical" }}
          />
        </div>

        <button className="btnOrange" type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Enviar Solicitação"}
        </button>
      </form>
    </div>
  );
}
