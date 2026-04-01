import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

const SINGLETON_ID = "singleton"

function parseYoutubeUrls(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim())
}

export async function GET() {
  const delegate = prisma.mediaSosial
  if (!delegate) {
    return NextResponse.json({ youtubeUrls: [] })
  }
  try {
    const row = await delegate.findUnique({
      where: { id: SINGLETON_ID },
      select: { youtubeUrls: true },
    })
    const urls = parseYoutubeUrls(row?.youtubeUrls ?? null)
    return NextResponse.json({ youtubeUrls: urls })
  } catch {
    return NextResponse.json({ youtubeUrls: [] })
  }
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("media-sosial")
  if (!auth.authenticated) return auth.response

  const delegate = prisma.mediaSosial
  if (!delegate) {
    return NextResponse.json(
      { error: "MediaSosial model not available. Run: npx prisma generate && restart the dev server." },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { youtubeUrls } = body
    const urls = Array.isArray(youtubeUrls)
      ? parseYoutubeUrls(youtubeUrls)
      : []

    const row = await delegate.upsert({
      where: { id: SINGLETON_ID },
      update: { youtubeUrls: urls },
      create: { id: SINGLETON_ID, youtubeUrls: urls },
    })
    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, "update media sosial")
    const saved = parseYoutubeUrls(row.youtubeUrls)
    return NextResponse.json({ youtubeUrls: saved })
  } catch (err) {
    console.error("PATCH /api/media-sosial error:", err)
    const msg = err instanceof Error ? err.message : "Failed to save"
    const isTableMissing = typeof msg === "string" && /doesn't exist|not found|unknown table/i.test(msg)
    return NextResponse.json(
      { error: isTableMissing ? "MediaSosial table not found. Run: npx prisma migrate deploy" : "Failed to save" },
      { status: 500 }
    )
  }
}
