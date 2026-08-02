export default function EmptyState({ title, body, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 border-dashed p-12 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-xs text-sm text-ink-soft">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
