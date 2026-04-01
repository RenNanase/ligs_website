import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

const MAX_IMAGES = 20

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

    if (urls.length === 0) {
      return NextResponse.json({ error: "At least one image URL required" }, { status: 400 })
    }

    const count = await prisma.galleryEventImage.count({ where: { eventId: id } })
    const toAdd = urls.slice(0, Math.max(0, MAX_IMAGES - count))

    if (toAdd.length === 0) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images per event` },
        { status: 400 }
      )
    }

    await prisma.galleryEventImage.createMany({
      data: toAdd.map((url: string, i: number) => ({
        eventId: id,
        url: String(url).trim(),
        sortOrder: count + i,
      })),
    })

    const event = await prisma.galleryEvent.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    })

    return NextResponse.json(event)
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

    const event = await prisma.galleryEvent.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    })

    await updateLastUpdated()
    return NextResponse.json(event)
  } catch (err) {
    console.error("PUT /api/gallery/events/[id]/images error:", err)
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 })
  }
}
