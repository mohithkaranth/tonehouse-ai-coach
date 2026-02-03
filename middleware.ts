import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/signin" || // ✅ custom sign-in page
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
    // no-op; auth logic handled in callbacks.authorized
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ✅ Always allow Next.js internals & assets
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.startsWith("/robots") ||
          pathname.startsWith("/sitemap")
        ) {
          return true;
        }

        // ✅ Always allow NextAuth routes
        if (pathname.startsWith("/api/auth")) return true;

        // ✅ Public APIs
        if (pathname.startsWith("/api/youtube-search")) return true;

        // ✅ Public pages
        if (isPublicPath(pathname)) return true;

        // 🔒 Protected pages
        if (isProtectedPath(pathname)) {
          return !!token;
        }

        // 🔒 Default: require login for anything new
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
