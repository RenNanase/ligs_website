import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

/** Public GET: list publications ordered by date (newest first) */
export async function GET() {
  try {
    const items = await prisma.penerbitan.findMany({
      orderBy: [{ date: "desc" }, { sortOrder: "asc" }],
    })
    return NextResponse.json({
      items: items.map((p) => ({
        id: p.id,
        title: p.title,
        date: p.date.toISOString(),
        pdfUrl: p.pdfUrl,
        sortOrder: p.sortOrder,
      })),
    })
  } catch (err) {
    console.error("GET /api/penerbitan error:", err)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requirePermission("penerbitan")
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { title, date, pdfUrl } = body

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }
    if (!pdfUrl || typeof pdfUrl !== "string" || !pdfUrl.trim()) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 })
    }

    const item = await prisma.penerbitan.create({
      data: {
        title: title.trim(),
        date: new Date(date),
        pdfUrl: pdfUrl.trim(),
      },
    })

    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, `add new penerbitan (${title.trim()})`)
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error("POST /api/penerbitan error:", err)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
