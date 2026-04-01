import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"
import { z } from "zod"
import { bannerSlideSchema } from "@/lib/api-validation"

export async function GET() {
  const banners = await prisma.bannerSlide.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(banners, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  })
}

export async function POST(request: Request) {
  const auth = await requirePermission("banners")
  if (!auth.authenticated) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bannerSlideSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const count = await prisma.bannerSlide.count()
  const banner = await prisma.bannerSlide.create({
    data: { ...parsed.data, sortOrder: count },
  })
  await updateLastUpdated()
  await logActivity(
    auth.session.user.id,
    auth.session.user.name ?? auth.session.user.email ?? "Unknown",
    `add new banner (${parsed.data.title})`
  )
  revalidateTag("initial-data", { expire: 0 })
  revalidatePath("/")
  return NextResponse.json(banner, { status: 201 })
}

// Bulk replace all banners (used by admin batch-save)
export async function PUT(request: Request) {
  const auth = await requirePermission("banners")
  if (!auth.authenticated) return auth.response

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!Array.isArray(raw) || raw.length > 20) {
    return NextResponse.json(
      { error: "Expected array of up to 20 banner slides" },
      { status: 400 }
    )
  }

  const parsed = z.array(bannerSlideSchema).safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.bannerSlide.deleteMany()
    for (let i = 0; i < parsed.data.length; i++) {
      await tx.bannerSlide.create({
        data: { ...parsed.data[i], sortOrder: i },
      })
    }
  })
  const result = await prisma.bannerSlide.findMany({
    orderBy: { sortOrder: "asc" },
  })
  await updateLastUpdated()
  await logActivity(
    auth.session.user.id,
    auth.session.user.name ?? auth.session.user.email ?? "Unknown",
    "update banners"
  )
  revalidateTag("initial-data", { expire: 0 })
  revalidatePath("/")
  return NextResponse.json(result)
}
