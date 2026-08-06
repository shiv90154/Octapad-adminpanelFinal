import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// Next.js 16 renamed Middleware to Proxy (same feature, this file replaces
// the old middleware.ts). Defaults to the Node.js runtime, which is what we
// need since verifySessionToken() uses Node's crypto (HMAC).
export function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!verifySessionToken(token)) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
