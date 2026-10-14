import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 Proxy Convention
export const proxy = createMiddleware(routing);
export default proxy;

export const config = {
  // Match only internationalized pathnames, exclude api, _next, _vercel, and static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/", "/(uz|ru)/:path*"],
};
