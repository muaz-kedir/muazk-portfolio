import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-elevated", className)} />;
}

export function PageSkeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={i % 3 === 0 ? "h-6 w-1/3" : "h-4 w-2/3"} />
        ))}
      </div>
    </div>
  );
}
