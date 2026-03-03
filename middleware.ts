import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api") && pathname !== "/api/health") {
    return NextResponse.json(
      {
        success: false,
        error: "Deprecated Next.js API endpoint. Use Python backend /v1/*.",
        code: "NEXT_API_DEPRECATED",
      },
      { status: 410 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
