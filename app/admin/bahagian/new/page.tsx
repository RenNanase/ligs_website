"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export default function AdminBahagianNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    content: "<p></p>",
    featuredImage: "",
    membersImage: "",
    orderIndex: 0,
    status: "draft" as "draft" | "published",
    metaTitle: "",
    metaDescription: "",
  })

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: f.slug || slugify(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/bahagian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          shortDescription: form.shortDescription || null,
          featuredImage: form.featuredImage || null,
          membersImage: form.membersImage || null,
          metaTitle: form.metaTitle || null,
          metaDescription: form.metaDescription || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast.success("Bahagian created successfully")
      router.push("/admin/bahagian")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/bahagian">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">Add New Bahagian</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label>Bahagian Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Bahagian Pengurus Besar"
                  required
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="bahagian-pengurus-besar"
                />
              </div>
              <div>
                <Label>Order Index</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.orderIndex}
                  onChange={(e) => setForm((f) => ({ ...f, orderIndex: parseInt(e.target.value, 10) || 0 }))}
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">Featured Image</h2>
            <ImageUpload
              value={form.featuredImage}
              onChange={(url) => setForm((f) => ({ ...f, featuredImage: url }))}
              uploadPath="/api/bahagian/upload"
              aspectRatio="banner"
              maxSize={20 * 1024 * 1024}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">Members Image</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Upload full organizational structure image
            </p>
            <ImageUpload
              value={form.membersImage}
              onChange={(url) => setForm((f) => ({ ...f, membersImage: url }))}
              uploadPath="/api/bahagian/upload"
              aspectRatio="video"
              maxSize={20 * 1024 * 1024}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">Content</h2>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              minHeight="300px"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">Short Description</h2>
            <textarea
              value={form.shortDescription}
              onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
              placeholder="Brief description for Carta Organisasi cards..."
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">SEO (Optional)</h2>
            <div className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                  placeholder="Page title for search engines"
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  placeholder="Brief description for search engines"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
            <Link href="/admin/bahagian">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-foreground">Preview</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>URL: /bahagian/{form.slug || "..."}</p>
              {form.featuredImage && (
                <div className="mt-2 overflow-hidden rounded-lg">
                  <img src={form.featuredImage} alt="" className="h-24 w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
