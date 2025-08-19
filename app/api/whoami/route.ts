// app/api/whoami/route.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any }); // อย่าส่ง secret ตรงๆ
  return NextResponse.json({
    hasCookie: !!req.headers.get("cookie"),
    hasToken: !!token,
    secretLen: (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "")
      .length,
    authUrl: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? null,
    trust: process.env.AUTH_TRUST_HOST ?? null,
  });
}
