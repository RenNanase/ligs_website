import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"

/** Admin: GET intro content */
export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const content = await prisma.kelabSukanContent.findFirst({
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json({
    intro: content?.introHtml ?? "",
    logo: content?.logoUrl ?? null,
  })
}

/** Admin: PUT intro content (upsert) */
export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const introHtml = typeof body.intro === "string" ? body.intro : body.introHtml ?? ""
  const logoUrl = typeof body.logo === "string" ? body.logo : body.logoUrl ?? null

  const existing = await prisma.kelabSukanContent.findFirst()
  const data = { introHtml, logoUrl: logoUrl || null }
  let content

  if (existing) {
    content = await prisma.kelabSukanContent.update({
      where: { id: existing.id },
      data,
    })
  } else {
    content = await prisma.kelabSukanContent.create({
      data: { ...data, introHtml: introHtml || "" },
    })
  }

  await updateLastUpdated()
  return NextResponse.json({ intro: content.introHtml, logo: content.logoUrl })
}
