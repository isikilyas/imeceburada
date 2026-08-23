export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse">
      <div className="h-4 w-24 rounded bg-ink-800" />
      <div className="mt-3 h-6 w-32 rounded-full bg-ink-800" />
      <div className="mt-3 h-7 w-3/4 rounded bg-ink-800" />
      <div className="mt-2 h-4 w-40 rounded bg-ink-800" />
      <div className="mt-4 h-4 w-56 rounded bg-ink-800" />
      <div className="mt-6 space-y-2">
        <div className="h-3 w-full rounded bg-ink-800" />
        <div className="h-3 w-full rounded bg-ink-800" />
        <div className="h-3 w-2/3 rounded bg-ink-800" />
      </div>
      <div className="mt-8 h-10 w-32 rounded-md bg-ink-800" />
    </div>
  );
}
