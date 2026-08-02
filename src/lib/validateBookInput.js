import { BOOK_STATUSES } from "@/models/Book";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

// Validates + normalizes book input before it touches Mongoose, so bad
// types never reach the schema and blow up as an ugly CastError/500.
// partial=true is for PATCH: only validate/return fields present in body.
export function validateBookInput(body, { partial = false } = {}) {
  const errors = {};
  const data = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(body ?? {}, key);

  if (!partial || has("title")) {
    if (!isNonEmptyString(body.title)) {
      errors.title = "Title is required.";
    } else if (body.title.trim().length > 200) {
      errors.title = "Keep the title under 200 characters.";
    } else {
      data.title = body.title.trim();
    }
  }

  if (!partial || has("author")) {
    if (!isNonEmptyString(body.author)) {
      errors.author = "Author is required.";
    } else if (body.author.trim().length > 120) {
      errors.author = "Keep the author under 120 characters.";
    } else {
      data.author = body.author.trim();
    }
  }

  if (!partial || has("status")) {
    const status = has("status") ? body.status : "want-to-read";
    if (typeof status !== "string" || !BOOK_STATUSES.includes(status)) {
      errors.status = "Status must be want-to-read, reading, or completed.";
    } else {
      data.status = status;
    }
  }

  if (!partial || has("tags")) {
    const tags = has("tags") ? body.tags : [];
    if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) {
      errors.tags = "Tags must be a list of text values.";
    } else if (tags.length > 10) {
      errors.tags = "Use at most 10 tags.";
    } else if (tags.some((t) => t.trim().length > 30)) {
      errors.tags = "Keep each tag under 30 characters.";
    } else {
      data.tags = tags;
    }
  }

  if (!partial || has("isFavorite")) {
    const favorite = has("isFavorite") ? body.isFavorite : false;
    if (typeof favorite !== "boolean") {
      errors.isFavorite = "Favorite must be true or false.";
    } else {
      data.isFavorite = favorite;
    }
  }

  if (!partial || has("notes")) {
    const notes = has("notes") ? body.notes : "";
    if (typeof notes !== "string") {
      errors.notes = "Notes must be text.";
    } else if (notes.length > 2000) {
      errors.notes = "Keep notes under 2000 characters.";
    } else {
      data.notes = notes.trim();
    }
  }

  // rating: null clears it, 1–5 sets it — anything else is invalid.
  if (!partial || has("rating")) {
    const rating = has("rating") ? body.rating : null;
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      errors.rating = "Rating must be a whole number between 1 and 5.";
    } else {
      data.rating = rating;
    }
  }

  // currentPage / totalPages: validated together since one implies a check
  // against the other. Either can be null to mean "not tracked".
  const currentPageProvided = has("currentPage");
  const totalPagesProvided = has("totalPages");
  if (!partial || currentPageProvided || totalPagesProvided) {
    const currentPage = currentPageProvided ? body.currentPage : null;
    const totalPages = totalPagesProvided ? body.totalPages : null;

    const currentPageValid = currentPage === null || (isFiniteNumber(currentPage) && currentPage >= 0);
    const totalPagesValid = totalPages === null || (isFiniteNumber(totalPages) && totalPages >= 0);

    if (!currentPageValid) {
      errors.currentPage = "Current page must be a positive number.";
    } else if (!totalPagesValid) {
      errors.totalPages = "Total pages must be a positive number.";
    } else if (currentPage !== null && totalPages !== null && currentPage > totalPages) {
      errors.currentPage = "Current page can't be greater than total pages.";
    } else {
      if (!partial || currentPageProvided) data.currentPage = currentPage;
      if (!partial || totalPagesProvided) data.totalPages = totalPages;
    }
  }

  return { errors, data, isValid: Object.keys(errors).length === 0 };
}
