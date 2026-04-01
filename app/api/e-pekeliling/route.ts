import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

const PAGE_SIZE = 15

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const skip = (page - 1) * PAGE_SIZE

  const [items, total] = await Promise.all([
    prisma.ePekeliling.findMany({
      orderBy: { tarikhDikeluarkan: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.ePekeliling.count(),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE) || 1,
    pageSize: PAGE_SIZE,
  })
}

export async function POST(request: Request) {
  const auth = await requirePermission("e-pekeliling")
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { noPekeliling, noRujukan, tajuk, tarikhDikeluarkan, pdfUrl } = body

  const item = await prisma.ePekeliling.create({
    data: {
      noPekeliling: String(noPekeliling ?? "").trim(),
      noRujukan: String(noRujukan ?? "").trim(),
      tajuk: String(tajuk ?? "").trim(),
      tarikhDikeluarkan: String(tarikhDikeluarkan ?? "").trim(),
      pdfUrl: String(pdfUrl ?? "").trim(),
    },
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `add new e-pekeliling (${String(tajuk ?? "").trim()})`)
  return NextResponse.json(item, { status: 201 })
}
