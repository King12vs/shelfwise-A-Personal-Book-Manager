"use client";

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  pendingLabel = "Working…",
  isPending = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="card w-full max-w-sm animate-slide-up p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={isPending} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending} className="btn-danger bg-shelf-rust/10">
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
