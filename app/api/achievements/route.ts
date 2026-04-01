import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET() {
  const achievements = await prisma.achievement.findMany({
    orderBy: { achievementDate: "desc" },
  })
  return NextResponse.json(achievements)
}

export async function POST(request: Request) {
  const auth = await requirePermission("achievements")
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  if (body.achievementDate) {
    body.achievementDate = new Date(body.achievementDate)
  }
  const achievement = await prisma.achievement.create({ data: body })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `add new achievement (${achievement.title})`)
  return NextResponse.json(achievement, { status: 201 })
}
