import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

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
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { createdAt, updatedAt, ...data } = body
  const tender = await prisma.tender.update({
    where: { id },
    data,
  })
  return NextResponse.json(tender)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  await prisma.tender.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
