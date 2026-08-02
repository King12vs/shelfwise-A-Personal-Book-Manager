export default function BookCardSkeleton() {
  return (
    <div className="card animate-pulse space-y-3 p-4 pl-5">
      <div className="flex items-start justify-between gap-3">
        <div className="w-2/3 space-y-2">
          <div className="h-4 w-full rounded bg-ink/10" />
          <div className="h-3 w-2/3 rounded bg-ink/10" />
        </div>
        <div className="h-5 w-20 rounded-full bg-ink/10" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-ink/10" />
        <div className="h-5 w-16 rounded-full bg-ink/10" />
      </div>
      <div className="h-8 rounded-card border-t border-ink/10 bg-transparent pt-3" />
    </div>
  );
}

export function BookGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
