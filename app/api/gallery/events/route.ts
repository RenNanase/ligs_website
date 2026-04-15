import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

const CREATE_CHUNK = 200

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

    const urls = Array.isArray(imageUrls)
      ? imageUrls.map((u: unknown) => String(u).trim()).filter(Boolean)
      : []

    const existing = await prisma.galleryEvent.findUnique({
      where: { title: trimmedTitle },
      select: { id: true, isArchived: true },
    })

    if (existing && !existing.isArchived) {
      return NextResponse.json(
        {
          error:
            "An event with this title already exists. Use a different title, or open the existing event to edit it.",
        },
        { status: 409 }
      )
    }

    let eventId: string

    if (existing?.isArchived) {
      await prisma.$transaction(async (tx) => {
        await tx.galleryEvent.update({
          where: { id: existing.id },
          data: {
            isArchived: false,
            archivedAt: null,
            date: eventDate,
          },
        })
        await tx.galleryEventImage.deleteMany({ where: { eventId: existing.id } })
        for (let offset = 0; offset < urls.length; offset += CREATE_CHUNK) {
          const slice = urls.slice(offset, offset + CREATE_CHUNK)
          await tx.galleryEventImage.createMany({
            data: slice.map((url: string, i: number) => ({
              eventId: existing.id,
              url,
              sortOrder: offset + i,
            })),
          })
        }
      })
      eventId = existing.id
    } else {
      const event = await prisma.galleryEvent.create({
        data: {
          title: trimmedTitle,
          date: eventDate,
        },
      })
      eventId = event.id
      for (let offset = 0; offset < urls.length; offset += CREATE_CHUNK) {
        const slice = urls.slice(offset, offset + CREATE_CHUNK)
        await prisma.galleryEventImage.createMany({
          data: slice.map((url: string, i: number) => ({
            eventId: event.id,
            url,
            sortOrder: offset + i,
          })),
        })
      }
    }

    const withCount = await prisma.galleryEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { images: true } },
      },
    })

    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    const logLabel = existing?.isArchived
      ? `restored gallery event from archive (${trimmedTitle})`
      : `add new gallery event (${trimmedTitle})`
    await logActivity(auth.session.user.id, userName, logLabel)
    return NextResponse.json(
      {
        id: withCount!.id,
        title: withCount!.title,
        date: withCount!.date,
        createdAt: withCount!.createdAt,
        updatedAt: withCount!.updatedAt,
        imageCount: withCount!._count.images,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("POST /api/gallery/events error:", err)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
