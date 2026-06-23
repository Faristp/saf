import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/invoices"];
const publicRoutes = ["/", "/auth/login"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route needs protection
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  // Adjust cookie names to match backend (include ASPX auth cookie names)
  const authCookieNames = [
    "auth",
    "session",
    "token",
    "authorization",
    ".ASPXAUTH",
    "ASPXAUTH",
    "remember_token",
  ];

  const hasAuthCookie = authCookieNames.some((name) =>
    request.cookies.has(name)
  ) || (request.headers.get("cookie") || "").includes("ASPXAUTH");

  if (!hasAuthCookie) {
    // Redirect to login page
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
