"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Download, ExternalLink, Filter, AlertTriangle, CheckCircle2, Phone } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { countAGrades } from "@/lib/count-a-grades"

interface AkalSubmission {
  id: string
  namaParent: string
  noMykadParent: string
  unitBahagian: string | null
  noSpkns: string | null
  alamatRumah: string
  noTel: string
  namaAnak: string
  noMykadAnak: string
  namaSekolah: string
  namaPeperiksaan: string
  tahunPeperiksaan: string
  noAngkaGiliran: string
  keputusanPeperiksaan: string
  pdfUrl: string
  mykadPdfUrl: string | null
  createdAt: string
}

function exportPdf8A(rows: (AkalSubmission & { totalA: number })[]) {
  import("jspdf").then(({ jsPDF }) => {
    import("jspdf-autotable").then((autoTableModule) => {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const autoTable = autoTableModule.default

      const pageWidth = doc.internal.pageSize.getWidth()

      // Header
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("LAPORAN PELAJAR 8A", pageWidth / 2, 16, { align: "center" })
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Anugerah Kecemerlangan Anak LIGS (AKAL)", pageWidth / 2, 22, { align: "center" })

      const today = new Date().toLocaleDateString("ms-MY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      doc.setFontSize(9)
      doc.text(`Tarikh Jana Laporan: ${today}`, pageWidth / 2, 28, { align: "center" })
      doc.text(`Jumlah Pelajar: ${rows.length}`, pageWidth / 2, 33, { align: "center" })

      const withIc = rows.filter((r) => !!r.mykadPdfUrl).length
      const withoutIc = rows.length - withIc

      const tableBody = rows.map((r, i) => [
        i + 1,
        r.namaAnak,
        r.noMykadAnak,
        r.namaSekolah,
        `${r.namaPeperiksaan} ${r.tahunPeperiksaan}`,
        r.keputusanPeperiksaan,
        r.totalA,
        r.mykadPdfUrl ? "Ada" : "Tiada",
        r.mykadPdfUrl ? "-" : r.noTel,
      ])

      autoTable(doc, {
        startY: 38,
        head: [
          [
            "#",
            "Nama Pelajar",
            "No. MyKad Pelajar",
            "Sekolah",
            "Peperiksaan",
            "Keputusan",
            "Jum. A",
            "MyKad",
            "No. Tel\n(jika tiada MyKad)",
          ],
        ],
        body: tableBody,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [30, 58, 95],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
          valign: "middle",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 42 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 45 },
          4: { cellWidth: 30 },
          5: { cellWidth: 40 },
          6: { halign: "center", cellWidth: 16 },
          7: { halign: "center", cellWidth: 18 },
          8: { cellWidth: 34 },
        },
        bodyStyles: {
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 7) {
            const row = rows[data.row.index]
            if (!row?.mykadPdfUrl) {
              data.cell.styles.textColor = [200, 50, 50]
              data.cell.styles.fontStyle = "bold"
            } else {
              data.cell.styles.textColor = [30, 130, 76]
            }
          }
        },
      })

      // Footer summary
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 180
      const summaryY = finalY + 10

      if (summaryY < doc.internal.pageSize.getHeight() - 20) {
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.text("Ringkasan:", 14, summaryY)
        doc.setFont("helvetica", "normal")
        doc.text(`Jumlah pelajar 8A: ${rows.length}`, 14, summaryY + 6)
        doc.text(`MyKad dimuat naik: ${withIc}`, 14, summaryY + 11)
        doc.text(`MyKad belum dimuat naik: ${withoutIc}`, 14, summaryY + 16)
      }

      const filename = `Laporan_Pelajar_8A_${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(filename)
    })
  })
}

export default function AdminAkalPage() {
  const { t } = useLanguage()
  const [submissions, setSubmissions] = useState<AkalSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AkalSubmission | null>(null)
  const [filter8A, setFilter8A] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/akal", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setSubmissions(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error("Failed to load AKAL submissions:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const enriched = useMemo(
    () =>
      submissions.map((s) => ({
        ...s,
        totalA: countAGrades(s.keputusanPeperiksaan),
        hasIc: !!s.mykadPdfUrl,
      })),
    [submissions],
  )

  const filtered = useMemo(
    () => (filter8A ? enriched.filter((s) => s.totalA >= 8) : enriched),
    [enriched, filter8A],
  )

  const stats8A = useMemo(() => {
    const all8A = enriched.filter((s) => s.totalA >= 8)
    return {
      total: all8A.length,
      withIc: all8A.filter((s) => s.hasIc).length,
      withoutIc: all8A.filter((s) => !s.hasIc).length,
    }
  }, [enriched])

  const handleExportPdf = useCallback(() => {
    const rows = enriched.filter((s) => s.totalA >= 8)
    if (rows.length === 0) return
    exportPdf8A(rows)
  }, [enriched])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const selectedEnriched = selected
    ? enriched.find((e) => e.id === selected.id)
    : null

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.akal")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {enriched.length} permohonan &middot; {stats8A.total} pelajar 8A
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filter8A ? "default" : "outline"}
            className="gap-2"
            onClick={() => setFilter8A(!filter8A)}
          >
            <Filter className="h-4 w-4" />
            {filter8A ? "Tapis 8A Aktif" : "Tapis 8A"}
            {stats8A.total > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs font-bold">
                {stats8A.total}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportPdf}
            disabled={stats8A.total === 0}
          >
            <Download className="h-4 w-4" />
            Eksport 8A (PDF)
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <a
              href="/api/akal/export"
              download
              className="inline-flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
              Eksport ke Excel
            </a>
          </Button>
        </div>
      </div>

      {/* 8A Summary Cards */}
      {filter8A && stats8A.total > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Jumlah Pelajar 8A
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats8A.total}
            </p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-950/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                MyKad Dimuat Naik
              </p>
            </div>
            <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">
              {stats8A.withIc}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                MyKad Belum Dimuat Naik
              </p>
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-100">
              {stats8A.withoutIc}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>
            {filter8A
              ? "Tiada pelajar dengan 8A dijumpai."
              : t("akal.admin.noSubmissions")}
          </p>
          {filter8A && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setFilter8A(false)}
            >
              Padam tapisan
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nama Pelajar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Keputusan
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Jum. A
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    MyKad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    No. Tel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tarikh Hantar
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(s)}
                        className="text-left font-medium text-primary hover:underline focus:outline-none focus:underline"
                      >
                        {s.namaAnak}
                      </button>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {s.namaSekolah}
                      </p>
                    </td>
                    <td
                      className="max-w-[220px] px-4 py-3 text-sm text-foreground"
                      title={s.keputusanPeperiksaan}
                    >
                      <span className="line-clamp-2">
                        {s.keputusanPeperiksaan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                          s.totalA >= 8
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.totalA}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.hasIc ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Ada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Tiada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {!s.hasIc ? (
                        <span className="inline-flex items-center gap-1 font-mono text-amber-700 dark:text-amber-300">
                          <Phone className="h-3 w-3" />
                          {s.noTel}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{s.noTel}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-0 bg-white p-0 shadow-2xl sm:rounded-2xl [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:bg-neutral-100 [&>button]:text-neutral-500 [&>button]:hover:bg-neutral-200 [&>button]:hover:text-neutral-700">
          {selected && (
            <>
              <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-6 py-5 sm:rounded-t-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold tracking-tight text-neutral-900">
                    {selected.namaAnak}
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-sm text-neutral-500">
                    {formatDate(selected.createdAt)}
                  </DialogDescription>
                </DialogHeader>
                {/* A-grade badge in modal header */}
                {selectedEnriched && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        selectedEnriched.totalA >= 8
                          ? "bg-green-100 text-green-800"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {selectedEnriched.totalA}A
                    </span>
                    {selectedEnriched.hasIc ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        <CheckCircle2 className="h-3 w-3" /> MyKad dimuat naik
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        <AlertTriangle className="h-3 w-3" /> MyKad belum dimuat
                        naik &mdash; Tel: {selected.noTel}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-6 px-6 py-6">
                {/* Section 1 */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    1. Maklumat Ibubapa / Warga LIGS / Pekebun Kecil
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Nama
                      </p>
                      <p className="text-sm font-medium text-neutral-900">
                        {selected.namaParent}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        No. MyKad
                      </p>
                      <p className="text-sm text-neutral-700 font-mono">
                        {selected.noMykadParent}
                      </p>
                    </div>
                    {selected.unitBahagian && (
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                          Unit/Bahagian
                        </p>
                        <p className="text-sm text-neutral-700">
                          {selected.unitBahagian}
                        </p>
                      </div>
                    )}
                    {selected.noSpkns && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                          No. SPKNS
                        </p>
                        <p className="text-sm text-neutral-700">
                          {selected.noSpkns}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Alamat Rumah
                      </p>
                      <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">
                        {selected.alamatRumah}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        No. Tel
                      </p>
                      <p className="text-sm text-neutral-700 font-mono">
                        {selected.noTel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    2. Maklumat Anak
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Nama
                      </p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {selected.namaAnak}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        No. MyKad
                      </p>
                      <p className="text-sm text-neutral-700 font-mono">
                        {selected.noMykadAnak}
                      </p>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Nama Sekolah
                      </p>
                      <p className="text-sm text-neutral-700">
                        {selected.namaSekolah}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Nama Peperiksaan
                      </p>
                      <p className="text-sm text-neutral-700">
                        {selected.namaPeperiksaan}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Tahun
                      </p>
                      <p className="text-sm text-neutral-700">
                        {selected.tahunPeperiksaan}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        No. Angka Giliran
                      </p>
                      <p className="text-sm text-neutral-700">
                        {selected.noAngkaGiliran}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Keputusan Peperiksaan
                      </p>
                      <p className="text-sm font-medium text-neutral-900">
                        {selected.keputusanPeperiksaan}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PDF attachments */}
                <div className="space-y-3">
                  <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 hover:bg-neutral-50/50">
                    <a
                      href={selected.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-lg p-1 -m-1 transition-colors hover:bg-neutral-100/80"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900">
                          Keputusan peperiksaan (PDF)
                        </p>
                        <p className="text-xs text-neutral-500">
                          Klik untuk muat turun atau pratonton
                        </p>
                      </div>
                      <ExternalLink className="h-5 w-5 shrink-0 text-neutral-400" />
                    </a>
                  </div>
                  <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 hover:bg-neutral-50/50">
                    {selected.mykadPdfUrl ? (
                      <a
                        href={selected.mykadPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 rounded-lg p-1 -m-1 transition-colors hover:bg-neutral-100/80"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-900">
                            Salinan MyKad (PDF)
                          </p>
                          <p className="text-xs text-neutral-500">
                            Klik untuk muat turun atau pratonton
                          </p>
                        </div>
                        <ExternalLink className="h-5 w-5 shrink-0 text-neutral-400" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 rounded-lg bg-amber-50 p-3 text-sm">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                        <div>
                          <p className="font-medium text-amber-800">
                            Salinan MyKad belum dimuat naik
                          </p>
                          <p className="mt-0.5 text-xs text-amber-600">
                            Hubungi pemohon di{" "}
                            <span className="font-mono font-bold">
                              {selected.noTel}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
