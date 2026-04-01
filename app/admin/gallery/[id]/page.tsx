"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiImageUpload } from "@/components/admin/multi-image-upload"
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
import { ArrowLeft, ChevronUp, ChevronDown, Trash2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"

interface GalleryImage {
  id: string
  url: string
  sortOrder: number
}

interface GalleryEvent {
  id: string
  title: string
  date: string
  images: GalleryImage[]
}

export default function AdminGalleryEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [event, setEvent] = useState<GalleryEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", date: "" })
  const [images, setImages] = useState<GalleryImage[]>([])

  useEffect(() => {
    fetch(`/api/gallery/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setEvent(data)
        setForm({ title: data.title, date: data.date?.split("T")[0] || "" })
        setImages(data.images || [])
      })
      .catch(() => router.push("/admin/gallery"))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/gallery/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), date: form.date }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save")
      }
      toast.success("Event updated")
      setEvent((prev) => (prev ? { ...prev, ...form } : null))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reordered = [...images]
    const [removed] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, removed)
    const imageIds = reordered.map((i) => i.id)
    setImages(reordered.map((i, idx) => ({ ...i, sortOrder: idx })))

    try {
      const res = await fetch(`/api/gallery/events/${id}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds }),
      })
      if (!res.ok) throw new Error("Failed to reorder")
      toast.success("Order updated")
    } catch {
      setImages(images)
      toast.error("Failed to reorder")
    }
  }

  const handleAddImages = async (urls: string[]) => {
    try {
      const res = await fetch(`/api/gallery/events/${id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add")
      setImages(data.images || [])
      toast.success("Images added")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add images")
    }
  }

  const handleDeleteImage = async () => {
    if (!deleteImageId) return
    try {
      const res = await fetch(`/api/gallery/events/${id}/images/${deleteImageId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      setImages((prev) => prev.filter((i) => i.id !== deleteImageId))
      setDeleteImageId(null)
      toast.success("Image removed")
    } catch {
      toast.error("Failed to delete image")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    )
  }

  if (!event) return null

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link
          href="/admin/gallery"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">Edit Event</h1>
        <p className="mt-1 text-muted-foreground">
          Update event details and manage images. Drag to reorder.
        </p>
      </div>

      <div className="max-w-2xl space-y-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold text-foreground">Event Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold text-foreground">Images ({images.length}/20)</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Add more images or reorder existing ones. Click the arrows to move, or delete to remove.
          </p>

          <MultiImageUpload
            value={[]}
            onChange={(urls) => urls.length > 0 && handleAddImages(urls)}
            uploadPath="/api/gallery/upload"
            maxFiles={20 - images.length}
          />

          {images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
                >
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleReorder(index, index - 1)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent/20 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleReorder(index, index + 1)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent/20 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="aspect-square overflow-hidden rounded border bg-muted">
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteImageId(img.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteImageId} onOpenChange={(o) => !o && setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this image from the event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
