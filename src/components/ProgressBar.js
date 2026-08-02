export default function ProgressBar({ current, total }) {
  if (!total || total <= 0) return null;
  const pct = Math.min(100, Math.round((Math.min(current ?? 0, total) / total) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink-faint">
        <span>
          {current ?? 0} / {total} pages
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-shelf-gold transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
