import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { logActivity } from "@/lib/activity-log"
import { randomBytes, randomUUID } from "crypto"
import nodemailer from "nodemailer"

const TOKEN_EXPIRY_HOURS = 24

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.authenticated) return auth.response

  const { id: userId } = await params

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  // Use raw SQL to avoid Prisma delegate issues with MariaDB adapter
  await prisma.$executeRaw`DELETE FROM PasswordResetToken WHERE userId = ${userId}`
  await prisma.$executeRaw`
    INSERT INTO PasswordResetToken (id, userId, token, expiresAt, createdAt)
    VALUES (${randomUUID()}, ${userId}, ${token}, ${expiresAt}, NOW(3))
  `

  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000"
  const resetLink = `${baseUrl}/reset-password?token=${token}`

  // Optionally send email
  const smtpUser = process.env.SMTP_USER?.trim()
  const smtpPass = (process.env.SMTP_APP_PASSWORD ?? "").replace(/\s/g, "").trim()
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass },
      })
      await transporter.sendMail({
        from: `"LIGS" <${smtpUser}>`,
        to: user.email,
        subject: "LIGS - Reset Your Password",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}</style></head>
<body>
  <p>Dear ${user.name || "User"},</p>
  <p>A password reset was requested for your LIGS admin account. Click the link below to set a new password:</p>
  <p><a href="${resetLink}" style="color:#1976d2;text-decoration:underline;">Reset Password</a></p>
  <p>This link expires in ${TOKEN_EXPIRY_HOURS} hours. If you did not request this, please ignore this email.</p>
  <p>Best regards,<br>LIGS Team</p>
</body>
</html>
        `.trim(),
      })
    } catch (err) {
      console.error("Password reset email error:", err)
      // Still return the link so admin can share manually
    }
  }

  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `request password reset for user (${user.email})`)

  return NextResponse.json({
    success: true,
    resetLink,
    emailSent: !!(smtpUser && smtpPass),
  })
}
