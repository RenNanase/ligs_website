"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X, FileText, Upload, ExternalLink } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { toast } from "sonner"

const TARAF_OPTIONS = ["Kontrak", "Tetap"] as const

interface JawatanKosongItem {
  id: string
  jawatanName: string
  taraf: string
  kekosongan: number
  tarikhLuput: string
  pdfUrl: string
}

export default function AdminJawatanKosongPage() {
  const [items, setItems] = useState<JawatanKosongItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<JawatanKosongItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    fetch("/api/jawatan-kosong")
      .then((res) => res.json())
      .then((data) => {
        setItems(
          Array.isArray(data)
            ? data.map((d: { tarikhLuput: string; taraf?: string; kekosongan?: number }) => ({
                ...d,
                taraf: d.taraf ?? "Kontrak",
                kekosongan: typeof d.kekosongan === "number" ? d.kekosongan : 1,
                tarikhLuput: d.tarikhLuput?.slice(0, 10) ?? "",
              }))
            : []
        )
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = () => {
    setIsNew(true)
    setEditing({
      id: "",
      jawatanName: "",
      taraf: "Kontrak",
      kekosongan: 1,
      tarikhLuput: new Date().toISOString().slice(0, 10),
      pdfUrl: "",
    })
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== "application/pdf") {
      toast.error("Please select a PDF file")
      return
    }
    e.target.value = ""
    if (!editing) return

    setUploadingPdf(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/jawatan-kosong/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Upload failed")
      }
      const { url } = await res.json()
      setEditing({ ...editing, pdfUrl: url })
      toast.success("PDF uploaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploadingPdf(false)
    }
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.jawatanName.trim()) {
      toast.error("Jawatan name is required")
      return
    }
    if (!editing.pdfUrl.trim()) {
      toast.error("Please upload a PDF file")
      return
    }

    setSaving(true)
    try {
      if (isNew) {
        const res = await fetch("/api/jawatan-kosong", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jawatanName: editing.jawatanName.trim(),
            taraf: editing.taraf,
            kekosongan: editing.kekosongan,
            tarikhLuput: editing.tarikhLuput,
            pdfUrl: editing.pdfUrl.trim(),
          }),
        })
        if (!res.ok) throw new Error("Failed to create")
        const created = await res.json()
        setItems((prev) => [
          { ...created, tarikhLuput: created.tarikhLuput?.slice(0, 10) ?? "" },
          ...prev,
        ])
        toast.success("Job vacancy added")
      } else {
        const res = await fetch(`/api/jawatan-kosong/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jawatanName: editing.jawatanName.trim(),
            taraf: editing.taraf,
            kekosongan: editing.kekosongan,
            tarikhLuput: editing.tarikhLuput,
            pdfUrl: editing.pdfUrl.trim(),
          }),
        })
        if (!res.ok) throw new Error("Failed to update")
        const updated = await res.json()
        setItems((prev) =>
          prev.map((i) =>
            i.id === editing.id
              ? {
                  ...updated,
                  taraf: updated.taraf ?? "Kontrak",
                  kekosongan: updated.kekosongan ?? 1,
                  tarikhLuput: updated.tarikhLuput?.slice(0, 10) ?? "",
                }
              : i
          )
        )
        toast.success("Job vacancy updated")
      }
      setEditing(null)
      setIsNew(false)
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job vacancy?")) return
    setSaving(true)
    try {
      const res = await fetch(`/api/jawatan-kosong/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setItems((prev) => prev.filter((i) => i.id !== id))
      setEditing(null)
      setIsNew(false)
      toast.success("Job vacancy deleted")
    } catch {
      toast.error("Failed to delete")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Jawatan Kosong (Job Vacancies)
          </h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} vacancy/vacancies
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/jawatan-kosong" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Page
            </Button>
          </Link>
          <Button
            onClick={handleAdd}
            className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Vacancy
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {isNew ? "New Job Vacancy" : "Edit Job Vacancy"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(null)
                setIsNew(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jawatanName">Jawatan Name</Label>
              <Input
                id="jawatanName"
                value={editing.jawatanName}
                onChange={(e) => setEditing({ ...editing, jawatanName: e.target.value })}
                placeholder="e.g. Pegawai Pentadbiran"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taraf">Taraf</Label>
              <select
                id="taraf"
                value={editing.taraf}
                onChange={(e) => setEditing({ ...editing, taraf: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TARAF_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kekosongan">Kekosongan</Label>
              <Input
                id="kekosongan"
                type="number"
                min={1}
                value={editing.kekosongan}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    kekosongan: Math.max(1, parseInt(e.target.value, 10) || 1),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tarikhLuput">Tarikh Luput (Closing Date)</Label>
              <Input
                id="tarikhLuput"
                type="date"
                value={editing.tarikhLuput}
                onChange={(e) => setEditing({ ...editing, tarikhLuput: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>PDF File</Label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={uploadingPdf}
                  onClick={() => pdfInputRef.current?.click()}
                >
                  {uploadingPdf ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {editing.pdfUrl ? "Replace PDF" : "Upload PDF"}
                    </>
                  )}
                </Button>
                {editing.pdfUrl && (
                  <a
                    href={editing.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View PDF
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null)
                setIsNew(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No job vacancies yet. Click &quot;Add Vacancy&quot; to add one.
          </div>
        ) : (
          [...items]
            .sort((a, b) => new Date(b.tarikhLuput).getTime() - new Date(a.tarikhLuput).getTime())
            .map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 p-5 ${
                  index < items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-card-foreground">{item.jawatanName}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.taraf} &middot; {item.kekosongan} vacancy
                    {item.kekosongan !== 1 ? "ies" : ""} &middot; Closing:{" "}
                    {new Date(item.tarikhLuput).toLocaleDateString("en-MY", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm hover:bg-accent/20"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(item)
                      setIsNew(false)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
        )}
      </div>
    </AdminLayout>
  )
}
