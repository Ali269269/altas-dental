import type { NextResponse } from "next/server";

function getApiOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:5000";
  }
}

function apiConnectSrc(): string {
  return `'self' ${getApiOrigin()} https:`;
}

function apiImgSrc(): string {
  return `'self' data: blob: ${getApiOrigin()} https:`;
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      `img-src ${apiImgSrc()}`,
      "font-src 'self' data:",
      `connect-src ${apiConnectSrc()}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  return response;
}
