import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { logActivity } from "@/lib/activity-log"

export async function GET() {
  const items = await prisma.jawatanKosong.findMany({
    orderBy: { tarikhLuput: "desc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const auth = await requirePermission("jawatan-kosong")
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const { jawatanName, taraf, kekosongan, tarikhLuput, pdfUrl } = body

  if (!jawatanName || typeof jawatanName !== "string" || !jawatanName.trim()) {
    return NextResponse.json({ error: "jawatanName is required" }, { status: 400 })
  }
  if (!pdfUrl || typeof pdfUrl !== "string" || !pdfUrl.trim()) {
    return NextResponse.json({ error: "pdfUrl is required" }, { status: 400 })
  }

  const tarafVal = taraf === "Tetap" ? "Tetap" : "Kontrak"
  const kekosonganVal = Math.max(1, Math.floor(Number(kekosongan) || 1))

  const tarikh = tarikhLuput ? new Date(tarikhLuput) : new Date()
  if (isNaN(tarikh.getTime())) {
    return NextResponse.json({ error: "Invalid tarikhLuput" }, { status: 400 })
  }

  const item = await prisma.jawatanKosong.create({
    data: {
      jawatanName: jawatanName.trim(),
      taraf: tarafVal,
      kekosongan: kekosonganVal,
      tarikhLuput: tarikh,
      pdfUrl: pdfUrl.trim(),
    },
  })
  await updateLastUpdated()
  const userName = auth.session.user.name ?? auth.session.user.email ?? "Unknown"
  await logActivity(auth.session.user.id, userName, `add new jawatan kosong (${jawatanName.trim()})`)
  return NextResponse.json(item, { status: 201 })
}
