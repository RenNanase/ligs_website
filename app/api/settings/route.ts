import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { requireAuth } from "@/lib/auth"
import { settingsSchema } from "@/lib/api-validation"

const SINGLETON_ID = "singleton"

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SINGLETON_ID },
    })
    if (!settings) {
      const created = await prisma.siteSettings.create({
        data: { id: SINGLETON_ID, themeId: "default" },
      })
      return NextResponse.json(created)
    }
    return NextResponse.json(settings)
  } catch (err) {
    console.error("GET /api/settings error:", err)
    return NextResponse.json({ themeId: "default" })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Validation failed"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { themeId, cartaOrganisasiImage } = parsed.data
    const updateData: { themeId?: string; cartaOrganisasiImage?: string | null } = {}
    if (themeId !== undefined) updateData.themeId = themeId
    if (cartaOrganisasiImage !== undefined) updateData.cartaOrganisasiImage = cartaOrganisasiImage

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      update: updateData,
      create: { id: SINGLETON_ID, themeId: themeId || "default", cartaOrganisasiImage: updateData.cartaOrganisasiImage ?? undefined },
    })
    await updateLastUpdated()
    return NextResponse.json(settings)
  } catch (err) {
    console.error("PUT /api/settings error:", err)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
