import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const team = await prisma.teamMember.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(team)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const count = await prisma.teamMember.count()
  const member = await prisma.teamMember.create({
    data: { ...body, sortOrder: count },
  })
  return NextResponse.json(member, { status: 201 })
}
