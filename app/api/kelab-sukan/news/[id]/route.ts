import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const item = await prisma.kelabSukanNews.findUnique({ where: { id } })
  if (!item)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    ...item,
    datePosted: item.datePosted.toISOString().split("T")[0],
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { datePosted, ...rest } = body

  const data: Record<string, unknown> = {
    ...rest,
    title: (rest.title ?? "").slice(0, 200),
    content: rest.content ?? "",
    featuredImage: rest.featuredImage ?? null,
    status: rest.status ?? "draft",
  }
  if (datePosted) data.datePosted = new Date(datePosted)

  const item = await prisma.kelabSukanNews.update({
    where: { id },
    data: data as Parameters<typeof prisma.kelabSukanNews.update>[0]["data"],
  })
  await updateLastUpdated()
  return NextResponse.json({
    ...item,
    datePosted: item.datePosted.toISOString().split("T")[0],
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  await prisma.kelabSukanNews.delete({ where: { id } })
  await updateLastUpdated()
  return NextResponse.json({ success: true })
}
