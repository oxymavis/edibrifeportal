import { NextResponse } from "next/server"
import { getCertificates, createCertificate } from "@/lib/data"
import type { Certificate } from "@/lib/store"

/**
 * GET /api/certificates?environment=&status=&partner=&search=&expiry=
 * Returns certificates with optional filters.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const environment = searchParams.get("environment") as "production" | "sandbox" | null
    const status = searchParams.get("status") ?? "all"
    const partner = searchParams.get("partner") ?? "all"
    const search = searchParams.get("search") ?? ""
    const expiry = searchParams.get("expiry") as "30" | "60" | "90" | null

    const certs = await getCertificates({
      environment: environment ?? undefined,
      status: status || undefined,
      partner: partner || undefined,
      search: search || undefined,
      expiry: expiry ?? undefined,
    })
    return NextResponse.json({ success: true, data: certs })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/certificates
 * Body: FormData with file, name, partner, usage, type, environment
 * Or JSON: { name, partner, usage, type, environment, serialNumber?, fingerprint?, expires?, ... }
 * Creates a new certificate (mock: no real file parsing).
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      const name = (formData.get("name") as string)?.trim()
      const partner = (formData.get("partner") as string)?.trim()
      const usage = (formData.get("usage") as string)?.trim()
      const type = (formData.get("type") as string)?.trim() || "X.509"
      const environment = (formData.get("environment") as string) === "sandbox" ? "sandbox" : "production"

      if (!name || !partner || !usage) {
        return NextResponse.json(
          { success: false, error: "Missing required fields: name, partner, usage" },
          { status: 400 }
        )
      }

      const serialNumber = file
        ? `UP:${Date.now().toString(16).toUpperCase().padStart(12, "0")}`
        : `SN:${Date.now()}`
      const fingerprint = `FP:${Array.from({ length: 15 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()
      ).join(":")}`
      const now = new Date().toISOString().slice(0, 10)
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1)
      const expiresStr = expires.toISOString().slice(0, 10)

      const certData: Omit<Certificate, "id"> = {
        name,
        partner,
        usage,
        type,
        environment,
        serialNumber,
        fingerprint,
        issuer: "Uploaded",
        subject: `CN=${name}`,
        algorithm: "SHA256RSA",
        keySize: "2048",
        created: now,
        expires: expiresStr,
        status: "active",
      }
      const cert = await createCertificate(certData)
      return NextResponse.json({ success: true, data: cert })
    }

    const body = await request.json()
    const name = body.name?.trim()
    const partner = body.partner?.trim()
    const usage = body.usage?.trim()
    if (!name || !partner || !usage) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, partner, usage" },
        { status: 400 }
      )
    }

    const certData: Omit<Certificate, "id"> = {
      name,
      partner,
      usage,
      type: body.type ?? "X.509",
      environment: body.environment === "sandbox" ? "sandbox" : "production",
      serialNumber: body.serialNumber ?? `SN:${Date.now()}`,
      fingerprint: body.fingerprint ?? `FP:${Date.now()}`,
      issuer: body.issuer ?? "Internal",
      subject: body.subject ?? `CN=${name}`,
      algorithm: body.algorithm ?? "SHA256RSA",
      keySize: body.keySize ?? "2048",
      created: body.created ?? new Date().toISOString().slice(0, 10),
      expires: body.expires ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: body.status ?? "active",
    }
    const cert = await createCertificate(certData)
    return NextResponse.json({ success: true, data: cert })
  } catch {
    return NextResponse.json(
      { success: false, error: "Certificate upload failed" },
      { status: 500 }
    )
  }
}
