import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

const SINGLETON_ID = "singleton"

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SINGLETON_ID },
      select: { cartaOrganisasiImage: true },
    })
    return NextResponse.json({
      centerImage: settings?.cartaOrganisasiImage ?? null,
    })
  } catch {
    return NextResponse.json({ centerImage: null })
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { centerImage } = body
    const value = centerImage === "" || centerImage == null ? null : String(centerImage)

    const settings = await prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      update: { cartaOrganisasiImage: value },
      create: { id: SINGLETON_ID, themeId: "default", cartaOrganisasiImage: value },
    })
    await updateLastUpdated()
    return NextResponse.json({ centerImage: settings.cartaOrganisasiImage })
  } catch (err) {
    console.error("PATCH /api/carta-organisasi error:", err)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
