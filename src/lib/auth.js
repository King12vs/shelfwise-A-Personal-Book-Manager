import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing. Add it to your .env.local file — see .env.local.example."
  );
}

// Drives both the JWT expiry and the cookie maxAge below, so they can't drift apart.
const SESSION_SECONDS = Number(process.env.JWT_SESSION_SECONDS) || 60 * 60 * 24 * 7; // 7 days

const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export const AUTH_COOKIE_NAME = "book_manager_token";

export async function signAuthToken(userId) {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(encodedSecret);
}

export async function verifyAuthToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload;
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}
