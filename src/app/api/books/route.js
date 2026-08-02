import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { validateBookInput } from "@/lib/validateBookInput";
import Book, { BOOK_STATUSES } from "@/models/Book";

function unauthorized() {
  return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");
  const search = searchParams.get("q");

  const query = { owner: user._id };

  if (status && status !== "all") {
    if (!BOOK_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Unknown status filter." }, { status: 400 });
    }
    query.status = status;
  }

  if (tag) {
    query.tags = tag.trim().toLowerCase();
  }

  if (search) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    query.$or = [{ title: pattern }, { author: pattern }];
  }

  await connectToDatabase();
  const books = await Book.find(query).sort({ createdAt: -1 });

  return NextResponse.json({ books: books.map((b) => b.toJSON()) }, { status: 200 });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { errors, data, isValid } = validateBookInput(body, { partial: false });
  if (!isValid) {
    return NextResponse.json({ error: "Please fix the errors below.", fields: errors }, { status: 422 });
  }

  await connectToDatabase();

  try {
    const book = await Book.create({ owner: user._id, ...data });
    return NextResponse.json({ book: book.toJSON() }, { status: 201 });
  } catch (err) {
    if (err.name === "ValidationError") {
      const fields = Object.fromEntries(
        Object.entries(err.errors).map(([key, val]) => [key, val.message])
      );
      return NextResponse.json({ error: "Please fix the errors below.", fields }, { status: 422 });
    }
    throw err;
  }
}
