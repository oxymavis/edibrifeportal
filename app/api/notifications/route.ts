import { NextResponse } from "next/server"
import { getNotifications } from "@/lib/data"

/**
 * GET /api/notifications?environment=&type=&showArchived=
 * Returns notifications with optional filters.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const environment = searchParams.get("environment") as "production" | "sandbox" | null
    const type = searchParams.get("type") ?? "all"
    const showArchived = searchParams.get("showArchived") === "true"

    const list = await getNotifications({
      environment: environment ?? undefined,
      type: type || undefined,
      showArchived,
    })
    return NextResponse.json({ success: true, data: list })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}
