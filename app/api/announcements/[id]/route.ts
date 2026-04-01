import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const announcement = await prisma.announcement.findUnique({ where: { id } })
  if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(announcement)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("announcements")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { createdAt, updatedAt, ...data } = body
  if (Array.isArray(data.links)) {
    data.links = data.links.filter((l: { url?: string }) => (l?.url ?? "").trim() !== "")
    if (data.links.length > 0) {
      const first = data.links[0] as { url: string; text: string }
      data.linkUrl = first.url
      data.linkText = first.text
    }
  }
  const announcement = await prisma.announcement.update({
    where: { id },
    data,
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `update announcement (${announcement.title})`)
  return NextResponse.json(announcement)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("announcements")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.announcement.findUnique({ where: { id }, select: { title: true } })
  await prisma.announcement.delete({ where: { id } })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete announcement (${existing?.title ?? id})`)
  return NextResponse.json({ success: true })
}
