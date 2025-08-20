// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import PrivateLayout from "./layouts/PrivateLayout";
import PublicLayout from "./layouts/PublicLayout";

// Páginas (admin)
import Login from "./pages/Login";
import Agendamento from "./pages/Agendamento";
import Analise from "./pages/Analise";
import Servicos from "./pages/Servicos";
import ClienteCalendario from "./pages/client/Calendario";
import ClienteServicos from "./pages/client/ClienteServicos";
import ClienteAgendamento from "./pages/client/ClienteAgendamento";

// Páginas (cliente)


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* LOGIN (sem header) */}
          <Route path="/login" element={<Login />} />

          {/* ROTAS PÚBLICAS DO CLIENTE (com header público fixo) */}
          <Route element={<PublicLayout />}>
            <Route index element={<Navigate to="/cliente/calendario" replace />} />
            <Route path="cliente/calendario" element={<ClienteCalendario />} />
            <Route path="cliente/servicos" element={<ClienteServicos />} />
            <Route path="cliente/agendamento" element={<ClienteAgendamento />} />
          </Route>

          {/* ROTAS PRIVADAS (admin) — com Header fixo do admin */}
          <Route
            element={
              <RequireAuth /* requireAdmin opcional */>
                <PrivateLayout />
              </RequireAuth>
            }
          >
            {/* IMPORTANTE: caminhos RELATIVOS aqui */}
            <Route index element={<Navigate to="agendamento" replace />} />
            <Route path="agendamento" element={<Agendamento />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="analise" element={<Analise />} />
          </Route>

          {/* Fallback: leva para o calendário público */}
          <Route path="*" element={<Navigate to="/cliente/calendario" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
