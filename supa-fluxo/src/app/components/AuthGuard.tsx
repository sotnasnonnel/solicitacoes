"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoutes = ["/login", "/signup"];

  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      // libera rotas públicas
      if (publicRoutes.includes(pathname)) {
        if (!alive) return;
        setAuthed(true);
        setChecking(false);
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!alive) return;

      if (error) {
        console.error("getSession error:", error.message);
        setAuthed(false);
        setChecking(false);
        return;
      }

      if (!data.session) {
        setAuthed(false);
        setChecking(false);
        window.location.href = "/login";
        return;
      }

      setAuthed(true);
      setChecking(false);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;

      if (publicRoutes.includes(pathname)) {
        setAuthed(true);
        setChecking(false);
        return;
      }

      if (!session) {
        setAuthed(false);
        setChecking(false);
        window.location.href = "/login";
      } else {
        setAuthed(true);
        setChecking(false);
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [pathname]);

  if (checking) {
    return (
      <div className="card">
        <div className="small">Carregando...</div>
      </div>
    );
  }

  if (!authed && !publicRoutes.includes(pathname)) {
    return null; // já redirecionou
  }

  return <>{children}</>;
}
