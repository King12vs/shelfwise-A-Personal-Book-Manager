"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/context/ToastContext";

export function useBookActions({ addBook, updateBook, removeBook }) {
  const { showToast } = useToast();

  // editingBook: null = adding new, book object = editing that book.
  const [editingBook, setEditingBook] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ids currently mid-request, so a card can disable itself and avoid double-fires
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const markPending = useCallback((id, isPending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const openAddModal = useCallback(() => {
    setEditingBook(null);
    setIsFormOpen(true);
  }, []);

  const openEditModal = useCallback((book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsFormOpen(false);
    setEditingBook(null);
  }, []);

  const handleSubmit = useCallback(
    async (payload) => {
      try {
        if (editingBook) {
          await updateBook(editingBook.id, payload);
          showToast("Book updated.");
        } else {
          await addBook(payload);
          showToast("Book added to your shelf.");
        }
        closeModal();
      } catch (err) {
        showToast(err.message || "Couldn't save that book.", { type: "error" });
        throw err;
      }
    },
    [editingBook, addBook, updateBook, closeModal, showToast]
  );

  const handleStatusChange = useCallback(
    async (book, status) => {
      if (pendingIds.has(book.id)) return; // already updating this book
      markPending(book.id, true);
      try {
        await updateBook(book.id, { status });
        showToast("Status updated.");
      } catch (err) {
        showToast(err.message || "Couldn't update status.", { type: "error" });
      } finally {
        markPending(book.id, false);
      }
    },
    [pendingIds, updateBook, markPending, showToast]
  );

  const handleToggleFavorite = useCallback(
    async (book) => {
      if (pendingIds.has(book.id)) return;
      markPending(book.id, true);
      try {
        await updateBook(book.id, { isFavorite: !book.isFavorite });
        showToast(book.isFavorite ? "Removed from favorites." : "Added to favorites.");
      } catch (err) {
        showToast(err.message || "Couldn't update favorite.", { type: "error" });
      } finally {
        markPending(book.id, false);
      }
    },
    [pendingIds, updateBook, markPending, showToast]
  );

  const requestDelete = useCallback((book) => {
    setPendingDelete(book);
  }, []);

  const cancelDelete = useCallback(() => {
    if (isDeleting) return; // don't let a backdrop click abandon an in-flight delete
    setPendingDelete(null);
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await removeBook(pendingDelete.id);
      showToast("Book removed.");
      setPendingDelete(null);
    } catch (err) {
      showToast(err.message || "Couldn't remove that book.", { type: "error" });
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDelete, isDeleting, removeBook, showToast]);

  return {
    isFormOpen,
    editingBook,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleStatusChange,
    handleToggleFavorite,
    pendingIds,
    pendingDelete,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
