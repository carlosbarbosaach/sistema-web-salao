// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import PrivateLayout from "./layouts/PrivateLayout";
import PublicLayout from "./layouts/PublicLayout";

// Modal global do agendamento (cliente só solicita)
import { BookingModalProvider } from "./components/booking/BookingModalProvider";

// Admin
import Login from "./pages/Login";
import Agendamento from "./pages/Agendamento";
import Analise from "./pages/Analise";
import Servicos from "./pages/Servicos";

// Cliente
import ClienteCalendario from "./pages/client/Calendario";
import ClienteServicos from "./pages/client/ClienteServicos";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingModalProvider
          servicesCollection="services"
          scheduleDocPath="settings/schedule"
        >
          <Routes>
            {/* login */}
            <Route path="/login" element={<Login />} />

            {/* público (cliente) */}
            <Route element={<PublicLayout />}>
              <Route index element={<Navigate to="/cliente/calendario" replace />} />
              <Route path="cliente/calendario" element={<ClienteCalendario />} />
              <Route path="cliente/servicos" element={<ClienteServicos />} />
              {/* ❌ removido: /cliente/agendamento (agora é modal) */}
            </Route>

            {/* privado (admin) */}
            <Route
              element={
                <RequireAuth>
                  <PrivateLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="agendamento" replace />} />
              <Route path="agendamento" element={<Agendamento />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="analise" element={<Analise />} />
            </Route>

            <Route path="*" element={<Navigate to="/cliente/calendario" replace />} />
          </Routes>
        </BookingModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
