import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

/** Admin: list all presidents */
export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const items = await prisma.kelabSukanPresident.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(
    items.map((p) => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate.toISOString().split("T")[0],
      endDate: p.endDate?.toISOString().split("T")[0] ?? null,
      imageUrl: p.imageUrl,
      description: p.description,
      sortOrder: p.sortOrder,
    }))
  )
}

/** Admin: create president */
export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const data = {
    name: (body.name ?? "").trim(),
    startDate: body.startDate ? new Date(body.startDate) : new Date(),
    endDate: body.endDate ? new Date(body.endDate) : null,
    imageUrl: body.imageUrl ?? "",
    description: body.description?.trim() ?? null,
    sortOrder: body.sortOrder ?? 0,
  }

  const maxOrder = await prisma.kelabSukanPresident.aggregate({
    _max: { sortOrder: true },
  })
  if (data.sortOrder === 0 && maxOrder._max.sortOrder != null) {
    data.sortOrder = maxOrder._max.sortOrder + 1
  }

  const item = await prisma.kelabSukanPresident.create({ data })
  await updateLastUpdated()
  return NextResponse.json(
    {
      ...item,
      startDate: item.startDate.toISOString().split("T")[0],
      endDate: item.endDate?.toISOString().split("T")[0] ?? null,
    },
    { status: 201 }
  )
}
