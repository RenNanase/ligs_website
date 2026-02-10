import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const tenders = await prisma.tender.findMany({
    orderBy: [{ status: "asc" }, { closingDate: "desc" }],
  })
  return NextResponse.json(tenders)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const tender = await prisma.tender.create({ data: body })
  return NextResponse.json(tender, { status: 201 })
}
