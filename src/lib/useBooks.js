"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await api.get("/api/books");
      setBooks(data.books);
    } catch (err) {
      setError(err.message || "Couldn't load your books.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addBook = useCallback(async (payload) => {
    const data = await api.post("/api/books", payload);
    setBooks((prev) => [data.book, ...prev]);
    return data.book;
  }, []);

  const updateBook = useCallback(async (id, payload) => {
    const data = await api.patch(`/api/books/${id}`, payload);
    setBooks((prev) => prev.map((b) => (b.id === id ? data.book : b)));
    return data.book;
  }, []);

  const removeBook = useCallback(async (id) => {
    await api.delete(`/api/books/${id}`);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { books, isLoading, error, reload: load, addBook, updateBook, removeBook };
}
