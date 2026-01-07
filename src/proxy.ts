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
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/certificates") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/tenants") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "better-auth.session-token",
  "__Secure-better-auth.session_token",
  "__Secure-better-auth.session-token",
  "__Host-better-auth.session_token",
  "__Host-better-auth.session-token",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isIgnoredPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
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
