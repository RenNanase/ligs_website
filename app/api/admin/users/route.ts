import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { logActivity } from "@/lib/activity-log"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password at least 6 characters"),
  name: z.string().max(255).optional(),
  role: z.enum(["admin", "user", "author", "publisher"]),
  allowedModules: z.array(z.string()).optional().nullable(),
})

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.authenticated) return auth.response

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      allowedModules: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.authenticated) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { email, password, name, role, allowedModules } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: name?.trim() || null,
      role,
      allowedModules: role === "user" ? (allowedModules ?? []) : role === "author" || role === "publisher" ? ["news"] : undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      allowedModules: true,
      createdAt: true,
    },
  })

  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `add new user (${email})`)
  return NextResponse.json(user, { status: 201 })
}
