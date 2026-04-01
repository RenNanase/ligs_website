import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"

export async function GET() {
  const auth = await requirePermission("akal")
  if (!auth.authenticated) return auth.response

  const submissions = await prisma.akalSubmission.findMany({
    orderBy: { createdAt: "desc" },
  })

  const rows = submissions.map((s) => ({
    "Tarikh Hantar": s.createdAt ? new Date(s.createdAt).toLocaleString("ms-MY") : "",
    "Nama (IBU BAPA/WARGA)": s.namaParent,
    "No. MyKad": s.noMykadParent,
    "Unit/Bahagian": s.unitBahagian || "",
    "No. SPKNS": s.noSpkns || "",
    "Alamat Rumah": s.alamatRumah,
    "No. Tel": s.noTel,
    "Nama Anak": s.namaAnak,
    "No. MyKad Anak": s.noMykadAnak,
    "Nama Sekolah": s.namaSekolah,
    "Nama Peperiksaan": s.namaPeperiksaan,
    "Tahun": s.tahunPeperiksaan,
    "No. Angka Giliran": s.noAngkaGiliran,
    "Keputusan Peperiksaan": s.keputusanPeperiksaan,
    "Lampiran PDF": s.pdfUrl,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const colWidths = [
    { wch: 18 },
    { wch: 25 },
    { wch: 16 },
    { wch: 25 },
    { wch: 15 },
    { wch: 40 },
    { wch: 14 },
    { wch: 25 },
    { wch: 16 },
    { wch: 30 },
    { wch: 20 },
    { wch: 8 },
    { wch: 18 },
    { wch: 25 },
    { wch: 35 },
  ]
  ws["!cols"] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "AKAL Submissions")
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  const filename = `AKAL_Submissions_${new Date().toISOString().slice(0, 10)}.xlsx`
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
