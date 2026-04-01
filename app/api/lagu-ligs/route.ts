import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

const SINGLETON_ID = "singleton"

export async function GET() {
  try {
    const row = await prisma.laguLigs.findUnique({
      where: { id: SINGLETON_ID },
      select: { videoUrl: true },
    })
    return NextResponse.json({ videoUrl: row?.videoUrl ?? null })
  } catch {
    return NextResponse.json({ videoUrl: null })
  }
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("lagu-ligs")
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { videoUrl } = body
    const value = videoUrl === "" || videoUrl == null ? null : String(videoUrl).trim()

    const row = await prisma.laguLigs.upsert({
      where: { id: SINGLETON_ID },
      update: { videoUrl: value },
      create: { id: SINGLETON_ID, videoUrl: value },
    })
    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, "update lagu LIGS")
    return NextResponse.json({ videoUrl: row.videoUrl })
  } catch (err) {
    console.error("PATCH /api/lagu-ligs error:", err)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
