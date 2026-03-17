import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase-auth-verify";
import { SESSION_COOKIE } from "@/lib/constants";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Build a Set-Cookie header value manually to bypass any Next.js abstraction
 * issues with response.cookies.set().
 */
function buildSetCookie(name: string, value: string, maxAge: number): string {
  const parts = [
    `${name}=${value}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

/**
 * POST /api/auth/session
 * Accepts a Firebase ID token, verifies it cryptographically,
 * then sets an HttpOnly session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify signature, issuer, audience, and expiry
    await verifyFirebaseToken(idToken);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": buildSetCookie(SESSION_COOKIE, idToken, COOKIE_MAX_AGE),
      },
    });
  } catch (err) {
    console.error("[session] Token verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * DELETE /api/auth/session
 * Clears the HttpOnly session cookie.
 */
export async function DELETE() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": buildSetCookie(SESSION_COOKIE, "", 0),
    },
  });
}
