import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const { pathname } = req.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ["/login", "/register", "/"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /**
   * 🔐 Role-based protection
   */

  // Company routes protection
  if (pathname.startsWith("/company")) {
    if (role !== "company") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  // User routes protection
  if (pathname.startsWith("/home") || pathname.startsWith("/user")) {
    if (role !== "user") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

/**
 * 🎯 Tell Next.js which routes middleware applies to
 */
export const config = {
  matcher: [
    "/home/:path*",
    "/dashboard/:path*",
    "/company/:path*",
    "/user/:path*",
  ],
};
