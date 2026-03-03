import { NextResponse } from "next/server"
import { updateNotification } from "@/lib/data"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * PUT /api/notifications/:id/read
 * Marks a single notification as read.
 */
export async function PUT(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const numId = parseInt(id, 10)
    if (Number.isNaN(numId)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification id" },
        { status: 400 }
      )
    }
    const notif = await updateNotification(numId, { read: true })
    if (!notif) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: notif })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    )
  }
}
