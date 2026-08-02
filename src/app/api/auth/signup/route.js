import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { signAuthToken, authCookieOptions, AUTH_COOKIE_NAME } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // 8+ chars, at least one letter and one number

export async function POST(request) {
  const { allowed, retryAfterMs } = rateLimit(`signup:${getClientIp(request)}`, {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const errors = {};
  if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email address.";
  if (!PASSWORD_REGEX.test(password)) {
    errors.password = "Password must be at least 8 characters and include a letter and a number.";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please fix the errors below.", fields: errors }, { status: 422 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "Please fix the errors below.", fields: { email: "An account with this email already exists." } },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let user;
  try {
    user = await User.create({ name, email, passwordHash });
  } catch (err) {
    // handles the race where two signups for the same email land at once
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Please fix the errors below.", fields: { email: "An account with this email already exists." } },
        { status: 409 }
      );
    }
    throw err;
  }

  const token = await signAuthToken(user._id);

  const response = NextResponse.json({ user: user.toJSON() }, { status: 201 });
  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
  return response;
}
