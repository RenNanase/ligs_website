import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prisma.galleryEvent.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (err) {
    console.error("GET /api/gallery/events/[id] error:", err)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("gallery")
  if (!auth.authenticated) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { title, date } = body

    const updateData: { title?: string; date?: Date } = {}
    if (title !== undefined) {
      const trimmed = String(title).trim()
      if (!trimmed) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 })
      }
      const existing = await prisma.galleryEvent.findFirst({
        where: { title: trimmed, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json(
          { error: "An event with this title already exists" },
          { status: 409 }
        )
      }
      updateData.title = trimmed
    }
    if (date !== undefined) {
      const d = new Date(date)
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 })
      }
      updateData.date = d
    }

    const event = await prisma.galleryEvent.update({
      where: { id },
      data: updateData,
      include: { images: { orderBy: { sortOrder: "asc" } } },
    })

    return NextResponse.json(event)
  } catch (err) {
    console.error("PUT /api/gallery/events/[id] error:", err)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("gallery")
  if (!auth.authenticated) return auth.response

  try {
    const { id } = await params
    const existing = await prisma.galleryEvent.findUnique({ where: { id }, select: { title: true } })
    await prisma.galleryEvent.delete({ where: { id } })
    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, `delete gallery event (${existing?.title ?? id})`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/gallery/events/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
