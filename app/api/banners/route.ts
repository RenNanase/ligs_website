import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const banners = await prisma.bannerSlide.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(banners)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const count = await prisma.bannerSlide.count()
  const banner = await prisma.bannerSlide.create({
    data: { ...body, sortOrder: count },
  })
  return NextResponse.json(banner, { status: 201 })
}

// Bulk replace all banners (used by admin batch-save)
export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const banners = await request.json()
  await prisma.$transaction(async (tx) => {
    await tx.bannerSlide.deleteMany()
    for (let i = 0; i < banners.length; i++) {
      const { id, createdAt, updatedAt, ...data } = banners[i]
      await tx.bannerSlide.create({
        data: { ...data, sortOrder: i },
      })
    }
  })
  const result = await prisma.bannerSlide.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(result)
}
