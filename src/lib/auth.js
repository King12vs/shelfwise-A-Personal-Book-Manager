import { SignJWT, jwtVerify } from "jose";

// Drives both the JWT expiry and the cookie maxAge below, so they can't drift apart.
const SESSION_SECONDS = Number(process.env.JWT_SESSION_SECONDS) || 60 * 60 * 24 * 7; // 7 days

export const AUTH_COOKIE_NAME = "book_manager_token";

// Checked lazily, inside each function, instead of at module load time —
// otherwise a missing env var fails the entire Next.js build (every route
// gets evaluated during "collecting page data") instead of just the one
// request that actually needed it.
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing. Add it to your .env.local file (or your host's environment variables) — see .env.local.example."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(userId) {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyAuthToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
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