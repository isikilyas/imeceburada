export function FormSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <div className="h-3 w-28 rounded bg-ink-800" />
          <div className="mt-2 h-10 w-full rounded-md bg-ink-800" />
        </div>
      ))}
      <div className="h-10 w-32 rounded-md bg-ink-800" />
    </div>
  );
}
