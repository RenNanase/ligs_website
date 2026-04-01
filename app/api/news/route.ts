import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth, requirePermission } from "@/lib/auth"
import { canAccessModule } from "@/lib/permissions"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET(request: Request) {
  // Public: only published. Admin/author/publisher: all (including draft)
  const auth = await requireAuth()
  const includeDraft =
    auth.authenticated &&
    canAccessModule(auth.session.user.role, auth.session.user.allowedModules, "news")

  const where = { isArchived: false }
  if (!includeDraft) {
    ;(where as { status?: string }).status = "published"
  }

  const news = await prisma.newsArticle.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  })
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
  }))
  return NextResponse.json(transformed)
}

export async function POST(request: Request) {
  const auth = await requirePermission("news")
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { images = [], status: reqStatus, ...rest } = body
  const { createdAt, updatedAt, id: _id, ...articleData } = rest

  // Author can only create as draft; publisher/admin can create as draft or published
  const canPublish = auth.session.user.role === "admin" || auth.session.user.role === "publisher"
  const status = canPublish && reqStatus === "published" ? "published" : "draft"

  const imageUrls = (Array.isArray(images) ? images : [])
    .filter((url: unknown) => url && String(url).trim())
    .map((url: string, i: number) => ({ url: String(url).trim(), sortOrder: i }))

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
        images: {
          create: imageUrls.map(({ url, sortOrder }) => ({ url, sortOrder })),
        },
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    })

    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, `add new news (${articleData.title ?? ""})`)
    return NextResponse.json(
      {
        ...article,
        status: (article as { status?: string }).status ?? "draft",
        images: article.images.map((img) => img.url),
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
