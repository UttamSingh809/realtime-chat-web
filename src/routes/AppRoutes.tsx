/**
 * AppRoutes — the router.
 *
 * Structure:
 *   /                 → redirect to /app (authenticated) or /login (guest)
 *   /login            → public, redirect to /app if signed in
 *   /register         → public, redirect to /app if signed in
 *   /app              → protected; the app shell
 *   *                 → 404
 *
 * The AuthProvider runs a silent refresh on mount. We wait for it before
 * rendering routes so users don't flash the login page on refresh.
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthBoot } from '@/providers';
import { ProtectedRoute, PublicRoute } from '@/components/routing';
import { AppLayout } from '@/components/layout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ChatEmptyPage from '@/pages/ChatEmptyPage';
import ChatConversationPage from '@/pages/ChatConversationPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { Loader2 } from 'lucide-react';

function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  const { isBooting } = useAuthBoot();

  if (isBooting) return <BootScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* Public */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected — all under /app use AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<ChatEmptyPage />} />
            <Route path="chat/:id" element={<ChatConversationPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}