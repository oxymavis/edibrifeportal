import { NextResponse } from "next/server"

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Validates credentials (mock: email format + password min 8 chars) and returns user.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    const emailTrimmed = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailTrimmed)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Mock: accept any valid email + password (no real DB lookup)
    const name = emailTrimmed.split("@")[0].replace(/[._]/g, " ")
    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: `user-${Date.now()}`,
          email: emailTrimmed,
          name: nameCapitalized,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    )
  }
}
