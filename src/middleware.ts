import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames, exclude api, _next, _vercel, and static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/", "/(uz|ru)/:path*"],
};
