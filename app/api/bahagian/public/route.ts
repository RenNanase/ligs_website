import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const items = await prisma.bahagian.findMany({
    where: { status: "published" },
    orderBy: { orderIndex: "asc" },
  })
  return NextResponse.json(items)
}
