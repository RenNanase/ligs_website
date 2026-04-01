"use client"

import { useState, useEffect } from "react"
import { api, type KelabSukanNewsItem, type KelabSukanNewsInput } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, X, Search, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const INTRO_CHAR_LIMIT = 5000

export function KelabSukanNewsSection() {
  const [items, setItems] = useState<KelabSukanNewsItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<KelabSukanNewsItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<KelabSukanNewsItem | null>(null)
  const [form, setForm] = useState<KelabSukanNewsInput>({
    title: "",
    content: "",
    featuredImage: null,
    datePosted: new Date().toISOString().split("T")[0],
    status: "draft",
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.getKelabSukanNews({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      toast.error("Failed to load news")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page, limit, search, status])

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!form.content.trim()) {
      toast.error("Content is required")
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        await api.createKelabSukanNews(form)
        toast.success("News article created")
      } else if (editing) {
        await api.updateKelabSukanNews(editing.id, form)
        toast.success("News article updated")
      }
      setEditing(null)
      setIsNew(false)
      setForm({
        title: "",
        content: "",
        featuredImage: null,
        datePosted: new Date().toISOString().split("T")[0],
        status: "draft",
      })
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.deleteKelabSukanNews(deleteTarget.id)
      toast.success("News article deleted")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error("Failed to delete")
    }
  }

  const handleToggleStatus = async (item: KelabSukanNewsItem) => {
    try {
      await api.updateKelabSukanNews(item.id, {
        status: item.status === "published" ? "draft" : "published",
      })
      toast.success(item.status === "published" ? "Marked as draft" : "Published")
      load()
    } catch {
      toast.error("Failed to update status")
    }
  }

  const showForm = editing || isNew
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {isNew ? "New News Article" : "Edit News Article"}
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

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Title (max 200 characters)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 200) })}
                placeholder="Article title"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{form.title.length}/200</p>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Write content..."
                minHeight="200px"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.datePosted}
                  onChange={(e) => setForm({ ...form, datePosted: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={form.status === "draft" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm({ ...form, status: "draft" })}
                  >
                    Draft
                  </Button>
                  <Button
                    type="button"
                    variant={form.status === "published" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm({ ...form, status: "published" })}
                  >
                    Published
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <ImageUpload
                value={form.featuredImage ?? ""}
                onChange={(url) => setForm({ ...form, featuredImage: url || null })}
                label="Featured Image (optional, max 5MB JPEG/PNG)"
                aspectRatio="video"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
              <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false) }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                className="pl-9"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          {!showForm && (
            <Button onClick={() => { setIsNew(true); setEditing(null); setForm({
              title: "",
              content: "",
              featuredImage: null,
              datePosted: new Date().toISOString().split("T")[0],
              status: "draft",
            }) }} className="gap-2">
              <Plus className="h-4 w-4" />
              Add News
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No news articles yet. Click &quot;Add News&quot; to create one.
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {item.featuredImage && (
                      <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-border">
                        <img src={item.featuredImage} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.datePosted}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleToggleStatus(item)}
                      title={item.status === "published" ? "Mark as draft" : "Publish"}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => {
                        setEditing(item)
                        setIsNew(false)
                        setForm({
                          title: item.title,
                          content: item.content,
                          featuredImage: item.featuredImage,
                          datePosted: item.datePosted,
                          status: item.status,
                        })
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {total} total · Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete news article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
