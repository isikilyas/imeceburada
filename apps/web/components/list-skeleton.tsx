export function ListSkeleton({ count = 6, columns = 1 }: { count?: number; columns?: 1 | 2 }) {
  return (
    <div className={`grid grid-cols-1 gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-ink-800 bg-ink-900 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-ink-800" />
              <div className="h-3 w-1/3 rounded bg-ink-800" />
            </div>
            <div className="h-6 w-16 shrink-0 rounded-full bg-ink-800" />
          </div>
          <div className="mt-4 h-3 w-1/2 rounded bg-ink-800" />
        </div>
      ))}
    </div>
  );
}
