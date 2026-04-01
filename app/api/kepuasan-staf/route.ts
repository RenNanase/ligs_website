import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as XLSX from "xlsx"
import { checkRateLimit } from "@/lib/feedback-rate-limit"
import { prisma } from "@/lib/prisma"
import type { StaffSatisfactionSurvey } from "@prisma/client"
import { requireAuth } from "@/lib/auth"

const JANTINA_OPTIONS = ["LELAKI", "PEREMPUAN"] as const
const TAHUN_KHIDMAT_OPTIONS = [
  "Kurang 3 tahun",
  "3 tahun hingga 5 tahun",
  "5 tahun hingga 10 tahun",
  "10 tahun hingga 15 tahun",
  "15 tahun dan ke atas",
] as const
const RESPONSE_OPTIONS = ["Bersetuju", "Tidak Bersetuju"] as const

const SURVEY_SCHEMA = z.object({
  jantina: z.enum(JANTINA_OPTIONS),
  daerah: z.string().min(1, "Daerah diperlukan").max(255),
  bahagianUnit: z.string().min(1, "Bahagian/Unit diperlukan").max(255),
  tahunKhidmat: z.enum(TAHUN_KHIDMAT_OPTIONS),
  q1: z.enum(RESPONSE_OPTIONS),
  q2: z.enum(RESPONSE_OPTIONS),
  q3: z.enum(RESPONSE_OPTIONS),
  q4: z.enum(RESPONSE_OPTIONS),
  q5: z.enum(RESPONSE_OPTIONS),
  q6: z.enum(RESPONSE_OPTIONS),
  q7: z.enum(RESPONSE_OPTIONS),
  q8: z.enum(RESPONSE_OPTIONS),
  cadanganKomen: z.string().min(1, "Cadangan/Komen diperlukan").max(2000),
})

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

export async function POST(req: NextRequest) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } })
  if (!(settings?.kepuasanStafOpen ?? true)) {
    return NextResponse.json(
      { error: "Borang kajian ini tidak lagi menerima penghantaran." },
      { status: 403 }
    )
  }

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

  const parsed = SURVEY_SCHEMA.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Pengesahan gagal"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const data = parsed.data

  try {
    await prisma.staffSatisfactionSurvey.create({
      data: {
        jantina: data.jantina,
        daerah: data.daerah.trim().slice(0, 255),
        bahagianUnit: data.bahagianUnit.trim().slice(0, 255),
        tahunKhidmat: data.tahunKhidmat,
        q1: data.q1,
        q2: data.q2,
        q3: data.q3,
        q4: data.q4,
        q5: data.q5,
        q6: data.q6,
        q7: data.q7,
        q8: data.q8,
        cadanganKomen: data.cadanganKomen.trim().slice(0, 10000),
      },
    })
    return NextResponse.json({ success: true })
  } catch (dbErr) {
    console.error("Staff survey DB save error:", dbErr)
    return NextResponse.json(
      { error: "Gagal menyimpan borang. Sila cuba lagi kemudian." },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format")
  const countOnly = searchParams.get("count") === "1"

  if (countOnly) {
    const count = await prisma.staffSatisfactionSurvey.count()
    return NextResponse.json({ count })
  }

  if (format === "excel") {
    const items = await prisma.staffSatisfactionSurvey.findMany({
      orderBy: { createdAt: "desc" },
    })
    const buffer = toExcel(items)
    const filename = `LIGS-PTN-077-Kepuasan-Staf-${new Date().toISOString().slice(0, 10)}.xlsx`
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}

const Q_LABELS = [
  "Halatuju LIGS jelas",
  "Pelaksanaan MS ISO 9001:2015 telah memberi impak yang positif kepada tugasan seharian saya",
  "Saya merasa gembira bekerja di dalam organisasi ini",
  "Pekerjaan saya sekarang memberi peluang untuk membangunkan kerjaya",
  "Semangat kerjasama dikalangan kakitangan adalah baik",
  "Pegawai atasan saya sentiasa membimbing dalam melaksanakan kerja",
  "Kursus-kursus yang dianjurkan oleh ibu pejabat dapat digunapakai dalam menjalankan tugasan harian",
  "Pegawai Atasan profesional dalam menilai hasil kerja kakitangan di bawah jagaannya",
]

function toExcel(items: StaffSatisfactionSurvey[]): Buffer {
  const headers = [
    "No.",
    "Tarikh",
    "Jantina",
    "Daerah",
    "Bahagian/Unit penempatan kerja",
    "Telah berkhidmat dengan LIGS selama",
    ...Q_LABELS,
    "Cadangan/Komen",
  ]
  const rows: (string | number)[][] = items.map((s, idx) => [
    idx + 1,
    new Date(s.createdAt).toLocaleString("ms-MY"),
    s.jantina,
    s.daerah,
    s.bahagianUnit,
    s.tahunKhidmat,
    s.q1,
    s.q2,
    s.q3,
    s.q4,
    s.q5,
    s.q6,
    s.q7,
    s.q8,
    (s.cadanganKomen ?? "").trim(),
  ])
  const data = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws["!cols"] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 12 },
    { wch: 20 },
    { wch: 30 },
    { wch: 28 },
    ...Q_LABELS.map(() => ({ wch: 18 })),
    { wch: 40 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Kepuasan Staf")
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }))
}
