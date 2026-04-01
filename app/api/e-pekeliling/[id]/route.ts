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
  const item = await prisma.ePekeliling.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("e-pekeliling")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { createdAt, updatedAt, id: _id, ...rest } = body

  const data: Record<string, unknown> = {}
  if (rest.noPekeliling !== undefined) data.noPekeliling = String(rest.noPekeliling).trim()
  if (rest.noRujukan !== undefined) data.noRujukan = String(rest.noRujukan).trim()
  if (rest.tajuk !== undefined) data.tajuk = String(rest.tajuk).trim()
  if (rest.tarikhDikeluarkan !== undefined) data.tarikhDikeluarkan = String(rest.tarikhDikeluarkan).trim()
  if (rest.pdfUrl !== undefined) data.pdfUrl = String(rest.pdfUrl).trim()

  const item = await prisma.ePekeliling.update({
    where: { id },
    data,
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `update e-pekeliling (${item.tajuk})`)
  return NextResponse.json(item)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("e-pekeliling")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.ePekeliling.findUnique({ where: { id }, select: { tajuk: true } })
  await prisma.ePekeliling.delete({ where: { id } })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete e-pekeliling (${existing?.tajuk ?? id})`)
  return NextResponse.json({ success: true })
}
