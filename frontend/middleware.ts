/**
 * Middleware for role-based access control.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  const { pathname } = req.nextUrl;

  if (
    !token &&
    (pathname.startsWith("/admin") || pathname.startsWith("/student"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && (pathname.startsWith("/admin") || pathname.startsWith("/student"))) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      const role = payload.role;

      if (role === "admin" && pathname.startsWith("/student")) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      if (role === "student" && pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/student/dashboard", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"]
};
