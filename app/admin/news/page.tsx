"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore, type NewsArticle } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { useState } from "react"

const emptyArticle: Omit<NewsArticle, "id"> = {
  title: "",
  titleMs: "",
  content: "",
  contentMs: "",
  date: new Date().toISOString().split("T")[0],
  image: "",
  category: "",
}

export default function AdminNewsPage() {
  const { t } = useLanguage()
  const { news, createNews, updateNews, deleteNews } = useDataStore()
  const [editing, setEditing] = useState<NewsArticle | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyArticle)

  const handleCreate = async () => {
    await createNews(form)
    setCreating(false)
    setForm(emptyArticle)
  }

  const handleUpdate = async () => {
    if (!editing) return
    await updateNews(editing.id, form)
    setEditing(null)
    setForm(emptyArticle)
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
      image: article.image,
      category: article.category,
    })
  }

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
            <div className="md:col-span-2">
              <ImageUpload
                label="Image"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                aspectRatio="video"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={editing ? handleUpdate : handleCreate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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
                <p className="font-medium text-card-foreground">{article.title}</p>
                <p className="text-sm text-muted-foreground">
                  {article.date} - {article.category}
                </p>
              </div>
              <div className="flex gap-2">
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
