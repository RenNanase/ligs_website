import { prisma } from "@/lib/prisma"
import { ensureNewsGalleryColumn } from "@/lib/ensure-news-gallery-column"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { canPublishNews } from "@/lib/permissions"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureNewsGalleryColumn()

  const { id } = await params
  let article
  try {
    article = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        galleryEvent: { select: { title: true } },
      },
    })
  } catch (err) {
    console.warn("GET /api/news/[id]: gallery relation failed, loading without it:", err)
    article = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    })
  }
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const { galleryEvent, images: imageRows, ...articleRest } = article
  return NextResponse.json({
    ...articleRest,
    status: (article as { status?: string }).status ?? "published",
    images: imageRows.map((img) => img.url),
    galleryEventId: article.galleryEventId ?? null,
    galleryEventTitle: galleryEvent?.title ?? null,
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureNewsGalleryColumn()

  const auth = await requirePermission("news")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { createdAt, updatedAt, id: _id, images, status: reqStatus, galleryEventId: rawGalleryId, ...rest } =
    body

  // Only publisher/admin can set status to published
  if (reqStatus === "published" && !canPublishNews(auth.session.user.role)) {
    return NextResponse.json(
      { error: "Only publisher or admin can publish news" },
      { status: 403 }
    )
  }

  // Only pass known scalar fields to Prisma
  const articleData: Record<string, unknown> = {
    ...(rest.title != null && { title: String(rest.title) }),
    ...(rest.titleMs != null && { titleMs: String(rest.titleMs) }),
    ...(rest.content != null && { content: String(rest.content) }),
    ...(rest.contentMs != null && { contentMs: String(rest.contentMs) }),
    ...(rest.date != null && { date: String(rest.date) }),
    ...(rest.category != null && { category: String(rest.category) }),
  }
  if (reqStatus === "published" || reqStatus === "draft") {
    articleData.status = reqStatus
  }

  if (rawGalleryId !== undefined) {
    if (rawGalleryId === null || rawGalleryId === "") {
      articleData.galleryEventId = null
    } else {
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
      articleData.galleryEventId = gid
    }
  }

  const imageUrls = (Array.isArray(images) ? images : [])
    .filter((url: unknown) => url && String(url).trim())
    .map((url: string, i: number) => ({
      url: String(url).trim(),
      sortOrder: i,
    }))

  try {
    // Use nested relation to avoid prisma.newsArticleImage delegate issues (Prisma 7 + MariaDB adapter)
    const article = await prisma.newsArticle.update({
      where: { id },
      data: {
        ...articleData,
        images: {
          deleteMany: {},
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
    await logActivity(auth.session.user.id, userName, `update news (${article.title})`)
    const { galleryEvent, images: imageRows, ...articleRest } = article
    return NextResponse.json({
      ...articleRest,
      images: imageRows.map((img) => img.url),
      galleryEventId: article.galleryEventId ?? null,
      galleryEventTitle: galleryEvent?.title ?? null,
    })
  } catch (error) {
    console.error("News update error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureNewsGalleryColumn()

  const auth = await requirePermission("news")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.newsArticle.findUnique({ where: { id }, select: { title: true } })
  await prisma.newsArticle.delete({ where: { id } })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete news (${existing?.title ?? id})`)
  return NextResponse.json({ success: true })
}
