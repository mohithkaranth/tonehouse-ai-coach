import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

// ✅ match any public static file: .jpg, .png, .svg, .css, .js, etc.
const PUBLIC_FILE = /\.(.*)$/;

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/signin" || // custom sign-in page
    pathname === "/start" ||  // ✅ make Start Music from Zero public
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
    // no-op; auth handled via callbacks.authorized
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ✅ Allow ALL public files (images, fonts, etc.)
        if (PUBLIC_FILE.test(pathname)) return true;

        // ✅ Allow Next.js internals
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.startsWith("/robots") ||
          pathname.startsWith("/sitemap")
        ) {
          return true;
        }

        // ✅ Allow NextAuth routes
        if (pathname.startsWith("/api/auth")) return true;

        // ✅ Allow public APIs
        if (pathname.startsWith("/api/youtube-search")) return true;

        // ✅ Public pages
        if (isPublicPath(pathname)) return true;

        // 🔒 Protected pages
        if (isProtectedPath(pathname)) {
          return !!token;
        }

        // 🔒 Default: require login
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
