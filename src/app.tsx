import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";

import { AppShell } from "@/components/app/app-shell";
import { NameGate } from "@/components/app/name-gate";

import HubPage from "@/pages/hub-page";
import DicePage from "@/pages/dice-page";
import AdminPage from "@/pages/admin-page";
import CallPage from "@/pages/call-page";
import NotFoundPage from "@/pages/not-found";

export default function App() {
  return (
    <HashRouter>
      <NameGate />
      <Toaster richColors />

      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HubPage />} />
          <Route path="/dice" element={<DicePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/call" element={<CallPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
