import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET() {
  const tenders = await prisma.tender.findMany({
    orderBy: [{ status: "asc" }, { closingDate: "desc" }],
  })
  return NextResponse.json(tenders)
}

export async function POST(request: Request) {
  const auth = await requirePermission("tenders")
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { title, titleMs, openingDate, closingDate, pdfUrl, status } = body
  const tender = await prisma.tender.create({
    data: {
      title: String(title ?? "").trim(),
      titleMs: String(titleMs ?? "").trim(),
      openingDate: String(openingDate ?? "").trim(),
      closingDate: String(closingDate ?? "").trim(),
      pdfUrl: String(pdfUrl ?? "").trim(),
      status: status === "closed" ? "closed" : "open",
    },
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `add new tender (${String(title ?? "").trim()})`)
  return NextResponse.json(tender, { status: 201 })
}
