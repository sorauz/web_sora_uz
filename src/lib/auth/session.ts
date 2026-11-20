import "server-only";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/schemas/auth";
import {
  RECENT_ORDER_ACCESS_COOKIE_NAME,
  RECENT_ORDER_ACCESS_TTL_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createRecentOrderAccessToken,
  createSessionToken,
  parseRecentOrderAccessToken,
  parseSessionToken,
  type RecentOrderAccess,
} from "./session-token";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function buildCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

/**
 * Reads and HMAC-verifies the logged-in user from the `sora_session` cookie.
 */
export async function getSessionUser(
  cookieStore?: CookieStore
): Promise<AuthUser | null> {
  const store = cookieStore ?? (await cookies());
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  return parseSessionToken(raw);
}

/**
 * Writes an HMAC-signed `AuthUser` payload into the `sora_session` HttpOnly cookie.
 */
export async function setSessionCookie(
  user: AuthUser,
  cookieStore?: CookieStore
): Promise<void> {
  const store = cookieStore ?? (await cookies());
  const token = createSessionToken(user);
  store.set(SESSION_COOKIE_NAME, token, buildCookieOptions(SESSION_TTL_SECONDS));
}

/**
 * Clears the `sora_session` cookie on logout.
 */
export async function clearSessionCookie(
  cookieStore?: CookieStore
): Promise<void> {
  const store = cookieStore ?? (await cookies());
  store.delete(SESSION_COOKIE_NAME);
}

/**
 * Persists a 24h signed ownership receipt for the just-created order so
 * OrderSuccessView can inspect it even if the session differs (e.g. B2C vs B2B checkout).
 */
export async function setRecentOrderAccessCookie(
  params: { orderId: string; type: "B2C" | "B2B"; ownerId: string },
  cookieStore?: CookieStore
): Promise<void> {
  const store = cookieStore ?? (await cookies());
  const token = createRecentOrderAccessToken(params);
  store.set(
    RECENT_ORDER_ACCESS_COOKIE_NAME,
    token,
    buildCookieOptions(RECENT_ORDER_ACCESS_TTL_SECONDS)
  );
}

/**
 * Returns the verified recent order ownership receipt if it matches `orderId`.
 */
export async function getRecentOrderAccess(
  orderId: string,
  cookieStore?: CookieStore
): Promise<RecentOrderAccess | null> {
  const store = cookieStore ?? (await cookies());
  const raw = store.get(RECENT_ORDER_ACCESS_COOKIE_NAME)?.value;
  const parsed = parseRecentOrderAccessToken(raw);
  if (!parsed || parsed.orderId !== orderId) {
    return null;
  }
  return parsed;
}
