import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

/** Admin: list all news (including drafts), with pagination & search */
export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)))
  const search = searchParams.get("search")?.trim() ?? ""
  const status = searchParams.get("status") ?? ""

  const where: { title?: { contains: string }; status?: string } = {}
  if (search) where.title = { contains: search }
  if (status && ["published", "draft"].includes(status)) where.status = status

  const [items, total] = await Promise.all([
    prisma.kelabSukanNews.findMany({
      where,
      orderBy: { datePosted: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.kelabSukanNews.count({ where }),
  ])

  return NextResponse.json({
    items: items.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      featuredImage: n.featuredImage,
      datePosted: n.datePosted.toISOString().split("T")[0],
      status: n.status,
      sortOrder: n.sortOrder,
    })),
    total,
    page,
    limit,
  })
}

/** Admin: create news */
export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { datePosted, ...rest } = body
  const data = {
    ...rest,
    title: (rest.title ?? "").slice(0, 200),
    content: rest.content ?? "",
    featuredImage: rest.featuredImage ?? null,
    datePosted: datePosted ? new Date(datePosted) : new Date(),
    status: rest.status ?? "draft",
  }

  const item = await prisma.kelabSukanNews.create({ data })
  await updateLastUpdated()
  return NextResponse.json(
    {
      ...item,
      datePosted: item.datePosted.toISOString().split("T")[0],
    },
    { status: 201 }
  )
}
