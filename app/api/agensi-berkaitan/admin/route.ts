import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const items = await prisma.agensiBerkaitan.findMany({
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(items)
  } catch (err) {
    console.error("GET /api/agensi-berkaitan/admin error:", err)
    const msg = err instanceof Error ? err.message : "Unknown error"
    if (msg.includes("doesn't exist") || msg.includes("Unknown table")) {
      return NextResponse.json(
        { error: "AgensiBerkaitan table not found. Run: npx prisma migrate deploy" },
        { status: 503 }
      )
    }
    throw err
  }
}
