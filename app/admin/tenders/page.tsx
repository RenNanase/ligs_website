"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import type { Tender } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X, FileText, Upload, ToggleLeft, ToggleRight } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"

export default function AdminTendersPage() {
  const { t } = useLanguage()
  const { tenders, createTender, updateTender, deleteTender } = useDataStore()
  const [editing, setEditing] = useState<Tender | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    setIsNew(true)
    setEditing({
      id: "",
      title: "",
      titleMs: "",
      openingDate: new Date().toISOString().split("T")[0],
      closingDate: new Date().toISOString().split("T")[0],
      pdfUrl: "",
      status: "open",
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
      const res = await fetch("/api/tenders/upload", {
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
    if (!editing.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!editing.pdfUrl.trim()) {
      toast.error("Please upload a PDF file")
      return
    }
    if (!editing.openingDate.trim()) {
      toast.error("Opening date is required")
      return
    }
    if (!editing.closingDate.trim()) {
      toast.error("Closing date is required")
      return
    }

    try {
      if (isNew) {
        const { id, ...data } = editing
        await createTender(data)
        toast.success("Tender added")
      } else {
        const { id, ...data } = editing
        await updateTender(editing.id, data)
        toast.success("Tender updated")
      }
      setEditing(null)
      setIsNew(false)
    } catch {
      toast.error("Failed to save")
    }
  }

  const handleToggleStatus = async (item: Tender) => {
    const newStatus = item.status === "open" ? "closed" : "open"
    try {
      await updateTender(item.id, { status: newStatus })
      toast.success(newStatus === "open" ? "Tender opened" : "Tender closed")
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tender?")) return
    try {
      await deleteTender(id)
      setEditing(null)
      setIsNew(false)
      toast.success("Tender deleted")
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.tenders")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {tenders.length} tenders total · {tenders.filter((x) => x.status === "open").length} open
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Plus className="h-4 w-4" />
          {t("admin.add")}
        </Button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {isNew ? "New Tender" : "Edit Tender"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setEditing(null); setIsNew(false) }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title (EN)</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Title (BM)</Label>
              <Input
                value={editing.titleMs}
                onChange={(e) => setEditing({ ...editing, titleMs: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tarikh Buka (Opening Date)</Label>
              <Input
                type="date"
                value={editing.openingDate}
                onChange={(e) => setEditing({ ...editing, openingDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tarikh Tutup (Closing Date)</Label>
              <Input
                type="date"
                value={editing.closingDate}
                onChange={(e) => setEditing({ ...editing, closingDate: e.target.value })}
              />
            </div>
            {!isNew && (
              <div className="space-y-2 md:col-span-2">
                <Label>Status</Label>
                <div className="flex gap-4">
                  {(["open", "closed"] as const).map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="status"
                        checked={editing.status === s}
                        onChange={() => setEditing({ ...editing, status: s })}
                        className="accent-primary"
                      />
                      {t(`tenders.status.${s}`)}
                    </label>
                  ))}
                </div>
              </div>
            )}
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
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              {t("admin.save")}
            </Button>
            <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false) }}>
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        {tenders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No tenders yet.
          </div>
        ) : (
          tenders
            .sort((a, b) => new Date(b.closingDate).getTime() - new Date(a.closingDate).getTime())
            .map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 p-5 ${
                  index < tenders.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent/20 hover:text-accent"
                      title={item.status === "open" ? "Click to close" : "Click to open"}
                    >
                      {item.status === "open" ? (
                        <ToggleRight className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    <span className={`text-xs font-medium ${item.status === "open" ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {t(`tenders.status.${item.status}`)}
                    </span>
                  </div>
                  <p className="font-medium text-card-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Buka: {new Date(item.openingDate).toLocaleDateString("en-MY", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · "}Tutup: {new Date(item.closingDate).toLocaleDateString("en-MY", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm hover:bg-accent/20"
                    >
                      <FileText className="h-4 w-4" />
                      PDF
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditing(item); setIsNew(false) }}
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