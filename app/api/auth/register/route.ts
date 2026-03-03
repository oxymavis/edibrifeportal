import { NextResponse } from "next/server"

/**
 * POST /api/auth/register
 * Body: { name: string, email: string, password: string, confirmPassword?: string }
 * Validates and creates user (mock: no persistence, returns user).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, confirmPassword } = body

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Full name must be at least 2 characters" },
        { status: 400 }
      )
    }

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

    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    if (!hasUpper || !hasNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least 1 uppercase letter and 1 number",
        },
        { status: 400 }
      )
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      )
    }

    // Mock: no duplicate check, no persistence
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: `user-${Date.now()}`,
          email: emailTrimmed,
          name: name.trim(),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    )
  }
}
