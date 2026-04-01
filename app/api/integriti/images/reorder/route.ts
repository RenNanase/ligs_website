import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { ids } = body
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 })
    }

    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.integritiImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )
    await updateLastUpdated()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PUT /api/integriti/images/reorder error:", err)
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 })
  }
}
