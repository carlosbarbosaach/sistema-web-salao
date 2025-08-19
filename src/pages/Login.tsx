// src/pages/Login.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { useAuth } from "../auth/AuthProvider";
import { ADMIN_EMAILS } from "../config/admin";
import { auth } from "../lib/firebase";

/* Helpers */
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

/* Ícone */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path fill="currentColor" d="M9 16.2l-3.5-3.6L4 14.1 9 19l12-12-1.5-1.4z" />
    </svg>
  );
}

export default function Login() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/agendamento";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (user && isAdmin) return <Navigate to={from} replace />;

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureAdminOrSignOut(cred.user.email);
    } catch (err) {
      const msg =
        (err as Error)?.message?.includes("administrador")
          ? "Sem permissão. Esta conta não é de administrador."
          : mapAuthError(err);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid bg-white md:grid-cols-2">
      {/* HERO MOBILE (aparece só no mobile) */}
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

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-white/90">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-400/20 text-indigo-100">
                  <CheckIcon />
                </span>
                Controle de agenda com WhatsApp rápido
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-400/20 text-indigo-100">
                  <CheckIcon />
                </span>
                Gestão de serviços e preços
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-400/20 text-indigo-100">
                  <CheckIcon />
                </span>
                Métricas de desempenho e receita
              </li>
            </ul>
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
          >
            <div>
              <label className="block text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Entrar
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-slate-500 md:hidden">
            © {new Date().getFullYear()} Priscila Alisamentos
          </p>
        </div>
      </main>
    </div>
  );
}
