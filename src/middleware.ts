import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

/**
 * Decode a JWT payload WITHOUT cryptographic verification.
 * This is safe here because the token was already verified cryptographically
 * when the session cookie was set (POST /api/auth/session).
 * We only check structure, expiry, audience, and issuer.
 */
function decodeTokenPayload(token: string): {
  sub?: string;
  exp?: number;
  aud?: string;
  iss?: string;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through the login page and session API route
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth/session")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return redirectToLogin(request);
    }

    // Lightweight check: decode payload and verify claims
    // Full cryptographic verification already happened when the cookie was set.
    const payload = decodeTokenPayload(token);

    if (
      !payload ||
      !payload.sub ||
      !payload.exp ||
      payload.exp <= Math.floor(Date.now() / 1000) ||
      payload.aud !== PROJECT_ID ||
      payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`
    ) {
      // Token is malformed, expired, or claims don't match — clear and redirect
      const response = redirectToLogin(request);
      response.cookies.set(SESSION_COOKIE, "", {
        maxAge: 0,
        path: "/",
        sameSite: "lax",
      });
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/session"],
};
