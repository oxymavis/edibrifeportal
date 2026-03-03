import { NextResponse } from "next/server"
import { getCertificateById, updateCertificate, deleteCertificate } from "@/lib/data"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/certificates/:id
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const numId = parseInt(id, 10)
    if (Number.isNaN(numId)) {
      return NextResponse.json(
        { success: false, error: "Invalid certificate id" },
        { status: 400 }
      )
    }
    const cert = await getCertificateById(numId)
    if (!cert) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: cert })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/certificates/:id
 * Body: partial Certificate (e.g. status: "inactive")
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const numId = parseInt(id, 10)
    if (Number.isNaN(numId)) {
      return NextResponse.json(
        { success: false, error: "Invalid certificate id" },
        { status: 400 }
      )
    }
    const body = await request.json()
    const cert = await updateCertificate(numId, body)
    if (!cert) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: cert })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update certificate" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/certificates/:id
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const numId = parseInt(id, 10)
    if (Number.isNaN(numId)) {
      return NextResponse.json(
        { success: false, error: "Invalid certificate id" },
        { status: 400 }
      )
    }
    const deleted = await deleteCertificate(numId)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete certificate" },
      { status: 500 }
    )
  }
}
