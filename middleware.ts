import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/", "/login"]);

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|css|js)$/i.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isAssetPath(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.has(pathname) || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("better-auth.session_token");
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    const redirectPath = `${pathname}${search}`;
    if (redirectPath && redirectPath !== "/") {
      loginUrl.searchParams.set("redirect", redirectPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
