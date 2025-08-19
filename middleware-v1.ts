import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isUserAdmin, isUserSubscribed } from "./auth-guard";
import { auth } from "./auth";

export default async function middleware(request: NextRequest) {
  // อ่านจาก env ที่ถูกฝังตอน build (ไม่ต้องส่ง secret)
  /*   const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  }); */

  const session = await auth();

  const pathname = request.nextUrl.pathname;

  // ใช้ path แบบไม่ต้องลงท้ายด้วย / เพื่อครอบคลุมทั้ง /app และ /app/xxx
  const isProtectedPath = pathname.startsWith("/app");
  const isProtectedAdminPath = pathname.startsWith("/admin");

  const user = (session?.user ?? null) as any;
  const IsSubscribed = isUserSubscribed(user);
  const IsAdmin = isUserAdmin(user);

  // ไม่มี token/สิทธิ์ → เด้งกลับหน้าแรก
  if (isProtectedPath && !(IsSubscribed || IsAdmin)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isProtectedAdminPath && !IsAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// แคบ matcher ให้เหลือเฉพาะที่ต้องเช็คจริงๆ (ช่วยดีบักคุกกี้/โฮสต์)
export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
