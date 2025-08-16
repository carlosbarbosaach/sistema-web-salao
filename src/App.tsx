import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import PrivateLayout from "./layouts/PrivateLayout";

import Login from "./pages/Login";
import Agendamento from "./pages/Agendamento";

import Analise from "./pages/Analise";
import Servicos from "./pages/Serviços";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login (sem header) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas privadas (com Header fixo) */}
          <Route
            element={
              <RequireAuth>
                <PrivateLayout />
              </RequireAuth>
            }
          >
            {/* ao entrar, manda para /agendamento */}
            <Route index element={<Navigate to="/agendamento" replace />} />
            <Route path="/agendamento" element={<Agendamento />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/analise" element={<Analise />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
