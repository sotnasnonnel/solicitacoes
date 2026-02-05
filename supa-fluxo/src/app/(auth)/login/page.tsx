"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./Login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <div className={styles.loginShell}>
      <div className={styles.left}>
        <div className={styles.card}>
          <img className={styles.logo} src="/phdtech.png" alt="PHD tech" />

          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Insira as informações abaixo para acessar sua conta</p>

          {err ? <div className={styles.error}>{err}</div> : null}

          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </div>

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className={styles.links}>
            <a className={styles.link} href="/signup">
              Cadastrar
            </a>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightInner}>
          <h2 className={styles.heroTitle}>Fluxo de Solicitações Power BI</h2>

          <div className={styles.heroImageWrap}>
            <img className={styles.heroImage} src="/graficos.jpg" alt="Gráficos" />
          </div>

          <p className={styles.heroText}>
            Centralize demandas, prazos e status por contrato, garantindo visibilidade e acompanhamento em tempo real.
          </p>
        </div>
      </div>
    </div>
  );
}
