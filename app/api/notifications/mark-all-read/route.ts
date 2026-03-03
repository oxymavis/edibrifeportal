import { NextResponse } from "next/server"
import { markAllNotificationsRead, getNotifications } from "@/lib/data"

/**
 * PUT /api/notifications/mark-all-read
 * Body: { environment?: "production" | "sandbox" }
 * Marks all (non-archived) notifications as read, optionally for one environment.
 */
export async function PUT(request: Request) {
  try {
    let environment: "production" | "sandbox" | undefined
    try {
      const body = await request.json().catch(() => ({}))
      environment = body.environment
    } catch {
      // no body
    }
    await markAllNotificationsRead(environment)
    const list = await getNotifications({
      environment: environment ?? undefined,
      showArchived: false,
    })
    return NextResponse.json({
      success: true,
      data: { updated: list.length },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to mark notifications as read" },
      { status: 500 }
    )
  }
}
