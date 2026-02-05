"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function TopBar() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  const load = async () => {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user ?? null;

    setEmail(user?.email ?? null);

    if (!user) {
      setRole(null);
      return;
    }

    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    setRole(p?.role === "admin" ? "admin" : "user");
  };

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isAdmin = role === "admin";

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Fluxo de Solicitações</div>
        <div className="small">{email ? `Logado: ${email} (${isAdmin ? "Admin" : "Usuário"})` : ""}</div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <a href="/">Home</a>

        {/* ✅ Dashboard fixo */}
        <a href="/assets/1">Dashboard</a>

        {!isAdmin && <a href="/surveys/new">Criar Solicitação</a>}
        {isAdmin && <a href="/admin/requests">Prazos</a>}
        {isAdmin && <a href="/admin/contracts/new">Empresas</a>}

        {email && <button onClick={logout}>Sair</button>}
      </div>
    </div>
  );
}
