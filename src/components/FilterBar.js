"use client";

import { useState } from "react";
import { STATUS_ORDER, statusOptionLabel } from "@/lib/bookStatus";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title (A–Z)" },
  { value: "author", label: "Author (A–Z)" },
  { value: "updated", label: "Recently updated" },
];

export default function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  tag,
  onTagChange,
  tags,
  sort,
  onSortChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  statusCounts,
  searchInputRef,
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // Only worth showing the shortcut hint while the box is empty and idle —
  // once there's a value or the user is already typing, it'd just be clutter.
  const showShortcutHint = !isSearchFocused && !search;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search by title or author…"
            className="field-input pl-9 pr-12"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            aria-label="Search books"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">⌕</span>
          {showShortcutHint && (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-ink/15 bg-parchment px-1.5 py-0.5 font-body text-xs text-ink-faint"
            >
              /
            </kbd>
          )}
        </div>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="field-input sm:w-52"
          aria-label="Filter by status"
        >
          <option value="all">All statuses ({statusCounts.all})</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {statusOptionLabel(s, statusCounts[s])}
            </option>
          ))}
        </select>

        <select
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          className="field-input sm:w-44"
          aria-label="Filter by tag"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
          aria-pressed={favoritesOnly}
          className={`btn text-sm ${
            favoritesOnly ? "bg-shelf-rust/10 text-shelf-rust-dark" : "border border-ink/15 bg-paper text-ink-soft"
          }`}
        >
          {favoritesOnly ? "♥" : "♡"} Favorites only
        </button>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Sort by
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="field-input w-auto py-1.5"
            aria-label="Sort books"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
