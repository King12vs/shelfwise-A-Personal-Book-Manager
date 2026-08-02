import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

const PROTECTED_PATHS = ["/dashboard", "/books"];
const AUTH_ONLY_PATHS = ["/login", "/signup"];

async function isAuthenticated(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = await verifyAuthToken(token);
  return Boolean(payload);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const authed = await isAuthenticated(request);

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && authed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/books/:path*", "/login", "/signup"],
};
