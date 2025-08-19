// src/auth/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import type { ReactNode } from "react";

type RequireAuthProps = {
  /** Caso use <RequireAuth>...children...</RequireAuth> */
  children?: ReactNode;
  /** Se quiser exigir admin explicitamente */
  requireAdmin?: boolean;
};

function Loading() {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="flex items-center gap-3 text-slate-500">
        <span
          className="inline-block h-5 w-5 rounded-full border-2 border-slate-300 border-t-transparent animate-spin"
          aria-label="Carregando"
        />
        <span>Carregando…</span>
      </div>
    </div>
  );
}

export default function RequireAuth({
  children,
  requireAdmin = false,
}: RequireAuthProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user || (requireAdmin && !isAdmin)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Suporta ambos os usos: com children OU via <Outlet/>
  return <>{children ?? <Outlet />}</>;
}
