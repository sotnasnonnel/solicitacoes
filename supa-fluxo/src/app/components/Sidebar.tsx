"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const ADMIN_EMAILS = new Set([
  "milena.neves@phdengenharia.eng.br",
  "vinicius.costa@phdengenharia.eng.br",
  "lennon.santos@phdengenharia.eng.br",
]);

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

// ÍCONES (SVG inline) — não depende de biblioteca
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path
        d="M4 19V5a1 1 0 0 1 2 0v14h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z"
        fill="currentColor"
      />
      <path
        d="M9 17V11a1 1 0 1 1 2 0v6H9Zm4 0V8a1 1 0 1 1 2 0v9h-2Zm4 0v-4a1 1 0 1 1 2 0v4h-2Z"
        fill="currentColor"
      />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path
        d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16h3a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h1Zm4-14h2V5H8v2Zm0 4h2V9H8v2Zm0 4h2v-2H8v2Zm4-8h2V5h-2v2Zm0 4h2V9h-2v2Zm0 4h2v-2h-2v2Z"
        fill="currentColor"
      />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm14 8H3v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9Z"
        fill="currentColor"
      />
    </svg>
  );
}
function IconPlusDoc() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path
        d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V7h3.5L14 3.5Z"
        fill="currentColor"
      />
      <path
        d="M12 10a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname() || "";
  const [openMobile, setOpenMobile] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string>(""); // nome no topo
  const [userEmail, setUserEmail] = useState<string>(""); // email no topo

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;

      if (!user) return;

      const email = (user.email || "").toLowerCase();
      setUserEmail(email);
      setIsAdmin(ADMIN_EMAILS.has(email));

      // tenta buscar o nome do perfil
      const { data: prof } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      const fallbackName = email ? email.split("@")[0] : "Usuário";
      setUserName((prof?.name || "").trim() || fallbackName);
    })();
  }, []);

  // ✅ ajuste se sua rota real de prazos for outra
  const PRAZOS_HREF = "/admin/contracts";

  const nav: NavItem[] = isAdmin
    ? [
        { label: "Home", href: "/", icon: <IconHome /> },
        { label: "Dashboard", href: "/dashboard", icon: <IconChart /> },
        { label: "Criar Empresa", href: "/admin/contracts/new", icon: <IconBuilding /> },
        { label: "Prazos", href: "/admin/prazos", icon: <IconCalendar /> },
      ]
    : [
        { label: "Home", href: "/", icon: <IconHome /> },
        { label: "Dashboard", href: "/dashboard", icon: <IconChart /> },
        { label: "Nova Solicitação", href: "/surveys/new", icon: <IconPlusDoc /> },
      ];

  const onLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* topo mobile */}
      <div className={styles.mobileTop}>
        <button className={styles.iconBtn} onClick={() => setOpenMobile(true)} aria-label="Abrir menu">
          ☰
        </button>
        <div className={styles.mobileTitle}>Menu</div>
      </div>

      {openMobile ? <div className={styles.overlay} onClick={() => setOpenMobile(false)} /> : null}

      <aside className={`${styles.sb} ${openMobile ? styles.open : ""}`}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <img className={styles.logo} src="/phdtech.png" alt="PHD tech" />
            <div className={styles.identity}>
              <div className={styles.nameLine} title={userName || ""}>
                {userName || "Carregando..."}
              </div>
              <div className={styles.emailLine} title={userEmail || ""}>
                {userEmail || " "}
              </div>
            </div>
          </div>

          <button className={styles.closeMobile} onClick={() => setOpenMobile(false)} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        <div className={styles.sectionTitle}>Navegação</div>

        <nav className={styles.nav}>
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`${styles.link} ${active ? styles.active : ""}`}
                onClick={() => setOpenMobile(false)}
              >
                <span className={styles.iconWrap} aria-hidden="true">
                  {item.icon}
                </span>
                <span className={styles.label}>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className={styles.spacer} />

        <button className={styles.logout} onClick={onLogout}>
          Sair
        </button>
      </aside>
    </>
  );
}
