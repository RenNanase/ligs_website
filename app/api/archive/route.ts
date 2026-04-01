import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

export type ArchiveItem = {
  id: string
  type: "berita" | "galeri"
  title: string
  titleMs?: string
  originalDate: string
  archivedAt: string
}

/** Run archival job: mark content >1 year old as archived */
export async function POST() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const now = new Date()
  const cutoff = new Date(now.getTime() - ONE_YEAR_MS)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  try {
    const [newsResult, galleryResult] = await Promise.all([
      prisma.newsArticle.updateMany({
        where: { date: { lt: cutoffStr }, isArchived: false },
        data: { isArchived: true, archivedAt: now },
      }),
      prisma.galleryEvent.updateMany({
        where: { date: { lt: cutoff }, isArchived: false },
        data: { isArchived: true, archivedAt: now },
      }),
    ])

    return NextResponse.json({
      success: true,
      archived: { news: newsResult.count, gallery: galleryResult.count },
    })
  } catch (err) {
    console.error("Archive run error:", err)
    return NextResponse.json(
      { error: "Failed to run archival" },
      { status: 500 }
    )
  }
}
