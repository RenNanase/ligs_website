import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

const EMAIL_SUFFIX = "@sabah.gov.my"
const PHONE_REGEX = /^[\d\s\-+()]{8,20}$/

function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return ""
  if (trimmed.endsWith(EMAIL_SUFFIX)) return trimmed
  return trimmed + EMAIL_SUFFIX
}

function isValidEmailInput(email: string): boolean {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return false
  const normalized = trimmed.endsWith(EMAIL_SUFFIX) ? trimmed : trimmed + EMAIL_SUFFIX
  return normalized.length > EMAIL_SUFFIX.length
}

function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.replace(/\s/g, ""))
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const body = await request.json()
  const { name, jawatan, unitCawangan, noTelefon, email, imageUrl } = body

  if (!name?.trim() || !jawatan?.trim() || !noTelefon?.trim() || !email?.trim() || !imageUrl?.trim()) {
    return NextResponse.json(
      { error: "Name, jawatan, no telefon, email, and image are required" },
      { status: 400 }
    )
  }

  if (!isValidEmailInput(email)) {
    return NextResponse.json(
      { error: "Email is required (will be saved as username@sabah.gov.my)" },
      { status: 400 }
    )
  }

  if (!isValidPhone(noTelefon)) {
    return NextResponse.json(
      { error: "Invalid phone number format" },
      { status: 400 }
    )
  }

  const member = await prisma.directoryMember.update({
    where: { id },
    data: {
      name: name.trim(),
      jawatan: jawatan.trim(),
      unitCawangan: unitCawangan?.trim() || null,
      noTelefon: noTelefon.trim(),
      email: normalizeEmail(email),
      imageUrl: imageUrl.trim(),
    },
  })
  return NextResponse.json(member)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  await prisma.directoryMember.delete({ where: { id } })
  await updateLastUpdated()
  return new Response(null, { status: 204 })
}
