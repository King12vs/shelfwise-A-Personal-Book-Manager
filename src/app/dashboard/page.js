"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatCards from "@/components/StatCards";
import BookCard from "@/components/BookCard";
import BookFormModal from "@/components/BookFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ProgressBar from "@/components/ProgressBar";
import { BookGridSkeleton } from "@/components/BookCardSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useBooks } from "@/lib/useBooks";
import { useBookActions } from "@/lib/useBookActions";

export default function DashboardPage() {
  const { user } = useAuth();
  const { books, isLoading, error, addBook, updateBook, removeBook } = useBooks();
  const actions = useBookActions({ addBook, updateBook, removeBook });

  const recent = [...books]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const currentlyReading = books
    .filter((b) => b.status === "reading" && b.totalPages)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Your dashboard"}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">Here&rsquo;s the state of your shelf today.</p>
          </div>
          <button onClick={actions.openAddModal} className="btn-primary">
            + Add a book
          </button>
        </div>

        {isLoading ? (
          <BookGridSkeleton count={3} />
        ) : error ? (
          <p className="text-sm text-shelf-rust-dark">{error}</p>
        ) : (
          <>
            <StatCards books={books} />

            {currentlyReading.length > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-semibold">Currently reading</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {currentlyReading.map((book) => (
                    <div key={book.id} className="card space-y-2 p-4">
                      <p className="truncate font-display font-semibold">{book.title}</p>
                      <p className="truncate text-xs text-ink-soft">{book.author}</p>
                      <ProgressBar current={book.currentPage} total={book.totalPages} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recently added</h2>
              {books.length > 0 && (
                <Link href="/books" className="text-sm font-medium text-shelf-green hover:underline">
                  View full shelf →
                </Link>
              )}
            </div>

            <div className="mt-4">
              {recent.length === 0 ? (
                <EmptyState
                  title="Your shelf is empty"
                  body="Add the first book you're reading, want to read, or already finished."
                  action={
                    <button onClick={actions.openAddModal} className="btn-primary">
                      Add your first book
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recent.map((book) => (
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
          </>
        )}
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
