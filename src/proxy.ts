import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set<string>(["/", "/login"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // allow nested login routes (e.g., /login/sucesso) if needed
  return Array.from(PUBLIC_PATHS).some((path) => pathname.startsWith(`${path}/`));
}

function isIgnoredPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isIgnoredPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const hasSessionCookie =
    request.cookies.has("better-auth.session_token") || request.cookies.has("better-auth.session-token");
  if (hasSessionCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const redirectTarget = `${pathname}${search}`;
  loginUrl.searchParams.set("redirect", redirectTarget || "/certificados");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|manifest.json|robots.txt|sitemap.xml).*)",
  ],
};
