import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { bahagianId, memberIds } = body as { bahagianId: string; memberIds: string[] }

  if (!bahagianId || !Array.isArray(memberIds) || memberIds.length === 0) {
    return NextResponse.json(
      { error: "bahagianId and memberIds array required" },
      { status: 400 }
    )
  }

  await prisma.$transaction(
    memberIds.map((id: string, index: number) =>
      prisma.directoryMember.update({
        where: { id },
        data: { orderIndex: index },
      })
    )
  )
  await updateLastUpdated()
  return NextResponse.json({ ok: true })
}
