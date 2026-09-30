import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const tag = searchParams.get("tag");
  const path = searchParams.get("path");

  const expectedSecret =
    process.env.REVALIDATION_SECRET || "sora_revalidate_secret_2026";

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret token" },
      { status: 401 }
    );
  }

  if (!tag && !path) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Missing 'tag' or 'path' query parameter to revalidate",
      },
      { status: 400 }
    );
  }

  try {
    if (tag) {
      revalidateTag(tag, { expire: 0 });
    }
    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      tag: tag || null,
      path: path || null,
      now: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { revalidated: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: { secret?: string; tag?: string; path?: string } = {};

  try {
    body = await request.json();
  } catch {
    // If not JSON body, read query params
    const searchParams = request.nextUrl.searchParams;
    body = {
      secret: searchParams.get("secret") || undefined,
      tag: searchParams.get("tag") || undefined,
      path: searchParams.get("path") || undefined,
    };
  }

  const expectedSecret =
    process.env.REVALIDATION_SECRET || "sora_revalidate_secret_2026";

  if (body.secret !== expectedSecret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret token" },
      { status: 401 }
    );
  }

  if (!body.tag && !body.path) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Missing 'tag' or 'path' parameter to revalidate",
      },
      { status: 400 }
    );
  }

  try {
    if (body.tag) {
      revalidateTag(body.tag, { expire: 0 });
    }
    if (body.path) {
      revalidatePath(body.path);
    }

    return NextResponse.json({
      revalidated: true,
      tag: body.tag || null,
      path: body.path || null,
      now: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { revalidated: false, error: message },
      { status: 500 }
    );
  }
}
