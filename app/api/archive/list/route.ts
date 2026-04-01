import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 50

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "all" // all | berita | galeri
  const search = searchParams.get("search")?.trim() || ""
  const year = searchParams.get("year") || ""
  const sort = searchParams.get("sort") || "year_desc"
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10)))

  const cutoff = new Date(Date.now() - ONE_YEAR_MS)
  const cutoffDateStr = cutoff.toISOString().slice(0, 10) // "YYYY-MM-DD" for string comparison

  try {
    // Show items that are archived OR older than 1 year by CONTENT date (not createdAt)
    // News: date is string "YYYY-MM-DD"; Gallery: date is DateTime
    const baseNewsWhere = {
      OR: [
        { isArchived: true },
        { date: { lt: cutoffDateStr } }, // string comparison works for YYYY-MM-DD
      ],
    }
    const yearStart = year ? new Date(`${year}-01-01`) : null
    const yearEnd = year ? new Date(`${parseInt(year, 10) + 1}-01-01`) : null

    const newsWhere =
      type === "galeri"
        ? { id: "never" }
        : {
            AND: [
              baseNewsWhere,
              ...(search ? [{ OR: [{ title: { contains: search } }, { titleMs: { contains: search } }] }] : []),
              ...(year
                ? [
                    {
                      date: {
                        gte: `${year}-01-01`,
                        lt: `${parseInt(year, 10) + 1}-01-01`,
                      },
                    },
                  ]
                : []),
            ],
          }

    const baseGalleryWhere = {
      OR: [{ isArchived: true }, { date: { lt: cutoff } }], // event date
    }
    const galleryWhere =
      type === "berita"
        ? { id: "never" }
        : {
            AND: [
              baseGalleryWhere,
              ...(search ? [{ title: { contains: search } }] : []),
              ...(year && yearStart && yearEnd ? [{ date: { gte: yearStart, lt: yearEnd } }] : []),
            ],
          }

    const orderByNews =
      sort === "year_desc" || sort === "archived_desc"
        ? { date: "desc" as const }
        : sort === "year_asc" || sort === "archived_asc"
          ? { date: "asc" as const }
          : sort === "original_asc"
            ? { date: "asc" as const }
            : sort === "original_desc"
              ? { date: "desc" as const }
              : sort === "title_asc"
                ? { title: "asc" as const }
                : { title: "desc" as const }

    const orderByGallery =
      sort === "year_desc" || sort === "archived_desc"
        ? { date: "desc" as const }
        : sort === "year_asc" || sort === "archived_asc"
          ? { date: "asc" as const }
          : sort === "original_asc"
            ? { date: "asc" as const }
            : sort === "original_desc"
              ? { date: "desc" as const }
              : sort === "title_asc"
                ? { title: "asc" as const }
                : { title: "desc" as const }

    const skip = (page - 1) * limit

    let items: { id: string; type: "berita" | "galeri"; title: string; titleMs?: string; originalDate: string; archivedAt: string }[]
    let total: number
    let newsDatesResult: { date: string | Date }[] = []
    let galleryDatesResult: { date: Date }[] = []

    const yearsQuery =
      type !== "galeri"
        ? prisma.newsArticle.findMany({
            where: newsWhere as object,
            select: { date: true },
            take: 2000,
          })
        : Promise.resolve([])
    const galleryYearsQuery =
      type !== "berita"
        ? prisma.galleryEvent.findMany({
            where: galleryWhere as object,
            select: { date: true },
            take: 2000,
          })
        : Promise.resolve([])

    if (type === "berita") {
      const [newsList, newsCount, newsDates] = await Promise.all([
        prisma.newsArticle.findMany({
          where: newsWhere as { isArchived: boolean; OR?: unknown[]; archivedAt?: unknown },
          orderBy: orderByNews,
          skip,
          take: limit,
        }),
        prisma.newsArticle.count({ where: newsWhere as object }),
        yearsQuery,
      ])
      items = (newsList as { id: string; title: string; titleMs: string; date: string; archivedAt: Date | null; createdAt: Date }[]).map(
        (n) => ({
          id: n.id,
          type: "berita" as const,
          title: n.title,
          titleMs: n.titleMs,
          originalDate: n.date,
          archivedAt: n.archivedAt ? n.archivedAt.toISOString() : n.createdAt.toISOString(),
        })
      )
      total = newsCount
      newsDatesResult = newsDates as { date: string }[]
    } else if (type === "galeri") {
      const [galleryList, galleryCount, galleryDates] = await Promise.all([
        prisma.galleryEvent.findMany({
          where: galleryWhere as { isArchived: boolean; title?: unknown; archivedAt?: unknown },
          orderBy: orderByGallery,
          skip,
          take: limit,
          include: { _count: { select: { images: true } } },
        }),
        prisma.galleryEvent.count({ where: galleryWhere as object }),
        galleryYearsQuery,
      ])
      items = (galleryList as { id: string; title: string; date: Date; archivedAt: Date | null }[]).map((g) => ({
        id: g.id,
        type: "galeri" as const,
        title: g.title,
        originalDate: g.date.toISOString().slice(0, 10),
        archivedAt: g.archivedAt ? g.archivedAt.toISOString() : g.date.toISOString(),
      }))
      total = galleryCount
      galleryDatesResult = galleryDates as { date: Date }[]
    } else {
      // type === "all": fetch both, merge, sort, paginate
      const [newsList, galleryList, newsCount, galleryCount, newsDates, galleryDates] = await Promise.all([
        prisma.newsArticle.findMany({
          where: newsWhere as { isArchived: boolean; OR?: unknown[]; archivedAt?: unknown },
          orderBy: orderByNews,
        }),
        prisma.galleryEvent.findMany({
          where: galleryWhere as { isArchived: boolean; title?: unknown; archivedAt?: unknown },
          orderBy: orderByGallery,
          include: { _count: { select: { images: true } } },
        }),
        prisma.newsArticle.count({ where: newsWhere as object }),
        prisma.galleryEvent.count({ where: galleryWhere as object }),
        yearsQuery,
        galleryYearsQuery,
      ])
      const allItems = [
        ...(newsList as { id: string; title: string; titleMs: string; date: string; archivedAt: Date | null; createdAt: Date }[]).map(
          (n) => ({
            id: n.id,
            type: "berita" as const,
            title: n.title,
            titleMs: n.titleMs,
            originalDate: n.date,
            archivedAt: n.archivedAt ? n.archivedAt.toISOString() : n.createdAt.toISOString(),
          })
        ),
        ...(galleryList as { id: string; title: string; date: Date; archivedAt: Date | null }[]).map((g) => ({
          id: g.id,
          type: "galeri" as const,
          title: g.title,
          originalDate: g.date.toISOString().slice(0, 10),
          archivedAt: g.archivedAt ? g.archivedAt.toISOString() : g.date.toISOString(),
        })),
      ]
      allItems.sort((a, b) => {
        const yearA = new Date(a.originalDate).getFullYear()
        const yearB = new Date(b.originalDate).getFullYear()
        if (yearA !== yearB) return yearB - yearA
        return new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime()
      })
      total = newsCount + galleryCount
      items = allItems.slice(skip, skip + limit)
      newsDatesResult = newsDates as { date: string }[]
      galleryDatesResult = galleryDates as { date: Date }[]
    }

    const totalPages = Math.max(1, Math.ceil(total / limit))

    const yearsSet = new Set<number>()
    newsDatesResult.forEach((n) => {
      const y = parseInt(String(n.date).slice(0, 4), 10)
      if (!isNaN(y)) yearsSet.add(y)
    })
    galleryDatesResult.forEach((g) => yearsSet.add((g.date as Date).getFullYear()))
    const availableYears = [...yearsSet].sort((a, b) => b - a)

    return NextResponse.json({
      items,
      pagination: { page, limit, total, totalPages },
      availableYears,
    })
  } catch (err) {
    console.error("Archive list error:", err)
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 })
  }
}
