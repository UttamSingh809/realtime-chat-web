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
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HomePage from '@/pages/HomePage';
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
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<HomePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}