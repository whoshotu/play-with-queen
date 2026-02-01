import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";

import { AppShell } from "@/components/app/app-shell";
import { LoginGate } from "@/components/app/login-gate";
import { PageLoader } from "@/components/loading/page-loader";

const HubPage = lazy(() => import("@/pages/hub-page").then(m => ({ default: m.default })));
const DicePage = lazy(() => import("@/pages/dice-page").then(m => ({ default: m.default })));
const TruthOrDarePage = lazy(() => import("@/pages/truth-or-dare-page").then(m => ({ default: m.default })));
const AdminPage = lazy(() => import("@/pages/admin-page").then(m => ({ default: m.default })));
const CallPage = lazy(() => import("@/pages/call-page").then(m => ({ default: m.default })));
const NotFoundPage = lazy(() => import("@/pages/not-found").then(m => ({ default: m.default })));

export default function App() {
  return (
    <HashRouter>
      <LoginGate />
      <Toaster richColors />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HubPage />} />
            <Route path="/dice" element={<DicePage />} />
            <Route path="/truth-or-dare" element={<TruthOrDarePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/call" element={<CallPage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
