import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { z } from "zod"
import { checkRateLimit } from "@/lib/feedback-rate-limit"
import { prisma } from "@/lib/prisma"
import type { Feedback } from "@prisma/client"
import { requireAuth } from "@/lib/auth"

const FEEDBACK_SCHEMA = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .regex(/^[\p{L}\p{N}\s\-']+$/u, "Name can only contain letters, numbers, spaces, hyphens and apostrophes"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine(
      (s) => {
        const digits = s.replace(/\D/g, "")
        return /^(0|60)?1[0-9]\d{6,9}$/.test(digits)
      },
      "Invalid phone format. Use Malaysian format: 01XXXXXXXX or +601XXXXXXXX (9-12 digits)"
    ),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(100),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must not exceed 500 characters"),
  recaptchaToken: z.string().optional(),
})

function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret || !token) return true // Skip if not configured

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed, retryAfter } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later.", retryAfter },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = FEEDBACK_SCHEMA.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const captchaValid = await verifyRecaptcha(parsed.data.recaptchaToken)
  if (!captchaValid) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 })
  }

  const { name, phone, email, subject, message } = parsed.data

  // Save to database for tracking (always, even if email fails)
  try {
    await prisma.feedback.create({
      data: {
        name: name.trim().slice(0, 255),
        phone: phone.trim().slice(0, 50),
        email: email.trim().slice(0, 255),
        subject: subject.trim().slice(0, 255),
        message: message.trim().slice(0, 10000),
      },
    })
  } catch (dbErr) {
    console.error("Feedback DB save error:", dbErr)
    return NextResponse.json(
      { error: "Failed to save feedback. Please try again later." },
      { status: 500 }
    )
  }

  const adminEmail = process.env.FEEDBACK_ADMIN_EMAIL?.trim()
  const smtpUser = process.env.SMTP_USER?.trim()
  const smtpPass = (process.env.SMTP_APP_PASSWORD ?? "").replace(/\s/g, "").trim()

  if (!adminEmail || !smtpUser || !smtpPass) {
    console.error("Missing FEEDBACK_ADMIN_EMAIL, SMTP_USER or SMTP_APP_PASSWORD - feedback saved to DB")
    return NextResponse.json({ success: true })
  }

  const safeName = sanitize(name)
  const safePhone = sanitize(phone)
  const safeEmail = sanitize(email)
  const safeSubject = sanitize(subject)
  const safeMessage = sanitize(message).replace(/\n/g, "<br>")

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h2 { color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
    .field { margin: 12px 0; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 4px; padding: 8px; background: #f4f4f4; border-radius: 4px; }
    .message-box { white-space: pre-wrap; }
    hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
    .footer { font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <h2>[Feedback] ${safeSubject} - From ${safeName}</h2>
  <div class="field">
    <div class="label">Name</div>
    <div class="value">${safeName}</div>
  </div>
  <div class="field">
    <div class="label">Phone</div>
    <div class="value">${safePhone}</div>
  </div>
  <div class="field">
    <div class="label">Email</div>
    <div class="value"><a href="mailto:${email}">${safeEmail}</a></div>
  </div>
  <div class="field">
    <div class="label">Subject</div>
    <div class="value">${safeSubject}</div>
  </div>
  <div class="field">
    <div class="label">Message</div>
    <div class="value message-box">${safeMessage}</div>
  </div>
  <hr>
  <div class="footer">Submitted via LIGS website feedback form</div>
</body>
</html>
`.trim()

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: `"LIGS Feedback" <${smtpUser}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[Feedback] ${subject} - From ${name}`,
      html: htmlBody,
    })

    const sendUserConfirmation = process.env.FEEDBACK_SEND_CONFIRMATION === "true"
    if (sendUserConfirmation) {
      const userHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}</style></head>
<body>
  <p>Dear ${safeName},</p>
  <p>Thank you for your feedback regarding "<strong>${safeSubject}</strong>".</p>
  <p>We have received your message and will respond within 3-5 working days.</p>
  <p>Best regards,<br>LIGS Team</p>
</body>
</html>
      `.trim()
      await transporter.sendMail({
        from: `"LIGS" <${smtpUser}>`,
        to: email,
        subject: `We received your feedback - ${subject}`,
        html: userHtml,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Feedback email error (data was saved):", err)
    return NextResponse.json({ success: true })
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { searchParams } = new URL(req.url)
  const countOnly = searchParams.get("count") === "1"

  if (countOnly) {
    const count = await prisma.feedback.count()
    return NextResponse.json({ count })
  }

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feedback.count(),
  ])

  return NextResponse.json({
    items: items.map((f: Feedback) => ({
      id: f.id,
      name: f.name,
      phone: f.phone,
      email: f.email,
      subject: f.subject,
      message: f.message,
      createdAt: f.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  })
}
