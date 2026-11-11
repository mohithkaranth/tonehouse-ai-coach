import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const publicPages = new Set(["/", "/signin", "/start", "/about", "/privacy"]);
const publicSections = ["/backing-tracks", "/finder", "/progressions"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (
    publicPages.has(pathname) ||
    publicSections.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  if (token) return NextResponse.next();

  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("callbackUrl", pathname + search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/((?!api/|api$|_next/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
