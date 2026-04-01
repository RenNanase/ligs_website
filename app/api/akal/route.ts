import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"
import { checkRateLimit } from "@/lib/feedback-rate-limit"

const AKAL_SCHEMA = z.object({
  namaParent: z.string().min(1, "NAMA wajib diisi").max(255),
  noMykadParent: z.string().min(1, "No. MyKad wajib diisi").max(30),
  unitBahagian: z.string().max(255).optional(),
  noSpkns: z.string().max(100).optional(),
  alamatRumah: z.string().min(1, "Alamat rumah wajib diisi").max(1000),
  noTel: z.string().min(1, "No. telefon wajib diisi").max(50),
  namaAnak: z.string().min(1, "NAMA anak wajib diisi").max(255),
  noMykadAnak: z.string().min(1, "No. MyKad anak wajib diisi").max(30),
  namaSekolah: z.string().min(1, "Nama sekolah wajib diisi").max(500),
  namaPeperiksaan: z.string().min(1, "Nama peperiksaan wajib diisi").max(100),
  tahunPeperiksaan: z.string().min(1, "Tahun wajib diisi").max(20),
  noAngkaGiliran: z.string().min(1, "No. angka giliran wajib diisi").max(50),
  keputusanPeperiksaan: z.string().min(1, "Keputusan peperiksaan wajib diisi").max(255),
  pdfUrl: z.string().min(1, "Sila muat naik fail PDF.").max(500),
})

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed, retryAfter } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak penghantaran. Sila cuba lagi kemudian.", retryAfter },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Data tidak sah" }, { status: 400 })
  }

  const parsed = AKAL_SCHEMA.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Sila lengkapkan semua ruangan wajib."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const data = parsed.data

  try {
    const submission = await prisma.akalSubmission.create({
      data: {
        namaParent: data.namaParent.trim(),
        noMykadParent: data.noMykadParent.trim(),
        unitBahagian: data.unitBahagian?.trim() || null,
        noSpkns: data.noSpkns?.trim() || null,
        alamatRumah: data.alamatRumah.trim(),
        noTel: data.noTel.trim(),
        namaAnak: data.namaAnak.trim(),
        noMykadAnak: data.noMykadAnak.trim(),
        namaSekolah: data.namaSekolah.trim(),
        namaPeperiksaan: data.namaPeperiksaan.trim(),
        tahunPeperiksaan: data.tahunPeperiksaan.trim(),
        noAngkaGiliran: data.noAngkaGiliran.trim(),
        keputusanPeperiksaan: data.keputusanPeperiksaan.trim(),
        pdfUrl: data.pdfUrl.trim(),
      },
    })
    return NextResponse.json({ success: true, id: submission.id })
  } catch (dbErr) {
    console.error("AKAL submission DB error:", dbErr)
    return NextResponse.json(
      { error: "Gagal menyimpan borang. Sila cuba lagi." },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const auth = await requirePermission("akal")
  if (!auth.authenticated) return auth.response

  const submissions = await prisma.akalSubmission.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(submissions)
}
