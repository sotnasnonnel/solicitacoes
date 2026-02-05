"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = new Set([
  "milena.neves@phdengenharia.eng.br",
  "vinicius.costa@phdengenharia.eng.br",
  "lennon.santos@phdengenharia.eng.br",
]);

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const email = (user.email || "").toLowerCase();
      if (!ADMIN_EMAILS.has(email)) {
        window.location.href = "/";
        return;
      }

      setOk(true);
    })();
  }, []);

  if (ok === null) return <div className="card"><div className="small">Carregando...</div></div>;
  return <>{children}</>;
}
