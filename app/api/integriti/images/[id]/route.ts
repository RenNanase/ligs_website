import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { sortOrder } = body

    const image = await prisma.integritiImage.update({
      where: { id },
      data: typeof sortOrder === "number" ? { sortOrder } : {},
    })
    return NextResponse.json(image)
  } catch (err) {
    console.error("PUT /api/integriti/images/[id] error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { id } = await params
    await prisma.integritiImage.delete({ where: { id } })
    await updateLastUpdated()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/integriti/images/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
