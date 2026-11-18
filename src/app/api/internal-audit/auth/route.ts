import { NextRequest, NextResponse } from "next/server";
import {
  AUDIT_COOKIE_NAME,
  createAuditSessionToken,
  verifyAuditAccessKey,
} from "@/lib/utils/audit-auth";

const NO_INDEX_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "no-store",
} as const;

export async function POST(request: NextRequest) {
  let body: { password?: unknown } = {};
  try {
    body = (await request.json()) as { password?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "So‘rov formati noto‘g‘ri" },
      { status: 400, headers: NO_INDEX_HEADERS },
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyAuditAccessKey(password)) {
    return NextResponse.json(
      { ok: false, error: "Kirish kaliti noto‘g‘ri" },
      { status: 401, headers: NO_INDEX_HEADERS },
    );
  }

  const response = NextResponse.json(
    { ok: true },
    { status: 200, headers: NO_INDEX_HEADERS },
  );

  response.cookies.set(AUDIT_COOKIE_NAME, createAuditSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json(
    { ok: true },
    { status: 200, headers: NO_INDEX_HEADERS },
  );

  response.cookies.set(AUDIT_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
