import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

// Returns null if not authenticated — caller decides what that means.
export async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  const payload = await verifyAuthToken(token);
  if (!payload?.sub) return null;

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  return user || null;
}
