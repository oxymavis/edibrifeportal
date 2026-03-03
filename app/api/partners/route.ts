import { NextResponse } from "next/server"
import { getPartners, createPartner } from "@/lib/data"
import type { TradingPartner, PrimaryContact } from "@/lib/store"

/**
 * GET /api/partners?environment=production|sandbox
 * Returns list of trading partners (optionally filtered by environment).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const environment = searchParams.get("environment") as "production" | "sandbox" | null

    const partners = await getPartners(environment ?? undefined)
    return NextResponse.json({ success: true, data: partners })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch partners" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/partners
 * Body: TradingPartner (without id); id is generated.
 * Creates a new trading partner.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name = body.name?.trim()
    const code = body.code?.trim()?.toUpperCase()
    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, code" },
        { status: 400 }
      )
    }

    const primaryContact: PrimaryContact = {
      name: body.primaryContact?.name ?? body.contactName ?? "",
      email: body.primaryContact?.email ?? body.email ?? "",
      phone: body.primaryContact?.phone ?? body.contactPhone,
    }
    if (!primaryContact.email) {
      return NextResponse.json(
        { success: false, error: "Primary contact email is required" },
        { status: 400 }
      )
    }

    const partnerData: Omit<TradingPartner, "id"> = {
      name,
      code,
      status: body.status ?? "active",
      industry: body.industry ?? "retail",
      website: body.website?.trim() || undefined,
      primaryContact,
      subsidiaries: Array.isArray(body.subsidiaries) ? body.subsidiaries : [],
      environment: body.environment ?? "production",
    }

    const partner = await createPartner(partnerData)
    return NextResponse.json({ success: true, data: partner })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to create partner" },
      { status: 500 }
    )
  }
}
