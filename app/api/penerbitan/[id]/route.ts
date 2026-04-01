import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("penerbitan")
  if (!auth.authenticated) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { title, date, pdfUrl } = body

    const data: { title?: string; date?: Date; pdfUrl?: string } = {}
    if (title !== undefined) data.title = String(title).trim()
    if (date !== undefined) {
      const d = new Date(date)
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 })
      }
      data.date = d
    }
    if (pdfUrl !== undefined) data.pdfUrl = String(pdfUrl).trim()

    const item = await prisma.penerbitan.update({
      where: { id },
      data,
    })

    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, `update penerbitan (${item.title})`)
    return NextResponse.json(item)
  } catch (err) {
    console.error("PUT /api/penerbitan/[id] error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("penerbitan")
  if (!auth.authenticated) return auth.response

  try {
    const { id } = await params
    const existing = await prisma.penerbitan.findUnique({
      where: { id },
      select: { title: true },
    })
    await prisma.penerbitan.delete({ where: { id } })
    await updateLastUpdated()
    const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
    await logActivity(auth.session.user.id, userName, `delete penerbitan (${existing?.title ?? id})`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/penerbitan/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
