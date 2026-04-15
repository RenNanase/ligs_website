"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X, FileText, Upload } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

interface PenerbitanItem {
  id: string
  title: string
  date: string
  pdfUrl: string
}

export default function AdminPenerbitanPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<PenerbitanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PenerbitanItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const loadItems = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/penerbitan", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleAdd = () => {
    setIsNew(true)
    setEditing({
      id: "",
      title: "",
      date: new Date().toISOString().split("T")[0],
      pdfUrl: "",
    })
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isPdf =
      file.type === "application/pdf" ||
      file.type === "application/x-pdf" ||
      (file.name?.toLowerCase().endsWith(".pdf") && (!file.type || file.type === ""))
    if (!isPdf) {
      toast.error("Please select a PDF file")
      return
    }
    if (file.size > 200 * 1024 * 1024) {
      toast.error("PDF must be 200 MB or smaller")
      return
    }
    e.target.value = ""
    if (!editing) return

    setUploadingPdf(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/penerbitan/upload", {
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
    if (!editing.date.trim()) {
      toast.error("Date is required")
      return
    }
    if (!editing.pdfUrl.trim()) {
      toast.error("Please upload a PDF file")
      return
    }

    try {
      if (isNew) {
        const res = await fetch("/api/penerbitan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editing.title.trim(),
            date: editing.date,
            pdfUrl: editing.pdfUrl,
          }),
        })
        if (!res.ok) throw new Error("Failed to create")
        toast.success("Publication added")
      } else {
        const res = await fetch(`/api/penerbitan/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editing.title.trim(),
            date: editing.date,
            pdfUrl: editing.pdfUrl,
          }),
        })
        if (!res.ok) throw new Error("Failed to update")
        toast.success("Publication updated")
      }
      setEditing(null)
      setIsNew(false)
      loadItems()
    } catch {
      toast.error("Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this publication?")) return
    try {
      const res = await fetch(`/api/penerbitan/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Publication deleted")
      loadItems()
      if (editing?.id === id) setEditing(null)
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.manage.penerbitan")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage publications: upload PDF files (max 10 MB) with title and date
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">Publications</h2>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
              No publications yet. Click &quot;Add New&quot; to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("en-MY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditing({
                          id: item.id,
                          title: item.title,
                          date: item.date.split("T")[0],
                          pdfUrl: item.pdfUrl,
                        })
                      }
                      className="gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editing && (
          <div className="w-full rounded-xl border border-border bg-card p-6 lg:w-96 lg:shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {isNew ? "Add Publication" : "Edit Publication"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="penerbitan-title">Title (required)</Label>
                <Input
                  id="penerbitan-title"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Publication title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="penerbitan-date">Date (required)</Label>
                <Input
                  id="penerbitan-date"
                  type="date"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>PDF File (required, max 200 MB)</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingPdf ? "Uploading..." : "Upload PDF"}
                  </Button>
                  {editing.pdfUrl && (
                    <a
                      href={editing.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View PDF
                    </a>
                  )}
                </div>
                {editing.pdfUrl && (
                  <p className="mt-1 text-xs text-muted-foreground">PDF uploaded</p>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {isNew ? "Add" : "Save"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
