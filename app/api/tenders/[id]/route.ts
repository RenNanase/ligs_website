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
  const tender = await prisma.tender.findUnique({ where: { id } })
  if (!tender) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(tender)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("tenders")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { createdAt, updatedAt, id: _id, ...rest } = body
  const data: Record<string, unknown> = {}
  if (rest.title !== undefined) data.title = String(rest.title).trim()
  if (rest.titleMs !== undefined) data.titleMs = String(rest.titleMs).trim()
  if (rest.openingDate !== undefined) data.openingDate = String(rest.openingDate).trim()
  if (rest.closingDate !== undefined) data.closingDate = String(rest.closingDate).trim()
  if (rest.pdfUrl !== undefined) data.pdfUrl = String(rest.pdfUrl).trim()
  if (rest.status === "closed" || rest.status === "open") data.status = rest.status
  const tender = await prisma.tender.update({
    where: { id },
    data,
  })
  await updateLastUpdated()
  return NextResponse.json(tender)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("tenders")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.tender.findUnique({ where: { id }, select: { title: true } })
  await prisma.tender.delete({ where: { id } })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete tender (${existing?.title ?? id})`)
  return NextResponse.json({ success: true })
}
