import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

/** Admin: reorder presidents by id array */
export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const ids = Array.isArray(body.ids) ? body.ids : []
  if (ids.length === 0) return NextResponse.json({ success: true })

  await prisma.$transaction(
    ids.map((id: string, i: number) =>
      prisma.kelabSukanPresident.update({
        where: { id },
        data: { sortOrder: i },
      })
    )
  )
  await updateLastUpdated()
  return NextResponse.json({ success: true })
}
