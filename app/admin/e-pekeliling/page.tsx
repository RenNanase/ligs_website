"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X, FileText, Upload } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

interface EPekelilingItem {
  id: string
  noPekeliling: string
  noRujukan: string
  tajuk: string
  tarikhDikeluarkan: string
  pdfUrl: string
}

export default function AdminEPekelilingPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<EPekelilingItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EPekelilingItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const loadItems = async (p = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/e-pekeliling?page=${p}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setItems(data.items)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems(page)
  }, [page])

  const handleAdd = () => {
    setIsNew(true)
    setEditing({
      id: "",
      noPekeliling: "",
      noRujukan: "",
      tajuk: "",
      tarikhDikeluarkan: new Date().toISOString().split("T")[0],
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
      const res = await fetch("/api/e-pekeliling/upload", {
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
    if (!editing.noPekeliling.trim()) {
      toast.error("No. Pekeliling is required")
      return
    }
    if (!editing.noRujukan.trim()) {
      toast.error("No. Rujukan is required")
      return
    }
    if (!editing.tajuk.trim()) {
      toast.error("Tajuk is required")
      return
    }
    if (!editing.tarikhDikeluarkan.trim()) {
      toast.error("Tarikh Dikeluarkan is required")
      return
    }
    if (!editing.pdfUrl.trim()) {
      toast.error("Please upload a PDF file")
      return
    }

    try {
      if (isNew) {
        const res = await fetch("/api/e-pekeliling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        })
        if (!res.ok) throw new Error("Failed to create")
        toast.success("Pekeliling added")
      } else {
        const res = await fetch(`/api/e-pekeliling/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        })
        if (!res.ok) throw new Error("Failed to update")
        toast.success("Pekeliling updated")
      }
      setEditing(null)
      setIsNew(false)
      loadItems(page)
    } catch {
      toast.error("Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pekeliling?")) return
    try {
      const res = await fetch(`/api/e-pekeliling/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setEditing(null)
      setIsNew(false)
      toast.success("Pekeliling deleted")
      loadItems(page)
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.ePekeliling")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {total} pekeliling total
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
              {isNew ? "New Pekeliling" : "Edit Pekeliling"}
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
              <Label>No. Pekeliling</Label>
              <Input
                value={editing.noPekeliling}
                onChange={(e) => setEditing({ ...editing, noPekeliling: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>No. Rujukan</Label>
              <Input
                value={editing.noRujukan}
                onChange={(e) => setEditing({ ...editing, noRujukan: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Tajuk</Label>
              <Input
                value={editing.tajuk}
                onChange={(e) => setEditing({ ...editing, tajuk: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tarikh Dikeluarkan</Label>
              <Input
                type="date"
                value={editing.tarikhDikeluarkan}
                onChange={(e) => setEditing({ ...editing, tarikhDikeluarkan: e.target.value })}
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
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              {t("admin.save")}
            </Button>
            <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false) }}>
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Table - same style as tenders */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No pekeliling yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="w-12 border-r border-border px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("jawatanKosong.bil")}
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      No. Pekeliling
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      No. Rujukan
                    </th>
                    <th className="min-w-[12rem] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tajuk
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tarikh Dikeluarkan
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("jawatanKosong.download")}
                    </th>
                    <th className="w-24 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group transition-colors">
                      <td className="border-r border-border whitespace-nowrap px-5 py-4 align-top text-muted-foreground">
                        {(page - 1) * 15 + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-sm font-medium text-foreground">
                        {item.noPekeliling}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-muted-foreground">
                        {item.noRujukan}
                      </td>
                      <td className="min-w-[12rem] max-w-xl px-5 py-4 align-top">
                        <p className="text-sm font-medium text-foreground leading-relaxed break-words">
                          {item.tajuk}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-muted-foreground">
                        {new Date(item.tarikhDikeluarkan).toLocaleDateString("ms-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top">
                        {item.pdfUrl ? (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-accent"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {t("jawatanKosong.downloadPdf")}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top">
                        <div className="flex items-center gap-1">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({total} items)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
