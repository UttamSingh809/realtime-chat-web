import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme';
import { toast } from 'sonner';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">RealTime Chat</h1>
        <p className="text-muted-foreground">
          Providers are wired. Ready for auth and chat features.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => toast.success('Success toast — providers work!')}
        >
          Test success toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error('Error toast', { description: 'This is what errors will look like.' })
          }
        >
          Test error toast
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm leading-6">
          ✅ Vite + React + TypeScript
          <br />
          ✅ TailwindCSS + theme variables
          <br />
          ✅ shadcn/ui components
          <br />
          ✅ React Query + DevTools
          <br />
          ✅ Zustand (auth + theme stores)
          <br />
          ✅ Sonner toasts
          <br />
          ✅ Theme toggle (top-right)
        </p>
      </div>
    </div>
  );
}