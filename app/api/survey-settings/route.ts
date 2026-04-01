import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"

const SINGLETON_ID = "singleton"

/** Public: Get survey form open/close status */
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SINGLETON_ID },
    })
    return NextResponse.json({
      pelangganOpen: settings?.kepuasanPelangganOpen ?? true,
      stafOpen: settings?.kepuasanStafOpen ?? true,
    })
  } catch {
    return NextResponse.json({ pelangganOpen: true, stafOpen: true })
  }
}

/** Requires kepuasan-pelanggan permission: Update survey form open/close status */
export async function PATCH(request: Request) {
  const auth = await requirePermission("kepuasan-pelanggan")
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const pelangganOpen = body.pelangganOpen as boolean | undefined
    const stafOpen = body.stafOpen as boolean | undefined

    if (pelangganOpen === undefined && stafOpen === undefined) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 })
    }

    const updateData: { kepuasanPelangganOpen?: boolean; kepuasanStafOpen?: boolean } = {}
    if (typeof pelangganOpen === "boolean") updateData.kepuasanPelangganOpen = pelangganOpen
    if (typeof stafOpen === "boolean") updateData.kepuasanStafOpen = stafOpen

    const settings = await prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      update: updateData,
      create: {
        id: SINGLETON_ID,
        themeId: "default",
        kepuasanPelangganOpen: pelangganOpen ?? true,
        kepuasanStafOpen: stafOpen ?? true,
      },
    })
    return NextResponse.json({
      pelangganOpen: settings.kepuasanPelangganOpen,
      stafOpen: settings.kepuasanStafOpen,
    })
  } catch (err) {
    console.error("Survey settings update error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
