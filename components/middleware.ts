import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get("sb-access-token"); 
  const { pathname } = request.nextUrl;

  // login page allow
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // not logged in => always login first
  if (!loggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/students/:path*",
  ],
};