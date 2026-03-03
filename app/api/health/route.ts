import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      message: "Frontend host is running. Business APIs moved to Python backend /v1/*",
    },
  })
}
