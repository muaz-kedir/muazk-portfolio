import { Skeleton } from "@/components/ui/skeleton";

export function AdminFallback() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="hidden w-64 flex-col border-r border-border-subtle bg-surface md:flex">
        <div className="h-16" />
        <div className="space-y-2 p-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
