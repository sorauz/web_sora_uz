import { NextRequest, NextResponse } from "next/server";
import { executeRevalidationRequest } from "@/lib/sync/revalidate-actions";

function getExpectedSecret(): string {
  return process.env.REVALIDATION_SECRET || "sora_revalidate_secret_2026";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");

  if (secret !== getExpectedSecret()) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret token" },
      { status: 401 },
    );
  }

  const { status, body } = await executeRevalidationRequest({
    mode: searchParams.get("mode") || undefined,
    scope: searchParams.get("scope") || undefined,
    fast: searchParams.get("fast") || undefined,
    tag: searchParams.get("tag") || undefined,
    path: searchParams.get("path") || undefined,
    customUrls: searchParams.get("url") || undefined,
  });

  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  let body: {
    secret?: string;
    mode?: string;
    scope?: string;
    fast?: boolean | string;
    tag?: string;
    path?: string;
    urls?: string | string[];
    url?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    const searchParams = request.nextUrl.searchParams;
    body = {
      secret: searchParams.get("secret") || undefined,
      mode: searchParams.get("mode") || undefined,
      scope: searchParams.get("scope") || undefined,
      fast: searchParams.get("fast") || undefined,
      tag: searchParams.get("tag") || undefined,
      path: searchParams.get("path") || undefined,
      url: searchParams.get("url") || undefined,
    };
  }

  if (body.secret !== getExpectedSecret()) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret token" },
      { status: 401 },
    );
  }

  const result = await executeRevalidationRequest({
    mode: body.mode || undefined,
    scope: body.scope || undefined,
    fast: body.fast,
    tag: body.tag || undefined,
    path: body.path || undefined,
    customUrls: body.urls || body.url || undefined,
  });

  return NextResponse.json(result.body, { status: result.status });
}
