// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import PrivateLayout from "./layouts/PrivateLayout";
import PublicLayout from "./layouts/PublicLayout";

// Provider do modal de agendamento
import { BookingModalProvider } from "./components/booking/BookingModalProvider";

// Páginas (admin)
import Login from "./pages/Login";
import Agendamento from "./pages/Agendamento";
import Analise from "./pages/Analise";
import Servicos from "./pages/Servicos";
import AdminTools from "./pages/tools/AdminTools"; // ⬅️ ADICIONADO

// Páginas (cliente)
import ClienteCalendario from "./pages/client/Calendario";
import ClienteServicos from "./pages/client/ClienteServicos";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Deixa o modal disponível para TODAS as rotas/CTAs */}
        <BookingModalProvider
          servicesCollection="services"        // ajuste se usar outra coleção
          scheduleDocPath="settings/schedule"  // ajuste se usar outro path
        >
          <Routes>
            {/* LOGIN (sem header) */}
            <Route path="/login" element={<Login />} />

            {/* ROTAS PÚBLICAS DO CLIENTE (com header público fixo) */}
            <Route element={<PublicLayout />}>
              <Route index element={<Navigate to="/cliente/calendario" replace />} />
              <Route path="cliente/calendario" element={<ClienteCalendario />} />
              <Route path="cliente/servicos" element={<ClienteServicos />} />
            </Route>

            {/* ROTAS PRIVADAS (admin) — com Header fixo do admin */}
            <Route
              element={
                <RequireAuth>
                  <PrivateLayout />
                </RequireAuth>
              }
            >
              {/* caminhos relativos */}
              <Route index element={<Navigate to="agendamento" replace />} />
              <Route path="agendamento" element={<Agendamento />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="analise" element={<Analise />} />
              <Route path="tools" element={<AdminTools />} /> {/* ⬅️ NOVA ROTA */}
            </Route>

            {/* Fallback: leva para o calendário público */}
            <Route path="*" element={<Navigate to="/cliente/calendario" replace />} />
          </Routes>
        </BookingModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
