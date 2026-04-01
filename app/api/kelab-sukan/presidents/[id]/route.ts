import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const data: Record<string, unknown> = {
    name: (body.name ?? "").trim(),
    imageUrl: body.imageUrl ?? "",
    description: body.description?.trim() ?? null,
  }
  if (body.startDate) data.startDate = new Date(body.startDate)
  if (body.endDate !== undefined)
    data.endDate = body.endDate ? new Date(body.endDate) : null
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder

  const item = await prisma.kelabSukanPresident.update({
    where: { id },
    data: data as Parameters<typeof prisma.kelabSukanPresident.update>[0]["data"],
  })
  await updateLastUpdated()
  return NextResponse.json({
    ...item,
    startDate: item.startDate.toISOString().split("T")[0],
    endDate: item.endDate?.toISOString().split("T")[0] ?? null,
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  await prisma.kelabSukanPresident.delete({ where: { id } })
  await updateLastUpdated()
  return NextResponse.json({ success: true })
}
