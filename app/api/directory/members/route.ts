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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bahagianId = searchParams.get("bahagianId")
  const search = searchParams.get("search")?.trim()
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50)
  const sortBy = searchParams.get("sortBy") || "orderIndex"
  const sortOrder = searchParams.get("sortOrder") || "asc"

  const where: Record<string, unknown> = {}
  if (bahagianId) where.bahagianId = bahagianId
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { jawatan: { contains: search } },
      { unitCawangan: { contains: search } },
      { email: { contains: search } },
    ]
  }

  const [members, total] = await Promise.all([
    prisma.directoryMember.findMany({
      where,
      include: { bahagian: { select: { id: true, name: true } } },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.directoryMember.count({ where }),
  ])

  return NextResponse.json({
    members,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { bahagianId, name, jawatan, unitCawangan, noTelefon, email, imageUrl } = body

  if (!bahagianId || !name?.trim() || !jawatan?.trim() || !noTelefon?.trim() || !email?.trim() || !imageUrl?.trim()) {
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

  const bahagian = await prisma.directoryBahagian.findUnique({
    where: { id: bahagianId },
    include: { members: { orderBy: { orderIndex: "desc" }, take: 1 } },
  })
  if (!bahagian) {
    return NextResponse.json({ error: "Bahagian not found" }, { status: 404 })
  }

  const nextOrder = bahagian.members[0] ? bahagian.members[0].orderIndex + 1 : 0

  const member = await prisma.directoryMember.create({
    data: {
      bahagianId,
      name: name.trim(),
      jawatan: jawatan.trim(),
      unitCawangan: unitCawangan?.trim() || null,
      noTelefon: noTelefon.trim(),
      email: normalizeEmail(email),
      imageUrl: imageUrl.trim(),
      orderIndex: nextOrder,
    },
  })
  await updateLastUpdated()
  return NextResponse.json(member, { status: 201 })
}
