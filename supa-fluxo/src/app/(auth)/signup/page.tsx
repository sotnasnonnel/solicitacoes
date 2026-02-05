"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./Signup.module.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSignup = async () => {
    setErr(null);
    if (!name.trim()) return setErr("Informe seu nome.");
    if (!email.trim()) return setErr("Informe seu e-mail.");
    if (!password.trim()) return setErr("Informe sua senha (mínimo 6 caracteres).");
    if (password.trim().length < 6) return setErr("A senha precisa ter pelo menos 6 caracteres.");

    setLoading(true);

    // Cria usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: { name: name.trim() }, // salva nome no metadata
      },
    });

    if (error) {
      setLoading(false);
      return setErr(error.message);
    }

    // Se você usa tabela profiles, pode criar/atualizar aqui também:
    // (se não existir, pode remover esse bloco)
    try {
      const userId = data.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          name: name.trim(),
          email: email.trim(),
          is_admin: false,
        });
      }
    } catch {}

    setLoading(false);

    // Vai pro login
    window.location.href = "/login";
  };

  return (
    <div className={styles.signupShell}>
      {/* ESQUERDA */}
      <div className={styles.left}>
        <div className={styles.box}>
          <img className={styles.logo} src="/phdtech.png" alt="PHD tech" />

          <h1 className={styles.title}>Cadastro</h1>
          <p className={styles.subtitle}>Crie seu acesso para solicitar e acompanhar demandas</p>

          <div className={styles.form}>
            <div>
              <div className={styles.label}>Nome</div>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
              />
            </div>

            <div>
              <div className={styles.label}>Email</div>
              <input
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
              />
            </div>

            <div>
              <div className={styles.label}>Senha</div>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha"
              />
            </div>

            {err && <div className={styles.error}>{err}</div>}

            <button className={styles.btn} onClick={onSignup} disabled={loading}>
              {loading ? "Criando..." : "Cadastrar"}
            </button>
          </div>

          <div className={styles.linkRow}>
            Já tem conta? <a href="/login">Entrar</a>
          </div>
        </div>
      </div>

      {/* DIREITA */}
      <div className={styles.rightWrap}>
        <div className={styles.right}>
          <div className={styles.rightInner}>
            <div className={styles.rightTitle}>
              Fluxo de Solicitações
              <br />
              Power BI
            </div>

            <div className={styles.imgBox}>
              <img src="/graficos.jpg" alt="Gráficos" />
            </div>

            <div className={styles.rightText}>
              Acompanhe status, prazos e histórico por contrato.
              Tudo em um só lugar, com visibilidade para equipe e administração.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
