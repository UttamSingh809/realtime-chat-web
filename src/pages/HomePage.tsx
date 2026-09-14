/**
 * HomePage — authenticated landing page.
 * Placeholder for now; the real chat layout comes in Step 5.
 */

import { useAuth, useCurrentUser, useLogout } from '@/features/auth';
import { ThemeToggle } from '@/components/theme';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { isLoading } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">RealTime Chat</h1>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold">You&apos;re signed in</h2>
          <p className="text-muted-foreground">
            Hello {user?.name ?? 'there'} — the chat UI arrives in Step 5.
          </p>
          <div className="mx-auto inline-block rounded-md border bg-muted px-3 py-1 text-xs text-muted-foreground">
            Auth is fully working: try refreshing the page.
          </div>
        </div>
      </main>
    </div>
  );
}