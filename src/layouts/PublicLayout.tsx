import React from "react";
import { Outlet } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      {/* padding-top para não ficar atrás do header fixo */}
      <main className="pt-[100px]">
        <Outlet />
      </main>

      <footer className="mt-10 border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Priscila Alisamentos
      </footer>
    </div>
  );
}
