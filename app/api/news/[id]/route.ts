import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { canPublishNews } from "@/lib/permissions"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const article = await prisma.newsArticle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  })
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    ...article,
    status: (article as { status?: string }).status ?? "published",
    images: article.images.map((img) => img.url),
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("news")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { createdAt, updatedAt, id: _id, images, status: reqStatus, ...rest } = body

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
      include: { images: { orderBy: { sortOrder: "asc" } } },
    })

    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, `update news (${article.title})`)
    return NextResponse.json({
      ...article,
      images: article.images.map((img) => img.url),
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
