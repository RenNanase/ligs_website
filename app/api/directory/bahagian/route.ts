import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const bahagian = await prisma.directoryBahagian.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      members: {
        orderBy: { orderIndex: "asc" },
      },
    },
  })
  const res = NextResponse.json(bahagian)
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
  return res
}
