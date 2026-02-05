"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/app/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuth) return <>{children}</>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ padding: "18px 16px 44px", background: "#f2f2f2" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
