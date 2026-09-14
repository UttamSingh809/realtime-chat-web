/**
 * LoginPage — the /login route.
 */

import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to RealTime Chat.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}