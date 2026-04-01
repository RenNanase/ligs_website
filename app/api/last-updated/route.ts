import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const SINGLETON_ID = "singleton"

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SINGLETON_ID },
      select: { lastUpdated: true },
    })
    const lastUpdated = settings?.lastUpdated ?? null
    return NextResponse.json({
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
    })
  } catch (err) {
    console.error("GET /api/last-updated error:", err)
    return NextResponse.json({ lastUpdated: null })
  }
}
