"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import BookFormModal from "@/components/BookFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import { BookGridSkeleton } from "@/components/BookCardSkeleton";
import { STATUS_ORDER } from "@/lib/bookStatus";
import { useBooks } from "@/lib/useBooks";
import { useBookActions } from "@/lib/useBookActions";

function sortBooks(books, sort) {
  const sorted = [...books];
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "author":
      return sorted.sort((a, b) => a.author.localeCompare(b.author));
    case "updated":
      return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    case "newest":
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export default function BooksPage() {
  const { books, isLoading, error, addBook, updateBook, removeBook } = useBooks();
  const actions = useBookActions({ addBook, updateBook, removeBook });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("newest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const searchInputRef = useRef(null);

  // Quiet, keyboard-first touches: "/" jumps to search, "n" starts a new book.
  const { isFormOpen, openAddModal } = actions;
  useEffect(() => {
    function handleKeyDown(e) {
      const activeTag = document.activeElement?.tagName;
      const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";
      if (isTyping || isFormOpen) return;

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "n") {
        e.preventDefault();
        openAddModal();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen, openAddModal]);

  const allTags = useMemo(() => {
    const set = new Set();
    books.forEach((b) => b.tags?.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [books]);

  // If the tag currently being filtered on no longer exists on any book
  // (its last book was edited or deleted), drop the filter instead of
  // silently hiding every book while the dropdown looks reset to "All tags".
  useEffect(() => {
    if (tag && !allTags.includes(tag)) setTag("");
  }, [tag, allTags]);

  const statusCounts = useMemo(() => {
    const counts = { all: books.length };
    STATUS_ORDER.forEach((s) => {
      counts[s] = books.filter((b) => b.status === s).length;
    });
    return counts;
  }, [books]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = books.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (tag && !b.tags?.includes(tag)) return false;
      if (favoritesOnly && !b.isFavorite) return false;
      if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
      return true;
    });
    return sortBooks(result, sort);
  }, [books, search, status, tag, favoritesOnly, sort]);

  const hasActiveFilters = search || status !== "all" || tag || favoritesOnly;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">My shelf</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {books.length} {books.length === 1 ? "book" : "books"} total
            </p>
          </div>
          <button onClick={actions.openAddModal} className="btn-primary" title="Add a book (shortcut: n)">
            + Add a book
          </button>
        </div>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          tag={tag}
          onTagChange={setTag}
          tags={allTags}
          sort={sort}
          onSortChange={setSort}
          favoritesOnly={favoritesOnly}
          onFavoritesOnlyChange={setFavoritesOnly}
          statusCounts={statusCounts}
          searchInputRef={searchInputRef}
        />

        <div className="mt-6">
          {isLoading ? (
            <BookGridSkeleton />
          ) : error ? (
            <p className="text-sm text-shelf-rust-dark">{error}</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? "No books match your filters" : "Your shelf is empty"}
              body={
                hasActiveFilters
                  ? "Try a different search term, status, or tag."
                  : "Add the first book you're reading, want to read, or already finished."
              }
              action={
                !hasActiveFilters && (
                  <button onClick={actions.openAddModal} className="btn-primary">
                    Add your first book
                  </button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onStatusChange={actions.handleStatusChange}
                  onEdit={actions.openEditModal}
                  onDelete={actions.requestDelete}
                  onToggleFavorite={actions.handleToggleFavorite}
                  isPending={actions.pendingIds.has(book.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BookFormModal
        open={actions.isFormOpen}
        book={actions.editingBook}
        onClose={actions.closeModal}
        onSubmit={actions.handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(actions.pendingDelete)}
        title="Remove this book?"
        body={
          actions.pendingDelete
            ? `"${actions.pendingDelete.title}" will be removed from your shelf. This can't be undone.`
            : ""
        }
        confirmLabel="Remove"
        pendingLabel="Removing…"
        isPending={actions.isDeleting}
        onConfirm={actions.confirmDelete}
        onCancel={actions.cancelDelete}
      />
    </div>
  );
}
