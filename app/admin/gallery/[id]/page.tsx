"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiImageUpload } from "@/components/admin/multi-image-upload"
import { LazyImage } from "@/components/gallery/lazy-image"
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
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

const PAGE_SIZE = 48

interface GalleryImage {
  id: string
  url: string
  sortOrder: number
}

interface GalleryEventMeta {
  id: string
  title: string
  date: string
  imageCount: number
}

export default function AdminGalleryEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [event, setEvent] = useState<GalleryEventMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", date: "" })
  const [images, setImages] = useState<GalleryImage[]>([])
  const [imagePage, setImagePage] = useState(1)
  const [imageTotal, setImageTotal] = useState(0)
  const [imageTotalPages, setImageTotalPages] = useState(1)
  const [loadingImages, setLoadingImages] = useState(true)
  const [swapBusy, setSwapBusy] = useState<string | null>(null)

  const loadMeta = useCallback(() => {
    return fetch(`/api/gallery/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data: GalleryEventMeta) => {
        setEvent(data)
        setForm({ title: data.title, date: data.date?.split("T")[0] || "" })
        setImageTotal(data.imageCount)
      })
  }, [id])

  const loadImages = useCallback(
    (page: number) => {
      setLoadingImages(true)
      return fetch(`/api/gallery/events/${id}/images?page=${page}&limit=${PAGE_SIZE}`)
        .then((res) => res.json())
        .then((data) => {
          setImages(data.images || [])
          setImageTotal(data.total ?? 0)
          setImageTotalPages(data.totalPages ?? 1)
          setImagePage(data.page ?? page)
        })
        .finally(() => setLoadingImages(false))
    },
    [id]
  )

  useEffect(() => {
    setEvent(null)
    setImages([])
    setImagePage(1)
    setLoading(true)
  }, [id])

  useEffect(() => {
    loadMeta()
      .catch(() => router.push("/admin/gallery"))
      .finally(() => setLoading(false))
  }, [id, router, loadMeta])

  useEffect(() => {
    if (!event) return
    loadImages(imagePage)
  }, [event, imagePage, loadImages])

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
      const data = await res.json()
      setEvent((prev) => (prev ? { ...prev, ...data, imageCount: data.imageCount ?? prev.imageCount } : null))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleSwap = async (imageId: string, direction: "up" | "down") => {
    setSwapBusy(imageId)
    try {
      const res = await fetch(`/api/gallery/events/${id}/images/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, direction }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to reorder")
      toast.success("Order updated")
      await loadImages(imagePage)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder")
    } finally {
      setSwapBusy(null)
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
      toast.success(`Added ${data.added ?? urls.length} image(s)`)
      await loadMeta()
      setImagePage(1)
      await loadImages(1)
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
      toast.success("Image removed")
      setDeleteImageId(null)
      await loadMeta()
      await loadImages(imagePage)
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
          Update event details and manage images. Images load in pages for performance; reorder swaps position in the full gallery.
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
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
          <h2 className="mb-1 font-semibold text-foreground">
            Images ({imageTotal.toLocaleString()})
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Add as many images as needed. Thumbnails load lazily. Use arrows to move an image earlier or later in the gallery.
          </p>

          <p className="mb-2 text-xs text-muted-foreground">
            New uploads are stored under{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">public/uploads/gallery/</code>{" "}
            in a folder named from this event&apos;s title (saved in the database).
          </p>
          <MultiImageUpload
            value={[]}
            onChange={(action) => {
              const urls = typeof action === "function" ? action([]) : action
              if (urls.length > 0) void handleAddImages(urls)
            }}
            uploadPath="/api/gallery/upload"
            uploadSearchParams={{ eventId: id }}
          />

          {loadingImages && images.length === 0 ? (
            <div className="mt-8 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, index) => {
                  const globalIndex = (imagePage - 1) * PAGE_SIZE + index
                  const canUp = globalIndex > 0
                  const canDown = globalIndex < imageTotal - 1
                  const busy = swapBusy === img.id
                  return (
                    <div
                      key={img.id}
                      className="group relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
                    >
                      <div className="flex shrink-0 flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={!canUp || busy}
                          onClick={() => handleSwap(img.id, "up")}
                          className="rounded p-1 text-muted-foreground hover:bg-accent/20 disabled:opacity-30"
                          aria-label="Move earlier in gallery"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={!canDown || busy}
                          onClick={() => handleSwap(img.id, "down")}
                          className="rounded p-1 text-muted-foreground hover:bg-accent/20 disabled:opacity-30"
                          aria-label="Move later in gallery"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="aspect-square overflow-hidden rounded border bg-muted">
                          <LazyImage
                            src={img.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="mt-1 truncate text-center text-[10px] text-muted-foreground">
                          #{globalIndex + 1}
                        </p>
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
                  )
                })}
              </div>

              {imageTotalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={imagePage <= 1 || loadingImages}
                    onClick={() => setImagePage((p) => p - 1)}
                  >
                    Previous page
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {imagePage} of {imageTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={imagePage >= imageTotalPages || loadingImages}
                    onClick={() => setImagePage((p) => p + 1)}
                  >
                    Next page
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="mt-6 text-center text-sm text-muted-foreground">No images yet.</p>
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
