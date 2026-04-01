import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

const SINGLETON_ID = "singleton"

export async function GET() {
  try {
    const [settings, images] = await Promise.all([
      prisma.siteSettings.findUnique({
        where: { id: SINGLETON_ID },
        select: { integritiVideoUrl: true },
      }),
      prisma.integritiImage.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, sortOrder: true },
      }),
    ])
    return NextResponse.json({
      videoUrl: settings?.integritiVideoUrl ?? null,
      images: images.map((i) => ({ id: i.id, url: i.url, sortOrder: i.sortOrder })),
    })
  } catch (err) {
    console.error("GET /api/integriti error:", err)
    return NextResponse.json({ videoUrl: null, images: [] })
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { videoUrl } = body
    const value = videoUrl === "" || videoUrl == null ? null : String(videoUrl).trim()

    await prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      update: { integritiVideoUrl: value },
      create: { id: SINGLETON_ID, themeId: "default", integritiVideoUrl: value },
    })
    await updateLastUpdated()
    return NextResponse.json({ videoUrl: value })
  } catch (err) {
    console.error("PATCH /api/integriti error:", err)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
