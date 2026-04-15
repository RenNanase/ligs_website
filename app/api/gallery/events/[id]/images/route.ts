import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

const CHUNK = 250

/** Paginated images for an event (public). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(120, Math.max(1, parseInt(searchParams.get("limit") || "48", 10)))
    const skip = (page - 1) * limit

    const eventExists = await prisma.galleryEvent.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!eventExists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const [total, images] = await Promise.all([
      prisma.galleryEventImage.count({ where: { eventId: id } }),
      prisma.galleryEventImage.findMany({
        where: { eventId: id },
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
        select: { id: true, url: true, sortOrder: true },
      }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      images,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    })
  } catch (err) {
    console.error("GET /api/gallery/events/[id]/images error:", err)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const urls = Array.isArray(body.urls) ? body.urls : Array.isArray(body.url) ? body.url : [body.url].filter(Boolean)

    const cleaned = urls.map((u: unknown) => String(u).trim()).filter(Boolean)
    if (cleaned.length === 0) {
      return NextResponse.json({ error: "At least one image URL required" }, { status: 400 })
    }

    const startOrder =
      (await prisma.galleryEventImage.aggregate({
        where: { eventId: id },
        _max: { sortOrder: true },
      }))._max.sortOrder ?? -1

    for (let offset = 0; offset < cleaned.length; offset += CHUNK) {
      const slice = cleaned.slice(offset, offset + CHUNK)
      const base = startOrder + 1 + offset
      await prisma.galleryEventImage.createMany({
        data: slice.map((url: string, i: number) => ({
          eventId: id,
          url,
          sortOrder: base + i,
        })),
      })
    }

    const total = await prisma.galleryEventImage.count({ where: { eventId: id } })
    await updateLastUpdated()

    return NextResponse.json({
      added: cleaned.length,
      totalImages: total,
    })
  } catch (err) {
    console.error("POST /api/gallery/events/[id]/images error:", err)
    return NextResponse.json({ error: "Failed to add images" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { imageIds } = body

    if (!Array.isArray(imageIds)) {
      return NextResponse.json({ error: "imageIds array required" }, { status: 400 })
    }

    await prisma.$transaction(
      imageIds.map((imgId: string, index: number) =>
        prisma.galleryEventImage.updateMany({
          where: { id: imgId, eventId: id },
          data: { sortOrder: index },
        })
      )
    )

    await updateLastUpdated()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PUT /api/gallery/events/[id]/images error:", err)
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 })
  }
}
