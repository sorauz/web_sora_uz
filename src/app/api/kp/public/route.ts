import { NextRequest, NextResponse } from "next/server";
import { fetchSanitizedPublicKp } from "@/lib/kp/public-service";

const KP_SECURITY_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store",
};

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token") || "";
    const res = await fetchSanitizedPublicKp(token);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error },
        { status: res.statusCode, headers: KP_SECURITY_HEADERS }
      );
    }

    // Strip internal client_id before sending to unauthenticated public client
    const { client_id: _omittedClientId, ...publicKp } = res.kp;
    void _omittedClientId;

    return NextResponse.json(
      { success: true, kp: publicKp },
      { status: 200, headers: KP_SECURITY_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Ichki server xatoligi",
      },
      { status: 500, headers: KP_SECURITY_HEADERS }
    );
  }
}
