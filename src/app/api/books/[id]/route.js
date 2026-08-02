import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { validateBookInput } from "@/lib/validateBookInput";
import Book from "@/models/Book";

function unauthorized() {
  return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
}

async function findOwnedBook(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) return { book: null, invalidId: true };
  const book = await Book.findOne({ _id: id, owner: userId });
  return { book, invalidId: false };
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { errors, data, isValid } = validateBookInput(body, { partial: true });
  if (!isValid) {
    return NextResponse.json({ error: "Please fix the errors below.", fields: errors }, { status: 422 });
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  await connectToDatabase();
  const { book, invalidId } = await findOwnedBook(params.id, user._id);
  if (invalidId) return NextResponse.json({ error: "That book id isn't valid." }, { status: 400 });
  if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });

  Object.assign(book, data);

  try {
    await book.save();
  } catch (err) {
    if (err.name === "ValidationError") {
      const fields = Object.fromEntries(
        Object.entries(err.errors).map(([key, val]) => [key, val.message])
      );
      return NextResponse.json({ error: "Please fix the errors below.", fields }, { status: 422 });
    }
    throw err;
  }

  return NextResponse.json({ book: book.toJSON() }, { status: 200 });
}

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await connectToDatabase();
  const { book, invalidId } = await findOwnedBook(params.id, user._id);
  if (invalidId) return NextResponse.json({ error: "That book id isn't valid." }, { status: 400 });
  if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });

  await book.deleteOne();
  return NextResponse.json({ ok: true }, { status: 200 });
}
