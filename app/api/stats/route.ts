import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET() {
  const stats = await prisma.statItem.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(stats)
}

export async function PUT(request: Request) {
  const auth = await requirePermission("stats")
  if (!auth.authenticated) return auth.response

  const body = (await request.json()) as { id: string; labelKey: string; value: number; suffix: string }[]
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < body.length; i++) {
      const { id, value, suffix } = body[i]
      await tx.statItem.update({
        where: { id },
        data: { value, suffix, sortOrder: i },
      })
    }
  })

  revalidateTag("initial-data", { expire: 0 })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, "update stats")

  const result = await prisma.statItem.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(result)
}
