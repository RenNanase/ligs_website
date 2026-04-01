import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { id, type } = body
  if (!id || !type || !["berita", "galeri"].includes(type)) {
    return NextResponse.json({ error: "Invalid id or type" }, { status: 400 })
  }

  try {
    if (type === "berita") {
      await prisma.newsArticle.update({
        where: { id },
        data: { isArchived: false, archivedAt: null },
      })
    } else {
      await prisma.galleryEvent.update({
        where: { id },
        data: { isArchived: false, archivedAt: null },
      })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Restore error:", err)
    return NextResponse.json({ error: "Failed to restore" }, { status: 500 })
  }
}
