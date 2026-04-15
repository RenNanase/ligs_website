import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

/** Swap sort order with adjacent image (efficient for large galleries vs full PUT). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("gallery")
  if (!auth.authenticated) return auth.response

  try {
    const { id: eventId } = await params
    const body = await request.json()
    const imageId = typeof body.imageId === "string" ? body.imageId : ""
    const direction = body.direction === "up" ? "up" : body.direction === "down" ? "down" : null

    if (!imageId || !direction) {
      return NextResponse.json({ error: "imageId and direction (up|down) required" }, { status: 400 })
    }

    const rows = await prisma.galleryEventImage.findMany({
      where: { eventId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, sortOrder: true },
    })

    const idx = rows.findIndex((r) => r.id === imageId)
    if (idx < 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    const j = direction === "up" ? idx - 1 : idx + 1
    if (j < 0 || j >= rows.length) {
      return NextResponse.json({ error: "Cannot move further" }, { status: 400 })
    }

    const a = rows[idx]
    const b = rows[j]

    await prisma.$transaction([
      prisma.galleryEventImage.update({
        where: { id: a.id },
        data: { sortOrder: b.sortOrder },
      }),
      prisma.galleryEventImage.update({
        where: { id: b.id },
        data: { sortOrder: a.sortOrder },
      }),
    ])

    await updateLastUpdated()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("POST /api/gallery/events/[id]/images/swap error:", err)
    return NextResponse.json({ error: "Failed to swap order" }, { status: 500 })
  }
}
