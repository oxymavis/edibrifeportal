import { NextResponse } from "next/server"
import { getTransactionById } from "@/lib/data"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/transactions/:id
 * Returns a single transaction with full details (raw, logs, errors).
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const trx = await getTransactionById(id)
    if (!trx) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: trx })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch transaction" },
      { status: 500 }
    )
  }
}
