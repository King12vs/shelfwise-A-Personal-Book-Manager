"use client";

import { STATUS_META, STATUS_ORDER } from "@/lib/bookStatus";
import StarRating from "@/components/StarRating";
import ProgressBar from "@/components/ProgressBar";

export default function BookCard({ book, onStatusChange, onEdit, onDelete, onToggleFavorite, isPending = false }) {
  const meta = STATUS_META[book.status];

  return (
    <div
      className={`card group relative flex flex-col gap-3 overflow-hidden p-4 pl-5 transition-shadow hover:shadow-card-hover ${
        isPending ? "opacity-70" : ""
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.spine}`} aria-hidden="true" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold leading-snug">{book.title}</h3>
          <p className="truncate text-sm text-ink-soft">{book.author}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => onToggleFavorite(book)}
            disabled={isPending}
            aria-label={book.isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={book.isFavorite}
            className={`rounded-full p-1 text-lg leading-none transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              book.isFavorite ? "text-shelf-rust" : "text-ink/20 hover:text-shelf-rust/70"
            }`}
          >
            {book.isFavorite ? "♥" : "♡"}
          </button>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
            {meta.emoji} {meta.label}
          </span>
        </div>
      </div>

      {book.status === "completed" && book.rating ? <StarRating value={book.rating} readOnly /> : null}

      {book.status !== "want-to-read" && book.totalPages ? (
        <ProgressBar current={book.currentPage} total={book.totalPages} />
      ) : null}

      {book.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {book.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink-soft">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {book.notes && <p className="line-clamp-2 text-sm italic text-ink-soft">&ldquo;{book.notes}&rdquo;</p>}

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-ink/10 pt-3">
        <label className="sr-only" htmlFor={`status-${book.id}`}>
          Change status for {book.title}
        </label>
        <select
          id={`status-${book.id}`}
          value={book.status}
          onChange={(e) => onStatusChange(book, e.target.value)}
          disabled={isPending}
          className="rounded-card border border-ink/15 bg-paper px-2.5 py-1.5 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].emoji} {STATUS_META[status].label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(book)}
            disabled={isPending}
            className="rounded-card px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(book)}
            disabled={isPending}
            className="rounded-card px-2.5 py-1.5 text-xs font-medium text-shelf-rust-dark hover:bg-shelf-rust/10 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
