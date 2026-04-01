"use client"

import { AdminLayout } from "@/components/admin-layout"
import { ImageUpload } from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink, ChevronUp, ChevronDown, Trash2 } from "lucide-react"

interface IntegritiImage {
  id: string
  url: string
  sortOrder: number
}

export default function AdminIntegritiPage() {
  const [videoUrl, setVideoUrl] = useState("")
  const [images, setImages] = useState<IntegritiImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")

  const load = () => {
    fetch("/api/integriti")
      .then((res) => res.json())
      .then((data) => {
        setVideoUrl(data.videoUrl || "")
        setImages(data.images || [])
      })
      .catch(() => {
        setVideoUrl("")
        setImages([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSaveVideo = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/integriti", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrl.trim() || null }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Video URL saved")
    } catch {
      toast.error("Failed to save video")
    } finally {
      setSaving(false)
    }
  }

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/integriti/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newImageUrl.trim() }),
      })
      if (!res.ok) throw new Error("Failed to add")
      const created = await res.json()
      setImages((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder))
      setNewImageUrl("")
      toast.success("Image added")
    } catch {
      toast.error("Failed to add image")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Delete this image?")) return
    setSaving(true)
    try {
      const res = await fetch(`/api/integriti/images/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setImages((prev) => prev.filter((i) => i.id !== id))
      toast.success("Image removed")
    } catch {
      toast.error("Failed to delete")
    } finally {
      setSaving(false)
    }
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reordered = [...images]
    const [removed] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, removed)
    const ids = reordered.map((i) => i.id)
    setImages(reordered.map((i, idx) => ({ ...i, sortOrder: idx })))

    try {
      const res = await fetch("/api/integriti/images/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error("Failed to reorder")
      toast.success("Order updated")
    } catch {
      setImages(images)
      toast.error("Failed to reorder")
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Sudut Integriti (Integrity Corner)
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage the video and Hebahan Integriti images. Up to 8 images display at once; additional images appear in a carousel.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-10">
          {/* Video URL */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-2 font-semibold text-foreground">Video (Center)</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Enter a YouTube URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)
            </p>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-4 flex gap-4">
              <Button
                onClick={handleSaveVideo}
                disabled={saving}
                className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {saving ? "Saving..." : "Save Video URL"}
              </Button>
              <Link href="/integriti" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Preview Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Hebahan Integriti Images */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-2 font-semibold text-foreground">Hebahan Integriti Images</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Add images for the Hebahan Integriti section. Up to 8 are shown at once; more than 8 will use a carousel.
            </p>

            <div className="mb-6 flex gap-3">
              <ImageUpload
                value={newImageUrl}
                onChange={setNewImageUrl}
                uploadPath="/api/integriti/upload"
                aspectRatio="square"
                maxSize={20 * 1024 * 1024}
                label="Add new image"
              />
              <Button
                onClick={handleAddImage}
                disabled={saving || !newImageUrl.trim()}
                className="self-end shrink-0"
              >
                Add Image
              </Button>
            </div>

            {images.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {images.length} image(s) — drag to reorder
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                          className="rounded p-1 text-muted-foreground hover:bg-accent/20 hover:text-accent disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === images.length - 1}
                          onClick={() => handleReorder(index, index + 1)}
                          className="rounded p-1 text-muted-foreground hover:bg-accent/20 hover:text-accent disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="aspect-square overflow-hidden rounded border border-border bg-muted">
                          <img
                            src={img.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={saving}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && (
              <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                No Hebahan Integriti images yet. Upload and add above.
              </p>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
