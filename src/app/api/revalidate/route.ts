import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/seo/indexnow";
import { runSmartDiffRevalidation } from "@/lib/sync/smart-diff";

function performRevalidation(tag?: string, path?: string) {
  if (tag) {
    if (tag === "all") {
      const allTags = [
        "products",
        "prices",
        "categories",
        "brands",
        "offers",
        "reviews",
        "units",
      ];
      for (const t of allTags) {
        revalidateTag(t, { expire: 0 });
      }
      revalidatePath("/", "layout");
    } else {
      revalidateTag(tag, { expire: 0 });

      // If products, prices, or individual product is revalidated,
      // flush the product page and discovery routes as well
      if (
        tag === "products" ||
        tag === "prices" ||
        tag.startsWith("product-")
      ) {
        revalidatePath("/[locale]/products/[slug]", "page");
        revalidatePath("/[locale]/catalog", "page");
        revalidatePath("/[locale]/category/[slug]", "page");
        revalidatePath("/[locale]", "layout");
      }
      if (tag === "categories") {
        revalidatePath("/[locale]/catalog", "page");
        revalidatePath("/[locale]/category/[slug]", "page");
        revalidatePath("/[locale]", "layout");
      }
      if (tag === "reviews" || tag.startsWith("reviews-")) {
        revalidatePath("/[locale]/products/[slug]", "page");
      }
    }
  }

  if (path) {
    revalidatePath(path);
  }
}

/**
 * Resolves URLs to ping via IndexNow when tags or paths are revalidated
 */
function resolveIndexNowUrls(
  tag?: string,
  path?: string,
  customUrls?: string | string[]
): string[] {
  const urls: string[] = [];

  if (path) {
    if (path.startsWith("/uz/") || path.startsWith("/ru/")) {
      urls.push(`https://sora.uz${path}`);
    } else {
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      urls.push(`https://sora.uz/uz${cleanPath}`);
      urls.push(`https://sora.uz/ru${cleanPath}`);
    }
  }

  if (tag === "products" || tag === "prices" || tag === "all") {
    urls.push(
      "https://sora.uz/uz",
      "https://sora.uz/ru",
      "https://sora.uz/uz/catalog",
      "https://sora.uz/ru/catalog"
    );
  } else if (tag === "categories") {
    urls.push("https://sora.uz/uz/catalog", "https://sora.uz/ru/catalog");
  }

  if (customUrls) {
    const list = Array.isArray(customUrls) ? customUrls : [customUrls];
    urls.push(...list);
  }

  return urls;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const tag = searchParams.get("tag");
  const path = searchParams.get("path");
  const customUrl = searchParams.get("url");

  const expectedSecret =
    process.env.REVALIDATION_SECRET || "sora_revalidate_secret_2026";

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret token" },
      { status: 401 }
    );
  }

  const mode = searchParams.get("mode");
  const isSmartDiff = mode === "smart-diff" || tag === "smart-diff";

  if (isSmartDiff) {
    const result = await runSmartDiffRevalidation();
    return NextResponse.json(result, {
      status: result.error && !result.summary ? 500 : 200,
    });
  }

  if (!tag && !path && !customUrl) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Missing 'tag', 'path', 'mode', or 'url' query parameter to revalidate",
      },
      { status: 400 }
    );
  }

  try {
    performRevalidation(tag || undefined, path || undefined);

    // Asynchronously dispatch changed URLs to IndexNow (Bing, Yandex, Naver)
    const indexNowUrls = resolveIndexNowUrls(
      tag || undefined,
      path || undefined,
      customUrl || undefined
    );

    if (indexNowUrls.length > 0) {
      submitToIndexNow(indexNowUrls).catch((err) =>
        console.warn("[IndexNow Webhook Dispatch Error]", err)
      );
    }

    return NextResponse.json({
      revalidated: true,
      tag: tag || null,
      path: path || null,
      indexnow: {
        dispatched: indexNowUrls.length > 0,
        urlCount: indexNowUrls.length,
      },
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
  let body: {
    secret?: string;
    mode?: string;
    tag?: string;
    path?: string;
    urls?: string | string[];
    url?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    // If not JSON body, read query params
    const searchParams = request.nextUrl.searchParams;
    body = {
      secret: searchParams.get("secret") || undefined,
      mode: searchParams.get("mode") || undefined,
      tag: searchParams.get("tag") || undefined,
      path: searchParams.get("path") || undefined,
      url: searchParams.get("url") || undefined,
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

  const isSmartDiff = body.mode === "smart-diff" || body.tag === "smart-diff";

  if (isSmartDiff) {
    const result = await runSmartDiffRevalidation();
    return NextResponse.json(result, {
      status: result.error && !result.summary ? 500 : 200,
    });
  }

  const customUrls = body.urls || body.url;

  if (!body.tag && !body.path && !customUrls) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Missing 'tag', 'path', 'mode', or 'urls' parameter to revalidate",
      },
      { status: 400 }
    );
  }

  try {
    performRevalidation(body.tag || undefined, body.path || undefined);

    // Asynchronously dispatch changed URLs to IndexNow
    const indexNowUrls = resolveIndexNowUrls(
      body.tag || undefined,
      body.path || undefined,
      customUrls || undefined
    );

    if (indexNowUrls.length > 0) {
      submitToIndexNow(indexNowUrls).catch((err) =>
        console.warn("[IndexNow Webhook Dispatch Error]", err)
      );
    }

    return NextResponse.json({
      revalidated: true,
      tag: body.tag || null,
      path: body.path || null,
      indexnow: {
        dispatched: indexNowUrls.length > 0,
        urlCount: indexNowUrls.length,
      },
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
