import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

const VALID_TAGS = ["Program", "Majlis", "Mesyuarat", "Public Holiday", "Lain-lain"] as const

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year")
  const month = searchParams.get("month")
  const tag = searchParams.get("tag")
  const fromDate = searchParams.get("from")
  const search = searchParams.get("search")?.trim()
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100)

  const where: Record<string, unknown> = {}

  if (year && month) {
    const y = parseInt(year, 10)
    const m = parseInt(month, 10)
    if (!isNaN(y) && !isNaN(m)) {
      const monthStart = new Date(y, m - 1, 1)
      const monthEnd = new Date(y, m, 0)
      where.AND = [
        { startDate: { lte: monthEnd } },
        { endDate: { gte: monthStart } },
      ]
    }
  }

  if (fromDate) {
    const from = new Date(fromDate)
    if (!isNaN(from.getTime())) {
      where.endDate = { gte: from }
    }
  }

  if (tag && VALID_TAGS.includes(tag as (typeof VALID_TAGS)[number])) {
    where.tag = tag
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { location: { contains: search } },
    ]
  }

  const [events, total] = await Promise.all([
    prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: "asc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.calendarEvent.count({ where }),
  ])

  return NextResponse.json({
    events,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  const auth = await requirePermission("calendar")
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { title, startDate, endDate, location, tag, imageUrl } = body

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }
  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 })
  }
  if (!location || typeof location !== "string" || !location.trim()) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 })
  }
  if (!tag || !VALID_TAGS.includes(tag)) {
    return NextResponse.json({ error: "Valid tag is required" }, { status: 400 })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 })
  }
  if (end < start) {
    return NextResponse.json({ error: "End date must be on or after start date" }, { status: 400 })
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title: title.trim(),
      startDate: start,
      endDate: end,
      location: location.trim(),
      tag,
      imageUrl: imageUrl && typeof imageUrl === "string" ? imageUrl.trim() || null : null,
    },
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `add new calendar event (${title.trim()})`)
  return NextResponse.json(event, { status: 201 })
}
