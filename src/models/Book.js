import mongoose from "mongoose";

export const BOOK_STATUSES = ["want-to-read", "reading", "completed"];

const bookSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      minlength: [1, "Title is required."],
      maxlength: [200, "Title can't be longer than 200 characters."],
    },
    author: {
      type: String,
      required: [true, "Author is required."],
      trim: true,
      minlength: [1, "Author is required."],
      maxlength: [120, "Author can't be longer than 120 characters."],
    },
    status: {
      type: String,
      enum: {
        values: BOOK_STATUSES,
        message: "Status must be want-to-read, reading, or completed.",
      },
      default: "want-to-read",
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (tags) => tags.length <= 10,
          message: "A book can have at most 10 tags.",
        },
        {
          validator: (tags) => tags.every((t) => t.length > 0 && t.length <= 30),
          message: "Each tag must be 1–30 characters.",
        },
      ],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Notes can't be longer than 2000 characters."],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be between 1 and 5."],
      max: [5, "Rating must be between 1 and 5."],
      validate: {
        validator: (v) => v === null || v === undefined || Number.isInteger(v),
        message: "Rating must be a whole number.",
      },
      default: null,
    },
    currentPage: {
      type: Number,
      min: [0, "Current page can't be negative."],
      default: null,
    },
    totalPages: {
      type: Number,
      min: [0, "Total pages can't be negative."],
      default: null,
    },
  },
  { timestamps: true }
);

// Normalize tags: trim, lowercase, drop empties/duplicates.
bookSchema.pre("validate", function normalizeTags(next) {
  if (Array.isArray(this.tags)) {
    const cleaned = this.tags
      .map((t) => String(t).trim().toLowerCase())
      .filter(Boolean);
    this.tags = [...new Set(cleaned)];
  }

  if (
    this.currentPage != null &&
    this.totalPages != null &&
    this.currentPage > this.totalPages
  ) {
    this.invalidate("currentPage", "Current page can't be greater than total pages.");
  }

  next();
});

bookSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

bookSchema.index({ owner: 1, status: 1 });
bookSchema.index({ owner: 1, tags: 1 });
bookSchema.index({ owner: 1, isFavorite: 1 });

export default mongoose.models.Book || mongoose.model("Book", bookSchema);
