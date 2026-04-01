import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

const VALID_TAGS = ["Program", "Majlis", "Mesyuarat", "Public Holiday", "Lain-lain"] as const

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const event = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(event)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("calendar")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { title, startDate, endDate, location, tag, imageUrl } = body

  const data: Record<string, unknown> = {}
  if (title !== undefined) {
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    data.title = title.trim()
  }
  if (startDate !== undefined) {
    const start = new Date(startDate)
    if (isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid start date" }, { status: 400 })
    }
    data.startDate = start
  }
  if (endDate !== undefined) {
    const end = new Date(endDate)
    if (isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid end date" }, { status: 400 })
    }
    data.endDate = end
  }
  if (location !== undefined) {
    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 })
    }
    data.location = location.trim()
  }
  if (tag !== undefined) {
    if (!VALID_TAGS.includes(tag)) {
      return NextResponse.json({ error: "Valid tag is required" }, { status: 400 })
    }
    data.tag = tag
  }
  if (imageUrl !== undefined) {
    data.imageUrl = imageUrl && typeof imageUrl === "string" ? imageUrl.trim() || null : null
  }

  const existing = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const start = (data.startDate as Date) ?? existing.startDate
  const end = (data.endDate as Date) ?? existing.endDate
  if (end < start) {
    return NextResponse.json({ error: "End date must be on or after start date" }, { status: 400 })
  }

  const event = await prisma.calendarEvent.update({
    where: { id },
    data,
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `update calendar event (${event.title})`)
  return NextResponse.json(event)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("calendar")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.calendarEvent.findUnique({ where: { id }, select: { title: true } })
  await prisma.calendarEvent.delete({ where: { id } })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete calendar event (${existing?.title ?? id})`)
  return NextResponse.json({ success: true })
}
