/**
 * Firebase ID token verification using the native Web Crypto API.
 * Works on Edge Runtime (middleware) and Node.js (API routes).
 * Zero external dependencies — uses crypto.subtle which is universally available.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const GOOGLE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

interface JwkKey {
  kid: string;
  n: string;
  e: string;
}

// Module-level JWKS cache — avoids hitting Google on every request
let jwksCache: { keys: JwkKey[] } | null = null;
let jwksCacheTime = 0;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchPublicKeys(): Promise<JwkKey[]> {
  const now = Date.now();
  if (jwksCache && now - jwksCacheTime < JWKS_CACHE_TTL_MS) {
    return jwksCache.keys;
  }
  const res = await fetch(GOOGLE_JWKS_URL);
  if (!res.ok) throw new Error("Failed to fetch Google public keys");
  const data = (await res.json()) as { keys: JwkKey[] };
  jwksCache = data;
  jwksCacheTime = now;
  return data.keys;
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  // Use new Uint8Array(length) to get Uint8Array<ArrayBuffer> which satisfies BufferSource
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface FirebaseTokenPayload {
  uid: string;
  email?: string;
  exp: number;
  iat: number;
}

/**
 * Cryptographically verifies a Firebase ID token (RS256 JWT) using
 * Google's public keys via crypto.subtle.
 * Validates signature, issuer, audience, and expiry.
 * Throws on any verification failure.
 */
export async function verifyFirebaseToken(
  token: string
): Promise<FirebaseTokenPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT");
  const [headerB64, payloadB64, signatureB64] = parts;

  const header = JSON.parse(
    new TextDecoder().decode(base64urlDecode(headerB64))
  ) as { kid?: string; alg?: string };

  if (header.alg !== "RS256") {
    throw new Error(`Unexpected JWT algorithm: ${header.alg}`);
  }

  const keys = await fetchPublicKeys();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error(`No public key found for kid: ${header.kid}`);

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlDecode(signatureB64);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature.buffer as ArrayBuffer,
    signedData.buffer as ArrayBuffer
  );
  if (!valid) throw new Error("Invalid JWT signature");

  const payload = JSON.parse(
    new TextDecoder().decode(base64urlDecode(payloadB64))
  ) as {
    sub?: string;
    email?: string;
    exp?: number;
    iat?: number;
    aud?: string;
    iss?: string;
  };

  const now = Math.floor(Date.now() / 1000);

  if (!payload.exp || payload.exp <= now) throw new Error("Token expired");
  if (!payload.iat || payload.iat > now + 60) throw new Error("Token issued in the future");
  if (payload.aud !== PROJECT_ID) throw new Error("Invalid audience");
  if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`)
    throw new Error("Invalid issuer");
  if (!payload.sub) throw new Error("Missing subject (uid) claim");

  return {
    uid: payload.sub,
    email: payload.email,
    exp: payload.exp,
    iat: payload.iat,
  };
}
