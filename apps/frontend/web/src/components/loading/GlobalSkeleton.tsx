import { Skeleton } from '@/components/ui/skeleton';

export function GlobalSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </header>

      <main className="space-y-6 p-6">
        <Skeleton className="h-10 w-1/3" />

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
