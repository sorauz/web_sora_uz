import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthUser, AuthUserSchema } from "@/lib/schemas/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sora_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const raw = JSON.parse(sessionCookie.value);
    const parsed = AuthUserSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: parsed.data as AuthUser,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}
