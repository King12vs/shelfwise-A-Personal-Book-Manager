"use client";

import { useEffect, useRef, useState } from "react";
import { STATUS_META, STATUS_ORDER } from "@/lib/bookStatus";
import TagInput from "@/components/TagInput";
import StarRating from "@/components/StarRating";

const EMPTY_FORM = {
  title: "",
  author: "",
  status: "want-to-read",
  tags: [],
  notes: "",
  rating: null,
  currentPage: "",
  totalPages: "",
};

function bookToForm(book) {
  if (!book) return EMPTY_FORM;
  return {
    title: book.title,
    author: book.author,
    status: book.status,
    tags: book.tags || [],
    notes: book.notes || "",
    rating: book.rating ?? null,
    currentPage: book.currentPage ?? "",
    totalPages: book.totalPages ?? "",
  };
}

export default function BookFormModal({ open, book, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(bookToForm(book));
      setErrors({});
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open, book]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    else if (form.title.trim().length > 200) next.title = "Keep it under 200 characters.";

    if (!form.author.trim()) next.author = "Author is required.";
    else if (form.author.trim().length > 120) next.author = "Keep it under 120 characters.";

    if (form.tags.length > 10) next.tags = "Use at most 10 tags.";

    if (form.notes.length > 2000) next.notes = "Keep notes under 2000 characters.";

    const current = form.currentPage === "" ? null : Number(form.currentPage);
    const total = form.totalPages === "" ? null : Number(form.totalPages);
    if (current !== null && (!Number.isFinite(current) || current < 0)) {
      next.currentPage = "Enter a positive number.";
    }
    if (total !== null && (!Number.isFinite(total) || total < 0)) {
      next.totalPages = "Enter a positive number.";
    }
    if (current !== null && total !== null && current > total) {
      next.currentPage = "Can't be greater than total pages.";
    }

    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        author: form.author.trim(),
        status: form.status,
        tags: form.tags,
        notes: form.notes.trim(),
        rating: form.rating,
        currentPage: form.currentPage === "" ? null : Number(form.currentPage),
        totalPages: form.totalPages === "" ? null : Number(form.totalPages),
      });
    } catch (err) {
      if (err?.fields) setErrors(err.fields);
    } finally {
      setIsSubmitting(false);
    }
  }

  const showProgress = form.status !== "want-to-read";

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4 py-8 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-form-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="card max-h-[90vh] w-full max-w-md animate-slide-up space-y-4 overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="book-form-title" className="text-lg font-semibold">
            {book ? "Edit book" : "Add a book"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-faint hover:bg-ink/5 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div>
          <label htmlFor="title" className="field-label">
            Title
          </label>
          <input
            id="title"
            ref={firstFieldRef}
            type="text"
            className="field-input"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="author" className="field-label">
            Author
          </label>
          <input
            id="author"
            type="text"
            className="field-input"
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            aria-invalid={Boolean(errors.author)}
          />
          {errors.author && <p className="field-error">{errors.author}</p>}
        </div>

        <div>
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select
            id="status"
            className="field-input"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].emoji} {STATUS_META[status].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tag-input" className="field-label">
            Tags
          </label>
          <TagInput id="tag-input" tags={form.tags} onChange={(tags) => update("tags", tags)} error={errors.tags} />
        </div>

        {showProgress && (
          <div>
            <span className="field-label">Reading progress (optional)</span>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  placeholder="Current page"
                  className="field-input"
                  value={form.currentPage}
                  onChange={(e) => update("currentPage", e.target.value)}
                  aria-label="Current page"
                  aria-invalid={Boolean(errors.currentPage)}
                />
              </div>
              <span className="text-ink-faint">of</span>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  placeholder="Total pages"
                  className="field-input"
                  value={form.totalPages}
                  onChange={(e) => update("totalPages", e.target.value)}
                  aria-label="Total pages"
                  aria-invalid={Boolean(errors.totalPages)}
                />
              </div>
            </div>
            {(errors.currentPage || errors.totalPages) && (
              <p className="field-error">{errors.currentPage || errors.totalPages}</p>
            )}
          </div>
        )}

        {form.status === "completed" && (
          <div>
            <span className="field-label">Your rating (optional)</span>
            <StarRating value={form.rating} onChange={(rating) => update("rating", rating)} />
          </div>
        )}

        <div>
          <label htmlFor="notes" className="field-label">
            Notes <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="A favorite quote, why you picked it up, who recommended it…"
            className="field-input resize-none"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            aria-invalid={Boolean(errors.notes)}
          />
          {errors.notes && <p className="field-error">{errors.notes}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Saving…" : book ? "Save changes" : "Add book"}
          </button>
        </div>
      </form>
    </div>
  );
}
