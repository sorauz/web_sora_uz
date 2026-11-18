import { NextRequest, NextResponse } from "next/server";
import { isAuditRequestAuthorized } from "@/lib/utils/audit-auth";
import {
  executeRevalidationRequest,
  isValidRevalidatePath,
  isValidRevalidateTag,
} from "@/lib/sync/revalidate-actions";

const NO_INDEX_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "no-store",
} as const;

export const dynamic = "force-dynamic";

interface SyncRequestPayload {
  mode?: unknown;
  scope?: unknown;
  fast?: unknown;
  tag?: unknown;
  path?: unknown;
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const explicitKey =
    searchParams.get("key") || request.headers.get("x-audit-key");

  if (!(await isAuditRequestAuthorized(explicitKey))) {
    return NextResponse.json(
      { ok: false, revalidated: false, message: "Ruxsat yo‘q (401)" },
      { status: 401, headers: NO_INDEX_HEADERS },
    );
  }

  let body: SyncRequestPayload = {};
  try {
    body = (await request.json()) as SyncRequestPayload;
  } catch {
    return NextResponse.json(
      { ok: false, revalidated: false, message: "JSON so‘rov formati noto‘g‘ri" },
      { status: 400, headers: NO_INDEX_HEADERS },
    );
  }

  const mode = typeof body.mode === "string" ? body.mode.trim() : undefined;
  const scope = typeof body.scope === "string" ? body.scope.trim() : undefined;
  const fast = body.fast === true || body.fast === "true";
  const tag = typeof body.tag === "string" ? body.tag.trim() : undefined;
  const path = typeof body.path === "string" ? body.path.trim() : undefined;

  if (mode && mode !== "smart-diff" && mode !== "relations-diff") {
    return NextResponse.json(
      { ok: false, revalidated: false, message: "Noto‘g‘ri sinxronizatsiya rejimi (mode)" },
      { status: 400, headers: NO_INDEX_HEADERS },
    );
  }

  if (scope && scope !== "relations") {
    return NextResponse.json(
      { ok: false, revalidated: false, message: "Noto‘g‘ri scope qiymati" },
      { status: 400, headers: NO_INDEX_HEADERS },
    );
  }

  if (tag && !isValidRevalidateTag(tag)) {
    return NextResponse.json(
      { ok: false, revalidated: false, message: `Ruxsat etilmagan teg: ${tag}` },
      { status: 400, headers: NO_INDEX_HEADERS },
    );
  }

  if (path && !isValidRevalidatePath(path)) {
    return NextResponse.json(
      { ok: false, revalidated: false, message: `Noto‘g‘ri URL yo‘li: ${path}` },
      { status: 400, headers: NO_INDEX_HEADERS },
    );
  }

  if (!mode && !tag && !path) {
    return NextResponse.json(
      {
        ok: false,
        revalidated: false,
        message: "Kamida bitta 'mode', 'tag' yoki 'path' parametri kerak",
      },
      { status: 400, headers: NO_INDEX_HEADERS },
    );
  }

  const startedAt = Date.now();
  const result = await executeRevalidationRequest({
    mode,
    scope,
    fast,
    tag,
    path,
  });
  const durationMs = Date.now() - startedAt;

  return NextResponse.json(
    {
      ...result.body,
      durationMs,
    },
    { status: result.status, headers: NO_INDEX_HEADERS },
  );
}
