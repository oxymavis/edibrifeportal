import { NextResponse } from "next/server"
import { getPartnerById, updatePartner, deletePartner } from "@/lib/data"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/partners/:id
 * Returns a single trading partner by id.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const partner = await getPartnerById(id)
    if (!partner) {
      return NextResponse.json(
        { success: false, error: "Partner not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: partner })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch partner" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/partners/:id
 * Body: partial TradingPartner
 * Updates a trading partner.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const partner = await updatePartner(id, body)
    if (!partner) {
      return NextResponse.json(
        { success: false, error: "Partner not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: partner })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update partner" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/partners/:id
 * Removes a trading partner.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const deleted = await deletePartner(id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Partner not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete partner" },
      { status: 500 }
    )
  }
}
