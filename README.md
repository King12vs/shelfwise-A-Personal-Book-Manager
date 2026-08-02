# Shelfwise

A personal book tracker. Sign up, keep a shelf of what you want to read, what
you're reading, and what you've finished, tag things however you want, and
see stats on your collection at a glance.

Next.js (App Router) + MongoDB + JWT auth. No separate Express server —
Next's API routes handle the backend.

## Features

- Signup / login / logout — JWT in an httpOnly cookie, protected routes via middleware
- Add / edit / delete books: title, author, status, tags, notes, rating, reading progress, favorites
- 📘 Want to Read · 📖 Reading · ✅ Completed, changeable inline from any card
- Filter by status/tag, search by title or author, sort a few different ways
- Dashboard with stats and a "currently reading" section
- Keyboard shortcuts on the shelf page — `/` to search, `n` to add a book
- Rate-limited login/signup, security headers, passwords hashed with bcrypt

## Running it locally

```bash
npm install

npm run dev
```

## Stack

| Layer     | Choice                                  |
| --------- | ---------------------------------------- |
| Frontend  | Next.js 14 (App Router), React, Tailwind |
| Backend   | Next.js API routes                       |
| Database  | MongoDB via Mongoose                     |
| Auth      | JWT (`jose`), httpOnly cookie            |

## Project structure

```
src/
  app/
    page.js              # landing page
    login/, signup/
    dashboard/            # stats, currently reading, recent books
    books/                # full collection, search/filter/sort
    api/
      auth/               # signup, login, logout, me
      books/               # CRUD, scoped to the logged-in user
  components/              # BookCard, BookFormModal, TagInput, StarRating...
  context/                 # AuthContext, ToastContext
  lib/                     # db connection, auth/rate-limit helpers, validation, hooks
  models/                  # User, Book (Mongoose schemas)
middleware.js               # route protection
```