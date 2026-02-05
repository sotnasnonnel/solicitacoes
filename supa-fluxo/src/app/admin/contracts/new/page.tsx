"use client";

import { useState } from "react";
import { AdminGuard } from "@/app/admin/AdminGuard";
import { supabase } from "@/lib/supabase";

export default function AdminCreateContractPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}

function Inner() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!code.trim() || !title.trim()) {
      setErr("Preencha Código da Empresa e Nome da Empresa.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("assets").insert({
      code: code.trim(),
      title: title.trim(),
      // created_by é default auth.uid()
    });

    setSaving(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setCode("");
    setTitle("");
    setOk("Empresa criada com sucesso!");
  };

  return (
    <div className="card">
      <div className="cardTitle">Criar Empresa</div>

      {err ? <div className="small" style={{ color: "#b85236", fontWeight: 900, marginTop: 10 }}>{err}</div> : null}
      {ok ? <div className="small" style={{ color: "#00a49a", fontWeight: 900, marginTop: 10 }}>{ok}</div> : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 14, maxWidth: 520 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label className="small"><b>Código da Empresa</b></label>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: ADMB-CT01-GERE" />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label className="small"><b>Nome da Empresa</b></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: ADM Brasil" />
        </div>

        <button className="btnOrange"type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Criar Empresa"}
        </button>
      </form>
    </div>
  );
}
