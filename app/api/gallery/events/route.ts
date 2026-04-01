import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(20, Math.max(10, parseInt(searchParams.get("limit") || "10", 10)))
    const search = searchParams.get("search")?.trim() || ""
    const sort = searchParams.get("sort") || "date_desc"
    const skip = (page - 1) * limit

    const where = { isArchived: false, ...(search ? { title: { contains: search } } : {}) }

    const [orderByDate, orderByTitle] =
      sort === "title_asc"
        ? [{ title: "asc" as const }, { date: "desc" as const }]
        : sort === "title_desc"
          ? [{ title: "desc" as const }, { date: "desc" as const }]
          : sort === "date_asc"
            ? [{ date: "asc" as const }, { title: "asc" as const }]
            : [{ date: "desc" as const }, { title: "asc" as const }]

    const [events, total] = await Promise.all([
      prisma.galleryEvent.findMany({
        where,
        orderBy: [orderByDate, orderByTitle],
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 6,
            select: { id: true, url: true },
          },
          _count: { select: { images: true } },
        },
      }),
      prisma.galleryEvent.count({ where }),
    ])

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error("GET /api/gallery/events error:", err)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requirePermission("gallery")
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { title, date, imageUrls = [] } = body

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const eventDate = date ? new Date(date) : null
    if (!eventDate || isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Valid date is required" }, { status: 400 })
    }

    const existing = await prisma.galleryEvent.findUnique({
      where: { title: trimmedTitle },
    })
    if (existing) {
      return NextResponse.json(
        { error: "An event with this title already exists" },
        { status: 409 }
      )
    }

    const urls = Array.isArray(imageUrls) ? imageUrls.slice(0, 20) : []

    const event = await prisma.galleryEvent.create({
      data: {
        title: trimmedTitle,
        date: eventDate,
        images: {
          create: urls.map((url: string, i: number) => ({ url, sortOrder: i })),
        },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    })

    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, `add new gallery event (${trimmedTitle})`)
    return NextResponse.json(event, { status: 201 })
  } catch (err) {
    console.error("POST /api/gallery/events error:", err)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
