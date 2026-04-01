import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { unlink } from "fs/promises"
import path from "path"

const URL_REGEX = /^https?:\/\/[^\s]+$/i

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return URL_REGEX.test(url)
  } catch {
    return false
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { name, logoPath, url, isActive, sortOrder } = body

  const existing = await prisma.agensiBerkaitan.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const data: Record<string, unknown> = {}

  if (name !== undefined) {
    data.name = (typeof name === "string" ? name : "").trim().slice(0, 150)
  }

  if (logoPath !== undefined) {
    if (typeof logoPath !== "string" || logoPath.trim().length === 0) {
      return NextResponse.json({ error: "Logo is required" }, { status: 400 })
    }
    const newPath = logoPath.trim().slice(0, 255)
    if (newPath !== existing.logoPath && existing.logoPath.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), "public", existing.logoPath)
      try {
        await unlink(oldPath)
      } catch {
        /* ignore */
      }
    }
    data.logoPath = newPath
  }

  if (url !== undefined) {
    if (typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }
    if (!isValidUrl(url.trim())) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }
    data.url = url.trim().slice(0, 255)
  }

  if (isActive !== undefined) data.isActive = Boolean(isActive)
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder) || 0

  const item = await prisma.agensiBerkaitan.update({
    where: { id },
    data,
  })
  await updateLastUpdated()
  return NextResponse.json(item)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params

  const existing = await prisma.agensiBerkaitan.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (existing.logoPath.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", existing.logoPath)
    try {
      await unlink(filePath)
    } catch {
      // Ignore if file doesn't exist
    }
  }

  await prisma.agensiBerkaitan.delete({ where: { id } })
  await updateLastUpdated()
  return NextResponse.json({ success: true })
}
