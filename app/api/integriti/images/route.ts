import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { url } = body
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 })
    }

    const count = await prisma.integritiImage.count()
    const image = await prisma.integritiImage.create({
      data: { url: url.trim(), sortOrder: count },
    })
    await updateLastUpdated()
    return NextResponse.json(image, { status: 201 })
  } catch (err) {
    console.error("POST /api/integriti/images error:", err)
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 })
  }
}
