import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("achievements")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { createdAt, updatedAt, id: _id, ...data } = body
  if (data.achievementDate) {
    data.achievementDate = new Date(data.achievementDate)
  }
  const achievement = await prisma.achievement.update({
    where: { id },
    data,
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `update achievement (${achievement.title})`)
  return NextResponse.json(achievement)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("achievements")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.achievement.findUnique({ where: { id }, select: { title: true } })
  await prisma.achievement.delete({ where: { id } })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete achievement (${existing?.title ?? id})`)
  return NextResponse.json({ success: true })
}
