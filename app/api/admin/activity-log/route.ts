import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { safeParseInt } from "@/lib/api-validation"

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.authenticated) return auth.response

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, safeParseInt(searchParams.get("page"), 1))
  const limit = Math.min(100, Math.max(10, safeParseInt(searchParams.get("limit"), 20)))
  const skip = (page - 1) * limit

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.activityLog.count(),
  ])

  return NextResponse.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
