import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"

/** Dropdown options for CMS (berita): id + title, non-archived events only. */
export async function GET() {
  const auth = await requirePermission("news")
  if (!auth.authenticated) return auth.response

  try {
    const events = await prisma.galleryEvent.findMany({
      where: { isArchived: false },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
      take: 500,
    })
    return NextResponse.json(events)
  } catch (err) {
    console.error("GET /api/gallery/events/select error:", err)
    return NextResponse.json({ error: "Failed to load gallery events" }, { status: 500 })
  }
}
