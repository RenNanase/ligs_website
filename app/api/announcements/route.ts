import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"
import { announcementSchema } from "@/lib/api-validation"

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { date: "desc" }],
  })
  return NextResponse.json(announcements)
}

export async function POST(request: Request) {
  const auth = await requirePermission("announcements")
  if (!auth.authenticated) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = announcementSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const data = { ...parsed.data } as Record<string, unknown>
  if (Array.isArray(data.links)) {
    data.links = data.links.filter((l: { url?: string }) => (l?.url ?? "").trim() !== "")
    // Sync first link to linkUrl/linkText for backward compatibility
    if (data.links.length > 0) {
      const first = data.links[0] as { url: string; text: string }
      data.linkUrl = first.url
      data.linkText = first.text
    }
  }

  const announcement = await prisma.announcement.create({ data: data as Parameters<typeof prisma.announcement.create>[0]["data"] })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `add new announcement (${parsed.data.title})`)
  return NextResponse.json(announcement, { status: 201 })
}
