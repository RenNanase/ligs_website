"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Upload, X } from "lucide-react"

const DECLARATION =
  "Saya mengaku bahawa semua maklumat yang diberikan adalah benar dan tepat. Sekiranya didapati terdapat sebarang maklumat yang tidak benar atau mengelirukan, permohonan ini akan terbatal serta-merta."

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10 MB

function validatePdfFile(file: File): string | null {
  if (file.type !== "application/pdf") {
    return "Hanya fail PDF dibenarkan."
  }
  if (file.size > MAX_PDF_SIZE) {
    return "Saiz fail maksimum 10 MB."
  }
  return null
}

export function AkalForm() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    namaParent: "",
    noMykadParent: "",
    unitBahagian: "",
    noSpkns: "",
    alamatRumah: "",
    noTel: "",
    namaAnak: "",
    noMykadAnak: "",
    namaSekolah: "",
    namaPeperiksaan: "",
    tahunPeperiksaan: "",
    noAngkaGiliran: "",
    keputusanPeperiksaan: "",
  })
  const [spmPdfFile, setSpmPdfFile] = useState<File | null>(null)
  const [mykadPdfFile, setMykadPdfFile] = useState<File | null>(null)
  const [spmPdfError, setSpmPdfError] = useState<string | null>(null)
  const [mykadPdfError, setMykadPdfError] = useState<string | null>(null)

  const handleSpmFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSpmPdfError(null)
    if (!file) {
      setSpmPdfFile(null)
      return
    }
    const err = validatePdfFile(file)
    if (err) {
      setSpmPdfError(err)
      setSpmPdfFile(null)
      return
    }
    setSpmPdfFile(file)
  }

  const handleMykadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setMykadPdfError(null)
    if (!file) {
      setMykadPdfFile(null)
      return
    }
    const err = validatePdfFile(file)
    if (err) {
      setMykadPdfError(err)
      setMykadPdfFile(null)
      return
    }
    setMykadPdfFile(file)
  }

  const uploadPdf = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/akal/upload", {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error ?? "Gagal memuat naik fail PDF.")
    }
    const { url } = await res.json()
    return url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const required = [
      "namaParent",
      "noMykadParent",
      "alamatRumah",
      "noTel",
      "namaAnak",
      "noMykadAnak",
      "namaSekolah",
      "namaPeperiksaan",
      "tahunPeperiksaan",
      "noAngkaGiliran",
      "keputusanPeperiksaan",
    ] as const

    for (const key of required) {
      if (!form[key]?.trim()) {
        setError("Sila isi semua ruangan yang wajib.")
        return
      }
    }

    if (!spmPdfFile) {
      setSpmPdfError("Sila lampirkan fail PDF keputusan peperiksaan.")
      setError("Sila lampirkan fail PDF keputusan peperiksaan.")
      return
    }
    if (!mykadPdfFile) {
      setMykadPdfError("Sila lampirkan fail PDF salinan MyKad.")
      setError("Sila lampirkan fail PDF salinan MyKad.")
      return
    }

    setSubmitting(true)
    try {
      const [pdfUrl, mykadPdfUrl] = await Promise.all([
        uploadPdf(spmPdfFile),
        uploadPdf(mykadPdfFile),
      ])
      const res = await fetch("/api/akal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pdfUrl, mykadPdfUrl }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error ?? "Gagal menghantar borang.")
      }
      setSuccess(true)
      setForm({
        namaParent: "",
        noMykadParent: "",
        unitBahagian: "",
        noSpkns: "",
        alamatRumah: "",
        noTel: "",
        namaAnak: "",
        noMykadAnak: "",
        namaSekolah: "",
        namaPeperiksaan: "",
        tahunPeperiksaan: "",
        noAngkaGiliran: "",
        keputusanPeperiksaan: "",
      })
      setSpmPdfFile(null)
      setMykadPdfFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghantar borang.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/30">
        <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-300">
          Permohonan berjaya dihantar
        </h3>
        <p className="mb-6 text-sm text-green-700 dark:text-green-400">
          Terima kasih. Permohonan anda telah diterima. Sila tunggu untuk makluman selanjutnya.
        </p>
        <Button
          variant="outline"
          onClick={() => setSuccess(false)}
          className="border-green-300 bg-white text-green-800 hover:bg-green-50 dark:border-green-700 dark:bg-green-950/50 dark:text-green-200 dark:hover:bg-green-950/70"
        >
          Hantar permohonan lain
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1 */}
      <div className="space-y-4">
        <h3 className="border-b border-border pb-2 font-semibold text-card-foreground">
          1. MAKLUMAT IBUBAPA/WARGA LIGS/PEKEBUN KECIL
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="namaParent">NAMA *</Label>
            <Input
              id="namaParent"
              value={form.namaParent}
              onChange={(e) => setForm({ ...form, namaParent: e.target.value })}
              placeholder="Nama penuh"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noMykadParent">NO. MYKAD *</Label>
            <Input
              id="noMykadParent"
              value={form.noMykadParent}
              onChange={(e) => setForm({ ...form, noMykadParent: e.target.value })}
              placeholder="e.g. 800101-01-1234"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitBahagian">UNIT/BAHAGIAN (*Untuk Pegawai/Kakitangan LIGS)</Label>
            <Input
              id="unitBahagian"
              value={form.unitBahagian}
              onChange={(e) => setForm({ ...form, unitBahagian: e.target.value })}
              placeholder="Unit atau bahagian"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noSpkns">NO. SPKNS (*Untuk Pekebun Kecil Getah)</Label>
            <Input
              id="noSpkns"
              value={form.noSpkns}
              onChange={(e) => setForm({ ...form, noSpkns: e.target.value })}
              placeholder="No. SPKNS"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="alamatRumah">ALAMAT RUMAH *</Label>
          <Textarea
            id="alamatRumah"
            value={form.alamatRumah}
            onChange={(e) => setForm({ ...form, alamatRumah: e.target.value })}
            placeholder="Alamat penuh (2 baris dibenarkan)"
            rows={3}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="noTel">NO. TEL *</Label>
          <Input
            id="noTel"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.noTel}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "")
              setForm({ ...form, noTel: val })
            }}
            placeholder="e.g. 0123456789"
            required
          />
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-4">
        <h3 className="border-b border-border pb-2 font-semibold text-card-foreground">
          2. MAKLUMAT ANAK
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="namaAnak">NAMA *</Label>
            <Input
              id="namaAnak"
              value={form.namaAnak}
              onChange={(e) => setForm({ ...form, namaAnak: e.target.value })}
              placeholder="Nama anak"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noMykadAnak">NO. MYKAD *</Label>
            <Input
              id="noMykadAnak"
              value={form.noMykadAnak}
              onChange={(e) => setForm({ ...form, noMykadAnak: e.target.value })}
              placeholder="e.g. 070101-01-1234"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="namaSekolah">NAMA SEKOLAH *</Label>
            <Input
              id="namaSekolah"
              value={form.namaSekolah}
              onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
              placeholder="Nama sekolah"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaPeperiksaan">NAMA PEPERIKSAAN *</Label>
            <Input
              id="namaPeperiksaan"
              value={form.namaPeperiksaan}
              onChange={(e) => setForm({ ...form, namaPeperiksaan: e.target.value })}
              placeholder="e.g. SPM"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tahunPeperiksaan">TAHUN *</Label>
            <Input
              id="tahunPeperiksaan"
              value={form.tahunPeperiksaan}
              onChange={(e) => setForm({ ...form, tahunPeperiksaan: e.target.value })}
              placeholder="e.g. 2025"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noAngkaGiliran">NO. ANGKA GILIRAN *</Label>
            <Input
              id="noAngkaGiliran"
              value={form.noAngkaGiliran}
              onChange={(e) => setForm({ ...form, noAngkaGiliran: e.target.value })}
              placeholder="No. angka giliran"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keputusanPeperiksaan">KEPUTUSAN PEPERIKSAAN *</Label>
            <Input
              id="keputusanPeperiksaan"
              value={form.keputusanPeperiksaan}
              onChange={(e) => setForm({ ...form, keputusanPeperiksaan: e.target.value })}
              placeholder="e.g. 8A 2B"
              required
            />
          </div>
        </div>
      </div>

      {/* PDF uploads */}
      <div className="space-y-6">
        <h3 className="border-b border-border pb-2 font-semibold text-card-foreground">
          3. DOKUMEN SOKONGAN (PDF)
        </h3>

        <div className="space-y-2">
          <Label htmlFor="spm-pdf">Keputusan peperiksaan / slip SPM (PDF, max 10MB) *</Label>
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="spm-pdf"
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              Pilih fail PDF
              <input
                id="spm-pdf"
                type="file"
                accept="application/pdf"
                onChange={handleSpmFileChange}
                className="hidden"
              />
            </label>
            {spmPdfFile && (
              <span className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary">
                <FileText className="h-4 w-4" />
                {spmPdfFile.name}
                <button
                  type="button"
                  onClick={() => {
                    setSpmPdfFile(null)
                    setSpmPdfError(null)
                  }}
                  className="rounded p-0.5 hover:bg-primary/20"
                  aria-label="Buang fail"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
          </div>
          {spmPdfError && <p className="text-sm text-destructive">{spmPdfError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mykad-pdf">Salinan MyKad (PDF, max 10MB) *</Label>
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="mykad-pdf"
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              Pilih fail PDF
              <input
                id="mykad-pdf"
                type="file"
                accept="application/pdf"
                onChange={handleMykadFileChange}
                className="hidden"
              />
            </label>
            {mykadPdfFile && (
              <span className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary">
                <FileText className="h-4 w-4" />
                {mykadPdfFile.name}
                <button
                  type="button"
                  onClick={() => {
                    setMykadPdfFile(null)
                    setMykadPdfError(null)
                  }}
                  className="rounded p-0.5 hover:bg-primary/20"
                  aria-label="Buang fail"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
          </div>
          {mykadPdfError && <p className="text-sm text-destructive">{mykadPdfError}</p>}
        </div>
      </div>

      {/* Declaration */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm italic text-muted-foreground">{DECLARATION}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        {submitting ? "Menghantar..." : "Hantar Permohonan"}
      </Button>
    </form>
  )
}
