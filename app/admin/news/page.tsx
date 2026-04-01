"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore, type NewsArticle } from "@/lib/data-store"
import { canPublishNews } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X, Send } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { useSession } from "next-auth/react"
import { useState } from "react"

const MAX_IMAGES = 10

const emptyArticle: Omit<NewsArticle, "id"> = {
  title: "",
  titleMs: "",
  content: "",
  contentMs: "",
  date: new Date().toISOString().split("T")[0],
  images: [],
  category: "",
  status: "draft",
}

export default function AdminNewsPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const { news, createNews, updateNews, deleteNews } = useDataStore()
  const [editing, setEditing] = useState<NewsArticle | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyArticle)
  const [publishing, setPublishing] = useState<string | null>(null)

  const role = (session?.user as { role?: string })?.role ?? "author"
  const canPublish = canPublishNews(role)

  const handleCreate = async () => {
    const images = (form.images ?? []).filter((u) => u && u.trim())
    const status = canPublish && form.status === "published" ? "published" : "draft"
    const dataToSave = { ...form, images, status }
    await createNews(dataToSave)
    setCreating(false)
    setForm(emptyArticle)
  }

  const handleUpdate = async () => {
    if (!editing) return
    const images = (form.images ?? []).filter((u) => u && u.trim())
    const status = canPublish ? (form.status ?? "draft") : "draft"
    const dataToSave = { ...form, images, status }
    await updateNews(editing.id, dataToSave)
    setEditing(null)
    setForm(emptyArticle)
  }

  const handlePublish = async (article: NewsArticle) => {
    setPublishing(article.id)
    try {
      await updateNews(article.id, { status: "published" })
    } finally {
      setPublishing(null)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteNews(id)
  }

  const startEdit = (article: NewsArticle) => {
    setEditing(article)
    setCreating(false)
    setForm({
      title: article.title,
      titleMs: article.titleMs,
      content: article.content,
      contentMs: article.contentMs,
      date: article.date,
      images: article.images ?? [],
      category: article.category,
      status: (article.status as "draft" | "published") ?? "draft",
    })
  }

  const setImageAtIndex = (index: number, url: string) => {
    setForm((prev) => {
      const current = prev.images ?? []
      const next = [...current]
      // Ensure array is long enough for the index (handles default empty slot case)
      while (next.length <= index) next.push("")
      next[index] = url
      return { ...prev, images: next }
    })
  }

  const removeImageAt = (index: number) => {
    setForm((prev) => {
      const next = (prev.images ?? []).filter((_, i) => i !== index)
      return { ...prev, images: next }
    })
  }

  const addImageSlot = () => {
    setForm((prev) => {
      const current = prev.images ?? []
      if (current.length >= MAX_IMAGES) return prev
      return { ...prev, images: [...current, ""] }
    })
  }

  // Ensure at least one image slot when creating
  const imageSlots = (form.images ?? []).length > 0 ? form.images! : [""]

  const cancelForm = () => {
    setEditing(null)
    setCreating(false)
    setForm(emptyArticle)
  }

  const showForm = creating || editing

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.news")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {news.length} articles
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setCreating(true)
              setEditing(null)
              setForm(emptyArticle)
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("admin.add")}
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {editing ? t("admin.edit") : t("admin.add")} - News Article
            </h2>
            <Button variant="ghost" size="sm" onClick={cancelForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.title")} (EN)
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.title")} (BM)
              </Label>
              <Input
                value={form.titleMs}
                onChange={(e) => setForm({ ...form, titleMs: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.content")} (EN)
              </Label>
              <Textarea
                rows={4}
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                className="bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.content")} (BM)
              </Label>
              <Textarea
                rows={4}
                value={form.contentMs}
                onChange={(e) =>
                  setForm({ ...form, contentMs: e.target.value })
                }
                className="bg-background"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                Date
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                Category
              </Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="bg-background"
              />
            </div>
            {canPublish && (
              <div>
                <Label className="mb-2 block text-sm font-medium text-card-foreground">Status</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={(form.status ?? "draft") === "draft"}
                      onChange={() => setForm((f) => ({ ...f, status: "draft" }))}
                      className="rounded border-gray-300"
                    />
                    Draft
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={(form.status ?? "draft") === "published"}
                      onChange={() => setForm((f) => ({ ...f, status: "published" }))}
                      className="rounded border-gray-300"
                    />
                    Published
                  </label>
                </div>
              </div>
            )}
            <div className="md:col-span-2 space-y-4">
              <Label className="block text-sm font-medium text-card-foreground">
                Images (up to {MAX_IMAGES})
              </Label>
              {imageSlots.map((url, index) => (
                <div key={`img-${index}-${url ? url.slice(-12) : "empty"}`} className="flex items-start gap-3">
                  <ImageUpload
                    label={`Image ${index + 1}`}
                    value={url}
                    onChange={(newUrl) => setImageAtIndex(index, newUrl)}
                    aspectRatio="video"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-8 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => removeImageAt(index)}
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {imageSlots.length < MAX_IMAGES && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageSlot}
                  className="gap-2 border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  Add image
                </Button>
              )}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={editing ? handleUpdate : handleCreate}
              className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {t("admin.save")}
            </Button>
            <Button variant="outline" onClick={cancelForm}>
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* News Table */}
      <div className="rounded-xl border border-border bg-card">
        {news.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No news articles yet.
          </div>
        ) : (
          news.map((article, index) => (
            <div
              key={article.id}
              className={`flex items-center justify-between p-4 ${
                index < news.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-card-foreground">{article.title}</p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      (article.status ?? "published") === "draft"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {(article.status ?? "published") === "draft" ? "Draft" : "Published"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {article.date} - {article.category}
                </p>
              </div>
              <div className="flex gap-2">
                {canPublish &&
                  (article.status ?? "published") === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublish(article)}
                      disabled={!!publishing}
                      className="gap-1"
                    >
                      <Send className="h-4 w-4" />
                      Publish
                    </Button>
                  )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(article)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(article.id)}
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
