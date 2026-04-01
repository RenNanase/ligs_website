import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { logActivity } from "@/lib/activity-log"
import bcrypt from "bcryptjs"
import { z } from "zod"

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().max(255).optional().nullable(),
  role: z.enum(["admin", "user", "author", "publisher"]).optional(),
  allowedModules: z.array(z.string()).optional().nullable(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      allowedModules: true,
      createdAt: true,
    },
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.authenticated) return auth.response

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (parsed.data.email !== undefined) data.email = parsed.data.email
  if (parsed.data.name !== undefined) data.name = parsed.data.name?.trim() || null
  if (parsed.data.role !== undefined) data.role = parsed.data.role
  if (parsed.data.allowedModules !== undefined) data.allowedModules = parsed.data.allowedModules
  if (parsed.data.password && parsed.data.password.trim()) {
    data.password = await bcrypt.hash(parsed.data.password, 10)
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      allowedModules: true,
      createdAt: true,
    },
  })
  return NextResponse.json(user)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  if (id === auth.session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { id }, select: { email: true } })
  await prisma.user.delete({ where: { id } })
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `delete user (${existing?.email ?? id})`)
  return new Response(null, { status: 204 })
}
