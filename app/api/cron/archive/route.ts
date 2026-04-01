import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

/**
 * Cron endpoint to run archival job.
 * Call this daily via Vercel Cron or external scheduler.
 * Set CRON_SECRET env var and pass it as Authorization: Bearer <secret> to secure.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    console.error("Archive cron error:", err)
    return NextResponse.json(
      { error: "Failed to run archival" },
      { status: 500 }
    )
  }
}
