import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

const URL_REGEX = /^https?:\/\/[^\s]+$/i

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return URL_REGEX.test(url)
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const items = await prisma.agensiBerkaitan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(items)
  } catch (err) {
    console.error("GET /api/agensi-berkaitan error:", err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { name, logoPath, url, isActive, sortOrder } = body

  if (!logoPath || typeof logoPath !== "string" || logoPath.trim().length === 0) {
    return NextResponse.json({ error: "Logo is required" }, { status: 400 })
  }

  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  if (!isValidUrl(url.trim())) {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
  }

  try {
    const item = await prisma.agensiBerkaitan.create({
      data: {
        name: (typeof name === "string" ? name : "").trim().slice(0, 150),
        logoPath: logoPath.trim().slice(0, 255),
        url: url.trim().slice(0, 255),
        isActive: isActive !== false,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
    })
    await updateLastUpdated()
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error("POST /api/agensi-berkaitan error:", err)
    const msg = err instanceof Error ? err.message : "Unknown error"
    if (msg.includes("doesn't exist") || msg.includes("Unknown table")) {
      return NextResponse.json(
        { error: "AgensiBerkaitan table not found. Run: npx prisma migrate deploy" },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
