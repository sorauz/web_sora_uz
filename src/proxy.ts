import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Next.js 16 Proxy Convention (with GEO / LLMs Markdown Content-Negotiation)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get("accept") || "";
  const wantsMarkdown = acceptHeader.toLowerCase().includes("text/markdown");

  // 1. Direct .md URL requests for Product pages:
  // Supports /uz/products/[slug].md, /ru/products/[slug].md, /products/[slug].md
  const mdProductMatch = pathname.match(
    /^\/(?:(uz|ru)\/)?products\/([^/]+)\.md$/i
  );
  if (mdProductMatch) {
    const locale = mdProductMatch[1]?.toLowerCase() || "uz";
    const slug = mdProductMatch[2];
    const url = request.nextUrl.clone();
    url.pathname = `/api/md/${locale}/products/${slug}`;
    return NextResponse.rewrite(url);
  }

  // 2. Direct .md URL requests for Category pages:
  // Supports /uz/category/[slug].md, /ru/category/[slug].md, /category/[slug].md
  const mdCategoryMatch = pathname.match(
    /^\/(?:(uz|ru)\/)?category\/([^/]+)\.md$/i
  );
  if (mdCategoryMatch) {
    const locale = mdCategoryMatch[1]?.toLowerCase() || "uz";
    const slug = mdCategoryMatch[2];
    const url = request.nextUrl.clone();
    url.pathname = `/api/md/${locale}/category/${slug}`;
    return NextResponse.rewrite(url);
  }

  // 3. HTTP Content-Negotiation (Accept: text/markdown) for AI Agents
  if (wantsMarkdown) {
    const htmlProductMatch = pathname.match(
      /^\/(?:(uz|ru)\/)?products\/([^/.]+)\/?$/i
    );
    if (htmlProductMatch) {
      const locale = htmlProductMatch[1]?.toLowerCase() || "uz";
      const slug = htmlProductMatch[2];
      const url = request.nextUrl.clone();
      url.pathname = `/api/md/${locale}/products/${slug}`;
      return NextResponse.rewrite(url);
    }

    const htmlCategoryMatch = pathname.match(
      /^\/(?:(uz|ru)\/)?category\/([^/.]+)\/?$/i
    );
    if (htmlCategoryMatch) {
      const locale = htmlCategoryMatch[1]?.toLowerCase() || "uz";
      const slug = htmlCategoryMatch[2];
      const url = request.nextUrl.clone();
      url.pathname = `/api/md/${locale}/category/${slug}`;
      return NextResponse.rewrite(url);
    }

    if (pathname === "/" || pathname === "/uz" || pathname === "/ru") {
      const url = request.nextUrl.clone();
      url.pathname = "/llms.txt";
      return NextResponse.rewrite(url);
    }
  }

  return intlMiddleware(request);
}

export default proxy;

export const config = {
  // Match internationalized pathnames, localized paths, and .md endpoints
  matcher: [
    "/((?!api|_next|_vercel|.*\\.(?!md$).*).*)",
    "/",
    "/uz/:path*",
    "/ru/:path*",
    "/products/:path*",
    "/category/:path*",
  ],
};
