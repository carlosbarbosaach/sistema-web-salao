// src/pages/Login.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { useAuth } from "../auth/AuthProvider";
import { ADMIN_EMAILS } from "../config/admin";
import { auth } from "../lib/firebase";

/* Utils */
function canonicalizeEmail(e?: string | null) {
  return (e || "").trim().toLowerCase();
}
function mapAuthError(err: unknown) {
  const code = (err as FirebaseError)?.code || "";
  switch (code) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-disabled":
      return "Usuário desativado.";
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Credenciais inválidas. Verifique e-mail e senha.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/network-request-failed":
      return "Falha de rede. Verifique sua conexão.";
    default:
      return "Falha ao entrar. Verifique as credenciais.";
  }
}
async function ensureAdminOrSignOut(email: string | null) {
  const adminSet = new Set(ADMIN_EMAILS.map(canonicalizeEmail));
  if (!adminSet.has(canonicalizeEmail(email))) {
    await signOut(auth);
    throw new Error("Sem permissão. Esta conta não é de administrador.");
  }
}

/* Ícones simples */
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

export default function Login() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/agendamento";

  // Form state
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  // Se já está logado e é admin, redireciona
  if (user && isAdmin) return <Navigate to={from} replace />;

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      // Validação simples no cliente
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Digite um e-mail válido.");
      }
      if (!password || password.length < 6) {
        throw new Error("A senha deve ter ao menos 6 caracteres.");
      }
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureAdminOrSignOut(cred.user.email);
    } catch (err) {
      const message = (err as Error)?.message?.includes("administrador")
        ? "Sem permissão. Esta conta não é de administrador."
        : (err as Error)?.message?.startsWith("Digite") || (err as Error)?.message?.startsWith("A senha")
          ? (err as Error).message
          : mapAuthError(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setInfo(null);
    try {
      if (!email) {
        setError("Digite seu e-mail para receber o link de recuperação.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setInfo("Enviamos um e-mail com instruções para redefinir sua senha.");
    } catch (err) {
      setError(mapAuthError(err));
    }
  }

  return (
    <div className="min-h-screen grid bg-white md:grid-cols-2">
      {/* HERO MOBILE */}
      <div className="relative md:hidden h-40">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800" />
        <div className="absolute -top-10 -right-24 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-52 w-52 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center font-semibold">
              PA
            </div>
            <span className="font-medium">Priscila Alisamentos</span>
          </div>
        </div>
      </div>

      {/* ESQUERDA (desktop vitrine) */}
      <aside className="relative hidden md:flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800" />
        <div className="absolute -top-16 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 -left-20 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative z-10 flex-1 px-10 py-10 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center font-semibold">
              PA
            </div>
            <span className="font-medium">Priscila Alisamentos</span>
          </div>

          <div className="mt-16 max-w-md">
            <h2 className="text-3xl font-semibold leading-tight">Bem-vinda ao Painel</h2>
            <p className="mt-2 text-white/80">
              Centralize sua operação: agendamentos, serviços e análise em um só lugar.
            </p>

            {/* Cards em coluna única, com mais respiro */}
            <div className="mt-10 space-y-5 max-w-md">
              {/* Card 1 */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/15 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/20 text-indigo-100">
                    {/* ícone calendário/whatsapp */}
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="shrink-0">
                      <path fill="currentColor" d="M7 2h2v2h6V2h2v2h1a2 2 0 0 1 2 2v6a8 8 0 0 1-8 8h-1l-3.29 2.47A1 1 0 0 1 6 21v-1.26A8 8 0 0 1 2 12V6a2 2 0 0 1 2-2h3V2Zm-3 6v4a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6V8H4Zm5 3h6v2H9v-2Z"/>
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold">Controle de agenda com WhatsApp rápido</h3>
                    <p className="mt-1 text-sm text-white/80">Confirme, reagende e envie lembretes com 1 clique direto pelo WhatsApp.</p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/15 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/20 text-indigo-100">
                    {/* ícone etiqueta/preço */}
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="shrink-0">
                      <path fill="currentColor" d="M20.59 13.41 13.4 20.6a2 2 0 0 1-2.83 0l-7.18-7.19A2 2 0 0 1 3 11V5a2 2 0 0 1 2-2h6a2 2 0 0 1 1.41.59l7.18 7.18a2 2 0 0 1 0 2.83ZM7.5 8A1.5 1.5 0 1 0 9 9.5 1.5 1.5 0 0 0 7.5 8Z"/>
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold">Gestão de serviços e preços</h3>
                    <p className="mt-1 text-sm text-white/80">Cadastre catálogos, crie pacotes e ajuste valores com regras inteligentes.</p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/15 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/20 text-indigo-100">
                    {/* ícone gráfico */}
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="shrink-0">
                      <path fill="currentColor" d="M3 3h2v18H3V3Zm4 10h2v8H7v-8Zm4-6h2v14h-2V7Zm4 4h2v10h-2V11Zm4 4h2v6h-2v-6Z"/>
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold">Métricas de desempenho e receita</h3>
                    <p className="mt-1 text-sm text-white/80">Acompanhe ticket médio, taxa de retorno e projeções semanais em tempo real.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-auto text-xs text-white/60">
            © {new Date().getFullYear()} Priscila Alisamentos
          </p>
        </div>
      </aside>

      {/* DIREITA (formulário) */}
      <main className="flex items-center justify-center px-4 py-10 md:py-12 -mt-8 md:mt-0">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800">
              Acesso do Administrador
            </h1>
            <p className="text-sm text-slate-500">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <form
            onSubmit={handleEmailPassword}
            className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-lg space-y-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
                disabled={submitting}
                aria-invalid={!!error}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={submitting}
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-slate-500 hover:text-slate-700 focus:outline-none"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 010-10m0-3C7 4 3.73 7.11 2 12c1.73 4.89 5 8 10 8 5 0 8.27-3.11 10-8-1.73-4.89-5-8-10-8Z"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M2 12C3.73 7.11 7 4 12 4c2.03 0 3.8.5 5.35 1.38l-1.46 1.46A8.53 8.53 0 0012 6C8 6 4.73 8.11 3 12c.45 1.28 1.07 2.4 1.83 3.34l-1.4 1.4A12.38 12.38 0 012 12m19.78-8.22l-1.56-1.56-3.06 3.06A11.76 11.76 0 0012 4C7 4 3.73 7.11 2 12c.74 2.1 1.84 3.9 3.2 5.3l-2.42 2.42 1.41 1.41 18.59-18.59M12 8c2.21 0 4 1.79 4 4 0 .73-.2 1.41-.54 2l-5.46 5.46A6 6 0 0112 8Z"/></svg>
                  )}
                </button>
              </div>
            </div>

            {(error || info) && (
              <div
                role="alert"
                className={`rounded-lg px-3 py-2 text-sm ${
                  error
                    ? "border border-rose-200 bg-rose-50 text-rose-700"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {error || info}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? <Spinner /> : null}
              Entrar
            </button>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                className="underline underline-offset-2 hover:text-slate-700"
                onClick={handleForgotPassword}
                disabled={submitting}
              >
                Esqueci minha senha
              </button>
              <span>Precisa de ajuda? contato@exemplo.com</span>
            </div>
          </form>

          <p className="mt-3 text-center text-xs text-slate-500 md:hidden">
            © {new Date().getFullYear()} Priscila Alisamentos
          </p>
        </div>
      </main>
    </div>
  );
}
