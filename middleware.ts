import { NextResponse } from "next/server";
import { auth } from "./auth";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const session = await auth();
  // If the user is not authenticated, redirect to the login page
  const protectedPaths = ["/app"];
  // Check if the request path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );
  // If the path is protected and the user is not authenticated, redirect to login
  const isAuthenticated = session?.user;

  if (isProtectedPath && !isAuthenticated) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // If the user is authenticated, allow the request to proceed
  return NextResponse.next();
}

// Export the config to specify which paths this middleware applies to
export const config = {
  matcher: ["/((?!_next|favicon.ico|api|static).*)"],
};
