import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { signAuthToken, authCookieOptions, AUTH_COOKIE_NAME } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 422 });
  }

  // Keyed by IP + email: slows down credential stuffing against one account
  // without letting a single attacker lock other people out of the same IP.
  const { allowed, retryAfterMs } = rateLimit(`login:${getClientIp(request)}:${email}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  await connectToDatabase();

  // Deliberately vague on failure — never reveal whether the email exists.
  const invalidCredentials = () =>
    NextResponse.json({ error: "That email and password don't match." }, { status: 401 });

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) return invalidCredentials();

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) return invalidCredentials();

  const token = await signAuthToken(user._id);

  const response = NextResponse.json({ user: user.toJSON() }, { status: 200 });
  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
  return response;
}
