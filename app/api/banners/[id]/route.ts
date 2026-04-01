import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const banner = await prisma.bannerSlide.findUnique({ where: { id } })
  if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(banner)
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
  const banner = await prisma.bannerSlide.update({
    where: { id },
    data,
  })
  await updateLastUpdated()
  revalidateTag("initial-data", { expire: 0 })
  revalidatePath("/")
  return NextResponse.json(banner)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  await prisma.bannerSlide.delete({ where: { id } })
  await updateLastUpdated()
  revalidateTag("initial-data", { expire: 0 })
  revalidatePath("/")
  return NextResponse.json({ success: true })
}
