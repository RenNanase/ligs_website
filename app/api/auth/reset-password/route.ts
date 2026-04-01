import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  token: z.string().min(1, "Invalid reset link"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { token, newPassword } = parsed.data

  // Use raw SQL to avoid Prisma delegate issues with MariaDB adapter
  const rows = await prisma.$queryRaw<{ userId: string; expiresAt: Date }[]>`
    SELECT userId, expiresAt FROM PasswordResetToken WHERE token = ${token} LIMIT 1
  `
  const resetRecord = rows[0]

  if (!resetRecord) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
  }

  if (new Date(resetRecord.expiresAt) < new Date()) {
    await prisma.$executeRaw`DELETE FROM PasswordResetToken WHERE token = ${token}`
    return NextResponse.json({ error: "Reset link has expired" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.$transaction([
    prisma.$executeRaw`UPDATE User SET password = ${hashed}, updatedAt = NOW(3) WHERE id = ${resetRecord.userId}`,
    prisma.$executeRaw`DELETE FROM PasswordResetToken WHERE token = ${token}`,
  ])

  return NextResponse.json({ success: true })
}
