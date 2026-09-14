import { Button } from '@/components/ui/button';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">RealTime Chat</h1>
        <p className="text-muted-foreground">Frontend foundation is up and running.</p>
      </div>

      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm">
          ✅ Vite + React + TypeScript
          <br />
          ✅ TailwindCSS + theme variables
          <br />
          ✅ shadcn/ui components
          <br />✅ Path alias <code className="rounded bg-muted px-1.5 py-0.5 text-xs">@/</code>
        </p>
      </div>
    </div>
  );
}