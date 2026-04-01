import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("jawatan-kosong")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { jawatanName, taraf, kekosongan, tarikhLuput, pdfUrl } = body

  const data: Record<string, unknown> = {}
  if (jawatanName !== undefined) data.jawatanName = String(jawatanName).trim()
  if (pdfUrl !== undefined) data.pdfUrl = String(pdfUrl).trim()
  if (taraf === "Tetap" || taraf === "Kontrak") data.taraf = taraf
  if (kekosongan !== undefined) data.kekosongan = Math.max(1, Math.floor(Number(kekosongan) || 1))
  if (tarikhLuput !== undefined) {
    const tarikh = new Date(tarikhLuput)
    if (!isNaN(tarikh.getTime())) data.tarikhLuput = tarikh
  }

  const item = await prisma.jawatanKosong.update({
    where: { id },
    data: data as {
      jawatanName?: string
      taraf?: string
      kekosongan?: number
      tarikhLuput?: Date
      pdfUrl?: string
    },
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `update jawatan kosong (${item.jawatanName})`)
  return NextResponse.json(item)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("jawatan-kosong")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.jawatanKosong.findUnique({ where: { id }, select: { jawatanName: true } })
  await prisma.jawatanKosong.delete({ where: { id } })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete jawatan kosong (${existing?.jawatanName ?? id})`)
  return NextResponse.json({ success: true })
}
