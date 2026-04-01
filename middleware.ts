import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Block invalid POST requests that trigger "Failed to find Server Action" errors.
 * Bots/scanners often probe with POST to /, /_next, /api, etc. with fake action IDs.
 * Returning 404 early prevents Next.js from attempting Server Action resolution and logging errors.
 */
const INVALID_SERVER_ACTION_PATHS = ["/", "/_next", "/api", "/_next/server", "/app", "/api/route"]

export function middleware(request: NextRequest) {
  if (request.method === "POST") {
    const pathname = request.nextUrl.pathname
    if (INVALID_SERVER_ACTION_PATHS.includes(pathname)) {
      return new NextResponse(null, { status: 404 })
    }
  }
  return NextResponse.next()
}
