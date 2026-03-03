import { NextResponse } from "next/server"
import { getTransactions, createTransaction } from "@/lib/data"
import type { Transaction } from "@/lib/store"
import { EDI_DOCUMENT_TYPES } from "@/lib/constants"

/**
 * GET /api/transactions?environment=&type=&status=&direction=&partner=&dateFrom=&dateTo=&search=
 * Returns transactions with optional filters.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const environment = searchParams.get("environment") as "production" | "sandbox" | null
    const type = searchParams.get("type") ?? "all"
    const status = searchParams.get("status") ?? "all"
    const direction = searchParams.get("direction") ?? "all"
    const partner = searchParams.get("partner") ?? "all"
    const dateFrom = searchParams.get("dateFrom") ?? ""
    const dateTo = searchParams.get("dateTo") ?? ""
    const search = searchParams.get("search") ?? ""

    const list = await getTransactions({
      environment: environment ?? undefined,
      type: type || undefined,
      status: status || undefined,
      direction: direction || undefined,
      partner: partner || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: search || undefined,
    })
    return NextResponse.json({ success: true, data: list })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Body: FormData with file, type (document type code)
 * Or JSON: { type, partner, direction, raw?, ... }
 * Creates a new transaction (e.g. EDI document submission).
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      const docType = (formData.get("type") as string)?.trim()
      const environment = (formData.get("environment") as string) === "sandbox" ? "sandbox" : "production"

      if (!docType) {
        return NextResponse.json(
          { success: false, error: "Missing required field: type (document type code)" },
          { status: 400 }
        )
      }

      const typeName =
        (EDI_DOCUMENT_TYPES as Record<string, string>)[docType] ?? `Document ${docType}`
      let raw = ""
      if (file && file instanceof File) {
        raw = await file.text()
        if (raw.length > 10000) raw = raw.slice(0, 10000) + "\n... (truncated)"
      } else {
        raw = `ISA*00*          *00*          *01*1234567890123  *01*9876543210987  *${new Date().toISOString().slice(0, 10).replace(/-/g, "")}*1200*U*00401*000000001*0*P*>~\n...`
      }

      const now = new Date()
      const date = now.toISOString().slice(0, 10)
      const time = now.toTimeString().slice(0, 8)
      const size = file && file instanceof File ? `${(file.size / 1024).toFixed(1)} KB` : "1.0 KB"

      const trxData: Omit<Transaction, "id"> = {
        type: docType,
        typeName,
        partner: (formData.get("partner") as string) ?? "Unknown",
        direction: "outbound",
        status: "processing",
        date,
        time,
        size,
        records: 0,
        controlNumber: `0000${Date.now().toString().slice(-5)}`,
        senderId: "1234567890123",
        receiverId: "9876543210987",
        raw,
        logs: [
          {
            timestamp: now.toISOString(),
            level: "info",
            message: "Document received and queued for processing",
          },
        ],
        errors: [],
        environment,
      }
      const trx = await createTransaction(trxData)
      return NextResponse.json({
        success: true,
        data: trx,
        message: "Document received and queued for processing",
      })
    }

    const body = await request.json()
    const docType = body.type?.trim()
    if (!docType) {
      return NextResponse.json(
        { success: false, error: "Missing required field: type" },
        { status: 400 }
      )
    }

    const typeName =
      (EDI_DOCUMENT_TYPES as Record<string, string>)[docType] ?? `Document ${docType}`
    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const time = now.toTimeString().slice(0, 8)

    const trxData: Omit<Transaction, "id"> = {
      type: docType,
      typeName,
      partner: body.partner ?? "Unknown",
      direction: body.direction ?? "outbound",
      status: body.status ?? "processing",
      date,
      time,
      size: body.size ?? "0 KB",
      records: body.records ?? 0,
      controlNumber: body.controlNumber ?? `0000${Date.now().toString().slice(-5)}`,
      senderId: body.senderId ?? "",
      receiverId: body.receiverId ?? "",
      raw: body.raw ?? "",
      logs: body.logs ?? [
        { timestamp: now.toISOString(), level: "info", message: "Transaction created" },
      ],
      errors: body.errors ?? [],
      environment: body.environment === "sandbox" ? "sandbox" : "production",
    }
    const trx = await createTransaction(trxData)
    return NextResponse.json({ success: true, data: trx })
  } catch {
    return NextResponse.json(
      { success: false, error: "Document submission failed" },
      { status: 500 }
    )
  }
}
