import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** HTTP basic auth for /admin, using ADMIN_USER and ADMIN_PASSWORD. Closed if they're unset. */
function adminGuard(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  const header = req.headers.get("authorization") ?? "";
  if (user && pass && header.startsWith("Basic ")) {
    const [u, ...rest] = atob(header.slice(6)).split(":");
    if (timingSafeEqual(u, user) && timingSafeEqual(rest.join(":"), pass)) {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex");
      return res;
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Ajoin admin", charset="UTF-8"' },
  });
}

export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) return adminGuard(req);
  return intl(req);
}

export const config = {
  // Skip API routes, Next internals and files with an extension.
  matcher: ["/admin/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
