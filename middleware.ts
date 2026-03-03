import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/signin" ||
    pathname === "/start" ||
    pathname === "/about" ||
    pathname === "/privacy" ||
    pathname.startsWith("/backing-tracks") ||
    pathname.startsWith("/finder") ||
    pathname.startsWith("/progressions")
  );
}

function isProtectedPath(pathname: string) {
  return (
    pathname === "/coach" ||
    pathname.startsWith("/coach/") ||
    pathname.startsWith("/lessons") ||
    pathname.startsWith("/ear-training")
  );
}

export const middleware = withAuth(
  function middleware(_req: NextRequest) {
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ✅ static files
        if (PUBLIC_FILE.test(pathname)) return true;

        // ✅ Next internals
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.startsWith("/robots") ||
          pathname.startsWith("/sitemap")
        ) {
          return true;
        }

        // ✅ NextAuth
        if (pathname.startsWith("/api/auth")) return true;

        // ✅ Stripe webhook (CRITICAL)
        if (pathname.startsWith("/api/stripe")) return true;

        // ✅ Public APIs
        if (pathname.startsWith("/api/youtube-search")) return true;

        // ✅ Public pages
        if (isPublicPath(pathname)) return true;

        // 🔒 Protected
        if (isProtectedPath(pathname)) {
          return !!token;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};