import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { bahagianCreateSchema } from "@/lib/bahagian-schema"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"
import { safeParseInt } from "@/lib/api-validation"

export async function GET(request: Request) {
  const auth = await requirePermission("bahagian")
  if (!auth.authenticated) return auth.response
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const page = Math.max(1, safeParseInt(searchParams.get("page"), 1))
  const limit = Math.min(50, Math.max(1, safeParseInt(searchParams.get("limit"), 20)))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status === "published") {
    where.status = "published"
  } else if (status === "draft") {
    where.status = "draft"
  }
  if (search?.trim()) {
    where.name = { contains: search.trim() }
  }

  const [items, total] = await Promise.all([
    prisma.bahagian.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.bahagian.count({ where }),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  const auth = await requirePermission("bahagian")
  if (!auth.authenticated) return auth.response

  const body = await request.json()

  const parsed = bahagianCreateSchema.safeParse(body)
  if (!parsed.success) {
    const err = parsed.error.flatten()
    return NextResponse.json(
      { error: Object.values(err.fieldErrors).flat().join(". ") || "Validation failed" },
      { status: 400 }
    )
  }

  const existing = await prisma.bahagian.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
  }

  const item = await prisma.bahagian.create({ data: parsed.data })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `add new bahagian (${item.name})`)
  return NextResponse.json(item, { status: 201 })
}
