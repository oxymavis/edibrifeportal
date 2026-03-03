import { NextResponse } from "next/server"
import { getNotificationById, updateNotification } from "@/lib/data"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/notifications/:id
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const numId = parseInt(id, 10)
    if (Number.isNaN(numId)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification id" },
        { status: 400 }
      )
    }
    const notif = await getNotificationById(numId)
    if (!notif) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: notif })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch notification" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/notifications/:id
 * Body: { read?: boolean, archived?: boolean }
 * Updates a notification (e.g. mark read, archive).
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const numId = parseInt(id, 10)
    if (Number.isNaN(numId)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification id" },
        { status: 400 }
      )
    }
    const body = await request.json()
    const notif = await updateNotification(numId, {
      read: body.read,
      archived: body.archived,
    })
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
