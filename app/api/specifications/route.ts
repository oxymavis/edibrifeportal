import { NextResponse } from "next/server"
import { getUNISSpecifications, getTPSpecifications, createTPSpecification } from "@/lib/data"
import type { TPSpecification } from "@/lib/store"

/**
 * GET /api/specifications?section=unis|tp&category=&partner=&search=
 * section=unis: UNIS standard specifications (optional category filter)
 * section=tp: Trading partner specifications (optional partner, search)
 * No section: returns both { unis, tp }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get("section") ?? "all"
    const category = searchParams.get("category") ?? "all"
    const partner = searchParams.get("partner") ?? "all"
    const search = searchParams.get("search") ?? ""

    if (section === "unis" || section === "all") {
      const unis = await getUNISSpecifications(section === "unis" ? category : undefined)
      if (section === "unis") {
        return NextResponse.json({ success: true, data: unis })
      }
      const tp = await getTPSpecifications(partner !== "all" ? partner : undefined, search || undefined)
      return NextResponse.json({ success: true, data: { unis, tp } })
    }

    if (section === "tp") {
      const tp = await getTPSpecifications(partner !== "all" ? partner : undefined, search || undefined)
      return NextResponse.json({ success: true, data: tp })
    }

    return NextResponse.json(
      { success: false, error: "Invalid section; use unis, tp, or omit" },
      { status: 400 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch specifications" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/specifications
 * Body: TPSpecification (without id) - for uploading a TP specification record.
 * Creates a new trading partner specification entry (mock: no file storage).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const messageType = body.messageType?.trim()
    const messageName = body.messageName?.trim()
    const partner = body.partner?.trim()
    const partnerCode = body.partnerCode?.trim()
    const version = body.version?.trim()
    const fileType = body.fileType ?? "PDF"
    const fileName = body.fileName?.trim() ?? "uploaded-file"
    const size = body.size ?? "0 KB"

    if (!messageType || !partner || !partnerCode || !version) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: messageType, partner, partnerCode, version" },
        { status: 400 }
      )
    }

    const specData: Omit<TPSpecification, "id"> = {
      messageType,
      messageName: messageName || messageType,
      partner,
      partnerCode,
      version,
      uploadedDate: new Date().toISOString().slice(0, 10),
      uploadedBy: body.uploadedBy ?? "user@example.com",
      fileType: ["PDF", "Excel", "X12", "JSON"].includes(fileType) ? fileType : "PDF",
      fileName,
      size,
    }
    const spec = await createTPSpecification(specData)
    return NextResponse.json({ success: true, data: spec })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create specification" },
      { status: 500 }
    )
  }
}
