import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { date: "desc" }],
  })
  return NextResponse.json(announcements)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const announcement = await prisma.announcement.create({ data: body })
  return NextResponse.json(announcement, { status: 201 })
}
