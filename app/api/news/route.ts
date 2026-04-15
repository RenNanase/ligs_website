import { prisma } from "@/lib/prisma"
import { ensureNewsGalleryColumn } from "@/lib/ensure-news-gallery-column"
import { NextResponse } from "next/server"
import { requireAuth, requirePermission } from "@/lib/auth"
import { canAccessModule } from "@/lib/permissions"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET(request: Request) {
  await ensureNewsGalleryColumn()

  // Public: only published. Admin/author/publisher: all (including draft)
  const auth = await requireAuth()
  const includeDraft =
    auth.authenticated &&
    canAccessModule(auth.session.user.role, auth.session.user.allowedModules, "news")

  const where = { isArchived: false }
  if (!includeDraft) {
    ;(where as { status?: string }).status = "published"
  }

  let news
  try {
    news = await prisma.newsArticle.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        galleryEvent: { select: { title: true } },
      },
    })
  } catch (err) {
    console.warn("GET /api/news: gallery relation unavailable, loading without it:", err)
    news = await prisma.newsArticle.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    })
  }
  const transformed = news.map((a) => ({
    id: a.id,
    title: a.title,
    titleMs: a.titleMs,
    content: a.content,
    contentMs: a.contentMs,
    date: a.date,
    category: a.category,
    status: (a as { status?: string }).status ?? "published",
    images: a.images.map((img) => img.url),
    galleryEventId: a.galleryEventId ?? null,
    galleryEventTitle: a.galleryEvent?.title ?? null,
  }))
  return NextResponse.json(transformed)
}

export async function POST(request: Request) {
  await ensureNewsGalleryColumn()

  const auth = await requirePermission("news")
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { images = [], status: reqStatus, galleryEventId: rawGalleryId, ...rest } = body
  const { createdAt, updatedAt, id: _id, ...articleData } = rest

  // Author can only create as draft; publisher/admin can create as draft or published
  const canPublish = auth.session.user.role === "admin" || auth.session.user.role === "publisher"
  const status = canPublish && reqStatus === "published" ? "published" : "draft"

  const imageUrls = (Array.isArray(images) ? images : [])
    .filter((url: unknown) => url && String(url).trim())
    .map((url: string, i: number) => ({ url: String(url).trim(), sortOrder: i }))

  let galleryEventId: string | null = null
  if (rawGalleryId != null && String(rawGalleryId).trim()) {
    const gid = String(rawGalleryId).trim()
    const ev = await prisma.galleryEvent.findFirst({
      where: { id: gid, isArchived: false },
      select: { id: true },
    })
    if (!ev) {
      return NextResponse.json(
        { error: "Selected gallery event was not found or is archived." },
        { status: 400 }
      )
    }
    galleryEventId = gid
  }

  try {
    const article = await prisma.newsArticle.create({
      data: {
        title: articleData.title ?? "",
        titleMs: articleData.titleMs ?? "",
        content: articleData.content ?? "",
        contentMs: articleData.contentMs ?? "",
        date: articleData.date ?? "",
        category: articleData.category ?? "",
        status,
        galleryEventId,
        images: {
          create: imageUrls.map(({ url, sortOrder }) => ({ url, sortOrder })),
        },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        galleryEvent: { select: { title: true } },
      },
    })

    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, `add new news (${articleData.title ?? ""})`)
    const { galleryEvent, images: imageRows, ...articleRest } = article
    return NextResponse.json(
      {
        ...articleRest,
        status: (article as { status?: string }).status ?? "draft",
        images: imageRows.map((img) => img.url),
        galleryEventId: article.galleryEventId ?? null,
        galleryEventTitle: galleryEvent?.title ?? null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("News create error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Create failed" },
      { status: 500 }
    )
  }
}
