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
import { FileText, Download, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"

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
  createdAt: string
}

export default function AdminAkalPage() {
  const { t } = useLanguage()
  const [submissions, setSubmissions] = useState<AkalSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AkalSubmission | null>(null)

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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.akal")}
          </h1>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <a href="/api/akal/export" download className="inline-flex items-center" target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Eksport ke Excel
          </a>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>{t("akal.admin.noSubmissions")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tarikh Permohonan dihantar
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(s)}
                        className="text-left font-medium text-primary hover:underline focus:outline-none focus:underline"
                      >
                        {s.namaAnak}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
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
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
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
              </div>
              <div className="space-y-6 px-6 py-6">
                {/* Section 1 */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    1. Maklumat Ibubapa / Warga LIGS / Pekebun Kecil
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Nama</p>
                      <p className="text-sm font-medium text-neutral-900">{selected.namaParent}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">No. MyKad</p>
                      <p className="text-sm text-neutral-700 font-mono">{selected.noMykadParent}</p>
                    </div>
                    {selected.unitBahagian && (
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Unit/Bahagian</p>
                        <p className="text-sm text-neutral-700">{selected.unitBahagian}</p>
                      </div>
                    )}
                    {selected.noSpkns && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">No. SPKNS</p>
                        <p className="text-sm text-neutral-700">{selected.noSpkns}</p>
                      </div>
                    )}
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Alamat Rumah</p>
                      <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">{selected.alamatRumah}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">No. Tel</p>
                      <p className="text-sm text-neutral-700 font-mono">{selected.noTel}</p>
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
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Nama</p>
                      <p className="text-sm font-semibold text-neutral-900">{selected.namaAnak}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">No. MyKad</p>
                      <p className="text-sm text-neutral-700 font-mono">{selected.noMykadAnak}</p>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Nama Sekolah</p>
                      <p className="text-sm text-neutral-700">{selected.namaSekolah}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Nama Peperiksaan</p>
                      <p className="text-sm text-neutral-700">{selected.namaPeperiksaan}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Tahun</p>
                      <p className="text-sm text-neutral-700">{selected.tahunPeperiksaan}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">No. Angka Giliran</p>
                      <p className="text-sm text-neutral-700">{selected.noAngkaGiliran}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Keputusan Peperiksaan</p>
                      <p className="text-sm font-medium text-neutral-900">{selected.keputusanPeperiksaan}</p>
                    </div>
                  </div>
                </div>

                {/* PDF Attachment */}
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
                      <p className="text-sm font-medium text-neutral-900">{t("akal.admin.viewPdf")}</p>
                      <p className="text-xs text-neutral-500">Klik untuk muat turun atau pratonton</p>
                    </div>
                    <ExternalLink className="h-5 w-5 shrink-0 text-neutral-400" />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
