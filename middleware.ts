import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isUserAdmin, isUserSubscribed } from "./auth-guard";

export default async function middleware(request: NextRequest) {
  // Check if the request has a valid token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // Define protected paths
  const protectedPaths = ["/app/"];
  const protectedAdminPaths = ["/admin/"];

  // Check if the request path is one of the protected paths
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const isProtectedAdminPath = protectedAdminPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const IsSubscribed = isUserSubscribed(token?.user as any);
  const IsAdmin = isUserAdmin(token?.user as any);

  // If the path is protected and no token is found, redirect to login
  if (isProtectedPath && !IsSubscribed && !IsAdmin) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  if (isProtectedAdminPath && !IsAdmin) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // If the path is protected and a token is found, allow the request to proceed
  return NextResponse.next();
}

// Export the config to specify which paths this middleware applies to
export const config = {
  matcher: ["/((?!_next|favicon.ico|api|static).*)"],
};
