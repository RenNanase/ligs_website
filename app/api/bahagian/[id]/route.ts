import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { bahagianUpdateSchema } from "@/lib/bahagian-schema"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"
import { unlink } from "fs/promises"
import path from "path"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = await prisma.bahagian.findUnique({ where: { id } })
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(item)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("bahagian")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.bahagian.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()
  const parsed = bahagianUpdateSchema.safeParse(body)
  if (!parsed.success) {
    const err = parsed.error.flatten()
    return NextResponse.json(
      { error: Object.values(err.fieldErrors).flat().join(". ") || "Validation failed" },
      { status: 400 }
    )
  }

  const data = parsed.data

  if (data.slug && data.slug !== existing.slug) {
    const duplicate = await prisma.bahagian.findUnique({ where: { slug: data.slug } })
    if (duplicate) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }
  }

  if ((data.featuredImage === "" || data.featuredImage === null) && existing.featuredImage?.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", existing.featuredImage)
    try {
      await unlink(filePath)
    } catch {
      /* ignore */
    }
    data.featuredImage = null
  }

  if ((data.membersImage === "" || data.membersImage === null) && existing.membersImage?.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", existing.membersImage)
    try {
      await unlink(filePath)
    } catch {
      /* ignore */
    }
    data.membersImage = null
  }

  const item = await prisma.bahagian.update({ where: { id }, data })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `update bahagian (${item.name})`)
  return NextResponse.json(item)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("bahagian")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const existing = await prisma.bahagian.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  for (const img of [existing.featuredImage, existing.membersImage]) {
    if (img?.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", img)
      try {
        await unlink(filePath)
      } catch {
        /* ignore */
      }
    }
  }

  await prisma.bahagian.delete({ where: { id } })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete bahagian (${existing.name})`)
  return NextResponse.json({ success: true })
}
