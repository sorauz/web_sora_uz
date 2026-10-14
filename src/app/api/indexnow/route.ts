import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow, DEFAULT_INDEXNOW_KEY, DEFAULT_INDEXNOW_HOST } from "@/lib/seo/indexnow";

const EXPECTED_SECRET = process.env.REVALIDATION_SECRET || "sora_revalidate_secret_2026";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");

  if (secret !== EXPECTED_SECRET) {
    return NextResponse.json(
      { success: false, message: "Invalid secret token" },
      { status: 401 }
    );
  }

  if (!url) {
    return NextResponse.json({
      status: "IndexNow endpoint active",
      host: DEFAULT_INDEXNOW_HOST,
      keyConfigured: Boolean(process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY),
      usage: "Provide 'url' query parameter or POST JSON { secret, urls: [...] }",
    });
  }

  const result = await submitToIndexNow(url);
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}

export async function POST(request: NextRequest) {
  let body: { secret?: string; urls?: string | string[]; url?: string } = {};

  try {
    body = await request.json();
  } catch {
    const searchParams = request.nextUrl.searchParams;
    body = {
      secret: searchParams.get("secret") || undefined,
      url: searchParams.get("url") || undefined,
    };
  }

  if (body.secret !== EXPECTED_SECRET) {
    return NextResponse.json(
      { success: false, message: "Invalid secret token" },
      { status: 401 }
    );
  }

  const rawUrls = body.urls || body.url;
  if (!rawUrls || (Array.isArray(rawUrls) && rawUrls.length === 0)) {
    return NextResponse.json(
      { success: false, message: "Missing 'urls' array or 'url' string in request body" },
      { status: 400 }
    );
  }

  const result = await submitToIndexNow(rawUrls);
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
