import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as XLSX from "xlsx"
import { checkRateLimit } from "@/lib/feedback-rate-limit"
import { prisma } from "@/lib/prisma"
import type { CustomerSatisfactionSurvey } from "@prisma/client"
import { requireAuth } from "@/lib/auth"

const JANTINA_OPTIONS = ["LELAKI", "PEREMPUAN"] as const
const PEKERJAAN_OPTIONS = [
  "Pekebun getah sepenuh masa",
  "Pekebun getah dan juga bekerja di sektor kerajaan",
  "Pekebun getah dan juga bekerja di sektor swasta",
] as const
const RESPONSE_OPTIONS = ["Bersetuju", "Tidak Bersetuju"] as const

const SURVEY_SCHEMA = z.object({
  jantina: z.enum(JANTINA_OPTIONS),
  umur: z
    .string()
    .min(1, "Umur diperlukan")
    .regex(/^\d{1,2}$/, "Umur mestilah 1-2 digit nombor sahaja (tiada huruf atau aksara lain)"),
  daerah: z.string().min(1, "Daerah diperlukan").max(255),
  pekerjaan: z.enum(PEKERJAAN_OPTIONS),
  tahunPerkhidmatan: z
    .string()
    .min(1, "Tahun perkhidmatan diperlukan")
    .regex(/^\d{4}$/, "Tahun mestilah 4 digit nombor sahaja (cth. 2020)"),
  q1: z.enum(RESPONSE_OPTIONS),
  q2: z.enum(RESPONSE_OPTIONS),
  q3: z.enum(RESPONSE_OPTIONS),
  q4: z.enum(RESPONSE_OPTIONS),
  q5: z.enum(RESPONSE_OPTIONS),
  q6: z.enum(RESPONSE_OPTIONS),
  q7: z.enum(RESPONSE_OPTIONS),
  q8: z.enum(RESPONSE_OPTIONS),
  q9: z.enum(RESPONSE_OPTIONS),
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
  if (!(settings?.kepuasanPelangganOpen ?? true)) {
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
    await prisma.customerSatisfactionSurvey.create({
      data: {
        jantina: data.jantina,
        umur: data.umur.trim().slice(0, 10),
        daerah: data.daerah.trim().slice(0, 255),
        pekerjaan: data.pekerjaan,
        tahunPerkhidmatan: data.tahunPerkhidmatan.trim().slice(0, 20),
        q1: data.q1,
        q2: data.q2,
        q3: data.q3,
        q4: data.q4,
        q5: data.q5,
        q6: data.q6,
        q7: data.q7,
        q8: data.q8,
        q9: data.q9,
        cadanganKomen: data.cadanganKomen.trim().slice(0, 10000),
      },
    })
    return NextResponse.json({ success: true })
  } catch (dbErr) {
    console.error("Survey DB save error:", dbErr)
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
    const count = await prisma.customerSatisfactionSurvey.count()
    return NextResponse.json({ count })
  }

  if (format === "excel") {
    const items = await prisma.customerSatisfactionSurvey.findMany({
      orderBy: { createdAt: "desc" },
    })
    const buffer = toExcel(items)
    const filename = `LIGS-PTN-076-Kepuasan-Pelanggan-${new Date().toISOString().slice(0, 10)}.xlsx`
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  }

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.customerSatisfactionSurvey.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.customerSatisfactionSurvey.count(),
  ])

  return NextResponse.json({
    items: items.map((s: CustomerSatisfactionSurvey) => ({
      id: s.id,
      jantina: s.jantina,
      umur: s.umur,
      daerah: s.daerah,
      pekerjaan: s.pekerjaan,
      tahunPerkhidmatan: s.tahunPerkhidmatan,
      q1: s.q1,
      q2: s.q2,
      q3: s.q3,
      q4: s.q4,
      q5: s.q5,
      q6: s.q6,
      q7: s.q7,
      q8: s.q8,
      q9: s.q9,
      cadanganKomen: s.cadanganKomen,
      createdAt: s.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  })
}

const Q_LABELS = [
  "LIGS menjawab setiap pertanyaan lisan dengan penerangan yang difahami",
  "LIGS menjawab setiap surat saya yang saya hantar",
  "Kakitangan LIGS sangat membantu saya semasa berurusan",
  "Penyelesaian terhadap 'ADUAN' saya disampaikan kepada saya",
  "Kakitangan LIGS yang membeli getah memberi perkhidmatan dengan baik (cekap)",
  "Prosedur penyelenggaraan ladang dikomunikasikan kepada saya",
  "Tumbesaran pokok getah di ladang adalah baik",
  "Latihan yang penorehan yang dijalankan di ladang adalah baik",
  "Bibit getah berpolibeg yang dibekalkan oleh Unit Tapak Semaian berkeadaan baik",
]

function toExcel(items: CustomerSatisfactionSurvey[]): Buffer {
  const headers = [
    "No.",
    "Tarikh",
    "Jantina",
    "Umur",
    "Daerah",
    "Pekerjaan",
    "Tahun Perkhidmatan",
    ...Q_LABELS,
    "Cadangan/Komen",
  ]
  const rows: (string | number)[][] = items.map((s, idx) => [
    idx + 1,
    new Date(s.createdAt).toLocaleString("ms-MY"),
    s.jantina,
    s.umur,
    s.daerah,
    s.pekerjaan,
    s.tahunPerkhidmatan,
    s.q1,
    s.q2,
    s.q3,
    s.q4,
    s.q5,
    s.q6,
    s.q7,
    s.q8,
    s.q9,
    (s.cadanganKomen ?? "").trim(),
  ])
  const data = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws["!cols"] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 12 },
    { wch: 6 },
    { wch: 20 },
    { wch: 45 },
    { wch: 18 },
    ...Q_LABELS.map(() => ({ wch: 18 })),
    { wch: 40 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Kepuasan Pelanggan")
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }))
}
