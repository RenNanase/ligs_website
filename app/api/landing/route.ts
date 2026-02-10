import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const landing = await prisma.landingContent.findFirst({
    include: { highlights: { orderBy: { sortOrder: "asc" } } },
  })
  if (!landing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(landing)
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { heroTitle, heroTitleMs, heroSubtitle, heroSubtitleMs, highlights } = body

  const existing = await prisma.landingContent.findFirst()
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.landingContent.update({
    where: { id: existing.id },
    data: {
      heroTitle,
      heroTitleMs,
      heroSubtitle,
      heroSubtitleMs,
      highlights: {
        deleteMany: {},
        create: highlights.map(
          (h: { title: string; titleMs: string; description: string; descriptionMs: string; icon: string }, i: number) => ({
            title: h.title,
            titleMs: h.titleMs,
            description: h.description,
            descriptionMs: h.descriptionMs,
            icon: h.icon,
            sortOrder: i,
          })
        ),
      },
    },
    include: { highlights: { orderBy: { sortOrder: "asc" } } },
  })
  return NextResponse.json(updated)
}
