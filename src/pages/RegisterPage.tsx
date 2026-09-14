/**
 * RegisterPage — the /register route.
 */

import { RegisterForm } from '@/features/auth';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Get started with RealTime Chat in seconds.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}