import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js middleware entry point that currently passes every request through unchanged.
 *
 * This middleware is invoked for requests matching the file's `config.matcher`. It performs no checks or mutations and returns a response that allows normal routing to continue.
 *
 * @param request - The incoming NextRequest for the current request.
 * @returns A NextResponse that continues the request lifecycle (equivalent to `NextResponse.next()`).
 */
export function middleware(request: NextRequest) {
  // Add any middleware logic here in the future
  // For now, just pass through all requests
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};
