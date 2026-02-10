import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const stats = await prisma.statItem.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(stats)
}
